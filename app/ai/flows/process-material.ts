'use server';
/**
 * @fileOverview Processes user-provided material (text or file) and suggests learning activities.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProcessMaterialInputSchema = z.object({
  text: z.string().optional().describe('Pasted text content.'),
  fileDataUri: z.string().optional().describe("A file encoded as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
  language: z.string().optional().describe('The language for the output (en, nl, fr). Defaults to English.'),
});
type ProcessMaterialInput = z.infer<typeof ProcessMaterialInputSchema>;

const SuggestedActionSchema = z.object({
  id: z.enum(['create-a-summary', 'generate-a-quiz', 'make-flashcards']),
  label: z.string(),
  description: z.string(),
  icon: z.enum(['FileText', 'BrainCircuit', 'BookCopy']),
});

const ProcessMaterialOutputSchema = z.object({
  analysis: z.object({
    title: z.string(),
    topic: z.string(),
    summary: z.string(),
    sourceText: z.string(),
  }),
  suggestedActions: z.array(SuggestedActionSchema),
});
export type ProcessMaterialOutput = z.infer<typeof ProcessMaterialOutputSchema>;

/* -------------------------------------------
   FIX: Define the flow FIRST, then export the
   wrapper function that calls it.
-------------------------------------------- */

const processMaterialFlow = ai.defineFlow(
  {
    name: 'processMaterial',
    inputSchema: ProcessMaterialInputSchema,
    outputSchema: ProcessMaterialOutputSchema,
  },
  async input => {
    const prompt = ai.definePrompt({
      name: 'processMaterialPrompt',
      model: 'gemini-2.5-flash',
      input: { schema: ProcessMaterialInputSchema },
      output: { schema: ProcessMaterialOutputSchema },
      prompt: `
You are an expert learning assistant. Extract all text, analyze it, and generate:
- A clear title
- The main topic
- A concise summary
- Suggested next actions (summary / quiz / flashcards)

Language code: {{{language}}}. Default: English.

Material:
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

    const { output } = await prompt(input);
    return output!;
  }
);

/* -------------------------------------------
   The exported function now works correctly
-------------------------------------------- */
export async function processMaterial(input: ProcessMaterialInput) {
  return processMaterialFlow(input);
}
