'use server';
/**
 * @fileOverview An AI agent that generates a single multiple-choice question.
 *
 * - generateSingleQuestion - A function that creates one question.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { QuizQuestionSchema, type QuizQuestion } from '@/lib/types';

const GenerateSingleQuestionInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to generate the question.'),
  difficulty: z.number().min(1).max(10).describe('The desired difficulty of the question, from 1 (easiest) to 10 (hardest).'),
  existingQuestionIds: z.array(z.string()).optional().describe('An array of question IDs that should not be regenerated to avoid duplicates.'),
});
type GenerateSingleQuestionInput = z.infer<typeof GenerateSingleQuestionInputSchema>;


export async function generateSingleQuestion(
  input: GenerateSingleQuestionInput
): Promise<QuizQuestion> {
  return generateSingleQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSingleQuestionPrompt',
  input: { schema: GenerateSingleQuestionInputSchema },
  output: { schema: QuizQuestionSchema },
  prompt: `You are an expert in creating educational content. Your task is to generate a single multiple-choice question from the provided source text.

The question should have a difficulty level of approximately {{{difficulty}}} out of 10.
The question must have 3 or 4 answer options.
Exactly one option must be correct.
The question ID must be a unique string.

{{#if existingQuestionIds}}
Do not generate a question that is identical or very similar to the questions represented by these IDs: {{{existingQuestionIds}}}.
{{/if}}

Source Text:
{{{sourceText}}}
`,
});

const generateSingleQuestionFlow = ai.defineFlow(
  {
    name: 'generateSingleQuestionFlow',
    inputSchema: GenerateSingleQuestionInputSchema,
    outputSchema: QuizQuestionSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
