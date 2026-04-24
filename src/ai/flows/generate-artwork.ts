
'use server';
/**
 * @fileOverview Enhanced AI Artwork Generation Flow using Replicate and Cloudinary.
 *
 * - generateArtwork - A function that generates, upscales, captions, and stores artwork.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { generateWithSDXL, upscaleImage, captionImage, uploadToCloudinary } from '@/lib/image-services';

const GenerateArtworkInputSchema = z.object({
  prompt: z.string().describe('The descriptive prompt for the artwork.'),
});
export type GenerateArtworkInput = z.infer<typeof GenerateArtworkInputSchema>;

const GenerateArtworkOutputSchema = z.object({
  imageUrl: z.string().describe('The final Cloudinary URL of the generated artwork.'),
  caption: z.string().describe('AI generated caption for the image.'),
});
export type GenerateArtworkOutput = z.infer<typeof GenerateArtworkOutputSchema>;

export async function generateArtwork(input: GenerateArtworkInput): Promise<GenerateArtworkOutput> {
  return generateArtworkFlow(input);
}

const generateArtworkFlow = ai.defineFlow(
  {
    name: 'generateArtworkFlow',
    inputSchema: GenerateArtworkInputSchema,
    outputSchema: GenerateArtworkOutputSchema,
  },
  async (input) => {
    // 1. Generate via Replicate SDXL
    const rawImageUrl = await generateWithSDXL(input.prompt);
    
    // 2. Upscale for higher quality
    const upscaledUrl = await upscaleImage(rawImageUrl);
    
    // 3. Generate caption using BLIP
    const caption = await captionImage(upscaledUrl);
    
    // 4. Store permanently in Cloudinary
    const finalCloudinaryUrl = await uploadToCloudinary(upscaledUrl);

    return {
      imageUrl: finalCloudinaryUrl,
      caption: caption || `A masterpiece inspired by: ${input.prompt}`,
    };
  }
);
