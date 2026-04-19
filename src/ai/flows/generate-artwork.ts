'use server';
/**
 * @fileOverview AI Artwork Generation Flow.
 *
 * - generateArtwork - A function that generates an image using Imagen 4.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateArtworkInputSchema = z.object({
  prompt: z.string().describe('The descriptive prompt for the artwork to be generated.'),
});
export type GenerateArtworkInput = z.infer<typeof GenerateArtworkInputSchema>;

const GenerateArtworkOutputSchema = z.object({
  imageUrl: z.string().describe('The generated artwork as a data URI.'),
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
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `Create a high-quality digital artwork or drawing: ${input.prompt}. Style should be artistic, creative, and visually striking.`,
    });

    if (!media || !media.url) {
      throw new Error('Failed to generate image');
    }

    return {
      imageUrl: media.url,
    };
  }
);
