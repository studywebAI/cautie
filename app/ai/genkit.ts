import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

// Export the model reference so flows can use it
let googleAIPluginInstance: ReturnType<typeof googleAI> | null = null;

// Get or create the plugin instance (shared between getGoogleAIModel and initializeAI)
const getOrCreatePlugin = (): ReturnType<typeof googleAI> => {
  if (!googleAIPluginInstance) {
    const apiKey1 = process.env.GEMINI_API_KEY;
    const apiKey2 = process.env.GEMINI_API_KEY_2;

    console.log(`[Genkit Debug] Inside getOrCreatePlugin. GEMINI_API_KEY: ${apiKey1 ? 'Set' : 'Not Set'}`);
    console.log(`[Genkit Debug] Inside getOrCreatePlugin. GEMINI_API_KEY_2: ${apiKey2 ? 'Set' : 'Not Set'}`);

    const apiKey = apiKey1 || apiKey2;
    if (!apiKey) {
      console.error('[Genkit Debug] No API key found. Throwing error.');
      throw new Error("Missing GEMINI_API_KEY or GEMINI_API_KEY_2 environment variable");
    }
    try {
      googleAIPluginInstance = googleAI({ apiKey });
      console.log('[Genkit Debug] googleAI plugin instance created successfully.');
    } catch (pluginError) {
      console.error('[Genkit Debug] Error creating googleAI plugin instance:', pluginError);
      throw pluginError;
    }
  }
  console.log('[Genkit Debug] Returning googleAI plugin instance.');
  return googleAIPluginInstance;
};

export const getGoogleAIModel = () => {
  const plugin = getOrCreatePlugin();
  console.log(`[Genkit Debug] In getGoogleAIModel. Plugin is: ${plugin ? 'Set' : 'Not Set'}`);
  if (!plugin) {
    const errorMessage = '[Genkit Error] GoogleAI plugin is not initialized in getGoogleAIModel. This indicates a problem during genkit setup or API key retrieval.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
  try {
    const model = plugin.model('gemini-1.5-flash');
    console.log('[Genkit Debug] Model instance created successfully.');
    if (!model) {
        const errorMessage = '[Genkit Error] Model is undefined after calling plugin.model().';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    return model;
  } catch (error) {
    console.error('[Genkit Debug] Error getting model or accessing model.name:', error);
    throw error;
  }
};

// Get API key from environment variables,aaasdasdS (This function is redundant and has been commented out.)
// const getApiKey = (): string => {
//   // For Vercel, these will be available at build time and runtime
//   const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY_2;
  
//   if (!apiKey) {
//     if (process.env.NODE_ENV === 'development') {
//       console.error('GEMINI_API_KEY is not set. Please set it in your Vercel environment variables or in .env.local for local development.');
//     } else {
//       console.error('GEMINI_API_KEY is not set. Please configure it in your Vercel project settings.');
//     }
//     throw new Error('Missing GEMINI_API_KEY environment variable');
//   }
  
//   return apiKey;
// };

// Initialize AI with error handling
let initError: Error | null = null;
let aiInstance: ReturnType<typeof genkit> | null = null;

const initializeAI = (): ReturnType<typeof genkit> => {
  // If we already have an instance, return it
  if (aiInstance) {
    return aiInstance;
  }
  
  // If we previously failed to initialize, throw the cached error
  if (initError) {
    throw initError;
  }
  
  try {
    // Use the shared plugin instance
    const plugin = getOrCreatePlugin();
    console.log(`[Genkit Debug] In initializeAI. Plugin is: ${plugin ? 'Set' : 'Not Set'}`);
    
    if (!plugin) {
        const errorMessage = '[Genkit Error] Plugin is not initialized in initializeAI. This should not happen if getOrCreatePlugin succeeds.';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    aiInstance = genkit({
      plugins: [plugin],
      // Removed 'debug' property as it is not a valid GenkitOptions property.
    });
    console.log('[Genkit Debug] Genkit AI instance initialized successfully.');
    return aiInstance;
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error));
    console.error('[Genkit Debug] Failed to initialize AI:', initError);
    throw initError;
  }
};

// Get the AI instance, initializing it on first access
const getAI = (): ReturnType<typeof genkit> => {
  return initializeAI();
};

// Create a dummy object that matches the genkit API structure for type safety
// This allows the module to load without errors, even if initialization fails
const createDummyAI = () => {
  return {
    definePrompt: (...args: any[]) => {
      const instance = getAI();
      return instance.definePrompt(...args);
    },
    defineFlow: (...args: any[]) => {
      const instance = getAI();
      return instance.defineFlow(...args);
    },
  } as any;
};

// Export the AI instance with lazy initialization
// Using a Proxy to make it work transparently with existing code
// This ensures initialization only happens when ai is actually used, not when the module is imported
export const ai = new Proxy(createDummyAI(), {
  get(_target, prop) {
    const instance = getAI();
    const value = (instance as any)[prop];
    // Bind functions to preserve 'this' context
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  },
  // Handle other Proxy traps that might be needed
  has(_target, prop) {
    try {
      const instance = getAI();
      return prop in instance;
    } catch {
      return false;
    }
  },
  ownKeys(_target) {
    try {
      const instance = getAI();
      return Reflect.ownKeys(instance);
    } catch {
      return [];
    }
  },
  getOwnPropertyDescriptor(_target, prop) {
    try {
      const instance = getAI();
      return Reflect.getOwnPropertyDescriptor(instance, prop);
    } catch {
      return undefined;
    }
  }
}) as ReturnType<typeof genkit>;
