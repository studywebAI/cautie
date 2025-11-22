'use server';
/**
 * @fileOverview Processes user-provided material (text or file) and suggests learning activities.
 *
 * - processMaterial - Analyzes content and provides a summary and suggested actions.
 * - ProcessMaterialInput - The input type for the processMaterial function.
 * - ProcessMaterialOutput - The return type for the processMaterial function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProcessMaterialInputSchema = z.object({
  text: z.string().optional().describe('Pasted text content.'),
  fileDataUri: z.string().optional().describe("A file encoded as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type ProcessMaterialInput = z.infer<typeof ProcessMaterialInputSchema>;

const SuggestedActionSchema = z.object({
  id: z.string().describe('Unique ID for the action.'),
  label: z.string().describe('The button text for the action (e.g., "Create a summary").'),
  description: z.string().describe('A brief description of what this action does.'),
  icon: z.enum(['FileText', 'BrainCircuit', 'BookCopy']).describe('Icon to display with the action.'),
});

const ProcessMaterialOutputSchema = z.object({
  analysis: z.object({
    title: z.string().describe('A suitable title for the provided content.'),
    topic: z.string().describe('The main topic or subject of the content.'),
    summary: z.string().describe('A concise summary of the material.'),
  }),
  suggestedActions: z.array(SuggestedActionSchema).describe('A list of AI-suggested next steps or activities.'),
});
export type ProcessMaterialOutput = z.infer<typeof ProcessMaterialOutputSchema>;

export async function processMaterial(input: ProcessMaterialInput): Promise<ProcessMaterialOutput> {
  return processMaterialFlow(input);
}

const prompt = ai.definePrompt({
  name: 'processMaterialPrompt',
  input: {schema: ProcessMaterialInputSchema},
  output: {schema: ProcessMaterialOutputSchema},
  prompt: `You are an expert learning assistant. Analyze the following material, which is provided as either text or a file. Your task is to understand the content, create a summary, and suggest relevant learning activities. The entire output should be in English.

Your analysis should include:
1.  A short, descriptive title for the material.
2.  The main topic or subject (e.g., "History", "Physics", "Poetry").
3.  A concise summary of the key points.

Based on the content, suggest 3 relevant actions from the following options: "Create a summary", "Generate a quiz", "Make flashcards". Provide a brief description for each suggested action.

Material to analyze:
{{#if text}}
Text:
{{{text}}}
{{/if}}
{{#if fileDataUri}}
File:
{{media url=fileDataUri}}
{{/if}}
`,
});

const processMaterialFlow = ai.defineFlow(
  {
    name: 'processMaterialFlow',
    inputSchema: ProcessMaterialInputSchema,
    outputSchema: ProcessMaterialOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
