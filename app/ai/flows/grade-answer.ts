'use server';
/**
 * @fileOverview AI agent for grading student answers
 *
 * - gradeStudentAnswer - A function that grades student responses
 */

import { ai, getGoogleAIModel } from '@/ai/genkit';
import { z } from 'genkit';

const GradeAnswerInputSchema = z.object({
  question: z.string().describe('The question or assignment text'),
  studentAnswer: z.string().describe('The student\'s answer to grade'),
  questionType: z.string().describe('Type of question (multiple_choice, open_question, fill_in_blank, etc.)'),
  gradingCriteria: z.string().optional().describe('Specific grading criteria provided by teacher'),
  sampleAnswer: z.string().optional().describe('Sample correct answer for reference'),
});

const GradeAnswerOutputSchema = z.object({
  score: z.number().min(0).max(100).describe('Score from 0-100'),
  feedback: z.string().describe('Brief feedback explaining the grade'),
  reasoning: z.string().describe('Detailed reasoning for the grade'),
  isCorrect: z.boolean().describe('Whether the answer is considered correct'),
});

type GradeAnswerInput = z.infer<typeof GradeAnswerInputSchema>;
type GradeAnswerOutput = z.infer<typeof GradeAnswerOutputSchema>;

export async function gradeStudentAnswer(input: GradeAnswerInput): Promise<GradeAnswerOutput> {
  return gradeAnswerFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gradeAnswerPrompt',
  model: getGoogleAIModel() as any,
  input: { schema: GradeAnswerInputSchema },
  output: { schema: GradeAnswerOutputSchema },
  prompt: `You are an expert educator grading student answers. Your task is to evaluate the student's response and provide a fair, accurate grade.

QUESTION TYPE: {{{questionType}}}
QUESTION: {{{question}}}
STUDENT ANSWER: {{{studentAnswer}}}

{{#if gradingCriteria}}
GRADING CRITERIA: {{{gradingCriteria}}}
{{/if}}

{{#if sampleAnswer}}
SAMPLE CORRECT ANSWER: {{{sampleAnswer}}}
{{/if}}

Please evaluate the student's answer and provide:

1. **score**: A number from 0-100 representing the quality and correctness of the answer
2. **feedback**: A brief, constructive explanation of the grade (2-3 sentences max)
3. **reasoning**: Detailed reasoning explaining why you gave this score, including what was correct/incorrect
4. **isCorrect**: Boolean indicating if the answer is substantially correct (true for scores 80+)

Be fair, accurate, and encouraging in your feedback. Consider partial credit for partially correct answers.`,
});

const gradeAnswerFlow = ai.defineFlow(
  {
    name: 'gradeAnswerFlow',
    inputSchema: GradeAnswerInputSchema,
    outputSchema: GradeAnswerOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);