'use server';
/**
 * @fileOverview An AI agent that generates structured notes from text.
 *
 * - generateNotes - A function that returns notes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NoteSchema = z.object({
  title: z.string().describe('The title of the note section.'),
  content: z.string().describe('The detailed content of the note in markdown format.'),
});

const GenerateNotesInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to generate notes.'),
  topic: z.string().optional().describe('The main topic to focus on.'),
});
type GenerateNotesInput = z.infer<typeof GenerateNotesInputSchema>;

const GenerateNotesOutputSchema = z.object({
  notes: z.array(NoteSchema).describe('An array of generated note sections.'),
});
export type GenerateNotesOutput = z.infer<typeof GenerateNotesOutputSchema>;

export async function generateNotes(
  input: GenerateNotesInput
): Promise<GenerateNotesOutput> {
  return generateNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateNotesPrompt',
  input: { schema: GenerateNotesInputSchema },
  output: { schema: GenerateNotesOutputSchema },
  prompt: `You are an expert notetaker. Your task is to create a structured set of notes from the provided source text, focusing on the given topic if provided.

Source Text:
{{{sourceText}}}

{{#if topic}}
Topic: {{{topic}}}
{{/if}}

Generate a set of notes with clear titles and content formatted in Markdown.
`,
});

const generateNotesFlow = ai.defineFlow(
  {
    name: 'generateNotesFlow',
    inputSchema: GenerateNotesInputSchema,
    outputSchema: GenerateNotesOutputSchema,
  },
  async (input) => {
    try {
      const { output } = await prompt(input);
      return output!;
    } catch (error) {
      console.error("Error generating notes from AI:", error);
      // Return a default empty structure or rethrow a custom error
      return { notes: [] };
    }
  }
);
