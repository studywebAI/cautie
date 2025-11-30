
import { defineFlow } from '@genkit-ai/core';
import { z } from 'zod';
import { ai } from '@lib/ai/genkit';

const NoteSchema = z.object({
  title: z.string().describe('The title of the note section.'),
  content: z.string().describe('The detailed content of the note in markdown format.'),
});

const GenerateNotesInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to generate notes.'),
  topic: z.string().optional().describe('The main topic to focus on.'),
});

const GenerateNotesOutputSchema = z.object({
  notes: z.array(NoteSchema).describe('An array of generated note sections.'),
});

export const generateNotes = defineFlow(
    {
        name: 'generateNotes',
        inputSchema: GenerateNotesInputSchema,
        outputSchema: GenerateNotesOutputSchema,
    },
    async (input) => {
        const { sourceText, topic } = input;

        const prompt = `You are an expert notetaker. Your task is to create a structured set of notes from the provided source text, focusing on the given topic if provided.

Source Text:
${sourceText}

${topic ? `Topic: ${topic}` : ''}

Generate a set of notes with clear titles and content formatted in Markdown.
`;

        const llmResponse = await ai.generate({
            prompt: prompt,
            model: 'gemini-1.5-flash',
            output: {
                format: 'json',
                schema: GenerateNotesOutputSchema,
            },
        });

        return llmResponse.output() || { notes: [] };
    }
);
