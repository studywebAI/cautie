// app/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

const getApiKeys = () => [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
].filter(Boolean);

let currentKeyIndex = 0;
let genkitInstance: ReturnType<typeof genkit> | null = null;

const createGenkitInstance = (apiKey: string) => {
  return genkit({
    plugins: [googleAI({ apiKey })],
  });
};

const getGenkitInstance = () => {
  const keys = getApiKeys();
  if (keys.length === 0) {
    throw new Error("No GEMINI_API_KEY found");
  }

  // Try keys in sequence
  for (let i = 0; i < keys.length; i++) {
    try {
      const key = keys[i]!;
      if (!genkitInstance) {
        genkitInstance = createGenkitInstance(key);
      }
      // Test if the instance works by trying to get the model
      const model = (genkitInstance as any).getModel('gemini-2.5-flash');
      if (model) {
        return genkitInstance;
      }
    } catch (err) {
      console.error(`Key ${i + 1} failed:`, err);
      genkitInstance = null; // Reset for next key
    }
  }

  throw new Error("All API keys failed");
};

// Export the functions the flows expect
export const getGoogleAIModel = async () => {
  const instance = getGenkitInstance();
  const model = (instance as any).getModel('gemini-2.5-flash');
  if (!model) {
    throw new Error("Model 'gemini-2.5-flash' not found");
  }
  return model;
};

export const ai = {
  definePrompt: (...args: any[]) => {
    const instance = getGenkitInstance();
    return (instance as any).definePrompt(...args);
  },

  defineFlow: (config: any, fn: any) => {
    const instance = getGenkitInstance();
    return (instance as any).defineFlow(config, fn);
  },
};
