'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ProcessMaterialInputSchema = z.object({
  text: z.string().optional(),
  fileDataUri: z.string().optional(),
  language: z.string().optional(),
});

const SuggestedActionSchema = z.object({
  id: z.enum(['create-a-summary', 'generate-a-quiz', 'make-flashcards']),
  label: z.string(),
  description: z.string(),
  icon: z.enum(['FileText', 'BrainCircuit', 'BookCopy']),
});

const ProcessMaterialOutputSchema = z.object({
  analysis: z.object({
    title: z.string(),
    topic: z.string(),
    summary: z.string(),
    sourceText: z.string(),
  }),
  suggestedActions: z.array(SuggestedActionSchema),
});

export type ProcessMaterialOutput = z.infer<typeof ProcessMaterialOutputSchema>;

const processMaterialFlow = ai.defineFlow(
  {
    name: 'processMaterial',
    inputSchema: ProcessMaterialInputSchema,
    outputSchema: ProcessMaterialOutputSchema,
  },
  async input => {
    const prompt = `
You are an expert learning assistant.

Return EXACT JSON:
{
  "analysis": {
    "title": "...",
    "topic": "...",
    "summary": "...",
    "sourceText": "..."
  },
  "suggestedActions": [
    {
      "id": "create-a-summary",
      "label": "Create Summary",
      "description": "Generate a clean summary",
      "icon": "FileText"
    },
    {
      "id": "generate-a-quiz",
      "label": "Quiz Me",
      "description": "Generate a quiz",
      "icon": "BrainCircuit"
    },
    {
      "id": "make-flashcards",
      "label": "Flashcards",
      "description": "Create flashcards",
      "icon": "BookCopy"
    }
  ]
}

Material:
${input.text ?? ""}
${input.fileDataUri ? "[FILE]" : ""}
`;

    // CORRECT api call
    const result = await ai.generate({
      model: "gemini-2.5-flash",
      prompt
    });

    const json = JSON.parse(result.text());

    return json;
  }
);

export async function processMaterial(input: z.infer<typeof ProcessMaterialInputSchema>) {
  return processMaterialFlow(input);
}
