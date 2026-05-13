'use server';
/**
 * @fileOverview Enhanced AI Artwork Generation Flow using Genkit Imagen 4 and Cloudinary.
 *
 * - generateArtwork - A function that generates, captions, and stores artwork.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { generateWithImagen, captionImage, uploadToCloudinary } from '@/lib/image-services';

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
    // 1. Generate via Imagen 4 (Fast)
    const dataUri = await generateWithImagen(input.prompt);
    
    // 2. Generate artistic caption using Gemini
    const caption = await captionImage(dataUri);
    
    // 3. Store permanently in Cloudinary
    const finalCloudinaryUrl = await uploadToCloudinary(dataUri);

    return {
      imageUrl: finalCloudinaryUrl,
      caption: caption || `A masterpiece inspired by: ${input.prompt}`,
    };
  }
);
