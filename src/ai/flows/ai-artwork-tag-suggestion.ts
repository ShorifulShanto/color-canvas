'use server';
/**
 * @fileOverview An AI agent that suggests relevant tags for artwork based on an image and optional description.
 *
 * - suggestArtworkTags - A function that handles the artwork tag suggestion process.
 * - ArtworkTagSuggestionInput - The input type for the suggestArtworkTags function.
 * - ArtworkTagSuggestionOutput - The return type for the suggestArtworkTags function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ArtworkTagSuggestionInputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "A photo of the artwork, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  description: z
    .string()
    .optional()
    .describe(
      'An optional text description provided by the user about the artwork.'
    ),
});
export type ArtworkTagSuggestionInput = z.infer<
  typeof ArtworkTagSuggestionInputSchema
>;

const ArtworkTagSuggestionOutputSchema = z.object({
  tags: z.array(z.string()).describe('A list of suggested tags for the artwork.'),
});
export type ArtworkTagSuggestionOutput = z.infer<
  typeof ArtworkTagSuggestionOutputSchema
>;

export async function suggestArtworkTags(
  input: ArtworkTagSuggestionInput
): Promise<ArtworkTagSuggestionOutput> {
  return aiArtworkTagSuggestionFlow(input);
}

const artworkTagSuggestionPrompt = ai.definePrompt({
  name: 'artworkTagSuggestionPrompt',
  input: {schema: ArtworkTagSuggestionInputSchema},
  output: {schema: ArtworkTagSuggestionOutputSchema},
  prompt: `You are an AI assistant specialized in generating relevant tags for artwork.
Based on the provided image and description, suggest a list of appropriate tags. Focus on themes, subjects, styles, and mood.

Description: {{{description}}}
Photo: {{media url=imageDataUri}}`,
});

const aiArtworkTagSuggestionFlow = ai.defineFlow(
  {
    name: 'aiArtworkTagSuggestionFlow',
    inputSchema: ArtworkTagSuggestionInputSchema,
    outputSchema: ArtworkTagSuggestionOutputSchema,
  },
  async (input) => {
    const {output} = await artworkTagSuggestionPrompt(input);
    return output!;
  }
);
