/**
 * Type declarations for WASM modules
 */

declare module '@tux-sourceish/universalfile/lib/universalfile.js' {
  interface UniversalFileModuleFactory {
    (): Promise<any>;
    default?: () => Promise<any>;
  }
  
  const factory: UniversalFileModuleFactory;
  export = factory;
  export default factory;
}

declare module '@tux-sourceish/universalfile/dist/core/wasm-types' {
  export interface WasmModule {
    [key: string]: any;
  }
}