
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
  prompt: `You are an expert educational tutor. When a student answers a quiz question, provide a detailed, structured explanation to enhance their understanding.

Question: "{{{question}}}"
Correct Answer: "{{{correctAnswer}}}"
Student's Answer: "{{{selectedAnswer}}}"

{{#if isCorrect}}
**Analysis of Correct Answer:**
1. **Why It's Right:** Explain the reasoning behind the correct answer, connecting it to core concepts.
2. **Key Concepts:** Highlight 2-3 fundamental ideas or principles that support this answer.
3. **Study Tips:** Suggest study strategies to reinforce this knowledge.
4. **Real-World Example:** Provide a practical example or analogy to solidify understanding.

{{else}}
**Comprehensive Explanation:**
1. **Error Analysis:** Diagnose why the selected answer is incorrect - common misconceptions? Misinterpretation? 
2. **Correct Reasoning:** Break down the logical steps to arrive at the correct answer.
3. **Contrast:** Explicitly compare the incorrect vs correct reasoning.
4. **Key Concepts:** Identify 2-3 fundamental ideas needed to understand this question.
5. **Study Plan:** Recommend specific resources or practice methods to address gaps.
6. **Example Scenario:** Provide a practical example demonstrating the correct approach.

{{/if}}
**Final Summary:** Concisely restate the main takeaway in 1-2 sentences.
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
