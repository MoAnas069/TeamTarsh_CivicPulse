/* ============================================
   CivicPulse — Image Utilities
   ============================================ */

/**
 * Compress an image file using canvas
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width (default 800)
 * @param {number} quality - JPEG quality 0-1 (default 0.7)
 * @returns {Promise<string>} Base64 data URL
 */
export function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Invalid image file'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Scale down if needed
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert a File to a base64 data URL without compression
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate that a file is an acceptable image
 */
export function validateImage(file) {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPEG, PNG, WebP, or GIF image.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Image must be under 10MB.' };
  }

  return { valid: true };
}
