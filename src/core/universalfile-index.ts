import UniversalFileModule, {
  UniversalDocument,
  Module as UniversalFileWasmModule,
} from '@tux-sourceish/universalfile/lib/universalfile.js';

class UniversalFileEngine {
  private static instance: UniversalFileEngine;
  private wasmModule: UniversalFileWasmModule | null = null;
  private universalDocument: UniversalDocument | null = null;

  private constructor() {}

  public static getInstance(): UniversalFileEngine {
    if (!UniversalFileEngine.instance) {
      UniversalFileEngine.instance = new UniversalFileEngine();
    }
    return UniversalFileEngine.instance;
  }

  public async init(): Promise<void> {
    if (this.wasmModule) {
      return;
    }
    this.wasmModule = await UniversalFileModule();
    this.universalDocument = new this.wasmModule.UniversalDocument();
  }

  public getDocument(): UniversalDocument {
    if (!this.universalDocument) {
      throw new Error('UniversalFileEngine not initialized!');
    }
    return this.universalDocument;
  }
}

export const universalFileEngine = UniversalFileEngine.getInstance();