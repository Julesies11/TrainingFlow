/* eslint-disable @typescript-eslint/no-explicit-any */
import { SupabaseAdapter } from '@/auth/adapters/supabase-adapter';
import { User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { supabase } from '@/lib/supabase';

// Mock supabase client
vi.mock('@/lib/supabase', () => {
  const mockFrom = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
  };

  return {
    supabase: {
      from: vi.fn(() => mockFrom),
      functions: {
        invoke: vi.fn(),
      },
      auth: {
        updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
        signInWithOAuth: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  };
});

describe('SupabaseAdapter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('_ensureProfileExists', () => {
    it('should NOT insert or update if profile already exists', async () => {
      const mockUser = { id: 'existing-user-id', user_metadata: {} } as User;
      const mockFrom = supabase.from('tf_profiles');

      // Mock profile existing
      (mockFrom.maybeSingle as any).mockResolvedValue({
        data: { id: 'existing-user-id' },
        error: null,
      });

      await SupabaseAdapter._ensureProfileExists(mockUser);

      expect(supabase.from).toHaveBeenCalledWith('tf_profiles');
      expect(mockFrom.select).toHaveBeenCalledWith('id');
      expect(mockFrom.insert).not.toHaveBeenCalled();
    });

    it('should insert new profile if it does not exist', async () => {
      const mockUser = {
        id: 'new-user-id',
        user_metadata: { theme: 'dark' },
      } as User;
      const mockFrom = supabase.from('tf_profiles');

      // Mock profile NOT existing
      (mockFrom.maybeSingle as any).mockResolvedValue({
        data: null,
        error: null,
      });
      (mockFrom.insert as any).mockResolvedValue({ error: null });

      await SupabaseAdapter._ensureProfileExists(mockUser);

      expect(mockFrom.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'new-user-id',
          theme: 'dark',
        }),
      );
    });
  });

  describe('updateUserProfile', () => {
    it('should update tf_profiles when avatar (pic) is updated', async () => {
      const userData = { pic: 'http://new-avatar.url' };
      const mockFrom = supabase.from('tf_profiles');
      (mockFrom.update as any).mockReturnThis();

      await SupabaseAdapter.updateUserProfile(userData);

      expect(supabase.auth.updateUser).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ pic: 'http://new-avatar.url' }),
        }),
      );

      expect(supabase.from).toHaveBeenCalledWith('tf_profiles');
      expect(mockFrom.update).toHaveBeenCalledWith(
        expect.objectContaining({
          avatar_url: 'http://new-avatar.url',
        }),
      );
    });
  });

  describe('signInWithOAuth', () => {
    it('should call signInWithOAuth with the correct provider', async () => {
      await SupabaseAdapter.signInWithOAuth('azure');

      expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'azure',
        }),
      );
    });
  });

  describe('requestPasswordReset', () => {
    it('should call the tf-send-password-reset Edge Function with email and redirect url', async () => {
      (supabase.functions.invoke as any).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      await SupabaseAdapter.requestPasswordReset('user@example.com');

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'tf-send-password-reset',
        expect.objectContaining({
          body: expect.objectContaining({
            email: 'user@example.com',
            redirectTo: expect.stringContaining('/auth/change-password'),
          }),
        }),
      );
    });

    it('should throw an error if the Edge Function returns an error object', async () => {
      (supabase.functions.invoke as any).mockResolvedValue({
        data: { error: 'Function execution failed' },
        error: null,
      });

      await expect(
        SupabaseAdapter.requestPasswordReset('user@example.com'),
      ).rejects.toThrow('Function execution failed');
    });

    it('should throw an error if the Edge Function call itself errors', async () => {
      (supabase.functions.invoke as any).mockResolvedValue({
        data: null,
        error: new Error('Network error'),
      });

      await expect(
        SupabaseAdapter.requestPasswordReset('user@example.com'),
      ).rejects.toThrow('Network error');
    });
  });

  describe('register', () => {
    it('should call tf-register-user Edge Function with correct arguments', async () => {
      (supabase.functions.invoke as any).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await SupabaseAdapter.register(
        'test@example.com',
        'password123',
        'password123',
        'John',
        'Doe',
      );

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'tf-register-user',
        expect.objectContaining({
          body: expect.objectContaining({
            email: 'test@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            isResend: false,
          }),
        }),
      );
      expect(result).toEqual({ access_token: '', refresh_token: '' });
    });

    it('should throw an error if passwords do not match', async () => {
      await expect(
        SupabaseAdapter.register(
          'test@example.com',
          'password123',
          'different',
          'John',
          'Doe',
        ),
      ).rejects.toThrow('Passwords do not match');
    });
  });

  describe('resendVerificationEmail', () => {
    it('should call tf-register-user Edge Function with isResend: true', async () => {
      (supabase.functions.invoke as any).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      await SupabaseAdapter.resendVerificationEmail('test@example.com');

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'tf-register-user',
        expect.objectContaining({
          body: expect.objectContaining({
            email: 'test@example.com',
            isResend: true,
          }),
        }),
      );
    });
  });

  describe('signInWithMagicLink', () => {
    it('should call tf-send-magic-link Edge Function with email and redirect url', async () => {
      (supabase.functions.invoke as any).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      await SupabaseAdapter.signInWithMagicLink('test@example.com');

      expect(supabase.functions.invoke).toHaveBeenCalledWith(
        'tf-send-magic-link',
        expect.objectContaining({
          body: expect.objectContaining({
            email: 'test@example.com',
            redirectTo: expect.stringContaining('/auth/callback'),
          }),
        }),
      );
    });
  });
});
