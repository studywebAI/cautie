
'use server';
/**
 * @fileOverview An AI agent that generates flashcards from a given text.
 *
 * - generateFlashcards - A function that creates flashcards.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { FlashcardSchema } from '@/lib/types';

const GenerateFlashcardsInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to generate flashcards.'),
  count: z.number().optional().default(10).describe('The number of flashcards to generate.'),
  existingFlashcardIds: z.array(z.string()).optional().describe('An array of flashcard front texts that should not be regenerated.'),
});
type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('An array of generated flashcards.'),
});
export type GenerateFlashcardsOutput = z.infer<typeof GenerateFlashcardsOutputSchema>;

export async function generateFlashcards(
  input: GenerateFlashcardsInput
): Promise<GenerateFlashcardsOutput> {
  return generateFlashcardsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateFlashcardsPrompt',
  input: { schema: GenerateFlashcardsInputSchema },
  output: { schema: GenerateFlashcardsOutputSchema },
  prompt: `You are an expert in creating effective learning materials. Your task is to generate a set of flashcards based on the provided source text. Create exactly {{{count}}} flashcards.\n\nFor each flashcard, you must provide:\n1.  **id**: a unique, short, kebab-case string based on the front of the card.\n2.  **front**: A key term or a question.\n3.  **back**: The corresponding definition or answer.\n4.  **cloze**: A "fill-in-the-blank" sentence based on the definition where the word(s) from the 'back' are replaced with "____". This sentence should provide enough context to guess the missing word.\n\n{{#if existingFlashcardIds}}\nDo not generate flashcards with front text that is identical or very similar to the text from this list: {{{existingFlashcardIds}}}.\n{{/if}}\n\nExample:\n- id: "mitochondria"\n- front: "Mitochondria"\n- back: "powerhouse of the cell"\n- cloze: "The mitochondria is often called the ____."\n\nSource Text:\n{{{sourceText}}}\n`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (error) {
      console.error("Error generating flashcards from AI:", error);
      return { flashcards: [] };
    }
  }
);
