
'use server';
/**
 * @fileOverview An AI agent that explains why a quiz answer is correct or incorrect.
 *
 * - explainAnswer - A function that generates an explanation.
 */

import { ai, getGoogleAIModel } from '@/ai/genkit';
import { z } from 'genkit';

const ExplainAnswerInputSchema = z.object({
  question: z.string().describe('The quiz question that was asked.'),
  selectedAnswer: z.string().describe('The answer the user selected.'),
  correctAnswer: z.string().describe('The correct answer to the question.'),
  isCorrect: z.boolean().describe('Whether the user\'s answer was correct.').optional(), // Made optional
  sources: z.array(z.string()).describe('Optional array of URLs or references for the explanation.').optional(), // Made optional
});
type ExplainAnswerInput = z.infer<typeof ExplainAnswerInputSchema>;

const ExplainAnswerOutputSchema = z.object({
  explanation: z.string().describe('A brief explanation tailored to the user\'s answer.'),
  sources: z.array(z.string()).optional().describe('Optional array of URLs or references for the explanation.'),
});
type ExplainAnswerOutput = z.infer<typeof ExplainAnswerOutputSchema>;

export async function explainAnswer(
  input: ExplainAnswerInput
): Promise<ExplainAnswerOutput> {
  return explainAnswerFlow(input);
}

const explainAnswerFlow = ai.defineFlow(
  {
    name: 'explainAnswerFlow',
    inputSchema: ExplainAnswerInputSchema,
    outputSchema: ExplainAnswerOutputSchema,
  },
  async (input) => {
    const prompt = ai.definePrompt({
      name: 'explainAnswerPrompt',
      model: 'gemini-2.5-flash',
      input: { schema: ExplainAnswerInputSchema },
      output: { schema: ExplainAnswerOutputSchema },
      prompt: `You are an expert educational tutor. Provide accurate, factual information, and avoid making things up. Focus solely on explaining the correctness or incorrectness of the answers. Do NOT include any complimentary phrases like "nice try", "almost had it", or "good job". When generating explanations, if external sources like Wikipedia have been provided, refer to them to verify and backup the explanation.

Question: "{{{question}}}"
Student\'s Answer: "{{{selectedAnswer}}}"
Correct Answer: "{{{correctAnswer}}}"

{{#if isCorrect}}
Here\'s why your answer was correct:
1. **Reasoning for Correctness:** Explain in detail why the student\'s selected answer is the correct one, drawing connections to core concepts.
2. **Reinforcement:** Briefly reiterate the key concepts or principles that validate this answer.

{{else}}
Here\'s why your answer was incorrect and why the correct answer is right:
1. **Error Analysis:** Clearly explain why the student\'s selected answer is incorrect. Point out any common misconceptions or misinterpretations that might lead to such an error.
2. **Correct Reasoning:** Provide a thorough explanation of the logical steps and facts that lead to the correct answer.
3. **Contrast and Clarification:** Explicitly compare the incorrect reasoning with the correct reasoning, highlighting the critical differences.

{{/if}}
`,
    });
    const { output } = await prompt(input);
    // Sources will be handled by quiz-taker.tsx and passed here if available
    return {
      explanation: output!.explanation,
      sources: input.sources, // Pass through sources if provided by the caller
    };
  }
);
