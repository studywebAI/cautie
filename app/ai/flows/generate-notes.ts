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
  content: z.string().describe('The detailed content of the note in markdown format.'),
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
  model: getGoogleAIModel() as any,
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

Generate notes with clear titles and content formatted in HTML. Mix clean notes with short explanatory text. Use <h2> for titles, <p> for paragraphs, etc. Split into different parts.
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
