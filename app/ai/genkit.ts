import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Get API key from environment variables
const getApiKey = (): string => {
  // For Vercel, these will be available at build time and runtime
  const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2;
  
  if (!apiKey) {
    if (process.env.NODE_ENV === 'development') {
      console.error('GEMINI_API_KEY is not set. Please set it in your Vercel environment variables or in .env.local for local development.');
    } else {
      console.error('GEMINI_API_KEY is not set. Please configure it in your Vercel project settings.');
    }
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }
  
  return apiKey;
};

// Initialize AI with error handling
const initializeAI = () => {
  try {
    const apiKey = getApiKey();
    return genkit({
      plugins: [
        googleAI({
          apiKey,
          // Add any additional Google AI configuration here
        })
      ],
      // Use the latest stable model by default
      model: googleAI.model('gemini-1.5-flash'),
      // Enable debugging in development
      debug: process.env.NODE_ENV === 'development',
    });
  } catch (error) {
    console.error('Failed to initialize AI:', error);
    throw error; // Re-throw to prevent silent failures
  }
};

// Lazy initialization - only initialize when actually accessed
let aiInstance: ReturnType<typeof initializeAI> | null = null;

// Get the AI instance, initializing it on first access
const getAI = () => {
  if (!aiInstance) {
    aiInstance = initializeAI();
  }
  return aiInstance;
};

// Export the AI instance with lazy initialization
// Using a Proxy to make it work transparently with existing code
export const ai = new Proxy({} as ReturnType<typeof initializeAI>, {
  get(_target, prop) {
    const instance = getAI();
    const value = (instance as any)[prop];
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});
