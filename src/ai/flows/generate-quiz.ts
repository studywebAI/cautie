'use server';
/**
 * @fileOverview An AI agent that generates a multiple-choice quiz from source text.
 *
 * - generateQuiz - A function that creates a quiz.
 * - GenerateQuizInput - The input type for the function.
 * - Quiz - The return type for the function (the quiz object).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const QuizOptionSchema = z.object({
  id: z.string().describe('Unique identifier for the option (e.g., "a", "b", "c").'),
  text: z.string().describe('The text of the answer option.'),
  isCorrect: z.boolean().describe('Whether this option is the correct answer.'),
});

const QuizQuestionSchema = z.object({
  id: z.string().describe('Unique identifier for the question.'),
  question: z.string().describe('The text of the question.'),
  options: z.array(QuizOptionSchema).describe('An array of 3 to 4 possible answer options.'),
});

const QuizSchema = z.object({
  title: z.string().describe('A suitable title for the quiz, based on the source text.'),
  description: z.string().describe('A brief description of the quiz content.'),
  questions: z.array(QuizQuestionSchema).describe('An array of 5 to 10 multiple-choice questions.'),
});

export type QuizOption = z.infer<typeof QuizOptionSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;
export type Quiz = z.infer<typeof QuizSchema>;


const GenerateQuizInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to generate the quiz.'),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;


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
Create between 5 and 10 questions.
Each question must have 3 or 4 answer options.
Exactly one option for each question must be correct.

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
