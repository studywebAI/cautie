
import {flow} from 'genkit';
import {z} from 'zod';
import {ai} from '../genkit';

const TitleRequestSchema = z.object({
    text: z.string().min(50), // Require a reasonable amount of text to generate a good title
});

const TitleResponseSchema = z.object({
    title: z.string(),
});

export const generateTitle = flow(
    {
        name: 'generateTitle',
        inputSchema: TitleRequestSchema,
        outputSchema: TitleResponseSchema,
    },
    async (request) => {
        const {text} = request;

        const prompt = `
            You are a highly skilled AI assistant specialized in content summarization and title generation. 
            Your task is to create a concise, informative, and unique title for the following text. 
            The title should be similar in style to how a platform like ChatGPT would title a conversation based on its content.

            **Instructions:**
            1.  Read and understand the provided text.
            2.  Identify the main topic, key concepts, and overall sentiment.
            3.  Generate a title that is short (ideally 5-10 words), descriptive, and easy to understand.
            4.  The title must be unique and not a generic phrase.
            5.  Return ONLY the generated title as a JSON object.

            **Text to Analyze:**
            """
            ${text.substring(0, 4000)} ...
            """
        `;

        const llmResponse = await ai.generate({
            model: 'googleai/gemini-1.5-flash',
            prompt: prompt,
            output: {
                format: 'json',
                schema: TitleResponseSchema,
            },
            config: {
                temperature: 0.5, // Lower temperature for more predictable, less creative titles
            }
        });

        const output = llmResponse.output();

        if (!output?.title) {
            throw new Error('Failed to generate a title from the AI model.');
        }

        return {
            title: output.title.replace(/"/g, ''), // Clean up any stray quotation marks
        };
    }
);
