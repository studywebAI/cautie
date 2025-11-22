'use server';
/**
 * @fileOverview An AI agent that generates flashcards from a given text.
 *
 * - generateFlashcards - A function that creates flashcards.
 * - GenerateFlashcardsInput - The input type for the function.
 * - GenerateFlashcardsOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const FlashcardSchema = z.object({
  front: z.string().describe('The front side of the flashcard, containing a key term or a question.'),
  back: z.string().describe('The back side of the flashcard, containing the definition or answer.'),
});
export type Flashcard = z.infer<typeof FlashcardSchema>;

const GenerateFlashcardsInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to generate flashcards.'),
});
export type GenerateFlashcardsInput = z.infer<typeof GenerateFlashcardsInputSchema>;

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
  prompt: `You are an expert in creating effective learning materials. Your task is to generate a set of flashcards based on the provided source text. Each flashcard should have a clear 'front' (a term or question) and a concise 'back' (the corresponding definition or answer). Create between 5 and 10 flashcards.

Source Text:
{{{sourceText}}}
`,
});

const generateFlashcardsFlow = ai.defineFlow(
  {
    name: 'generateFlashcardsFlow',
    inputSchema: GenerateFlashcardsInputSchema,
    outputSchema: GenerateFlashcardsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
