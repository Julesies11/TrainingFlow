import { AuthModel, UserModel } from '@/auth/lib/models';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

/**
 * Supabase adapter that maintains the same interface as the existing auth flow
 * but uses Supabase under the hood.
 *
 * Implements a "Lazy Profile Creation" strategy for shared Supabase databases.
 */
export const SupabaseAdapter = {
  /**
   * Private-ish helper to ensure a record exists in pf_profiles.
   * Performs an upsert to bridge users from shared auth.users.
   */
  async _ensureProfileExists(user: User): Promise<void> {
    const metadata = user.user_metadata || {};

    const { error } = await supabase.from('pf_profiles').upsert(
      {
        id: user.id,
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
      },
      { onConflict: 'id' },
    );

    if (error) {
      console.error('SupabaseAdapter: Error ensuring profile exists:', error);
      // We don't throw here to avoid blocking the login if profile sync fails
    }
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
      | 'slack',
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

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: email.split('@')[0],
          first_name: firstName || '',
          last_name: lastName || '',
          fullname:
            firstName && lastName ? `${firstName} ${lastName}`.trim() : '',
          created_at: new Date().toISOString(),
        },
      },
    });

    if (error) throw new Error(error.message);

    if (data.user) {
      await this._ensureProfileExists(data.user);
    }

    if (!data.session) {
      return { access_token: '', refresh_token: '' };
    }

    return {
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    };
  },

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      const redirectUrl = `${window.location.origin}/auth/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) throw new Error(error.message);
    } catch (err) {
      console.error('Unexpected error in password reset:', err);
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
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/verify-email`,
      },
    });

    if (error) throw new Error(error.message);
  },

  /**
   * Get current user from the session
   */
  async getCurrentUser(): Promise<UserModel | null> {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return null;

    // Check if profile exists, if not, create it lazily
    const { data: profile } = await supabase
      .from('pf_profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle();

    if (!profile) {
      await this._ensureProfileExists(data.user);
    }

    return this.getUserProfile();
  },

  /**
   * Get user profile from user metadata
   */
  async getUserProfile(): Promise<UserModel> {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) throw new Error(error?.message || 'User not found');

    const metadata = user.user_metadata || {};

    return {
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

    // Also update the relational profile if relevant fields changed
    if (userData.pic) {
      await supabase
        .from('pf_profiles')
        .update({ avatar_url: userData.pic })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);
    }

    return this.getCurrentUser() as Promise<UserModel>;
  },

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },
};
