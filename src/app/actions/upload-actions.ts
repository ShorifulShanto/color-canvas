
'use server';

import { uploadToCloudinary } from '@/lib/image-services';

/**
 * Server action to securely upload an image (Data URI or URL) to Cloudinary.
 * This prevents exposing Cloudinary credentials on the client side.
 */
export async function uploadImageAction(dataUri: string): Promise<string> {
  try {
    const cloudinaryUrl = await uploadToCloudinary(dataUri);
    return cloudinaryUrl;
  } catch (error: any) {
    console.error('Cloudinary Action Error:', error);
    // Propagate the descriptive error message
    throw new Error(error.message || 'Failed to transfer image to Cloudinary storage.');
  }
}
