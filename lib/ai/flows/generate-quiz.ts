
import { defineFlow } from '@genkit-ai/core';
import { z } from 'zod';
import { ai } from '@lib/ai/genkit';
import { QuizSchema } from '@lib/types';

const GenerateQuizInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to generate the quiz.'),
  questionCount: z.number().optional().default(7).describe('The desired number of questions.'),
  existingQuestionIds: z.array(z.string()).optional().describe('An array of question IDs that should not be regenerated.'),
});

export const generateQuiz = defineFlow(
    {
        name: 'generateQuiz',
        inputSchema: GenerateQuizInputSchema,
        outputSchema: QuizSchema,
    },
    async (input) => {
        const { sourceText, questionCount, existingQuestionIds } = input;

        const prompt = `You are an expert in creating educational content. Your task is to generate a multiple-choice quiz from the provided source text.

The quiz should have a relevant title and a brief description.
Create exactly ${questionCount} questions.
Each question must have 3 or 4 answer options.
Exactly one option for each question must be correct.
${existingQuestionIds && existingQuestionIds.length > 0 ? `Do not generate questions that are identical or very similar to the questions represented by these IDs: ${existingQuestionIds.join(', ')}.` : ''}

Source Text:
${sourceText}
`;

        const llmResponse = await ai.generate({
            prompt: prompt,
            model: 'gemini-1.5-flash',
            output: {
                format: 'json',
                schema: QuizSchema,
            },
        });

        const quiz = llmResponse.output();

        if (!quiz) {
            throw new Error("Failed to generate quiz");
        }

        // Ensure the quiz has a title and description
        quiz.title = quiz.title || 'Generated Quiz';
        quiz.description = quiz.description || 'A quiz generated from your document.';

        return quiz;
    }
);
