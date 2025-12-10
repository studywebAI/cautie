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
  content: z.string().or(z.array(z.string())).describe('The detailed content. For visual styles, use structured markdown format. For text styles, use markdown format.'),
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
Style: {{{style}}}
{{#eq style "mindmap"}}Create a mind map structure using hierarchical markdown:
**Main Subject:** [Central Topic]
**Branch 1:** [First main branch]
- Branch 1-1: [Sub-branch]
- Branch 1-2: [Sub-branch]
**Branch 2:** [Second main branch]
- Branch 2-1: [Sub-branch]{{/eq}}
{{#eq style "flowchart"}}Create a flowchart using step-by-step format:
**Start:** [Starting point]
**Step 1:** [First process] → [Next step]
**Decision:** [Question?]
- Yes → [Outcome A]
- No → [Outcome B]
**End:** [Ending point]{{/eq}}
{{#eq style "timeline"}}Create a timeline using chronological format:
**2023-01-01:** Event 1 - Description
**2023-02-01:** Event 2 - Description
**2023-03-01:** Event 3 - Description{{/eq}}
{{#eq style "chart"}}Create a chart using data format:
**Chart Type:** bar
**Data:**
- Label A: 10
- Label B: 20
- Label C: 30{{/eq}}
{{#eq style "venndiagram"}}Create a Venn diagram using set format:
**Set A:** [Label A]
- Item 1
- Item 2
**Set B:** [Label B]
- Item 2
- Item 3
**Overlap:**
- Item 2{{/eq}}
{{#eq style "conceptmap"}}Create a concept map using node format:
**Node 1:** Concept A
**Node 2:** Concept B
**Node 3:** Concept C
**Connection 1-2:** relates to
**Connection 2-3:** connects with{{/eq}}
{{#eq style "fishbone"}}Create a fishbone diagram using cause format:
**Main Problem:** [Problem statement]
**Category 1:** [Cause category]
- Cause 1-1
- Cause 1-2
**Category 2:** [Cause category]
- Cause 2-1{{/eq}}
{{#eq style "decisiontree"}}Create a decision tree using branching format:
**Decision:** [Question?]
├── Yes → [Outcome A]
└── No → [Outcome B]{{/eq}}
{{#eq style "swot"}}Create a SWOT analysis using quadrant format:
**Strengths:**
- Strength 1
- Strength 2
**Weaknesses:**
- Weakness 1
**Opportunities:**
- Opportunity 1
**Threats:**
- Threat 1{{/eq}}
{{#eq style "pestel"}}Create a PESTEL analysis using factor format:
**Political:**
- Factor 1
- Factor 2
**Economic:**
- Factor 1
**Social:**
- Factor 1
**Technological:**
- Factor 1
**Environmental:**
- Factor 1
**Legal:**
- Factor 1{{/eq}}
{{#eq style "kanban"}}Create a Kanban board using column format:
**To Do:**
- Task 1
- Task 2
**In Progress:**
- Task 3
**Done:**
- Task 4{{/eq}}
{{/if}}

{{#if highlightTitles}}
Highlight titles with colors using HTML <span style="background-color: lightblue;">Title</span> for light blue highlighting. Highlight important parts with <span style="background-color: lightblue;">important text</span>.
{{/if}}

Output the result as a JSON object with the structure: { "notes": [ { "title": "Section Title", "content": "Markdown formatted content" } ] }

Generate structured notes from the source text. Create multiple sections with clear titles and detailed markdown content. Adapt the style to {{{style}}} if specified. Include explanatory text and examples where appropriate.

IMPORTANT:
- For visual styles (mindmap, flowchart, timeline, chart, venndiagram, conceptmap, fishbone, decisiontree, swot, pestel, kanban), use the structured markdown format specified above.
- For text styles (standard, wordweb, structured, bullet-points, outline, summary, cornell, boxing, sentence, mapping, pattern, qa, tchart), use plain markdown text.
- DO NOT include HTML unless highlightTitles is true.
`,
    });
    const { output } = await prompt(input);
    return output!;
  }
);
