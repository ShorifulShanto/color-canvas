
import { v2 as cloudinary } from 'cloudinary';
import { ai } from '@/ai/genkit';

/**
 * Validates that all required environment variables are present.
 */
function validateConfig() {
  const googleKey = process.env.GOOGLE_GENAI_API_KEY;
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const cloudKey = process.env.CLOUDINARY_API_KEY;
  const cloudSecret = process.env.CLOUDINARY_API_SECRET;

  if (!googleKey) {
    throw new Error('GOOGLE_GENAI_API_KEY is missing in your environment configuration.');
  }
  if (!cloudName) {
    throw new Error('CLOUDINARY_CLOUD_NAME is missing. Check your .env file.');
  }
  if (!cloudKey) {
    throw new Error('CLOUDINARY_API_KEY is missing. Check your .env file.');
  }
  if (!cloudSecret) {
    throw new Error('CLOUDINARY_API_SECRET is missing. Check your .env file.');
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: cloudName,
    api_key: cloudKey,
    api_secret: cloudSecret,
    secure: true,
  });
}

/**
 * Generates a high-quality artistic image using Imagen 4 via Genkit.
 */
export async function generateWithImagen(prompt: string): Promise<string> {
  validateConfig();
  
  try {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `A professional artistic masterpiece: ${prompt}. Cinematic lighting, highly detailed, 4k resolution, trending on ArtStation.`,
    });
    
    if (!media || !media.url) {
      throw new Error('AI Engine failed to generate image. The service might be temporarily unavailable or the prompt was blocked by safety filters.');
    }
    
    return media.url;
  } catch (error: any) {
    console.error('Imagen Generation Error:', error);
    throw new Error(`AI Generation failed: ${error.message || 'Unknown provider error'}`);
  }
}

/**
 * Generates an artistic caption for an image using Gemini 2.5 Flash.
 */
export async function captionImage(imageUrl: string): Promise<string> {
  validateConfig();
  
  try {
    const { text } = await ai.generate({
      model: 'googleai/gemini-2.5-flash',
      prompt: [
        { media: { url: imageUrl, contentType: 'image/png' } },
        { text: 'Describe this artwork in a few poetic and evocative words suitable for a high-end art gallery caption.' }
      ]
    });
    
    return text || "An ethereal vision of creative expression.";
  } catch (error: any) {
    console.error('Captioning Error:', error);
    return "A masterpiece of digital expression."; // Graceful fallback
  }
}

/**
 * Stores the generated image permanently in Cloudinary.
 */
export async function uploadToCloudinary(dataUri: string): Promise<string> {
  validateConfig();

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'colorcanvas',
      resource_type: 'auto',
    });
    return result.secure_url;
  } catch (error: any) {
    console.error('Cloudinary Upload Internal Error:', error);
    throw new Error(`Cloudinary transfer failed: ${error.message || 'Check your Cloudinary credentials and network connection.'}`);
  }
}

export async function upscaleImage(imageUrl: string): Promise<string> {
  return imageUrl; 
}
