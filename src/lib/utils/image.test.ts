import { describe, expect, it, vi } from 'vitest';
import { compressImage, validateImage } from './image';

vi.mock('browser-image-compression', () => ({
  default: vi
    .fn()
    .mockResolvedValue(new Blob(['compressed'], { type: 'image/jpeg' })),
}));

describe('image-utils', () => {
  describe('validateImage', () => {
    it('returns true for valid JPG', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
      expect(validateImage(file)).toBe(true);
    });

    it('returns true for valid PNG', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      Object.defineProperty(file, 'size', { value: 1024 * 1024 });
      expect(validateImage(file)).toBe(true);
    });

    it('throws error for invalid file type', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      expect(() => validateImage(file)).toThrow(/Invalid file type/);
    });

    it('throws error for file too large', () => {
      const file = new File([''], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 }); // 11MB
      expect(() => validateImage(file)).toThrow(/File size exceeds 10MB/);
    });
  });

  describe('compressImage', () => {
    it('calls compression library', async () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const result = await compressImage(file);
      expect(result).toBeDefined();
      expect(result.type).toBe('image/jpeg');
    });
  });
});
