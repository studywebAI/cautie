
import { defineFlow } from '@genkit-ai/core';
import { z } from 'zod';
import { ai } from '@lib/ai/genkit';

const ClassIdeaSchema = z.object({
  id: z.string().describe('A unique identifier for this class idea.'),
  name: z.string().describe('A creative and engaging name for the class.'),
  description: z.string().describe('A one-sentence description of what the class covers.'),
});

const GenerateClassIdeasInputSchema = z.object({
  subject: z.string().describe('The general subject for the class (e.g., "History", "Physics").'),
});

const GenerateClassIdeasOutputSchema = z.object({
  ideas: z.array(ClassIdeaSchema).describe('An array of 3-4 creative class ideas.'),
});

export const generateClassIdeas = defineFlow(
    {
        name: 'generateClassIdeas',
        inputSchema: GenerateClassIdeasInputSchema,
        outputSchema: GenerateClassIdeasOutputSchema,
    },
    async (input) => {
        const { subject } = input;

        const prompt = `You are an AI curriculum designer helping a teacher. Your task is to brainstorm engaging class ideas based on a subject.

Subject: ${subject}

Generate 3-4 creative and distinct class ideas. For each idea, provide a compelling name and a concise, one-sentence description.
Make the names sound interesting and not generic (e.g., instead of "History 101", suggest "The Age of Revolutions: 1750-1914").
The description should clearly state what the class is about.
`;

        const llmResponse = await ai.generate({
            prompt: prompt,
            model: 'gemini-1.5-flash',
            output: {
                format: 'json',
                schema: GenerateClassIdeasOutputSchema,
            },
        });

        return llmResponse.output() || { ideas: [] };
    }
);
