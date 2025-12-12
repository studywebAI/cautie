'use server';
/**
 * @fileOverview Simplified AI agent that generates structured notes from text.
 * Similar to flashcards/quiz - reliable and focused.
 */

import { ai, getGoogleAIModel } from '@/ai/genkit';
import { z } from 'genkit';

const NoteSchema = z.object({
  title: z.string().describe('The title of the note section.'),
  content: z.string().describe('The detailed content in markdown format.'),
});

const GenerateNotesInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to generate notes.'),
  topic: z.string().optional().describe('The main topic to focus on.'),
  length: z.string().optional().describe('The desired length: short, medium, long.').default('medium'),
  style: z.string().optional().describe('The style: structured, bullet-points, standard.').default('structured'),
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
      prompt: `You are an expert educator. Create well-structured notes from the provided text.

Source Text:
{{{sourceText}}}

{{#if topic}}
Focus Topic: {{{topic}}}
{{/if}}

{{#if length}}
Desired Length: {{{length}}} (short: 2-3 main sections, medium: 4-6 sections, long: 6-8 sections)
{{/if}}

{{#if style}}
Style: {{{style}}}
- "structured": Use clear headings and subheadings with organized content
- "bullet-points": Use hierarchical bullet points
- "standard": Clean paragraphs with headings
{{/if}}

Create comprehensive notes with multiple sections. Each section should have:
- A clear, descriptive title
- Detailed content in markdown format
- Logical organization of the information

Output as JSON: { "notes": [ { "title": "Section Title", "content": "Markdown content here" } ] }`,
    });
    const { output } = await prompt(input);
    return output!;
  }
);</content>
</xai:function_call">Now let me update the API handler to use the simplified notes flow instead of the complex one. I'll replace the import in the route.ts file. 

The issue is that the current notes flow is trying to do too much - it has complex visual components like timelines, mindmaps, flowcharts, etc. that can fail. The user wants a reliable notes system like flashcards and quiz.

Let me update the API handler to use the simplified flow. But first, let me check if I need to rename the file or update the import. Actually, let me just simplify the existing flow instead of creating a new file. Let me replace the complex prompt with a simple one. 

I'll modify the existing generate-notes.ts to have a much simpler prompt that just generates structured markdown notes without any of the complex visual components. This will make it work reliably like the flashcards and quiz flows. 

The key is to remove all the visual format options (mindmap, regular, timeline, etc.) and just focus on generating clean, structured markdown notes that the NoteViewer can display as simple text. This will make the notes system as reliable as the flashcards and quiz tools. 

I'll update the prompt to only support basic styles (structured, bullet-points, standard) and remove all the complex JSON visual formats that were causing failures. The notes will still be comprehensive and well-organized, but they'll display as clean markdown instead of trying to render complex visual components. 

This approach will make the notes system much more reliable and consistent with the existing working patterns in flashcards and quiz generation. The simplification will ensure that users get consistent, working results every time they generate notes. I'll continue the partial thought from the previous rewritten thinking by copying over the next line, and then summarize the key points:

sections, long: 6-8 sections)
{{/if}}

{{#if style}}
Style: {{{style}}}
- "structured": Use clear headings and subheadings with organized content
- "bullet-points": Use hierarchical bullet points  
- "standard": Clean paragraphs with headings
{{/if}}

Create comprehensive notes with multiple sections. Each section should have:
- A clear, descriptive title
- Detailed content in markdown format
- Logical organization of the information

Output as JSON: { "notes": [ { "title": "Section Title", "content": "Markdown content here" } ] }`,