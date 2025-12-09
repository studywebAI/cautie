// app/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// ─────────────────────────────
// Shared Plugin Instance
// ─────────────────────────────
let googleAIInstance: ReturnType<typeof googleAI> | null = null;

const getGoogleAI = () => {
  if (!googleAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY");
    googleAIInstance = googleAI({ apiKey });
  }
  return googleAIInstance;
};

// ─────────────────────────────
// Model Getter
// ─────────────────────────────
export const getGoogleAIModel = () => {
  const plugin = getGoogleAI();
  const model = plugin.model('gemini-1.5-flash');

  if (!model) throw new Error("Gemini model returned undefined.");
  return model;
};

// ─────────────────────────────
// Genkit Initialization
// ─────────────────────────────
let aiInstance: ReturnType<typeof genkit> | null = null;
let initError: Error | null = null;

const initializeAI = () => {
  if (aiInstance) return aiInstance;
  if (initError) throw initError;

  try {
    aiInstance = genkit({
      plugins: [getGoogleAI()],
    });
    return aiInstance;
  } catch (err) {
    initError = err instanceof Error ? err : new Error(String(err));
    throw initError;
  }
};

const getAI = () => initializeAI();

// ─────────────────────────────
// Proxy Wrapper for Lazy Loading
// ─────────────────────────────
const createVirtualAI = () => ({
  definePrompt: (...args: any[]) => getAI().definePrompt(...args),
  defineFlow: (...args: any[]) => getAI().defineFlow(...args),
});

export const ai = new Proxy(createVirtualAI(), {
  get(_target, prop) {
    const instance = getAI();
    const value = (instance as any)[prop];
    return typeof value === "function" ? value.bind(instance) : value;
  },
  has(_target, prop) {
    try {
      return prop in getAI();
    } catch {
      return false;
    }
  },
  ownKeys() {
    try {
      return Reflect.ownKeys(getAI());
    } catch {
      return [];
    }
  },
  getOwnPropertyDescriptor(_target, prop) {
    try {
      return Reflect.getOwnPropertyDescriptor(getAI(), prop);
    } catch {
      return undefined;
    }
  },
}) as ReturnType<typeof genkit>;
