// app/ai/genkit.ts
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// ─────────────────────────────
// Shared Plugin Instance
// ─────────────────────────────
let googleAIInstance: ReturnType<typeof googleAI> | null = null;

const getGoogleAI = () => {
  if (!googleAIInstance) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY_2;
    if (!apiKey) {
        console.error("❌ Fatal Error: GEMINI_API_KEY is missing from environment variables.");
        throw new Error("Missing GEMINI_API_KEY");
    }
    console.log(`✅ Using API key from ${process.env.GEMINI_API_KEY ? 'GEMINI_API_KEY' : process.env.NEXT_PUBLIC_GEMINI_API_KEY ? 'NEXT_PUBLIC_GEMINI_API_KEY' : 'GEMINI_API_KEY_2'} (length: ${apiKey.length}, starts with: ${apiKey.substring(0,4)}...)`);
    googleAIInstance = googleAI({ apiKey });
  }
  return googleAIInstance;
};

// ─────────────────────────────
// Model Getter
// ─────────────────────────────
export const getGoogleAIModel = () => {
  const plugin = getGoogleAI();
  const model = plugin.model('gemini-2.5-flash');

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
  definePrompt: (...args: any[]) => (getAI() as any).definePrompt(...args),
  defineFlow: (...args: any[]) => (getAI() as any).defineFlow(...args),
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
