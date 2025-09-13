// Runtime loader for the C++/WASM UniversalFile engine
// - Loads the Emscripten wrapper JS from the local package
// - Ensures the .wasm URL is correctly resolved (vite ?url import)
// - Exposes a single async getter to obtain the initialized engine

// We import file URLs so Vite can serve/bundle them properly
// The JS is injected as a script tag because the Emscripten output is UMD-style
// and exposes a global `UniversalFileModule` factory function.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite's ?url imports are strings at runtime
import wasmJsUrl from '@tux-sourceish/universalfile/lib/universalfile.js?url';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - Vite's ?url imports are strings at runtime
import wasmBinUrl from '@tux-sourceish/universalfile/lib/universalfile.wasm?url';

let wasmReadyPromise: Promise<any> | null = null;

export async function loadUniversalFileWasm(): Promise<any> {
  if (typeof window === 'undefined') {
    throw new Error('UniversalFile WASM engine requires a browser environment');
  }

  const g: any = window as any;
  if (g.__UF_WASM_ENGINE) return g.__UF_WASM_ENGINE;
  if (wasmReadyPromise) return wasmReadyPromise;

  wasmReadyPromise = new Promise<void>((resolve, reject) => {
    // If already present (e.g. injected elsewhere), skip tag injection
    if (g.UniversalFileModule) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = wasmJsUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = (e) => reject(new Error('Failed to load universalfile.js'));
    document.head.appendChild(script);
  }).then(async () => {
    const g2: any = window as any;
    const factory = g2.UniversalFileModule;
    if (!factory || typeof factory !== 'function') {
      throw new Error('UniversalFileModule factory not found on window');
    }
    // Provide locateFile so the wrapper can fetch the .wasm from the correct URL
    const engine = await factory({
      locateFile: (path: string) => (path.endsWith('.wasm') ? wasmBinUrl : path),
    });
    g2.__UF_WASM_ENGINE = engine;
    return engine;
  });

  return wasmReadyPromise;
}

// Lightweight guard that resolves true when engine is ready
export async function ensureUniversalFileEngine(): Promise<boolean> {
  try {
    await loadUniversalFileWasm();
    return true;
  } catch (e) {
    console.error('UniversalFile WASM engine failed to initialize:', e);
    return false;
  }
}

