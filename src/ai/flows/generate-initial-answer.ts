'use server';

/**
 * @fileOverview This flow generates an initial answer to a student's question using AI.
 *
 * - generateInitialAnswer - A function that handles the generation of the initial answer.
 * - GenerateInitialAnswerInput - The input type for the generateInitialAnswer function.
 * - GenerateInitialAnswerOutput - The return type for the generateInitialAnswer function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialAnswerInputSchema = z.object({
  question: z.string().describe('The question asked by the student.'),
  context: z.string().optional().describe('Additional context for the question, such as the subject or topic.'),
});
export type GenerateInitialAnswerInput = z.infer<typeof GenerateInitialAnswerInputSchema>;

const GenerateInitialAnswerOutputSchema = z.object({
  answer: z.string().describe('The AI-generated initial answer to the question.'),
});
export type GenerateInitialAnswerOutput = z.infer<typeof GenerateInitialAnswerOutputSchema>;

export async function generateInitialAnswer(input: GenerateInitialAnswerInput): Promise<GenerateInitialAnswerOutput> {
  return generateInitialAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateInitialAnswerPrompt',
  input: {schema: GenerateInitialAnswerInputSchema},
  output: {schema: GenerateInitialAnswerOutputSchema},
  prompt: `You are an AI assistant helping students by providing initial answers to their questions. The answer should be in markdown format. Consider the context provided and generate a helpful and informative answer.\n\nContext: {{{context}}}\n\nQuestion: {{{question}}}\n\nAnswer: `,
});

const generateInitialAnswerFlow = ai.defineFlow(
  {
    name: 'generateInitialAnswerFlow',
    inputSchema: GenerateInitialAnswerInputSchema,
    outputSchema: GenerateInitialAnswerOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
