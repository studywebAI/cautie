
import { defineFlow } from '@genkit-ai/core';
import { z } from 'zod';
import { ai } from '@lib/ai/genkit';

const GeneratePersonalizedStudyPlanInputSchema = z.object({
  deadlines: z
    .string()
    .describe('A list of deadlines for upcoming assignments and exams.'),
  learningHabits: z
    .string()
    .describe(
      'A description of the students learning habits, including preferred study times, subjects, and methods.'
    ),
  calendar: z
    .string()
    .describe(
      'The students calendar, including scheduled classes, appointments, and other commitments.'
    ),
});

const GeneratePersonalizedStudyPlanOutputSchema = z.object({
  studyPlan: z.string().describe('A personalized study plan for the student.'),
});

export const generatePersonalizedStudyPlan = defineFlow(
    {
        name: 'generatePersonalizedStudyPlan',
        inputSchema: GeneratePersonalizedStudyPlanInputSchema,
        outputSchema: GeneratePersonalizedStudyPlanOutputSchema,
    },
    async (input) => {
        const { deadlines, learningHabits, calendar } = input;

        const prompt = `You are an AI study assistant. You will generate a personalized study plan for the student based on their deadlines, learning habits, and calendar.

Deadlines: ${deadlines}
Learning Habits: ${learningHabits}
Calendar: ${calendar}

Study Plan:`;

        const llmResponse = await ai.generate({
            prompt: prompt,
            model: 'gemini-1.5-flash',
            output: {
                format: 'json',
                schema: GeneratePersonalizedStudyPlanOutputSchema,
            },
        });

        return llmResponse.output() || { studyPlan: '' };
    }
);
