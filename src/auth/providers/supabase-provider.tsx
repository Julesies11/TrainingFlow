import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { SupabaseAdapter } from '@/auth/adapters/supabase-adapter';
import { AuthContext } from '@/auth/context/auth-context';
import { AuthModel, UserModel } from '@/auth/lib/models';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

// Define the Supabase Auth Provider
export function AuthProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<AuthModel | undefined>();
  const [currentUser, setCurrentUser] = useState<UserModel | undefined>();
  const [isAdmin, setIsAdmin] = useState(false);
  const isInitialized = useRef(false);

  // Initialize auth state from Supabase
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // 1. Define internal state sync function
    const syncState = async (session: Session | null) => {
      console.log(
        'AuthProvider syncState session:',
        session ? 'exists' : 'null',
      );
      if (session) {
        setAuth({
          access_token: session.access_token,
          refresh_token: session.refresh_token,
        });

        try {
          const user = await SupabaseAdapter.getUserProfile(session.user);
          console.log('AuthProvider syncState user profile:', user);
          setCurrentUser(user || undefined);
          // Background ensure profile exists
          SupabaseAdapter._ensureProfileExists(session.user);
        } catch (err) {
          console.error(
            'AuthProvider: Error fetching profile during sync:',
            err,
          );
        }
      } else {
        setAuth(undefined);
        setCurrentUser(undefined);
      }
    };

    // 2. Initial manual check (Source of truth for the first render)
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log(
          'AuthProvider initAuth session:',
          session ? 'exists' : 'null',
        );
        await syncState(session);
      } catch (error) {
        console.error('AuthProvider: Initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // 3. Listen for subsequent auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        'AuthProvider onAuthStateChange event:',
        event,
        'session:',
        session ? 'exists' : 'null',
      );
      // INITIAL_SESSION redundant with initAuth, but safe
      await syncState(session);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Check if user is admin
  useEffect(() => {
    setIsAdmin(currentUser?.is_admin === true);
  }, [currentUser]);

  // Non-destructive verification
  const verify = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const user = await SupabaseAdapter.getUserProfile(session.user);
        setCurrentUser(user || undefined);
      }
    } catch (error) {
      console.error('AuthProvider: Verification failed:', error);
    }
  };

  const saveAuth = async (authData: AuthModel | undefined) => {
    setAuth(authData);
    if (authData?.access_token) {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          const profile = await SupabaseAdapter.getUserProfile(user);
          setCurrentUser(profile || undefined);
          // Background ensure profile exists
          SupabaseAdapter._ensureProfileExists(user);
        }
      } catch (err) {
        console.error('saveAuth sync profile error:', err);
      }
    } else {
      setCurrentUser(undefined);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const authData = await SupabaseAdapter.login(email, password);
      await saveAuth(authData);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    password_confirmation: string,
    firstName?: string,
    lastName?: string,
  ) => {
    await SupabaseAdapter.register(
      email,
      password,
      password_confirmation,
      firstName,
      lastName,
    );
  };

  const requestPasswordReset = async (email: string) => {
    await SupabaseAdapter.requestPasswordReset(email);
  };

  const resetPassword = async (
    password: string,
    password_confirmation: string,
  ) => {
    await SupabaseAdapter.resetPassword(password, password_confirmation);
  };

  const resendVerificationEmail = async (email: string) => {
    await SupabaseAdapter.resendVerificationEmail(email);
  };

  const getUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      return await SupabaseAdapter.getUserProfile(session.user);
    }
    return null;
  };

  const updateProfile = async (userData: Partial<UserModel>) => {
    const updatedUser = await SupabaseAdapter.updateUserProfile(userData);
    setCurrentUser(updatedUser);
    return updatedUser;
  };

  const logout = () => {
    // Clear React states immediately for instant UI response/redirection
    setAuth(undefined);
    setCurrentUser(undefined);
    // Securely terminate the session in the background
    SupabaseAdapter.logout().catch((err) => {
      console.error('AuthProvider: Logout error:', err);
    });
  };

  return (
    <AuthContext.Provider
      value={{
        loading,
        setLoading,
        auth,
        saveAuth,
        user: currentUser,
        setUser: setCurrentUser,
        login,
        register,
        requestPasswordReset,
        resetPassword,
        resendVerificationEmail,
        getUser,
        updateProfile,
        logout,
        verify,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
