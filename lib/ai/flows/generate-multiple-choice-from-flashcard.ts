import { z } from 'zod';
import { ai } from '@lib/ai/genkit';
import { McqQuestionSchema, McqQuestion } from '@/lib/types';

const GenerateMultipleChoiceFromFlashcardInputSchema = z.object({
  front: z.string().describe("The front of the flashcard (the term or prompt)."),
  back: z.string().describe("The back of the flashcard (the definition or answer)."),
});

export const generateMultipleChoiceFromFlashcard = ai.defineFlow(
    {
        name: 'generateMultipleChoiceFromFlashcard',
        inputSchema: GenerateMultipleChoiceFromFlashcardInputSchema,
        outputSchema: McqQuestionSchema,
    },
    async (input: z.infer<typeof GenerateMultipleChoiceFromFlashcardInputSchema>) => {
        const { front, back } = input;

        const prompt = `You are an expert in creating educational content. Your task is to generate a single multiple-choice question based on a flashcard.

The flashcard has a "front" and a "back".
- The "front" is the prompt: "${front}"
- The "back" is the correct answer: "${back}"

Your task:
1.  Create a clear question based on the flashcard's "front". The ID for the question should be a unique kebab-case string.
2.  The "back" of the flashcard is the correct answer. Include it as one of the options.
3.  Generate 2 or 3 plausible but incorrect "distractor" options. They should be related to the topic but clearly wrong.
4.  The total number of options should be 3 or 4.
5.  Each option needs a unique ID (e.g., "a", "b", "c").
6.  Shuffle the options so the correct answer is not always in the same position.
7.  Return the ID of the correct option in the 'correctOptionId' field.
`;

        const llmResponse = await ai.generate({
            prompt: prompt,
            model: 'gemini-1.5-flash',
            output: {
                format: 'json',
                schema: McqQuestionSchema,
            },
        });

        const question = llmResponse.output;

        if (!question) {
            throw new Error("Failed to generate multiple choice question");
        }

        return question;
    }
);
