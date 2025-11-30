import { z } from 'zod';
import { ai } from '@lib/ai/genkit';

const ConceptSchema = z.object({
  id: z.string().describe('A unique, kebab-case identifier for the concept.'),
  name: z.string().describe('The name of the concept.'),
  summary: z.string().describe('A one-sentence summary of the concept.'),
});

const GenerateKnowledgeGraphInputSchema = z.object({
  sourceText: z.string().describe('The source text from which to extract concepts.'),
});

const GenerateKnowledgeGraphOutputSchema = z.object({
  concepts: z.array(ConceptSchema).describe('An array of key concepts extracted from the text.'),
});

export const generateKnowledgeGraph = ai.defineFlow(
    {
        name: 'generateKnowledgeGraph',
        inputSchema: GenerateKnowledgeGraphInputSchema,
        outputSchema: GenerateKnowledgeGraphOutputSchema,
    },
    async (input: z.infer<typeof GenerateKnowledgeGraphInputSchema>) => {
        const { sourceText } = input;

        const prompt = `You are an AI that specializes in semantic analysis and knowledge extraction. Your task is to identify the most important concepts from the provided text and represent them as a simple list.

For each concept, provide a unique ID, a clear name, and a concise one-sentence summary.

Source Text:
${sourceText}
`;

        const llmResponse = await ai.generate({
            prompt: prompt,
            model: 'gemini-1.5-flash',
            output: {
                format: 'json',
                schema: GenerateKnowledgeGraphOutputSchema,
            },
        });

        return llmResponse.output || { concepts: [] };
    }
);
