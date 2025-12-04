import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2;

export const ai = genkit({
  plugins: [googleAI({ 
    project: 'study-web-app-426213', 
    location: 'us-central1',
    apiKey: geminiApiKey,
  })],
  model: googleAI.model('gemini-2.5-flash-lite'),
});
