import imageCompression from 'browser-image-compression';

export const AVATAR_PRESET = {
  maxWidthOrHeight: 256,
  maxSizeMB: 0.05,
  fileType: 'image/jpeg' as const,
  useWebWorker: true,
  preserveExif: false,
};

export const validateImage = (file: File) => {
  const maxSizeBytes = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.');
  }

  if (file.size > maxSizeBytes) {
    throw new Error('File size exceeds 10MB limit.');
  }

  return true;
};

export const compressImage = async (file: File) => {
  try {
    return await imageCompression(file, AVATAR_PRESET);
  } catch (error) {
    console.error('Image compression failed:', error);
    throw error;
  }
};
