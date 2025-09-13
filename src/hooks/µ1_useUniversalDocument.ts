/**
 * µ1_useUniversalDocument - Campus-Modell Hook für UniversalDocument Management
 * BAGUA: HIMMEL (☰) - Templates/Classes - "Strukturelle Grundlagen"
 *
 * Engine transplant: All core ops go through the C++/WASM engine.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { UDFormat } from '../core/UDFormat';
import { loadUniversalFileWasm } from '../core/universalfile-bridge';
import type { UDItem, UDOrigin, UDMetadata, UDPosition } from '@tux-sourceish/universalfile';
import { UniversalDocument as TSUniversalDocument } from '@tux-sourceish/universalfile';

export interface µ1_DocumentState {
  // Expose only metadata; keep wasm document instance internal
  document: { metadata: UDMetadata } | null;
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
  is_contextual: boolean;
  bagua_descriptor?: number;
}

export const µ1_useUniversalDocument = () => {
  const wasmRef = useRef<any | null>(null);
  const docRef = useRef<any | null>(null); // WASM doc
  const tsDocRef = useRef<any | null>(null); // TS doc fallback

  const pickActiveDoc = () => {
    const doc = docRef.current;
    if (doc) {
      const createAdv = (doc as any)["μ6_createItem"] || (doc as any).μ6_createItem;
      const legacyCreate = (doc as any).createItem;
      if (typeof createAdv === 'function' || typeof legacyCreate === 'function') return doc;
    }
    return tsDocRef.current;
  };

  const normalizeItems = (maybeList: any): UDItem[] => {
    if (Array.isArray(maybeList)) return maybeList as UDItem[];
    if (maybeList && typeof maybeList.length === 'number') {
      try { return Array.from(maybeList) as UDItem[]; } catch {}
    }
    if (maybeList && typeof maybeList.size === 'function' && typeof maybeList.get === 'function') {
      const size = maybeList.size();
      const arr: UDItem[] = [] as any;
      for (let i = 0; i < size; i++) arr.push(maybeList.get(i));
      return arr;
    }
    return [];
  };

  const [documentState, setDocumentState] = useState<µ1_DocumentState>({
    document: null,
    items: [],
    isLoading: false,
    hasChanges: false,
    lastSaved: null
  });

  // Initialize WASM engine once
  useEffect(() => {
    let mounted = true;
    loadUniversalFileWasm()
      .then(engine => {
        if (!mounted) return;
        wasmRef.current = engine;
        if (!docRef.current && !tsDocRef.current) {
          // Prepare both, prefer WASM when fully bound
          const wasmDoc = new engine.UniversalDocument();
          const tsDoc = new TSUniversalDocument();
          docRef.current = wasmDoc;
          tsDocRef.current = tsDoc;
          const active = pickActiveDoc() || wasmDoc || tsDoc;
          const meta = (active as any).getMetadata ? (active as any).getMetadata() : { format_version: '2.0', creator: 'UniversalDesktop', created_at: new Date().toISOString(), canvas_bounds: { x: -2000, y: -2000, width: 4000, height: 4000 }, item_count: 0 };
          const getAll = (active as any)["μ6_getAllItems"] || (active as any).μ6_getAllItems || (active as any).getAllItems;
          const items = normalizeItems(typeof getAll === 'function' ? getAll.call(active) : []);
          setDocumentState(prev => ({ ...prev, document: { metadata: meta }, items, isLoading: false }));
        }
      })
      .catch(err => {
        console.error('💥 Failed to load UniversalFile WASM engine:', err);
      });
    return () => { mounted = false; };
  }, []);

  // Create a new document (WASM)
  const µ1_createDocument = useCallback(() => {
    // Prefer WASM when available; otherwise TS fallback
    const engine = wasmRef.current;
    let doc: any = null;
    if (engine) {
      doc = new engine.UniversalDocument();
      docRef.current = doc;
    } else {
      doc = new TSUniversalDocument();
      tsDocRef.current = doc;
    }
    const meta = doc.getMetadata ? doc.getMetadata() : { format_version: '2.0', creator: 'UniversalDesktop', created_at: new Date().toISOString(), canvas_bounds: { x: -2000, y: -2000, width: 4000, height: 4000 }, item_count: 0 };

    setDocumentState(prev => ({
      ...prev,
      document: { metadata: meta },
      items: [],
      hasChanges: true,
      lastSaved: null
    }));

    console.log('🌌 µ1_Document created (WASM engine)');
    return doc;
  }, []);

  // Load from compact workspace snapshot (JSON produced by worker)
  const µ1_loadFromWorkspaceSnapshot = useCallback(async (binaryData: ArrayBuffer) => {
    setDocumentState(prev => ({ ...prev, isLoading: true }));

    try {
      const engine = wasmRef.current || (await loadUniversalFileWasm());
      console.log('📥 µ1_loadFromWorkspaceSnapshot (WASM) starting:', { binarySize: binaryData.byteLength });

      // Support both JSON and UDAR-binary in the same code path
      let data: any | null = null;
      try {
        const decoder = new TextDecoder();
        const text = decoder.decode(binaryData);
        if (text && (text.trim().startsWith('{') || text.trim().startsWith('['))) {
          data = JSON.parse(text);
        }
      } catch {}

      if (!data) {
        // Not JSON; try UDAR binary path as fallback
        const engine = wasmRef.current || (await loadUniversalFileWasm());
        const u8 = new Uint8Array(binaryData);
        const fromBin = engine.UniversalDocument.fromBinary(u8);
        docRef.current = fromBin;
        const active = pickActiveDoc() || fromBin;
        const getAll = (active as any)["μ6_getAllItems"] || (active as any).μ6_getAllItems || (active as any).getAllItems;
        const items = normalizeItems(typeof getAll === 'function' ? getAll.call(active) : []);
        const meta = active.getMetadata ? active.getMetadata() : { format_version: '2.0', creator: 'UniversalDesktop', created_at: new Date().toISOString(), canvas_bounds: { x: -2000, y: -2000, width: 4000, height: 4000 }, item_count: items.length };

        setDocumentState({ document: { metadata: meta }, items, isLoading: false, hasChanges: false, lastSaved: Date.now() });
        return true;
      }

      const doc = new engine.UniversalDocument();
      docRef.current = doc;

      // Restore metadata
      if (data.version || data.creator || data.created_at || data.canvas_bounds) {
        const meta = doc.getMetadata();
        if (data.version) meta.format_version = data.version;
        if (data.creator) meta.creator = data.creator;
        if (data.created_at) meta.created_at = data.created_at;
        if (data.canvas_bounds) meta.canvas_bounds = data.canvas_bounds;
        doc.setMetadata(meta);
      }

      const defaultOrigin: UDOrigin = {
        host: 'UniversalDesktop.localhost',
        path: '/workspace',
        tool: 'µ1_useUniversalDocument',
        device: 'Browser@Client'
      };

      // Backward-compat: support multiple item shapes
      const itemsArray = Array.isArray(data.items)
        ? data.items
        : Array.isArray(data.document?.items)
          ? data.document.items
          : Array.isArray(data.content?.items)
            ? data.content.items
            : Array.isArray(data)
              ? data
              : [];

      if (Array.isArray(itemsArray)) {
        for (const it of itemsArray) {
          const position = (it.position as UDPosition) ?? { x: 0, y: 0, z: 0 };
          const title = it.title ?? 'Untitled';
          // Prefer μ6_createItem if available, else fallback to legacy createItem
          let active = pickActiveDoc() || doc;
          const tryCreate = (targetDoc: any): boolean => {
            const createAdv = (targetDoc as any)["μ6_createItem"] || (targetDoc as any).μ6_createItem;
            try {
              if (typeof createAdv === 'function') {
                createAdv.call(targetDoc, {
                  type: it.type ?? 0,
                  title,
                  position,
                  dimensions: it.dimensions ?? { width: 300, height: 200 },
                  is_contextual: !!it.is_contextual,
                  bagua_descriptor: typeof it.bagua_descriptor === 'number' ? it.bagua_descriptor : 1,
                }, defaultOrigin);
                return true;
              } else if (typeof (targetDoc as any).createItem === 'function') {
                (targetDoc as any).createItem(it.type ?? 0, title, position);
                return true;
              }
            } catch (e: any) {
              if (e && e.name === 'UnboundTypeError') {
                // drop wasm doc and fallback
                docRef.current = null;
              }
            }
            return false;
          };
          if (!tryCreate(active)) {
            if (!tsDocRef.current) tsDocRef.current = new TSUniversalDocument();
            active = tsDocRef.current;
            tryCreate(active);
          }
        }
      }

      const active = pickActiveDoc() || doc;
      const getAll = (active as any)["μ6_getAllItems"] || (active as any).μ6_getAllItems || (active as any).getAllItems;
      const items = normalizeItems(typeof getAll === 'function' ? getAll.call(active) : []);
      const meta = doc.getMetadata ? doc.getMetadata() : { format_version: '2.0', creator: 'UniversalDesktop', created_at: new Date().toISOString(), canvas_bounds: { x: -2000, y: -2000, width: 4000, height: 4000 }, item_count: items.length };

      setDocumentState({
        document: { metadata: meta },
        items,
        isLoading: false,
        hasChanges: false,
        lastSaved: Date.now()
      });

      console.log('✅ µ1_Document (WASM) loaded from workspace snapshot:', { itemCount: items.length, version: meta.format_version });
      return true;
    } catch (error) {
      console.error('💥 µ1_Document (WASM) loading failed:', error);
      setDocumentState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  }, []);

  // Load from UDAR binary
  const µ1_loadFromBinary = useCallback(async (binaryData: ArrayBuffer) => {
    setDocumentState(prev => ({ ...prev, isLoading: true }));

    try {
      const engine = wasmRef.current || (await loadUniversalFileWasm());
      const u8 = new Uint8Array(binaryData);
      const doc = engine.UniversalDocument.fromBinary(u8);
      docRef.current = doc;
      const active = pickActiveDoc() || doc;
      const getAll = (active as any)["μ6_getAllItems"] || (active as any).μ6_getAllItems || (active as any).getAllItems;
      const items = normalizeItems(typeof getAll === 'function' ? getAll.call(active) : []);
      const meta = doc.getMetadata ? doc.getMetadata() : { format_version: '2.0', creator: 'UniversalDesktop', created_at: new Date().toISOString(), canvas_bounds: { x: -2000, y: -2000, width: 4000, height: 4000 }, item_count: items.length };

      setDocumentState(prev => ({ ...prev, document: { metadata: meta }, items, isLoading: false, hasChanges: false, lastSaved: Date.now() }));
      console.log('📥 µ1_Document (WASM) loaded from binary:', { itemCount: items.length });
      return doc;
    } catch (error) {
      console.error('💥 µ1_Document (WASM) loading failed:', error);
      setDocumentState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  }, []);

  // Serialize to UDAR binary (best effort conversion)
  const µ1_toBinary = useCallback((): ArrayBuffer | null => {
    const doc = pickActiveDoc();
    if (!doc) {
      console.warn('⚠️ µ1_toBinary: No document to serialize');
      return null;
    }
    try {
      const vec = doc.toBinary();
      let out: Uint8Array | null = null;
      if (vec instanceof Uint8Array) {
        out = vec;
      } else if (vec && typeof vec.length === 'number') {
        out = new Uint8Array(vec);
      } else if (vec && typeof vec.size === 'function' && typeof vec.get === 'function') {
        const size = vec.size();
        const tmp = new Uint8Array(size);
        for (let i = 0; i < size; i++) tmp[i] = vec.get(i);
        out = tmp;
      }
      if (!out) throw new Error('Unknown WASM toBinary return type');

      setDocumentState(prev => ({ ...prev, hasChanges: false, lastSaved: Date.now() }));
      console.log('💾 µ1_Document (WASM) serialized to binary:', { size: out.byteLength });
      return out.buffer;
    } catch (error) {
      console.error('💥 µ1_toBinary (WASM) failed:', error);
      return null;
    }
  }, []);

  // Add item
  const µ1_addItem = useCallback((options: µ1_CreateItemOptions, origin?: UDOrigin) => {
    const doc = pickActiveDoc();
    if (!doc) {
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
      const attemptCreate = (targetDoc: any): UDItem | null => {
        const createAdv = (targetDoc as any)["μ6_createItem"] || (targetDoc as any).μ6_createItem;
        if (typeof createAdv === 'function') {
          return createAdv.call(targetDoc, {
            type: options.type,
            title: options.title,
            position: options.position,
            dimensions: options.dimensions,
            is_contextual: options.is_contextual,
            bagua_descriptor: typeof options.bagua_descriptor === 'number' ? options.bagua_descriptor : 1,
          }, origin || defaultOrigin);
        } else if (typeof (targetDoc as any).createItem === 'function') {
          return (targetDoc as any).createItem(options.type, options.title, options.position);
        }
        return null;
      };

      let item: UDItem | null = null;
      try {
        item = attemptCreate(doc);
      } catch (e: any) {
        if (e && e.name === 'UnboundTypeError') {
          docRef.current = null; // prefer fallback
        } else {
          throw e;
        }
      }
      if (!item) {
        if (!tsDocRef.current) tsDocRef.current = new TSUniversalDocument();
        item = attemptCreate(tsDocRef.current);
      }
      const getAll = (doc as any)["μ6_getAllItems"] || (doc as any).μ6_getAllItems || (doc as any).getAllItems;
      const updatedItems = normalizeItems(typeof getAll === 'function' ? getAll.call(doc) : []);

      setDocumentState(prev => ({ ...prev, items: updatedItems, hasChanges: true }));
      return item;
    } catch (error) {
      console.error('💥 µ1_addItem (WASM) failed:', error);
      return null;
    }
  }, []);

  // Transform item
  const µ1_transformItem = useCallback((
    itemId: string,
    transformation: { verb: string; agent: string; description: string },
    newData: Partial<UDItem>
  ) => {
    const doc = pickActiveDoc();
    if (!doc) {
      console.warn('⚠️ µ1_transformItem: No document available');
      return false;
    }
    try {
      const tfn = (doc as any)["μ6_transformItem"] || (doc as any).μ6_transformItem;
      if (typeof tfn === 'function') {
        const changes: any = {};
        if (newData.title !== undefined) { changes.title = newData.title; changes.update_title = true; }
        if (newData.position !== undefined) { changes.position = newData.position; changes.update_position = true; }
        if ((newData as any).dimensions !== undefined) { changes.dimensions = (newData as any).dimensions; changes.update_dimensions = true; }
        if ((newData as any).is_contextual !== undefined) { changes.is_contextual = (newData as any).is_contextual; changes.update_is_contextual = true; }
        if ((newData as any).bagua_descriptor !== undefined) { changes.bagua_descriptor = (newData as any).bagua_descriptor; changes.update_bagua_descriptor = true; }

        const updatedItem = tfn.call(doc, itemId, {
          verb: (transformation.verb as any) || 'iteriert',
          agent: transformation.agent,
          description: transformation.description,
        }, changes);

        const success = UDFormat.transistor(updatedItem !== undefined && updatedItem !== null);
        if (success) {
          const getAll = (doc as any)["μ6_getAllItems"] || (doc as any).μ6_getAllItems || (doc as any).getAllItems;
          const updatedItems = normalizeItems(typeof getAll === 'function' ? getAll.call(doc) : []);
          setDocumentState(prev => ({ ...prev, items: updatedItems, hasChanges: true }));
          console.log('🔄 µ1_Item transformed (WASM):', { itemId, verb: transformation.verb });
        }
        return success;
      }
      // Fallback: mutate state only
      setDocumentState(prev => ({
        ...prev,
        items: prev.items.map(it => it.id === itemId ? { ...it, ...newData, updated_at: Date.now() as any } as UDItem : it),
        hasChanges: true
      }));
      return true;
    } catch (error) {
      console.error('💥 µ1_transformItem (WASM) failed:', error);
      return false;
    }
  }, []);

  // Remove item
  const µ1_removeItem = useCallback((itemId: string) => {
    const doc = pickActiveDoc();
    if (!doc) {
      console.warn('⚠️ µ1_removeItem: No document available');
      return false;
    }
    try {
      const dfn = (doc as any)["μ6_deleteItem"] || (doc as any).μ6_deleteItem;
      if (typeof dfn === 'function') {
        const success = dfn.call(doc, itemId, 'user-interaction');
        if (UDFormat.transistor(success)) {
          const getAll = (doc as any)["μ6_getAllItems"] || (doc as any).μ6_getAllItems || (doc as any).getAllItems;
          const updatedItems = normalizeItems(typeof getAll === 'function' ? getAll.call(doc) : []);
          setDocumentState(prev => ({ ...prev, items: updatedItems, hasChanges: true }));
          console.log('🗑️ µ1_Item removed (WASM):', { itemId });
        }
        return !!success;
      }
      // Fallback: update state only
      setDocumentState(prev => ({ ...prev, items: prev.items.filter(i => i.id !== itemId), hasChanges: true }));
      return true;
    } catch (error) {
      console.error('💥 µ1_removeItem (WASM) failed:', error);
      return false;
    }
  }, []);

  // Filter by Bagua
  const µ1_getItemsByBagua = useCallback((baguaDescriptor: number): UDItem[] => {
    return documentState.items.filter(item => (item.bagua_descriptor & baguaDescriptor) === baguaDescriptor);
  }, [documentState.items]);

  const µ1_markAsSaved = useCallback(() => {
    setDocumentState(prev => ({ ...prev, hasChanges: false, lastSaved: Date.now() }));
  }, []);

  const µ1_documentMetadata = useMemo(() => {
    const { document, items } = documentState;
    if (!document) return null;
    const safeItems = Array.isArray(items) ? items : [];
    const baguaStats = safeItems.reduce((stats: Record<number, number>, item) => {
      stats[item.bagua_descriptor] = (stats[item.bagua_descriptor] || 0) + 1;
      return stats;
    }, {});
    return {
      itemCount: safeItems.length,
      baguaStats,
      documentId: 'doc-' + Date.now(),
      createdAt: Date.now(),
      hasTransformations: safeItems.some(item => item.transformation_history.length > 0)
    };
  }, [documentState]);

  return {
    // State
    documentState,
    µ1_documentMetadata,

    // API
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
