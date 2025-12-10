// File: /app/ai/genkit.ts
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

      // Quick health-check: try to access model or run a harmless method if available.
      // We attempt to call `model` or `getModel` with a name to ensure plugin is usable.
      // But we do not await heavy generation here; just ensure method exists.
      // If model method doesn't exist, still accept the instance (some genkit versions differ).
      const maybeModelFn = (instance as any).model ?? (instance as any).getModel;
      if (typeof maybeModelFn === 'function') {
        // attempt to call it but with cautious error handling
        try {
          // call and allow it to resolve or reject; await to surface sync/async issues
          // NOTE: calling a model retrieval can be sync or async depending on lib, so await safely.
          // We call with a common model id — if it errors due to model name, ignore that as long as call succeeded.
          // Use a short timeout pattern would be ideal but keep simple here.
          await Promise.resolve((maybeModelFn as Function).call(instance, 'gemini-2.5-flash')).catch(() => {
            // ignore inner model-name errors; presence of function call is enough
          });
        } catch (e) {
          // If calling model function throws fatally (e.g., plugin rejects), treat as failure
          throw e;
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
export async function getGoogleAIModel(modelName = 'gemini-2.5-flash') {
  const { instance } = await getWorkingInstance();

  const modelGetter = (instance as any).model ?? (instance as any).getModel;
  if (typeof modelGetter !== 'function') {
    throw new Error('Genkit instance does not expose a model getter (model or getModel).');
  }

  // Call model getter; allow both sync and async forms
  const maybeModel = (modelGetter as Function).call(instance, modelName);
  // If it returns a promise, await it
  return await Promise.resolve(maybeModel);
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
  definePrompt: createDelegator('definePrompt'),
  defineFlow: async function defineFlow(name: string, schema: any, fn: AnyFn) {
    // Wrap the flow function to ensure each run uses a working instance (with key rotation if necessary).
    // The wrapper only delegates execution to the genkit instance's defineFlow.
    const { instance } = await getWorkingInstance();

    // Genkit's defineFlow expects the flow function to be executed by the genkit runtime.
    // We register the flow on the active instance.
    const defineFlowFn = (instance as any).defineFlow;
    if (typeof defineFlowFn !== 'function') {
      throw new Error('Genkit instance does not implement defineFlow');
    }

    // We wrap the provided fn to ensure runtime errors bubble through and to allow key rotation per-run
    const wrappedFn = async (input: any, ctx?: any) => {
      // When the flow actually runs, ensure we have a working instance (this will rotate keys if needed).
      const { instance: runInstance } = await getWorkingInstance();
      // Call the user's fn with the same input; user's fn may internally call ai.definePrompt/others, which will resolve to runInstance
      // We do not bind `this` to genkit instance — keep fn plain so users can rely on function parameters.
      return fn(input, ctx, { genkitInstance: runInstance });
    };

    // Register the flow on the instance
    return defineFlowFn.call(instance, name, schema, wrappedFn);
  },
  // a generic "runFlow" helper that some codebases use
  runFlow: createDelegator('runFlow'),
  // expose a method to retrieve low-level genkit instance if absolutely necessary
  _getInstance: async () => {
    const { instance } = await getWorkingInstance();
    return instance;
  },
};

/** Export `ai` object with TypeScript-friendly typings (partial genkit) */
export const ai = exported as unknown as {
  definePrompt: (...args: any[]) => Promise<any>;
  defineFlow: (name: string, schema: any, fn: AnyFn) => Promise<any>;
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
