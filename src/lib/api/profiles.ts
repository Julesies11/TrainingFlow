import { supabase } from '../supabase';
import { uploadFile } from './storage';

/**
 * Handles the complete avatar upload flow:
 * 1. Authenticates the user.
 * 2. Uploads and compresses the image to Supabase storage.
 * 3. Updates the user's profile with the new avatar URL.
 *
 * @param file - The file object selected by the user.
 * @returns The new avatar URL.
 */
export const handleAvatarUpload = async (file: File) => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const userId = user.id;

  // 1. Get current profile to check for existing avatar
  const { data: profile } = await supabase
    .from('pf_profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single();

  // 2. Delete old avatar if it exists
  if (profile?.avatar_url) {
    try {
      const urlParts = profile.avatar_url.split('/');
      const fileNameWithQuery = urlParts[urlParts.length - 1];
      const oldFileName = fileNameWithQuery.split('?')[0];
      if (oldFileName) {
        await supabase.storage
          .from('pf_avatars')
          .remove([`${userId}/${oldFileName}`]);
      }
    } catch (error) {
      console.error('Failed to delete old avatar:', error);
      // Continue anyway, we don't want to block the new upload
    }
  }

  // 3. Prepare new file path
  const fileName = `avatar-${Date.now()}.jpg`;
  const filePath = `${userId}/${fileName}`;

  // 4. Storage Logic: This calls uploadFile in src/lib/api/storage.ts, which acts as a centralized orchestrator.
  const avatarUrl = await uploadFile('pf_avatars', filePath, file, {
    compress: true,
  });

  // 5. Update pf_profiles table with the new avatar_url
  const { error: updateError } = await supabase
    .from('pf_profiles')
    .update({
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating profile avatar:', updateError);
    throw updateError;
  }

  return avatarUrl;
};

/**
 * Removes the user's avatar from storage and updates their profile.
 *
 * @returns true if successful.
 */
export const handleAvatarRemove = async () => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('User not authenticated');
  }

  const userId = user.id;

  // 1. Get current profile to check for existing avatar
  const { data: profile } = await supabase
    .from('pf_profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single();

  // 2. Delete avatar from storage if it exists
  if (profile?.avatar_url) {
    const urlParts = profile.avatar_url.split('/');
    const fileNameWithQuery = urlParts[urlParts.length - 1];
    const oldFileName = fileNameWithQuery.split('?')[0];
    if (oldFileName) {
      await supabase.storage
        .from('pf_avatars')
        .remove([`${userId}/${oldFileName}`]);
    }
  }

  // 3. Update profile
  const { error: updateError } = await supabase
    .from('pf_profiles')
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    throw updateError;
  }

  return true;
};
