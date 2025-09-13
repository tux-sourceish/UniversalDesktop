/**
 * µ1_useUniversalDocument - Campus-Modell Hook für UniversalDocument Management
 * BAGUA: HIMMEL (☰) - Templates/Classes - "Strukturelle Grundlagen"
 * 
 * REGEL: NUR UniversalDocument-Logik, NICHTS anderes!
 * Nutzt UDFormat.transistor für Bedingungen
 * 
 * @version 2.1.0-engine-transplant (WASM integration)
 */

import { useState, useCallback, useMemo } from 'react';
import { UDItem, UDOrigin } from '@tux-sourceish/universalfile';
import { WasmUniversalDocument, createUniversalDocument } from '../utils/wasmBridge';
// Keep old UDFormat as fallback for transistor operations
import { UDFormat as OldUDFormat } from '../core/UDFormat';

export interface µ1_DocumentState {
  document: WasmUniversalDocument | null;
  items: readonly UDItem[]; // Readonly for immutability
  isLoading: boolean;
  hasChanges: boolean;
  lastSaved: number | null;
}

export interface µ1_CreateItemOptions {
  type: number;
  title: string;
  position: { x: number; y: number; z: number };
  dimensions: { width: number; height: number };
  content: any;
  is_contextual: boolean; // Required to match UDItem interface
  bagua_descriptor: number; // Required Bagua metadata for µX_ system (now required)
}

/**
 * µ1_useUniversalDocument - Reine .ud Document-Funktionalität
 * Campus-Modell: Macht NUR eine Sache - UniversalDocument Management
 */
export const µ1_useUniversalDocument = () => {
  const [documentState, setDocumentState] = useState<µ1_DocumentState>({
    document: null,
    items: [],
    isLoading: false,
    hasChanges: false,
    lastSaved: null
  });

  // µ1_ Neues Document erstellen (now with WASM power!)
  const µ1_createDocument = useCallback(() => {
    const doc = createUniversalDocument();
    
    setDocumentState(prev => ({
      ...prev,
      document: doc,
      items: [],
      hasChanges: true,
      lastSaved: null
    }));

    console.log('🌌 µ1_Document created with WASM-Bagua-Power!');
    return doc;
  }, []);

  // µ1_ Document aus Binary laden
  // µ1_ Document von Workspace Snapshot laden (JSON Format - für Supabase)
  const µ1_loadFromWorkspaceSnapshot = useCallback((binaryData: ArrayBuffer) => {
    setDocumentState(prev => ({ ...prev, isLoading: true }));

    try {
      console.log('📥 µ1_loadFromWorkspaceSnapshot starting:', {
        binarySize: binaryData.byteLength,
        hasData: binaryData.byteLength > 0
      });

      const doc = WasmUniversalDocument.fromBinary(binaryData);
      const items = [...doc.allItems]; // Convert readonly to mutable array

      setDocumentState({
        document: doc,
        items,
        isLoading: false,
        hasChanges: false,
        lastSaved: Date.now()
      });

      // ENHANCED DEBUG: Detailed load analysis
      console.log('📥 µ1_Document loaded from workspace snapshot:', {
        itemCount: items.length,
        version: doc.metadata.format_version,
        binaryAnalysis: {
          inputSize: binaryData.byteLength,
          processedItems: items.length,
          firstItemsTypes: items.slice(0, 5).map(item => ({
            id: item.id.slice(0, 8),
            type: item.type,
            title: item.title.slice(0, 20)
          }))
        },
        documentMetadata: doc.metadata
      });

      // CRITICAL: Check for deserialization issues
      if (binaryData.byteLength > 1000 && items.length === 0) {
        console.warn('🚨 POTENTIAL DESERIALIZATION BUG: Large binary but no items extracted!', {
          binarySize: binaryData.byteLength,
          expectedItems: 'unknown',
          actualItems: 0
        });
      }
      
      return true;
    } catch (error) {
      console.error('💥 µ1_Document loading failed:', error);
      
      setDocumentState(prev => ({
        ...prev,
        isLoading: false
      }));
      
      return false;
    }
  }, []);

  const µ1_loadFromBinary = useCallback((binaryData: ArrayBuffer) => {
    setDocumentState(prev => ({ ...prev, isLoading: true }));

    try {
      const doc = WasmUniversalDocument.fromBinary(binaryData);
      const items = [...doc.allItems]; // Convert readonly to mutable array

      setDocumentState({
        document: doc,
        items,
        isLoading: false,
        hasChanges: false,
        lastSaved: Date.now()
      });

      console.log('📥 µ1_Document loaded from binary with WASM:', {
        itemCount: items.length,
        usingWasm: doc.isUsingWasm,
        baguaSystem: 'activated'
      });

      return doc;
    } catch (error) {
      console.error('💥 µ1_Document loading failed:', error);
      setDocumentState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  }, []);

  const µ1_toBinary = useCallback((): ArrayBuffer | null => {
    const { document } = documentState;
    
    // Algebraischer Transistor für Document-Check
    const hasDocument = OldUDFormat.transistor(document !== null);
    
    if (!hasDocument) {
      console.warn('⚠️ µ1_toBinary: No document to serialize');
      return null;
    }

    try {
      const binary = document!.toBinary();
      
      setDocumentState(prev => ({
        ...prev,
        hasChanges: false,
        lastSaved: Date.now()
      }));

      console.log('💾 µ1_Document serialized to binary:', {
        size: Math.round(binary.byteLength / 1024) + 'KB',
        itemCount: documentState.items.length
      });
      return binary;
    } catch (error) {
      console.error('💥 µ1_toBinary failed:', error);
      
      // Try to create empty document binary as fallback
      try {
        const emptyBuffer = new ArrayBuffer(8); // Minimal valid binary
        const view = new DataView(emptyBuffer);
        view.setUint32(0, 0); // version
        view.setUint32(4, 0); // item count
        
        console.log('🔄 Created minimal empty document binary');
        return emptyBuffer;
      } catch (fallbackError) {
        console.error('💥 Even fallback binary creation failed:', fallbackError);
        return null;
      }
    }
  }, [documentState]);

  // µ1_ Item hinzufügen mit Bagua-System (now with WASM power!)
  const µ1_addItem = useCallback((options: µ1_CreateItemOptions, origin?: UDOrigin) => {
    const { document } = documentState;
    
    // Algebraischer Transistor für Document-Check
    const hasDocument = OldUDFormat.transistor(document !== null);
    
    if (!hasDocument) {
      console.warn('⚠️ µ1_addItem: No document available');  
      return null;
    }

    const defaultOrigin: UDOrigin = {
      host: 'UniversalDesktop.localhost',
      path: '/workspace',
      tool: 'µ1_useUniversalDocument',
      device: 'Browser@Client'
    };

    try {
      const item = document!.μ6_createItem(options, origin || defaultOrigin);
      const updatedItems = document!.allItems;

      setDocumentState(prev => ({
        ...prev,
        items: updatedItems,
        hasChanges: true
      }));

      // Enhanced logging with WASM status
      if (typeof window !== 'undefined' && (window as any).DEBUG_UD_ITEMS) {
        console.log('➕ µ1_Item added with WASM:', {
          id: item.id,
          type: options.type,
          position: item.position,
          dimensions: item.dimensions,
          usingWasm: document!.isUsingWasm
        });
      }

      return item;
    } catch (error) {
      console.error('💥 µ1_addItem failed:', error);
      return null;
    }
  }, [documentState]);

  // µ1_ Item transformieren
  const µ1_transformItem = useCallback((
    itemId: string, 
    transformation: { verb: string; agent: string; description: string },
    newData: Partial<UDItem>
  ) => {
    const { document } = documentState;
    
    // Algebraischer Transistor für Document-Check
    const hasDocument = OldUDFormat.transistor(document !== null);
    
    if (!hasDocument) {
      console.warn('⚠️ µ1_transformItem: No document available');
      return false;
    }

    try {
      const updatedItem = document!.μ6_transformItem(itemId, transformation, newData);
      
      // Algebraischer Transistor: Item wurde erfolgreich transformiert?
      const success = OldUDFormat.transistor(updatedItem !== null);
      
      if (success) {
        const updatedItems = document!.allItems;
        
        setDocumentState(prev => ({
          ...prev,
          items: updatedItems,
          hasChanges: true
        }));

        console.log('🔄 µ1_Item transformed with WASM:', {
          itemId,
          verb: transformation.verb,
          usingWasm: document!.isUsingWasm,
          success
        });
      }

      return success;
    } catch (error) {
      console.error('💥 µ1_transformItem failed:', error);
      return false;
    }
  }, [documentState]);

  // µ1_ Item entfernen (now with WASM power!)
  const µ1_removeItem = useCallback((itemId: string) => {
    const { document } = documentState;
    
    // Algebraischer Transistor für Document-Check
    const hasDocument = OldUDFormat.transistor(document !== null);
    
    if (!hasDocument) {
      console.warn('⚠️ µ1_removeItem: No document available');
      return false;
    }

    try {
      // Quick-Fix: Remove from React state even if not in document (State-Sync Issue)
      const itemExists = document!.allItems.find(item => item.id === itemId);
      
      let success = false;
      if (itemExists) {
        success = document!.μ6_deleteItem(itemId, 'µ1_useUniversalDocument');
      } else {
        // Force remove from React state (State-Sync Fix)
        console.log('🔧 State-Sync Fix: Removing item from React state only');
        success = true; // Pretend success to update React state
      }
      
      // Algebraischer Update bei Erfolg
      const shouldUpdate = OldUDFormat.transistor(success);
      
      if (shouldUpdate) {
        // Force state update - filter out the item even if document didn't have it
        setDocumentState(prev => ({
          ...prev,
          items: prev.items.filter(item => item.id !== itemId),
          hasChanges: true
        }));

        console.log('🗑️ µ1_Item removed with WASM:', { 
          itemId, 
          usingWasm: document!.isUsingWasm,
          success 
        });
      }

      return success;
    } catch (error) {
      console.error('💥 µ1_removeItem failed:', error);
      return false;
    }
  }, [documentState]);

  // µ1_ Items nach Bagua filtern
  const µ1_getItemsByBagua = useCallback((baguaDescriptor: number): UDItem[] => {
    return documentState.items.filter(item => 
      (item.bagua_descriptor & baguaDescriptor) === baguaDescriptor
    );
  }, [documentState.items]);

  // µ1_ Mark document as saved (reset hasChanges)
  const µ1_markAsSaved = useCallback(() => {
    setDocumentState(prev => ({
      ...prev,
      hasChanges: false,
      lastSaved: Date.now()
    }));
  }, []);

  // µ1_ Computed values mit useMemo für Performance
  const µ1_documentMetadata = useMemo(() => {
    const { document, items } = documentState;
    
    if (!document) return null;

    // Bagua-Statistiken berechnen
    const baguaStats = items.reduce((stats: Record<number, number>, item) => {
      stats[item.bagua_descriptor] = (stats[item.bagua_descriptor] || 0) + 1;
      return stats;
    }, {});

    return {
      itemCount: items.length,
      baguaStats,
      documentId: 'doc-' + Date.now(), // TODO: Echte ID aus Document
      createdAt: Date.now(), // TODO: Echte Timestamp aus Document
      hasTransformations: items.some(item => item.transformation_history.length > 0)
    };
  }, [documentState]);

  return {
    // State
    documentState,
    µ1_documentMetadata,
    
    // µ1_ Campus-Modell Funktionen - NUR UniversalDocument
    µ1_createDocument,
    µ1_loadFromBinary,
    µ1_loadFromWorkspaceSnapshot,
    µ1_toBinary,
    µ1_addItem,
    µ1_transformItem,
    µ1_removeItem,
    µ1_getItemsByBagua,
    µ1_markAsSaved
  };
};