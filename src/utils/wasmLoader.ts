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
  // Try different import methods for robustness
  const importAttempts = [
    () => import('@tux-sourceish/universalfile/lib/universalfile.js'),
    () => import('/node_modules/@tux-sourceish/universalfile/lib/universalfile.js'),
    () => import('../../../UniversalFile/lib/universalfile.js')
    // Note: Cannot import from /public in Vite - will use script loading instead
  ];
  
  for (let i = 0; i < importAttempts.length; i++) {
    try {
      console.log(`🔄 Trying WASM import method ${i + 1}...`);
      const wasmModuleFactory = await importAttempts[i]();
      
      // Initialize the module
      if (typeof wasmModuleFactory.default === 'function') {
        const module = await wasmModuleFactory.default();
        console.log('✅ WASM module factory loaded successfully');
        return module as WasmModule;
      } else if (typeof wasmModuleFactory.UniversalFileModule === 'function') {
        // Emscripten module factory
        const module = await wasmModuleFactory.UniversalFileModule();
        console.log('✅ Emscripten WASM module loaded successfully');
        return module as WasmModule;
      } else if (wasmModuleFactory.default) {
        // Sometimes the factory is already initialized
        console.log('✅ Pre-initialized WASM module found');
        return wasmModuleFactory.default as WasmModule;
      }
    } catch (error) {
      console.warn(`❌ Import method ${i + 1} failed:`, error);
      continue;
    }
  }
  
  // All import methods failed, try script loading
  console.warn('All import methods failed, trying script loading...');
  return loadWasmViaScript();
}

/**
 * Fallback: Load WASM via script tag (for cases where ES6 import doesn't work)
 */
async function loadWasmViaScript(): Promise<WasmModule> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/lib/universalfile.js';  // Load from public directory
    
    script.onload = async () => {
      try {
        // The WASM module should be available as a global
        const UniversalFileModule = (window as any).UniversalFileModule;
        
        if (!UniversalFileModule || typeof UniversalFileModule !== 'function') {
          throw new Error('UniversalFileModule not found in global scope or not a function');
        }
        
        // Initialize the Emscripten module
        console.log('🔄 Initializing UniversalFileModule via script loading...');
        const module = await UniversalFileModule();
        console.log('✅ Script-loaded WASM module initialized successfully');
        resolve(module as WasmModule);
      } catch (error) {
        console.error('❌ Script loading initialization failed:', error);
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