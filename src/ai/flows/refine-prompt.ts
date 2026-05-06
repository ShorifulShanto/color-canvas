
'use server';
/**
 * @fileOverview An AI agent that refines simple user prompts into detailed artistic descriptions.
 *
 * - refineArtPrompt - A function that takes a simple prompt and returns a detailed version.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RefinePromptInputSchema = z.object({
  prompt: z.string().describe('The simple prompt provided by the user.'),
});

const RefinePromptOutputSchema = z.object({
  refinedPrompt: z.string().describe('The detailed, artistic version of the prompt.'),
});

const refinePromptAgent = ai.definePrompt({
  name: 'refinePromptAgent',
  input: { schema: RefinePromptInputSchema },
  output: { schema: RefinePromptOutputSchema },
  prompt: `You are an expert prompt engineer for AI image generators like SDXL.
Your goal is to take a simple, short prompt from a user and expand it into a detailed, descriptive, and artistic prompt that includes information about style, lighting, composition, and mood.

User Prompt: {{{prompt}}}

Output a single refined version of this prompt that will yield a stunning masterpiece.`,
});

export async function refineArtPrompt(input: { prompt: string }) {
  const { output } = await refinePromptAgent(input);
  return output!;
}
