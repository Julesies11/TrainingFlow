import { supabase } from '../supabase';
import { compressImage, validateImage } from '../utils/image';

/**
 * Uploads a file to a Supabase storage bucket after validation and optional compression.
 * Acts as a centralized orchestrator for file uploads.
 *
 * @param bucket - The Supabase storage bucket name.
 * @param path - The destination path within the bucket.
 * @param file - The file object to upload.
 * @param options - Upload options, including whether to compress (default: true).
 * @returns The public URL of the uploaded file.
 */
export const uploadFile = async (
  bucket: string,
  path: string,
  file: File,
  options: { compress?: boolean } = { compress: true },
) => {
  // 1. Validation
  validateImage(file);

  // 2. Compression & Resizing
  let fileToUpload: File | Blob = file;
  if (options.compress) {
    fileToUpload = await compressImage(file);
  }

  // 3. Supabase Upload
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, fileToUpload, {
      upsert: true,
      contentType: fileToUpload.type,
    });

  if (error) {
    throw error;
  }

  // 4. Return Public URL
  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);

  return publicUrlData.publicUrl;
};
