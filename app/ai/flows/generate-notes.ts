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
  content: z.string().or(z.array(z.string())).describe('The detailed content. For visual styles, use structured JSON format. For text styles, use markdown format. No ASCII art or HTML unless specified.'),
});

const GenerateNotesInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to generate notes.'),
  imageDataUri: z.string().optional().describe('Base64 data URI of an image to analyze as context.'),
  topic: z.string().optional().describe('The main topic to focus on.'),
  length: z.string().optional().describe('The desired length of the notes: short, medium, long.'),
  style: z.string().optional().describe('The style of notes: standard, wordweb, structured, bullet-points, outline, summary, cornell, mindmap, flowchart, timeline, chart, boxing, sentence, mapping, pattern, qa, tchart, venndiagram, conceptmap, fishbone, decisiontree, swot, pestel, kanban, smart, vocabulary, piechart.'),
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
  const prompt = `You are an expert notetaker. Your task is to create notes from the provided source text.

Source Text:
${input.sourceText}

${input.topic ? `Topic: ${input.topic}` : ''}

${input.length ? `Length: ${input.length} (short: brief overview, medium: balanced, long: detailed)` : ''}

${input.style ? `Style: ${input.style}
${input.style === 'standard' ? 'Create clean, structured notes with clear headings and organized content' : ''}
${input.style === 'wordweb' ? 'Create a word web with central concepts connected to related terms and explanations' : ''}
${input.style === 'structured' ? 'Organize content into clear sections with subsections and bullet points' : ''}
${input.style === 'bullet-points' ? 'Use hierarchical bullet points with main points and subpoints' : ''}
${input.style === 'outline' ? 'Create a hierarchical outline with roman numerals, letters, and numbers' : ''}
${input.style === 'summary' ? 'Provide a concise summary highlighting key points only' : ''}
${input.style === 'cornell' ? 'Use Cornell method: left column for cues/questions, right for notes, bottom for summary' : ''}
${input.style === 'mindmap' ? 'Output as JSON: {"type": "mindmap", "central": "Main Topic", "branches": [{"topic": "Branch 1", "subs": ["sub1", "sub2"]}, {"topic": "Branch 2", "subs": ["sub3"]}]}' : ''}
${input.style === 'regular' ? 'Output as JSON: {"type": "regular", "summary": "Super short summary explaining everything quickly and easily, every word counts", "terms": [{"term": "Term", "definition": "Meaning or formula or visual description"}], "other": "Other relevant content, visuals, or artifacts like periodic table description"}' : ''}
${input.style === 'flowchart' ? 'Output as JSON: {"type": "flowchart", "nodes": [{"id": "start", "label": "Start", "type": "start"}, {"id": "process1", "label": "Process 1", "type": "process"}, {"id": "decision1", "label": "Decision?", "type": "decision"}], "connections": [{"from": "start", "to": "process1"}, {"from": "process1", "to": "decision1", "label": "Yes"}]}' : ''}
${input.style === 'timeline' ? 'Output as JSON: {"type": "timeline", "events": [{"date": "2023-01-01", "title": "Event 1", "description": "Description"}, {"date": "2023-02-01", "title": "Event 2", "description": "Description"}]}' : ''}
${input.style === 'chart' ? 'Output as JSON: {"type": "chart", "chartType": "bar", "data": {"labels": ["A", "B", "C"], "values": [10, 20, 30]}}' : ''}
${input.style === 'venndiagram' ? 'Output as JSON: {"type": "venndiagram", "sets": [{"label": "Set A", "items": ["item1", "item2"]}, {"label": "Set B", "items": ["item2", "item3"]}]}' : ''}
${input.style === 'conceptmap' ? 'Output as JSON: {"type": "conceptmap", "nodes": [{"id": "1", "label": "Concept 1", "x": 100, "y": 100}, {"id": "2", "label": "Concept 2", "x": 200, "y": 200}], "connections": [{"from": "1", "to": "2", "label": "relates to"}]}' : ''}
${input.style === 'fishbone' ? 'Output as JSON: {"type": "fishbone", "problem": "Main Problem", "categories": [{"name": "Category 1", "causes": ["Cause 1", "Cause 2"]}, {"name": "Category 2", "causes": ["Cause 3"]}]}' : ''}
${input.style === 'decisiontree' ? 'Output as JSON: {"type": "decisiontree", "root": {"question": "Decision?", "yes": {"outcome": "Outcome 1"}, "no": {"outcome": "Outcome 2"}}}' : ''}
${input.style === 'swot' ? 'Output as JSON: {"type": "swot", "strengths": ["Strength 1", "Strength 2"], "weaknesses": ["Weakness 1"], "opportunities": ["Opportunity 1"], "threats": ["Threat 1"]}' : ''}
${input.style === 'pestel' ? 'Output as JSON: {"type": "pestel", "political": ["Factor 1"], "economic": ["Factor 2"], "social": ["Factor 3"], "technological": ["Factor 4"], "environmental": ["Factor 5"], "legal": ["Factor 6"]}' : ''}
${input.style === 'kanban' ? 'Output as JSON: {"type": "kanban", "columns": [{"name": "To Do", "cards": ["Task 1", "Task 2"]}, {"name": "In Progress", "cards": ["Task 3"]}, {"name": "Done", "cards": ["Task 4"]}]}' : ''}
${input.style === 'smart' ? 'Analyze the content and choose the most appropriate visual format: Use timeline for chronological content, chart/piechart for data/statistics, mindmap for concepts, flowchart for processes, venndiagram for comparisons, fishbone for problem analysis, swot for strategic analysis, conceptmap for relationships, kanban for task organization, vocabulary for word lists/definitions' : ''}
${input.style === 'vocabulary' ? 'Output as JSON: {"type": "vocabulary", "words": [{"term": "Word", "definition": "Definition", "partOfSpeech": "noun", "example": "Example sentence"}]}' : ''}
${input.style === 'piechart' ? 'Output as JSON: {"type": "piechart", "data": {"labels": ["A", "B", "C"], "values": [30, 40, 30], "colors": ["#ff6384", "#36a2eb", "#cc65fe"]}}' : ''}
${input.style === 'boxing' ? 'Group related concepts in separate boxes or sections' : ''}
${input.style === 'sentence' ? 'Write complete sentences explaining each concept' : ''}
${input.style === 'mapping' ? 'Create visual concept mappings with connections' : ''}
${input.style === 'pattern' ? 'Identify and explain patterns and themes' : ''}
${input.style === 'qa' ? 'Format as questions and answers' : ''}
${input.style === 'tchart' ? 'Use T-chart format with two columns for comparison' : ''}
` : ''}

${input.highlightTitles ? 'Highlight titles with colors using HTML <span style="background-color: lightblue;">Title</span> for light blue highlighting. Highlight important parts with <span style="background-color: lightblue;">important text</span>.' : ''}

Output the result as a JSON object with the structure: { "notes": [ { "title": "Section Title", "content": "Markdown formatted content" } ] }

Generate structured notes from the source text. Create multiple sections with clear titles and detailed markdown content. Adapt the style to ${input.style} if specified. Include explanatory text and examples where appropriate.

IMPORTANT: For visual styles (mindmap, flowchart, timeline, chart, venndiagram, conceptmap, fishbone, decisiontree, swot, pestel, kanban, vocabulary, piechart), output as structured JSON. For smart mode, analyze the content type and choose the most appropriate visual format. For all other styles, keep content as plain markdown text. DO NOT include HTML unless highlightTitles is true.
`;

  const result = await ai.generate({
    model: "gemini-1.5-flash",
    prompt
  });

  const json = JSON.parse(result.text);
  return json;
}
