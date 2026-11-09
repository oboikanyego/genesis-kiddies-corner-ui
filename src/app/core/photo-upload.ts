/** Browser-only, client-side resize: keeps uploaded images small for MongoDB Atlas Free. */
export const MAX_SELECTED_PHOTO_BYTES = 15 * 1024 * 1024;
export const MAX_UPLOADED_PHOTO_BYTES = 2 * 1024 * 1024;
export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function servicePhotoValidation(file: Pick<File,'size'|'type'>): string | null {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) return 'Choose a JPG, PNG or WebP image.';
  if (!file.size || file.size > MAX_SELECTED_PHOTO_BYTES) return 'Choose an image smaller than 15 MB.';
  return null;
}

/** Resizes up to 1280px and compresses to WebP, retaining transparency where present. */
export async function prepareServicePhoto(file: File): Promise<Blob> {
  const validation = servicePhotoValidation(file);
  if (validation) throw new Error(validation);
  const bitmap = await createImageBitmap(file);
  try {
    const ratio = Math.min(1,1280/Math.max(bitmap.width,bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1,Math.round(bitmap.width*ratio));
    canvas.height = Math.max(1,Math.round(bitmap.height*ratio));
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('This browser cannot prepare the selected photo.');
    ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
    const blob = await new Promise<Blob>((resolve,reject)=>{
      canvas.toBlob(result=>result?resolve(result):reject(new Error('Unable to prepare the selected photo.')),'image/webp',0.78);
    });
    if (!ALLOWED_PHOTO_TYPES.includes(blob.type)||blob.size>MAX_UPLOADED_PHOTO_BYTES) {
      throw new Error('The photo is still too large after compression. Please choose a smaller one.');
    }
    return blob;
  } finally {
    bitmap.close();
  }
}
