import { v2 as cloudinary } from 'cloudinary';
import { ai } from '@/ai/genkit';

// Initialize Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary storage is not fully configured');
  }

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'colorcanvas',
  });
  return result.secure_url;
}

// Keeping these for interface compatibility with the flow, but Imagen 4 handles quality internally
export async function upscaleImage(imageUrl: string): Promise<string> {
  return imageUrl; 
}
