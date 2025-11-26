import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

// It's crucial that you have your GEMINI_API_KEY set in your .env.local file.
// Without it, the AI features of this application will not work.
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not defined. Please set it in your .env.local file.');
  // Throwing an error during initialization is better than letting the app run in a broken state.
  throw new Error('GEMINI_API_KEY is not configured. AI functionalities will be disabled.');
}

export const ai = genkit({
  plugins: [googleAI({ 
    apiKey: geminiApiKey,
  })],
  model: 'googleai/gemini-1.5-flash',
  // Optional: Add logging to see Genkit's operational status.
  logLevel: 'debug',
  // Enable tracing to see the flow of data through your Genkit actions.
  enableTracing: true,
});
