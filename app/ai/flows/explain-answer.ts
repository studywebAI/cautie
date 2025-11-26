'use server';
/**
 * @fileOverview An AI agent that explains why a quiz answer is correct or incorrect.
 *
 * - explainAnswer - A function that generates an explanation.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainAnswerInputSchema = z.object({
  question: z.string().describe('The quiz question that was asked.'),
  selectedAnswer: z.string().describe('The answer the user selected.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  isCorrect: z.boolean().describe('Whether the user\'s answer was correct.'),
});
type ExplainAnswerInput = z.infer<typeof ExplainAnswerInputSchema>;

const ExplainAnswerOutputSchema = z.object({
  explanation: z.string().describe('A brief explanation tailored to the user\'s answer.'),
});
type ExplainAnswerOutput = z.infer<typeof ExplainAnswerOutputSchema>;

export async function explainAnswer(
  input: ExplainAnswerInput
): Promise<ExplainAnswerOutput> {
  return explainAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainAnswerPrompt',
  input: { schema: ExplainAnswerInputSchema },
  output: { schema: ExplainAnswerOutputSchema },
  prompt: `You are a helpful study assistant. A student has just answered a quiz question. Your task is to provide a concise explanation.

Question: "{{{question}}}"
The correct answer is: "{{{correctAnswer}}}"

{{#if isCorrect}}
The user chose "{{{selectedAnswer}}}", which is the correct answer.
Briefly explain why this answer is correct.
{{else}}
The user chose "{{{selectedAnswer}}}", which is incorrect.
Briefly explain why the user's answer is wrong and why the correct answer is right.
{{/if}}

Keep the explanation clear, friendly, and under 50 words.
`,
});

const explainAnswerFlow = ai.defineFlow(
  {
    name: 'explainAnswerFlow',
    inputSchema: ExplainAnswerInputSchema,
    outputSchema: ExplainAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
