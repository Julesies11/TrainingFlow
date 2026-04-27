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
      auth: {
        updateUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: 'test-user-id' } },
          error: null,
        }),
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
});
