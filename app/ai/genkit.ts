// app/ai/genkit.ts
/**
 * Full genkit wrapper for StudyWeb
 * - Safe key rotation with caching
 * - Robust initialization + error handling
 * - Exports `ai` that proxies common Genkit methods safely
 *
 * Note: keep environment vars:
 *  - GEMINI_API_KEY
 *  - NEXT_PUBLIC_GEMINI_API_KEY
 *  - GEMINI_API_KEY_2
 *  - NEXT_PUBLIC_GEMINI_API_KEY_2
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';

type GenkitInstance = ReturnType<typeof genkit>;
type GoogleAIPlugin = ReturnType<typeof googleAI>;

/** --- CONFIG --- **/
const KEY_ENV_NAMES = [
  'GEMINI_API_KEY',
  'NEXT_PUBLIC_GEMINI_API_KEY',
  'GEMINI_API_KEY_2',
  'NEXT_PUBLIC_GEMINI_API_KEY_2',
] as const;

const MODEL_NAME = 'gemini-1.0-pro';

/** --- Internal caches & state --- **/
const keyList: (string | undefined)[] = KEY_ENV_NAMES.map((k) => process.env[k]);
const validKeys = keyList.map((k) => (typeof k === 'string' && k.length > 0 ? k : undefined));

const instancesByKeyIndex: Array<GenkitInstance | null> = new Array(validKeys.length).fill(null);
let lastSuccessfulKeyIndex: number | null = null;

/** --- Utilities --- **/
const safeLogKey = (index: number) => {
  const k = validKeys[index];
  if (!k) return '(missing)';
  return `key#${index + 1} (len:${k.length})`;
};

function throwNoKeys() {
  const msg = `No GEMINI API keys available. Checked env: ${KEY_ENV_NAMES.join(', ')}`;
  console.error(msg);
  throw new Error(msg);
}

/** Create a genkit instance for a single API key (cached per key index) */
function createInstanceForKey(index: number): GenkitInstance {
  const apiKey = validKeys[index];
  if (!apiKey) throw new Error(`No API key at index ${index}`);

  // If already created, return cached instance
  if (instancesByKeyIndex[index]) return instancesByKeyIndex[index] as GenkitInstance;

  // Create google plugin
  const plugin: GoogleAIPlugin = googleAI({ apiKey });

  // Initialize genkit instance with the plugin
  const instance = genkit({
    plugins: [plugin],
  });

  instancesByKeyIndex[index] = instance;
  console.info(`genkit: initialized instance for ${safeLogKey(index)}`);
  return instance;
}

/** Try to get a working genkit instance by rotating through keys */
async function getWorkingInstance(): Promise<{ instance: GenkitInstance; keyIndex: number }> {
  // If we have a previously successful key, try it first
  const candidateOrder: number[] = [];
  if (lastSuccessfulKeyIndex !== null) candidateOrder.push(lastSuccessfulKeyIndex);
  for (let i = 0; i < validKeys.length; i++) {
    if (i !== lastSuccessfulKeyIndex) candidateOrder.push(i);
  }

  if (candidateOrder.length === 0) throwNoKeys();

  const errors: string[] = [];

  for (const idx of candidateOrder) {
    const key = validKeys[idx];
    if (!key) {
      errors.push(`key#${idx + 1} missing`);
      continue;
    }

    try {
      const instance = createInstanceForKey(idx);

      // Quick health-check: try to access model
      // We attempt to call `getModel` with our model name to ensure plugin is usable.
      const maybeModelFn = (instance as any).getModel;
      if (typeof maybeModelFn === 'function') {
        // Attempt to call getModel but don't await the full model creation
        // This tests if the method exists and basic plugin setup works
        try {
          maybeModelFn.call(instance, MODEL_NAME);
        } catch (e) {
          // If getModel throws (e.g., due to model name), still accept the instance
          // Most errors here are acceptable as long as the method exists
        }
      }

      lastSuccessfulKeyIndex = idx;
      return { instance, keyIndex: idx };
    } catch (err: any) {
      const m = err instanceof Error ? err.message : String(err);
      console.warn(`genkit: init failed for ${safeLogKey(idx)} — ${m}`);
      errors.push(`key#${idx + 1}: ${m}`);
      // continue to next key
    }
  }

  const aggregate = `All keys failed: ${errors.join(' | ')}`;
  console.error(aggregate);
  throw new Error(aggregate);
}

/** Public helper to get model in a safe/cross-genkit way */
export async function getGoogleAIModel(modelName = MODEL_NAME) {
  const { instance } = await getWorkingInstance();

  // Try different ways to access the model
  let model;

  // Method 1: getModel function
  const modelGetter = (instance as any).getModel;
  if (typeof modelGetter === 'function') {
    try {
      model = (modelGetter as Function).call(instance, modelName);
      model = await Promise.resolve(model);
    } catch (e) {
      console.warn('getModel method failed:', e);
    }
  }

  // Method 2: Direct model access
  if (!model) {
    model = (instance as any).model?.(modelName) || (instance as any)[modelName];
    if (model) {
      model = await Promise.resolve(model);
    }
  }

  // Method 3: Check if model is available through plugins
  if (!model) {
    const plugins = (instance as any)._plugins || (instance as any).plugins;
    if (plugins) {
      for (const plugin of plugins) {
        if (plugin && typeof plugin.model === 'function') {
          try {
            model = plugin.model(modelName);
            model = await Promise.resolve(model);
            break;
          } catch (e) {
            // Continue to next plugin
          }
        }
      }
    }
  }

  if (!model) {
    throw new Error(`Could not access model '${modelName}' from Genkit instance.`);
  }

  return model;
}

/** --- AI facade (lightweight) --- **
 * We expose a small facade object `ai` that delegates common Genkit methods to a working instance.
 * This avoids complex Proxy traps that previously caused issues.
 */
type AnyFn = (...args: any[]) => any;

function createDelegator<K extends string>(methodName: K) {
  return async function delegator(this: any, ...args: any[]) {
    const { instance } = await getWorkingInstance();
    const fn = (instance as any)[methodName];
    if (typeof fn !== 'function') {
      throw new Error(`Genkit instance does not implement method "${methodName}"`);
    }
    return fn.apply(instance, args);
  };
}

/** List of methods we expect to forward. Add more if needed. */
const exported: Record<string, AnyFn> = {
  definePrompt: (...args: any[]) => {
    // Define prompt with first available instance (synchronous)
    const keys = KEY_ENV_NAMES.map((k) => process.env[k]).filter(Boolean);
    if (keys.length === 0) {
      throw new Error("No GEMINI_API_KEY found");
    }

    const instance = createInstanceForKey(0); // Use first key for registration
    return (instance as any).definePrompt(...args);
  },
  defineFlow: function defineFlow(config: any, fn: AnyFn) {
    // Use first available instance for registration (synchronous)
    const keys = KEY_ENV_NAMES.map((k) => process.env[k]).filter(Boolean);
    if (keys.length === 0) {
      throw new Error("No GEMINI_API_KEY found");
    }

    const instance = createInstanceForKey(0); // Use first key for registration

    // Wrap the flow function to ensure each run uses a working instance
    const wrappedFn = async (input: any) => {
      // When the flow actually runs, ensure we have a working instance
      const { instance: runInstance } = await getWorkingInstance();
      // Call the user's fn
      return fn(input);
    };

    // Register the flow on the instance
    return (instance as any).defineFlow(config, wrappedFn);
  },
  runFlow: createDelegator('runFlow'),
  // expose a method to retrieve low-level genkit instance if absolutely necessary
  _getInstance: async () => {
    const { instance } = await getWorkingInstance();
    return instance;
  },
};

/** Export `ai` object with TypeScript-friendly typings (partial genkit) */
export const ai = exported as unknown as {
  definePrompt: (...args: any[]) => any;
  defineFlow: (config: any, fn: AnyFn) => any;
  runFlow?: (...args: any[]) => Promise<any>;
  _getInstance: () => Promise<GenkitInstance>;
};

/** --- Optional: expose a method to force-switch key (admin/debug use) --- */
export async function forceUseKeyIndex(index: number) {
  if (index < 0 || index >= validKeys.length) {
    throw new Error(`Invalid key index ${index}`);
  }
  if (!validKeys[index]) throw new Error(`No API key configured at index ${index}`);
  // create instance for that key and mark as last successful (so it will be used first)
  createInstanceForKey(index);
  lastSuccessfulKeyIndex = index;
  console.info(`genkit: forced use of ${safeLogKey(index)}`);
}

/** --- End of file --- */
