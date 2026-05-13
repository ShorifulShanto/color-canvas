
import { v2 as cloudinary } from 'cloudinary';
import { ai } from '@/ai/genkit';

/**
 * Generates a high-quality artistic image using Imagen 4 via Genkit.
 */
export async function generateWithImagen(prompt: string): Promise<string> {
  const { media } = await ai.generate({
    model: 'googleai/imagen-4.0-fast-generate-001',
    prompt: `A professional artistic masterpiece: ${prompt}. Cinematic lighting, highly detailed, 4k resolution, trending on ArtStation.`,
  });
  
  if (!media || !media.url) {
    throw new Error('AI Engine failed to generate image. Please check your service quotas.');
  }
  
  return media.url;
}

/**
 * Generates an artistic caption for an image using Gemini 2.5 Flash.
 */
export async function captionImage(imageUrl: string): Promise<string> {
  const { text } = await ai.generate({
    model: 'googleai/gemini-2.5-flash',
    prompt: [
      { media: { url: imageUrl, contentType: 'image/png' } },
      { text: 'Describe this artwork in a few poetic and evocative words suitable for a high-end art gallery caption.' }
    ]
  });
  
  return text || "An ethereal vision of creative expression.";
}

/**
 * Stores the generated image permanently in Cloudinary.
 */
export async function uploadToCloudinary(dataUri: string): Promise<string> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary is not fully configured. Please ensure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set in your environment.');
  }

  // Re-configure to ensure context in serverless functions
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'colorcanvas',
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary Upload Internal Error:', error);
    throw new Error(`Cloudinary transfer failed: ${error.message || 'Unknown error during upload'}`);
  }
}

// Keeping these for interface compatibility with the flow
export async function upscaleImage(imageUrl: string): Promise<string> {
  return imageUrl; 
}
