import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2;

export const ai = genkit({
  plugins: [googleAI({
    apiKey: geminiApiKey,
  })],
  model: googleAI.model('gemini-1.5-flash'),
});
