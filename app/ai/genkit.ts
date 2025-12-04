import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const geminiApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY_2;

export const ai = genkit({
  plugins: [
    googleAI({ 
      apiKey: geminiApiKey,
    }),
  ],
  model: 'googleai/gemini-1.5-flash',
});
