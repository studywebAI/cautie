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
      prompt: `You are an expert educator specializing in creating comprehensive, educational notes from text content. Your task is to transform source material into clear, structured notes that enhance student learning.

CORE PRINCIPLES:
- Always create educational value - focus on key concepts, relationships, and practical applications
- Ensure notes are comprehensive but not overwhelming
- Use appropriate formatting for maximum clarity and retention
- Maintain academic integrity and accuracy

Source Text:
{{{sourceText}}}

{{#if topic}}
Focus Topic: {{{topic}}}
{{/if}}

{{#if length}}
Length: {{{length}}} (short: 2-3 sections, medium: 4-6 sections, long: 6-8 sections)
{{/if}}

{{#if style}}
Style: {{{style}}}

=== TEXT-BASED STYLES ===

For "structured" style:
- Create hierarchical markdown with clear H1, H2, H3 headings
- Include definitions, explanations, and examples
- Use bullet points for lists and key points
- Add code blocks for technical content when relevant
- Structure: Introduction → Key Concepts → Examples → Summary

For "bullet-points" style:
- Use nested bullet points (-, *, -) for hierarchical information
- Main points at top level, sub-points indented
- Include brief explanations under each main point
- Focus on key facts, definitions, and relationships
- Keep each bullet concise but informative

For "standard" style:
- Traditional note format with headings and paragraphs
- Clear section breaks with descriptive titles
- Mix of explanatory text and structured lists
- Include summaries and key takeaways
- Academic tone with clear explanations

=== VISUAL STYLES (JSON OUTPUT) ===

For "mindmap" style:
- Create concept maps showing relationships between ideas
- Central node should be the main topic or key concept
- Branches represent major subtopics or categories
- Include 3-5 main branches with 2-3 sub-branches each
- Focus on hierarchical relationships and connections
Example: {"type": "mindmap", "central": "Photosynthesis", "branches": [{"topic": "Process", "subs": ["Light Reaction", "Dark Reaction"]}, {"topic": "Requirements", "subs": ["Light", "Water", "CO2"]}]}

For "timeline" style:
- Chronological representation of events, processes, or historical developments
- Include dates, titles, and descriptions
- Focus on sequence and progression
- 4-8 key events or stages
- Useful for history, processes, or developmental sequences
Example: {"type": "timeline", "events": [{"date": "2020-01-01", "title": "Event Title", "description": "Detailed description of the event"}, {"date": "2020-06-01", "title": "Next Event", "description": "Description"}]}

For "chart" style:
- Data visualization using bar charts, pie charts, or line graphs
- Extract numerical data, statistics, or comparative information from text
- Include labels, values, and clear data representation
- Choose appropriate chart type (bar for comparisons, pie for proportions)
- Provide 3-7 data points with meaningful labels
Example: {"type": "chart", "chartType": "bar", "data": {"labels": ["Category A", "Category B", "Category C"], "values": [25, 45, 30]}}

For "venn" style:
- Compare and contrast two related concepts or sets
- Maximum 2 circles (3-circle Venn diagrams are complex and often fail)
- Include overlapping and unique elements
- Focus on similarities (overlap) and differences (unique areas)
- Clear, concise labels for each section
Example: {"type": "venn", "sets": [{"label": "Set A", "items": ["item1", "item2", "shared_item"]}, {"label": "Set B", "items": ["item3", "shared_item"]}]}

For "conceptgrid" style:
- Tabular representation of concepts with definitions and examples
- Columns: Term, Definition, Example/Application
- 4-8 key concepts from the material
- Clear, concise definitions with practical examples
- Useful for vocabulary, key terms, or concept relationships
Example: {"type": "conceptgrid", "concepts": [{"term": "Term 1", "definition": "Clear definition", "example": "Practical example"}, {"term": "Term 2", "definition": "Another definition", "example": "Another example"}]}

For "simpleflow" style:
- Linear process or workflow visualization
- Simple blocks connected by arrows
- 3-6 steps in sequence
- Clear labels for each step
- Focus on processes, procedures, or sequential operations
- Avoid complex branching or decision points
Example: {"type": "simpleflow", "steps": [{"id": "1", "label": "Input"}, {"id": "2", "label": "Process"}, {"id": "3", "label": "Output"}], "connections": [{"from": "1", "to": "2"}, {"from": "2", "to": "3"}]}

For "images" style:
- Curated selection of relevant educational images
- Generate search queries for visual learning aids
- Include 3-5 specific, targeted search terms
- Focus on diagrams, illustrations, or photographs that enhance understanding
- Consider the subject matter (biology, history, math, etc.)
Example: {"type": "images", "query": "photosynthesis process diagram chloroplast structure", "count": 3}
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
{"type": "images", "query": "educational images for [topic]", "count": 3}
{{/eq}}
{{/if}}

{{#if highlightTitles}}
Use HTML <span style="background-color: lightblue;">text</span> for highlighting.
{{/if}}

Output as JSON: { "notes": [ { "title": "Section Title", "content": "Content here" } ] }

FINAL INSTRUCTIONS:
- Create notes that are pedagogically sound and educationally valuable
- Ensure all content is derived from the source material
- Use appropriate academic language and terminology
- Make complex concepts accessible without oversimplifying
- Include practical examples and applications where relevant
- Focus on clarity, accuracy, and educational impact
- For visual styles, ensure the JSON is valid and matches the specified format exactly


`,
    });
    const { output } = await prompt(input);
    return output!;
  }
);
