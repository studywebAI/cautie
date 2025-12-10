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
Style: {{{style}}}
{{#eq style "standard"}}Create clean, structured notes with clear headings and organized content{{/eq}}
{{#eq style "wordweb"}}Create a word web with central concepts connected to related terms and explanations{{/eq}}
{{#eq style "structured"}}Organize content into clear sections with subsections and bullet points{{/eq}}
{{#eq style "bullet-points"}}Use hierarchical bullet points with main points and subpoints{{/eq}}
{{#eq style "outline"}}Create a hierarchical outline with roman numerals, letters, and numbers{{/eq}}
{{#eq style "summary"}}Provide a concise summary highlighting key points only{{/eq}}
{{#eq style "cornell"}}Use Cornell method: left column for cues/questions, right for notes, bottom for summary{{/eq}}
{{#eq style "mindmap"}}Output as JSON: {"type": "mindmap", "central": "Main Topic", "branches": [{"topic": "Branch 1", "subs": ["sub1", "sub2"]}, {"topic": "Branch 2", "subs": ["sub3"]}]}{{/eq}}
{{#eq style "flowchart"}}Describe a flowchart with steps and decision points{{/eq}}
{{#eq style "timeline"}}Organize information chronologically{{/eq}}
{{#eq style "chart"}}Present data in chart/table format{{/eq}}
{{#eq style "boxing"}}Group related concepts in separate boxes or sections{{/eq}}
{{#eq style "sentence"}}Write complete sentences explaining each concept{{/eq}}
{{#eq style "mapping"}}Create visual concept mappings with connections{{/eq}}
{{#eq style "pattern"}}Identify and explain patterns and themes{{/eq}}
{{#eq style "qa"}}Format as questions and answers{{/eq}}
{{#eq style "tchart"}}Use T-chart format with two columns for comparison{{/eq}}
{{#eq style "venndiagram"}}Describe overlapping concepts in Venn diagram format{{/eq}}
{{#eq style "conceptmap"}}Create concept map with nodes and connecting relationships{{/eq}}
{{#eq style "fishbone"}}Use fishbone diagram to show cause and effect{{/eq}}
{{#eq style "decisiontree"}}Create decision tree with branches and outcomes{{/eq}}
{{#eq style "swot"}}Present SWOT analysis: Strengths, Weaknesses, Opportunities, Threats{{/eq}}
{{#eq style "pestel"}}Analyze using PESTEL framework: Political, Economic, Social, Technological, Environmental, Legal{{/eq}}
{{#eq style "kanban"}}Organize into Kanban columns: To Do, In Progress, Done{{/eq}}
{{/if}}

{{#if highlightTitles}}
Highlight titles with colors using HTML <span style="background-color: lightblue;">Title</span> for light blue highlighting. Highlight important parts with <span style="background-color: lightblue;">important text</span>.
{{/if}}

Output the result as a JSON object with the structure: { "notes": [ { "title": "Section Title", "content": "Markdown formatted content" } ] }

Generate structured notes from the source text. Create multiple sections with clear titles and detailed markdown content. Adapt the style to {{{style}}} if specified. Include explanatory text and examples where appropriate.

IMPORTANT: For visual styles (mindmap, flowchart, conceptmap, etc.), you may use simple ASCII art or text-based diagrams to represent the structure. For all other styles, keep content as plain markdown text. DO NOT include HTML unless highlightTitles is true.
`,
    });
    const { output } = await prompt(input);
    return output!;
  }
);
