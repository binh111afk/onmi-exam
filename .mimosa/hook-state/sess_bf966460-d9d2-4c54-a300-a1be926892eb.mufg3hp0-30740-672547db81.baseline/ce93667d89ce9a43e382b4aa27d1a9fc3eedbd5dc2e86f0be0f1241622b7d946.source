/**
 * Service handling document editor image uploads.
 * Currently uses local object URLs, easily swappable with Supabase Storage later.
 */
export const uploadImageFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Tệp không phải là hình ảnh hợp lệ.'));
        return;
      }
      
      // Simulate network upload delay of 300ms
      setTimeout(() => {
        const localUrl = URL.createObjectURL(file);
        resolve(localUrl);
      }, 300);
    } catch (err) {
      reject(err);
    }
  });
};
