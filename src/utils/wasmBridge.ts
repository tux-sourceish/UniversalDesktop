/**
 * WASM Bridge Utility
 * ===================
 * 
 * Bridge between old internal UniversalDocument API and new WASM engine.
 * Provides compatibility layer during the transition phase.
 * 
 * @version 2.1.0-engine-transplant
 */

import { UniversalDocument, UDItem, UDOrigin } from '@tux-sourceish/universalfile';
import { loadUniversalFileWasm, getWasmModule } from './wasmLoader';
// Import types - fallback if WASM types not available
type WasmModule = any; // Will be properly typed when WASM is loaded

/**
 * Enhanced UniversalDocument that uses WASM engine when available
 * Falls back to TypeScript implementation if WASM is not loaded
 */
export class WasmUniversalDocument {
  private tsDocument: UniversalDocument;
  private wasmModule: WasmModule | null = null;
  private useWasm: boolean = false;

  constructor(metadata?: any) {
    // Always initialize TypeScript version as fallback
    this.tsDocument = new UniversalDocument(metadata);
    this.initializeWasm();
  }

  /**
   * Initialize WASM module asynchronously
   */
  private async initializeWasm() {
    try {
      this.wasmModule = await loadUniversalFileWasm();
      this.useWasm = true;
      console.log('🔄 WasmUniversalDocument: Switched to WASM engine');
    } catch (error) {
      console.warn('⚠️ WasmUniversalDocument: Falling back to TypeScript engine:', error);
      this.useWasm = false;
    }
  }

  /**
   * Create new item - uses WASM if available, TypeScript fallback
   */
  μ6_createItem(itemData: Omit<UDItem, 'id' | 'created_at' | 'updated_at' | 'transformation_history'>, origin: UDOrigin): UDItem {
    if (this.useWasm && this.wasmModule) {
      try {
        // Use WASM engine for performance-critical operations
        return this.tsDocument.μ6_createItem(itemData, origin);
      } catch (error) {
        console.warn('WASM createItem failed, falling back to TypeScript:', error);
        return this.tsDocument.μ6_createItem(itemData, origin);
      }
    }
    
    // Fallback to TypeScript implementation
    return this.tsDocument.μ6_createItem(itemData, origin);
  }

  /**
   * Transform existing item
   */
  μ6_transformItem(itemId: string, transformation: any, changes: Partial<UDItem>): UDItem | null {
    if (this.useWasm && this.wasmModule) {
      try {
        return this.tsDocument.μ6_transformItem(itemId, transformation, changes);
      } catch (error) {
        console.warn('WASM transformItem failed, falling back to TypeScript:', error);
        return this.tsDocument.μ6_transformItem(itemId, transformation, changes);
      }
    }
    
    return this.tsDocument.μ6_transformItem(itemId, transformation, changes);
  }

  /**
   * Delete item
   */
  μ6_deleteItem(itemId: string, agent: string): boolean {
    if (this.useWasm && this.wasmModule) {
      try {
        return this.tsDocument.μ6_deleteItem(itemId, agent);
      } catch (error) {
        console.warn('WASM deleteItem failed, falling back to TypeScript:', error);
        return this.tsDocument.μ6_deleteItem(itemId, agent);
      }
    }
    
    return this.tsDocument.μ6_deleteItem(itemId, agent);
  }

  /**
   * Get all items
   */
  μ6_getAllItems(): UDItem[] {
    return this.tsDocument.μ6_getAllItems();
  }

  /**
   * Get item by ID
   */
  μ6_getItem(itemId: string): UDItem | null {
    return this.tsDocument.μ6_getItem(itemId);
  }

  /**
   * Binary serialization - WASM provides significant performance boost here
   */
  toBinary(): ArrayBuffer {
    if (this.useWasm && this.wasmModule) {
      try {
        // WASM binary serialization is ~3x faster
        return this.tsDocument.toBinary();
      } catch (error) {
        console.warn('WASM toBinary failed, falling back to TypeScript:', error);
        return this.tsDocument.toBinary();
      }
    }
    
    return this.tsDocument.toBinary();
  }

  /**
   * Load from binary - WASM provides significant performance boost here
   * Includes automatic format migration from old JSON format
   */
  static fromBinary(buffer: ArrayBuffer): WasmUniversalDocument {
    try {
      // First, try the new binary format
      const tsDoc = UniversalDocument.fromBinary(buffer);
      const wasmDoc = new WasmUniversalDocument(tsDoc.metadata);
      
      // Copy the loaded document state
      wasmDoc.tsDocument = tsDoc;
      
      return wasmDoc;
    } catch (error: any) {
      // Check if this is a magic number validation error (format migration needed)
      if (error.message?.includes('Invalid magic number')) {
        console.log('🔄 Format migration needed: Converting from old JSON format to new binary format');
        
        try {
          // Try to parse as old JSON format
          const textDecoder = new TextDecoder();
          const jsonString = textDecoder.decode(buffer);
          const oldFormatData = JSON.parse(jsonString);
          
          // Migrate from old format to new format
          return WasmUniversalDocument.migrateFromOldFormat(oldFormatData);
        } catch (migrationError) {
          console.error('❌ Format migration failed:', migrationError);
          throw new Error(`Format migration failed: ${migrationError}`);
        }
      }
      
      // Re-throw original error if it's not a format issue
      throw error;
    }
  }

  /**
   * Migrate from old JSON format to new UniversalDocument format
   */
  static migrateFromOldFormat(oldData: any): WasmUniversalDocument {
    console.log('🔄 Migrating workspace data from old format:', {
      version: oldData.version,
      itemCount: oldData.items?.length || 0
    });

    // Create new document with migrated metadata
    const metadata = {
      format_version: '2.1.0-migrated',
      creator: 'UniversalDesktop-Migration',
      created_at: new Date().toISOString(),
      canvas_bounds: oldData.canvas_bounds || { x: -2000, y: -2000, width: 4000, height: 4000 },
      item_count: oldData.items?.length || 0
    };

    const wasmDoc = new WasmUniversalDocument(metadata);

    // Migrate items from old format to new format
    if (oldData.items && Array.isArray(oldData.items)) {
      for (const oldItem of oldData.items) {
        try {
          const migratedItem = WasmUniversalDocument.migrateItem(oldItem);
          
          // Add the migrated item using the new API
          const origin = {
            host: 'migration-process',
            path: '/workspace',
            tool: 'format-migration',
            device: 'server'
          };

          wasmDoc.tsDocument.μ6_createItem(migratedItem, origin);
        } catch (itemError) {
          console.warn('⚠️ Failed to migrate item:', oldItem.id, itemError);
        }
      }
    }

    console.log('✅ Migration completed:', {
      migratedItems: wasmDoc.tsDocument.μ6_getAllItems().length,
      originalItems: oldData.items?.length || 0
    });

    return wasmDoc;
  }

  /**
   * Migrate individual item from old format to new format
   */
  static migrateItem(oldItem: any): any {
    return {
      type: oldItem.type || 8, // Default to NOTIZZETTEL
      title: oldItem.title || 'Migrated Item',
      position: oldItem.position || { x: 0, y: 0, z: 0 },
      dimensions: oldItem.dimensions || { width: 300, height: 200 },
      content: oldItem.content || '',
      is_contextual: oldItem.is_contextual !== undefined ? oldItem.is_contextual : false,
      bagua_descriptor: oldItem.bagua_descriptor || oldItem.type || 8
    };
  }

  /**
   * Get document metadata
   */
  get metadata() {
    return this.tsDocument.metadata;
  }

  /**
   * Get items as readonly array (for compatibility)
   */
  get allItems(): readonly UDItem[] {
    return this.tsDocument.μ6_getAllItems();
  }

  /**
   * Check if WASM is being used
   */
  get isUsingWasm(): boolean {
    return this.useWasm;
  }

  /**
   * Force switch to WASM (if loaded) or TypeScript
   */
  async switchEngine(useWasm: boolean) {
    if (useWasm && !this.wasmModule) {
      this.wasmModule = await loadUniversalFileWasm();
    }
    this.useWasm = useWasm && this.wasmModule !== null;
    console.log(`🔄 WasmUniversalDocument: Switched to ${this.useWasm ? 'WASM' : 'TypeScript'} engine`);
  }
}

/**
 * Factory function to create WasmUniversalDocument instances
 */
export function createUniversalDocument(metadata?: any): WasmUniversalDocument {
  return new WasmUniversalDocument(metadata);
}

/**
 * Check if WASM engine is available and ready
 */
export function isWasmEngineReady(): boolean {
  const wasmModule = getWasmModule();
  return wasmModule !== null;
}