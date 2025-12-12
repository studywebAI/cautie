'use server';
/**
 * @fileOverview An AI agent that generates structured notes from text.
 *
 * - generateNotes - A function that returns notes.
 */

import { ai, getGoogleAIModel } from '@/ai/genkit';
import { z } from 'genkit';

const NoteSchema = z.object({
  title: z.string().describe('The title of the note section.'),
  content: z.string().or(z.array(z.string())).describe('The detailed content. For visual styles, use structured JSON format. For text styles, use markdown format. No ASCII art or HTML unless specified.'),
});

const GenerateNotesInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to generate notes.'),
  imageDataUri: z.string().optional().describe('Base64 data URI of an image to analyze as context.'),
  topic: z.string().optional().describe('The main topic to focus on.'),
  length: z.string().optional().describe('The desired length of the notes: short, medium, long.'),
  style: z.string().optional().describe('The style of notes: structured, bullet-points, standard, mindmap, timeline, chart, venn, conceptgrid, simpleflow, images.'),
  highlightTitles: z.boolean().optional().describe('Whether to highlight titles with colors.'),
  fontFamily: z.string().optional().describe('The font family to use: default, serif, sans-serif, monospace.'),
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

const generateNotesFlow = ai.defineFlow(
  {
    name: 'generateNotesFlow',
    inputSchema: GenerateNotesInputSchema,
    outputSchema: GenerateNotesOutputSchema,
  },
  async (input) => {
    const model = await getGoogleAIModel();
    const prompt = ai.definePrompt({
      name: 'generateNotesPrompt',
      model,
      input: { schema: GenerateNotesInputSchema },
      output: { schema: GenerateNotesOutputSchema },
      prompt: `You are an expert educator creating reliable, structured notes from text.

Source Text:
{{{sourceText}}}

{{#if topic}}
Focus Topic: {{{topic}}}
{{/if}}

{{#if length}}
Desired Length: {{{length}}} (short: 2-3 sections, medium: 4-6 sections, long: 6-8 sections)
{{/if}}

{{#if style}}
Style: {{{style}}}

For TEXT styles (structured, bullet-points, standard):
- Output as markdown text in the content field

For VISUAL styles, output as JSON in the content field (keep it simple and educational):
{{#eq style "mindmap"}}
{"type": "mindmap", "central": "Main Topic", "branches": [{"topic": "Branch 1", "subs": ["sub1", "sub2"]}, {"topic": "Branch 2", "subs": ["sub3"]}]}
{{/eq}}
{{#eq style "timeline"}}
{"type": "timeline", "events": [{"date": "2023-01-01", "title": "Event Title", "description": "Event description"}]}
{{/eq}}
{{#eq style "chart"}}
{"type": "chart", "chartType": "bar", "data": {"labels": ["A", "B", "C"], "values": [10, 20, 30]}}
{{/eq}}
{{#eq style "venn"}}
{"type": "venn", "sets": [{"label": "Set A", "items": ["item1", "item2"]}, {"label": "Set B", "items": ["item2", "item3"]}]}
{{/eq}}
{{#eq style "conceptgrid"}}
{"type": "conceptgrid", "concepts": [{"term": "Concept", "definition": "Meaning", "example": "Example"}]}
{{/eq}}

{{#eq style "simpleflow"}}
{"type": "simpleflow", "steps": [{"id": "1", "label": "Start"}, {"id": "2", "label": "Process"}, {"id": "3", "label": "End"}], "connections": [{"from": "1", "to": "2"}, {"from": "2", "to": "3"}]}
{{/eq}}

{{#eq style "images"}}
{"type": "images", "query": "search terms for relevant educational images", "count": 3}
{{/eq}}
{{/if}}

{{#if highlightTitles}}
Highlight titles with colors using HTML <span style="background-color: lightblue;">Title</span> for light blue highlighting. Highlight important parts with <span style="background-color: lightblue;">important text</span>.
{{/if}}

Output the result as a JSON object with the structure: { "notes": [ { "title": "Section Title", "content": "Markdown formatted content" } ] }

Create comprehensive notes with clear titles and detailed content. Use the specified style format.


`,
    });
    const { output } = await prompt(input);
    return output!;
  }
);
