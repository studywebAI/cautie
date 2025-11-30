
import { defineFlow } from '@genkit-ai/core';
import { z } from 'zod';
import { ai } from '@lib/ai/genkit';
import { FlashcardSchema } from '@lib/types';

const GenerateFlashcardsInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to generate flashcards.'),
  count: z.number().optional().default(10).describe('The number of flashcards to generate.'),
  existingFlashcardIds: z.array(z.string()).optional().describe('An array of flashcard front texts that should not be regenerated.'),
});

const GenerateFlashcardsOutputSchema = z.object({
  flashcards: z.array(FlashcardSchema).describe('An array of generated flashcards.'),
});

export const generateFlashcards = defineFlow(
    {
        name: 'generateFlashcards',
        inputSchema: GenerateFlashcardsInputSchema,
        outputSchema: GenerateFlashcardsOutputSchema,
    },
    async (input) => {
        const { sourceText, count, existingFlashcardIds } = input;

        const prompt = `You are an expert in creating effective learning materials. Your task is to generate a set of flashcards based on the provided source text. Create exactly ${count} flashcards.

For each flashcard, you must provide:
1.  **id**: a unique, short, kebab-case string based on the front of the card.
2.  **front**: A key term or a question.
3.  **back**: The corresponding definition or answer.
4.  **cloze**: A "fill-in-the-blank" sentence based on the definition where the word(s) from the 'back' are replaced with "____". This sentence should provide enough context to guess the missing word.

${existingFlashcardIds && existingFlashcardIds.length > 0 ? `Do not generate flashcards with front text that is identical or very similar to the text from this list: ${existingFlashcardIds.join(', ')}.` : ''}

Example:
- id: "mitochondria"
- front: "Mitochondria"
- back: "powerhouse of the cell"
- cloze: "The mitochondria is often called the ____."

Source Text:
${sourceText}
`;

        const llmResponse = await ai.generate({
            prompt: prompt,
            model: 'gemini-1.5-flash',
            output: {
                format: 'json',
                schema: GenerateFlashcardsOutputSchema,
            },
        });

        return llmResponse.output() || { flashcards: [] };
    }
);
