/**
 * @fileOverview An AI agent that generates structured notes from text.
 *
 * - generateNotes - A function that returns notes.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const NoteSchema = z.object({
  title: z.string().describe('The title of the note section.'),
  content: z.string().or(z.array(z.string())).describe('The detailed content of the note in plain markdown format. No diagrams, ASCII art, or visual layouts.'),
});

const GenerateNotesInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to generate notes.'),
  imageDataUri: z.string().optional().describe('Base64 data URI of an image to analyze as context.'),
  topic: z.string().optional().describe('The main topic to focus on.'),
  length: z.string().optional().describe('The desired length of the notes: short, medium, long.'),
  style: z.string().optional().describe('The style of notes: standard, wordweb, structured, bullet-points, outline, summary, cornell, mindmap, flowchart, timeline, chart, boxing, sentence, mapping, pattern, qa, tchart, venndiagram, conceptmap, fishbone, decisiontree, swot, pestel, kanban.'),
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

const prompt = ai.definePrompt({
  name: 'generateNotesPrompt',
  model: 'gemini-2.5-flash',
  input: { schema: GenerateNotesInputSchema },
  output: { schema: GenerateNotesOutputSchema },
  prompt: `You are an expert notetaker. Your task is to create notes from the provided source text.

Source Text:
{{{sourceText}}}

{{#if topic}}
Topic: {{{topic}}}
{{/if}}

{{#if length}}
Length: {{{length}}} (short: brief overview, medium: balanced, long: detailed)
{{/if}}

{{#if style}}
Style: {{{style}}} (standard: clean structured notes, wordweb: mind map style with connections, structured: with sections, bullet-points: lists, outline: hierarchical, summary: concise, cornell: divided sections for cues/main/summary, mindmap: radial diagram, flowchart: process diagrams, timeline: chronological, chart: charts and diagrams, boxing: grouped boxes, sentence: complete sentences, mapping: visual connections, pattern: themes and patterns, qa: question-answer pairs, tchart: two-column comparison, venndiagram: overlapping circles, conceptmap: nodes with arrows, fishbone: cause-effect, decisiontree: branching paths, swot: strengths/weaknesses/opportunities/threats, pestel: political/economic/social/technological/environmental/legal, kanban: task columns)
{{/if}}

{{#if highlightTitles}}
Highlight titles with colors using HTML <span style="background-color: lightblue;">Title</span> for light blue highlighting. Highlight important parts with <span style="background-color: lightblue;">important text</span>.
{{/if}}

Output the result as a JSON object with the structure: { "notes": [ { "title": "Section Title", "content": "Markdown formatted content" } ] }

Generate structured notes from the source text. Create multiple sections with clear titles and detailed markdown content. Adapt the style to {{{style}}} if specified. Include explanatory text and examples where appropriate.

IMPORTANT: NEVER generate diagrams or visual layouts. ONLY return plain markdown text inside the content fields. DO NOT generate ASCII art, boxes, diagrams, flowcharts, shapes, or arrows. DO NOT include HTML unless highlightTitles is true. Keep all content as simple text.
`,
});

const generateNotesFlow = ai.defineFlow(
  {
    name: 'generateNotesFlow',
    inputSchema: GenerateNotesInputSchema,
    outputSchema: GenerateNotesOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
