
import { defineFlow } from '@genkit-ai/core';
import { z } from 'zod';
import { ai } from '@lib/ai/genkit';

const ExplainAnswerInputSchema = z.object({
  question: z.string().describe('The quiz question that was asked.'),
  selectedAnswer: z.string().describe('The answer the user selected.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  isCorrect: z.boolean().describe('Whether the user\'s answer was correct.'),
});

const ExplainAnswerOutputSchema = z.object({
  explanation: z.string().describe('A brief explanation tailored to the user\'s answer.'),
});

export const explainAnswer = defineFlow(
    {
        name: 'explainAnswer',
        inputSchema: ExplainAnswerInputSchema,
        outputSchema: ExplainAnswerOutputSchema,
    },
    async (input) => {
        const { question, selectedAnswer, correctAnswer, isCorrect } = input;

        const prompt = `You are a helpful study assistant. A student has just answered a quiz question. Your task is to provide a concise explanation.

Question: "${question}"
The correct answer is: "${correctAnswer}"

${isCorrect ? `The user chose "${selectedAnswer}", which is the correct answer.\nBriefly explain why this answer is correct.` : `The user chose "${selectedAnswer}", which is incorrect.\nBriefly explain why the user's answer is wrong and why the correct answer is right.`}

Keep the explanation clear, friendly, and under 50 words.
`;

        const llmResponse = await ai.generate({
            prompt: prompt,
            model: 'gemini-1.5-flash',
            output: {
                format: 'json',
                schema: ExplainAnswerOutputSchema,
            },
        });

        return llmResponse.output() || { explanation: '' };
    }
);
