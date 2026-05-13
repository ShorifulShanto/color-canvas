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
  } catch (error) {
    console.error('Cloudinary Action Error:', error);
    throw new Error('Failed to transfer image to Cloudinary storage.');
  }
}
