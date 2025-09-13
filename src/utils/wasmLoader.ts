/**
 * WASM Loader for UniversalFile Engine
 * ===================================
 * 
 * Loads and initializes the C++/WASM UniversalFile engine for performance-critical operations.
 * Phase 1 of "The Great Engine Swap" - replacing internal document logic with external WASM engine.
 * 
 * @version 2.1.0-engine-transplant
 */

// Import types - fallback if WASM types not available
type WasmModule = any; // Will be properly typed when WASM is loaded

let wasmModule: WasmModule | null = null;
let modulePromise: Promise<WasmModule> | null = null;

/**
 * Load the UniversalFile WASM module asynchronously
 * @returns Promise that resolves to the initialized WASM module
 */
export async function loadUniversalFileWasm(): Promise<WasmModule> {
  // Return existing promise if already loading
  if (modulePromise) {
    return modulePromise;
  }

  // Return cached module if already loaded
  if (wasmModule) {
    return wasmModule;
  }

  // Start loading the module
  modulePromise = loadWasmModule();
  
  try {
    wasmModule = await modulePromise;
    console.log('✅ UniversalFile WASM engine loaded successfully');
    return wasmModule;
  } catch (error) {
    console.error('❌ Failed to load UniversalFile WASM engine:', error);
    modulePromise = null; // Reset promise so we can retry
    throw error;
  }
}

/**
 * Internal WASM module loading logic
 */
async function loadWasmModule(): Promise<WasmModule> {
  // Try to import the WASM module
  try {
    // Import the UniversalFile WASM module (this should work with the existing package setup)
    const wasmModuleFactory = await import('@tux-sourceish/universalfile/lib/universalfile.js');
    
    // Initialize the module
    if (typeof wasmModuleFactory.default === 'function') {
      const module = await wasmModuleFactory.default();
      return module as WasmModule;
    } else {
      throw new Error('WASM module factory not found or invalid format');
    }
  } catch (importError) {
    console.warn('Direct import failed, trying alternative loading method:', importError);
    
    // Fallback: Try to load via dynamic script loading
    return loadWasmViaScript();
  }
}

/**
 * Fallback: Load WASM via script tag (for cases where ES6 import doesn't work)
 */
async function loadWasmViaScript(): Promise<WasmModule> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/node_modules/@tux-sourceish/universalfile/lib/universalfile.js';
    
    script.onload = async () => {
      try {
        // The WASM module should be available as a global
        const UniversalFileModule = (window as any).UniversalFileModule || (window as any).Module;
        
        if (!UniversalFileModule) {
          throw new Error('UniversalFileModule not found in global scope');
        }
        
        // Initialize the module
        const module = await UniversalFileModule();
        resolve(module as WasmModule);
      } catch (error) {
        reject(error);
      }
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load UniversalFile WASM script'));
    };
    
    document.head.appendChild(script);
  });
}

/**
 * Get the cached WASM module (synchronous)
 * @returns The WASM module if loaded, null otherwise
 */
export function getWasmModule(): WasmModule | null {
  return wasmModule;
}

/**
 * Check if WASM module is loaded
 */
export function isWasmLoaded(): boolean {
  return wasmModule !== null;
}

/**
 * Initialize WASM module during app startup
 * Should be called early in the application lifecycle
 */
export function initWasmEngine(): Promise<WasmModule> {
  console.log('🚀 Initializing UniversalFile WASM engine...');
  return loadUniversalFileWasm();
}