
import { defineFlow } from '@genkit-ai/core';
import { z } from 'zod';
import { ai } from '@lib/ai/genkit';

const TitleRequestSchema = z.object({
    text: z.string().min(50), // Require a reasonable amount of text to generate a good title
});

const TitleResponseSchema = z.object({
    title: z.string(),
});

export const generateTitle = defineFlow(
    {
        name: 'generateTitle',
        inputSchema: TitleRequestSchema,
        outputSchema: TitleResponseSchema,
    },
    async (request) => {
        const { text } = request;

        const prompt = `
            You are a highly skilled AI assistant specialized in content summarization and title generation. 
            Your task is to create a concise, informative, and unique title for the following text. 
            The title should be similar in style to how a platform like ChatGPT would title a conversation based on its content.

            **Instructions:**
            1.  Read and understand the provided text.
            2.  Identify the main subject or key topics.
            3.  Generate a title that is short (ideally 5-10 words).
            4.  The title should be neutral, objective, and descriptive.
            5.  Avoid clickbait, questions, or overly sensational language.
            6.  If the text is a conversation, reflect the core theme of the discussion.
            
            **Example:**
            Text: "I'm planning a trip to Japan and want to visit Tokyo, Kyoto, and Osaka. I'm interested in historical sites, food, and technology. What are the must-see places and best ways to travel between these cities?"
            Title: "Japan Trip Planning: Tokyo, Kyoto, Osaka"

            **Text to analyze:**
            ---
            ${text}
            ---
        `;

        const llmResponse = await ai.generate({
            prompt: prompt,
            model: 'gemini-1.5-flash',
            output: {
                format: 'json',
                schema: TitleResponseSchema,
            },
            config: {
                temperature: 0.3,
            }
        });

        return llmResponse.output() || { title: 'Untitled' };
    }
);
