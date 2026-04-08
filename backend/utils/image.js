import sharp from 'sharp';

/**
 * Compresses a Base64 image string.
 * @param {string} base64Str - The raw base64 string (with or without data prefix).
 * @param {number} size - Target square size (default 128px for avatars).
 * @returns {Promise<string>} - Compressed base64 string (WebP format).
 */
export const compressAvatar = async (base64Str, size = 128) => {
  if (!base64Str) return null;

  try {
    // Extract buffer from base64
    const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Process image with sharp
    const compressedBuffer = await sharp(buffer)
      .resize(size, size, {
        fit: 'cover',
        position: 'center'
      })
      .webp({ quality: 80 })
      .toBuffer();

    // Convert back to base64
    return `data:image/webp;base64,${compressedBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original if compression fails (safety fallback)
    return base64Str;
  }
};
