'use server';
/**
 * @fileOverview An AI agent that generates a multiple-choice quiz from source text.
 *
 * - generateQuiz - A function that creates a quiz.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { QuizSchema, type Quiz } from '@/lib/types';


const GenerateQuizInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to generate the quiz.'),
  questionCount: z.number().optional().default(7).describe('The desired number of questions.'),
  existingQuestionIds: z.array(z.string()).optional().describe('An array of question IDs that should not be regenerated.'),
});
type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;


export async function generateQuiz(
  input: GenerateQuizInput
): Promise<Quiz> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: { schema: GenerateQuizInputSchema },
  output: { schema: QuizSchema },
  prompt: `You are an expert in creating educational content. Your task is to generate a multiple-choice quiz from the provided source text.

The quiz should have a relevant title and a brief description.
Create exactly {{{questionCount}}} questions.
Each question must have 3 or 4 answer options.
Exactly one option for each question must be correct.
{{#if existingQuestionIds}}
Do not generate questions that are identical or very similar to the questions represented by these IDs: {{{existingQuestionIds}}}.
{{/if}}

Source Text:
{{{sourceText}}}
`,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: QuizSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
