import { AuthModel, UserModel } from '@/auth/lib/models';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Registry to prevent duplicate concurrent profile creation requests for the same user
const activeProfilePromises = new Map<string, Promise<void>>();

/**
 * Supabase adapter that maintains the same interface as the existing auth flow
 * but uses Supabase under the hood.
 *
 * Implements a "Lazy Profile Creation" strategy for shared Supabase databases.
 */
export const SupabaseAdapter = {
  /**
   * Private-ish helper to ensure a record exists in tf_profiles.
   */
  async _ensureProfileExists(user: User): Promise<void> {
    const userId = user.id;

    if (activeProfilePromises.has(userId)) {
      return activeProfilePromises.get(userId)!;
    }

    const promise = (async () => {
      const metadata = user.user_metadata || {};

      // 1. Check if profile already exists to avoid overwriting user settings/data on every login
      try {
        const { data: existingProfile, error: checkError } = await supabase
          .from('tf_profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (checkError) {
          console.error(
            'SupabaseAdapter: Error checking existing profile:',
            checkError,
          );
        }

        if (existingProfile) {
          return;
        }

        // 2. Only create if it doesn't exist (e.g., first login)
        const { error } = await supabase.from('tf_profiles').insert({
          id: userId,
          workout_type_options: JSON.stringify({
            Swim: ['Easy', 'Hard'],
            Bike: ['Easy', 'Hard'],
            Run: ['Easy', 'Tempo', 'Interval'],
            Strength: ['Full Body', 'Upper', 'Lower'],
          }),
          effort_settings: {},
          updated_at: new Date().toISOString(),
          // Map common metadata fields if they exist from other apps
          theme: metadata.theme || 'light',
          avatar_url: metadata.pic || metadata.avatar_url || null,
        });

        if (error) {
          // If the profile was concurrently created by another request, ignore the conflict (Postgres code 23505)
          if (error.code === '23505') {
            console.log(
              'SupabaseAdapter: Profile already exists (conflict handled).',
            );
          } else {
            console.error('SupabaseAdapter: Error creating profile:', error);
          }
        }
      } catch (err) {
        console.error(
          'SupabaseAdapter: Unexpected error in _ensureProfileExists:',
          err,
        );
      } finally {
        activeProfilePromises.delete(userId);
      }
    })();

    activeProfilePromises.set(userId, promise);
    return promise;
  },

  /**
   * Login with email and password
   */
  async login(email: string, password: string): Promise<AuthModel> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);

      if (data.user) {
        await this._ensureProfileExists(data.user);
      }

      return {
        access_token: data.session?.access_token || '',
        refresh_token: data.session?.refresh_token || '',
      };
    } catch (error) {
      console.error('SupabaseAdapter: Unexpected login error:', error);
      throw error;
    }
  },

  /**
   * Login with OAuth provider (Google, GitHub, etc.)
   */
  async signInWithOAuth(
    provider:
      | 'google'
      | 'github'
      | 'facebook'
      | 'twitter'
      | 'discord'
      | 'slack'
      | 'azure',
    options?: { redirectTo?: string },
  ): Promise<void> {
    try {
      const redirectTo =
        options?.redirectTo || `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });

      if (error) throw new Error(error.message);
    } catch (error) {
      console.error('SupabaseAdapter: Unexpected OAuth error:', error);
      throw error;
    }
  },

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    password_confirmation: string,
    firstName?: string,
    lastName?: string,
  ): Promise<AuthModel> {
    if (password !== password_confirmation) {
      throw new Error('Passwords do not match');
    }

    const redirectUrl = `${window.location.origin}/auth/verify-email`;
    const { data, error } = await supabase.functions.invoke(
      'tf-register-user',
      {
        body: {
          email,
          password,
          firstName,
          lastName,
          username: email.split('@')[0],
          redirectTo: redirectUrl,
          isResend: false,
        },
      },
    );

    if (error || (data && data.error)) {
      throw new Error(
        error?.message || data?.error || 'Failed to sign up user account',
      );
    }

    // Return empty tokens since the user is not confirmed yet and needs to click the verification link
    return {
      access_token: '',
      refresh_token: '',
    };
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const redirectUrl = `${window.location.origin}/auth/change-password`;
      const { data, error } = await supabase.functions.invoke(
        'tf-send-password-reset',
        {
          body: {
            email,
            redirectTo: redirectUrl,
          },
        },
      );

      if (error || (data && data.error)) {
        throw new Error(
          error?.message ||
            data?.error ||
            'Failed to send password reset email',
        );
      }
    } catch (err) {
      console.error('Unexpected error in password reset:', err);
      throw err;
    }
  },

  /**
   * Send magic link email via Edge Function
   */
  async signInWithMagicLink(email: string): Promise<void> {
    try {
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.functions.invoke(
        'tf-send-magic-link',
        {
          body: {
            email,
            redirectTo: redirectUrl,
          },
        },
      );

      if (error || (data && data.error)) {
        throw new Error(
          error?.message || data?.error || 'Failed to send magic link email',
        );
      }
    } catch (err) {
      console.error('Unexpected error in magic link:', err);
      throw err;
    }
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    password: string,
    password_confirmation: string,
  ): Promise<void> {
    if (password !== password_confirmation) {
      throw new Error('Passwords do not match');
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) throw new Error(error.message);
  },

  /**
   * Request another verification email
   */
  async resendVerificationEmail(email: string): Promise<void> {
    const redirectUrl = `${window.location.origin}/auth/verify-email`;
    const { data, error } = await supabase.functions.invoke(
      'tf-register-user',
      {
        body: {
          email,
          redirectTo: redirectUrl,
          isResend: true,
        },
      },
    );

    if (error || (data && data.error)) {
      throw new Error(
        error?.message || data?.error || 'Failed to resend verification email',
      );
    }
  },

  /**
   * Get current user from the session
   */
  async getCurrentUser(): Promise<UserModel | null> {
    try {
      const { data, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('SupabaseAdapter: auth.getUser error:', userError);
        return null;
      }

      if (!data.user) {
        return null;
      }

      // Check if profile exists, if not, create it lazily
      await this._ensureProfileExists(data.user);

      // Pass the user we already fetched to avoid another getUser() call
      return this.getUserProfile(data.user);
    } catch (err) {
      console.error(
        'SupabaseAdapter: Unexpected error in getCurrentUser:',
        err,
      );
      return null;
    }
  },

  /**
   * Get user profile from user metadata
   */
  async getUserProfile(passedUser?: User): Promise<UserModel> {
    let user = passedUser;

    if (!user) {
      const {
        data: { user: fetchedUser },
        error,
      } = await supabase.auth.getUser();

      if (error || !fetchedUser) {
        throw new Error(error?.message || 'User not found');
      }
      user = fetchedUser;
    }

    const metadata = user.user_metadata || {};

    const profile: UserModel = {
      id: user.id,
      email: user.email || '',
      email_verified: user.email_confirmed_at !== null,
      username: metadata.username || '',
      first_name: metadata.first_name || '',
      last_name: metadata.last_name || '',
      fullname:
        metadata.fullname ||
        `${metadata.first_name || ''} ${metadata.last_name || ''}`.trim(),
      occupation: metadata.occupation || '',
      company_name: metadata.company_name || '',
      companyName: metadata.company_name || '',
      phone: metadata.phone || '',
      roles: metadata.roles || [],
      pic: metadata.pic || '',
      language: metadata.language || 'en',
      is_admin: metadata.is_admin || false,
    };

    return profile;
  },

  /**
   * Update user profile (stored in metadata)
   */
  async updateUserProfile(userData: Partial<UserModel>): Promise<UserModel> {
    const metadata: Record<string, unknown> = {
      username: userData.username,
      first_name: userData.first_name,
      last_name: userData.last_name,
      fullname:
        userData.fullname ||
        `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
      occupation: userData.occupation,
      company_name: userData.company_name || userData.companyName,
      phone: userData.phone,
      roles: userData.roles,
      pic: userData.pic,
      language: userData.language,
      is_admin: userData.is_admin,
      updated_at: new Date().toISOString(),
    };

    Object.keys(metadata).forEach((key) => {
      if (metadata[key] === undefined) {
        delete metadata[key];
      }
    });

    const { error } = await supabase.auth.updateUser({
      data: metadata,
    });

    if (error) throw new Error(error.message);

    const currentUser = (await supabase.auth.getUser()).data.user;

    // Also update the relational profile if relevant fields changed
    if (userData.pic && currentUser) {
      await supabase
        .from('tf_profiles')
        .update({ avatar_url: userData.pic })
        .eq('id', currentUser.id);
    }

    return this.getUserProfile(currentUser || undefined);
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },
};
