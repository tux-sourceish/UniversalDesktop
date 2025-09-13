/**
 * µ1_useWorkspace - Campus-Modell Hook für Workspace + UniversalDocument Integration
 * BAGUA: HIMMEL (☰) - Templates/Classes - "Strukturelle Grundlagen"
 * 
 * REGEL: NUR Workspace-Management, NICHTS anderes!
 * Kombiniert µ1_useUniversalDocument + µ1_supabaseUDService
 * 
 * @version 2.1.0-raimund-algebra
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { UDFormat } from '../core/UDFormat';
import { UniversalDocument } from '@tux-sourceish/universalfile';

import { µ1_SupabaseUDService, µ1_Workspace } from '../services/µ1_supabaseUDService';

export interface µ1_WorkspaceState {
  currentWorkspace: µ1_Workspace | null;
  isLoading: boolean;
  isSaving: boolean;
  lastSyncedAt: number | null;
  syncError: string | null;
}

/**
 * µ1_useWorkspace - Reine Workspace-Funktionalität
 * Campus-Modell: Macht NUR eine Sache - Workspace Management
 */
export const µ1_useWorkspace = (userId: string) => {
  const [workspaceState, setWorkspaceState] = useState<µ1_WorkspaceState>({
    currentWorkspace: null,
    isLoading: false,
    isSaving: false,
    lastSyncedAt: null,
    syncError: null
  });


  // Campus-Modell Hook Integration
  const [udDocument, setUdDocument] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);


  useEffect(() => {
    setUdDocument(new UniversalDocument());
  }, []);

  // µ1_ Workspace laden und .ud Document initialisieren
  const µ1_loadWorkspace = useCallback(async (workspaceId?: string) => {
    setWorkspaceState(prev => {
      // Prevent concurrent loads using existing state
      if (prev.isLoading) {
        console.log('⏸️ µ1_loadWorkspace already in progress, skipping');
        return prev;
      }
      return { ...prev, isLoading: true, syncError: null };
    });

    try {
      console.log('📥 µ1_loadWorkspace starting for user:', userId);

      // Workspace von Supabase laden
      const workspace = workspaceId 
        ? await µ1_SupabaseUDService.µ1_getCurrentWorkspace(userId)
        : await µ1_SupabaseUDService.µ1_getCurrentWorkspace(userId);

      // Algebraischer Transistor für Workspace-Check
      const hasWorkspace = UDFormat.transistor(workspace !== null);

      if (!hasWorkspace) {
        // Neuen Workspace erstellen wenn keiner existiert
        console.log('🆕 Creating new workspace for user');
        const newDoc = new UniversalDocument();
        setUdDocument(newDoc);
      }

      // Bestehenden Workspace laden
      console.log('Raw ud_document from Supabase:', workspace!.ud_document);
      const binaryData = µ1_SupabaseUDService.µ1_base64ToArrayBuffer(workspace!.ud_document as any);

      let loadedDoc;
      const dataView = new DataView(binaryData);
      const magic = dataView.getUint32(0, false);

      if (magic === UniversalDocument.MAGIC) {
        loadedDoc = UniversalDocument.fromBinary(binaryData);
      } else {
        const jsonString = new TextDecoder().decode(binaryData);
        const jsonData = JSON.parse(jsonString);
        loadedDoc = new UniversalDocument(jsonData.metadata);
        const defaultOrigin = { host: 'Unknown', path: 'Unknown', tool: 'Unknown' };
        jsonData.items.forEach((item: any) => loadedDoc.μ6_createItem(item, item.origin || defaultOrigin));
      }

      setUdDocument(loadedDoc);

      const documentLoaded = UDFormat.transistor(loadedDoc !== null);

      if (documentLoaded) {
        // Access Time aktualisieren
        await µ1_SupabaseUDService.µ1_updateAccessTime(workspace!.id, userId);

        setWorkspaceState({
          currentWorkspace: workspace,
          isLoading: false,
          isSaving: false,
          lastSyncedAt: Date.now(),
          syncError: null
        });

        // Check final item count
        const itemCount = loadedDoc.μ6_getAllItems().length;
        console.log(`✅ µ1_loadWorkspace completed: ${itemCount} items loaded`);

        return workspace;
      }

      throw new Error('Failed to load document from workspace');

    } catch (error) {
      console.error('💥 µ1_loadWorkspace failed:', error);
      
      setWorkspaceState(prev => ({
        ...prev,
        isLoading: false,
        syncError: error instanceof Error ? error.message : 'Unknown error'
      }));
      
      return null;
    }
  }, [userId, setUdDocument]);



  // µ1_ Workspace speichern
  const µ1_saveWorkspace = useCallback(async (forceSync: boolean = false) => {
    const { currentWorkspace } = workspaceState;
    // Algebraischer Transistor für Save-Bedingungen
    const shouldSave = UDFormat.transistor(
      currentWorkspace !== null && 
      (hasChanges || forceSync)
    );

    if (!shouldSave) {
      console.log('ℹ️ µ1_saveWorkspace: No changes to save');
      // Don't update lastSyncedAt if nothing was actually saved
      return true;
    }

    setWorkspaceState(prev => ({ ...prev, isSaving: true, syncError: null }));

    try {
      console.log('💾 µ1_saveWorkspace starting');

      const binary = udDocument.toBinary();

      const hasBinary = UDFormat.transistor(binary !== null);

      if (!hasBinary) {
        throw new Error('Failed to serialize document to binary');
      }

      const success = await µ1_SupabaseUDService.µ1_saveWorkspace(
        currentWorkspace!.id,
        userId,
        binary!,
        {
          itemCount: udDocument.μ6_getAllItems().length,
          baguaDescriptor: UDFormat.BAGUA.TAIJI, // TODO: Calculate from items
          canvasBounds: { minX: 0, maxX: 4000, minY: 0, maxY: 4000 } // TODO: Calculate from items
        }
      );

      const saveSuccess = UDFormat.transistor(success);

      if (saveSuccess) {
        setHasChanges(false);
        
        setWorkspaceState(prev => ({
          ...prev,
          isSaving: false,
          lastSyncedAt: Date.now(),
          syncError: null
        }));

        console.log('✅ µ1_saveWorkspace completed');
        return true;
      }

      throw new Error('Supabase save operation failed');

    } catch (error) {
      console.error('💥 µ1_saveWorkspace failed:', error);
      
      setWorkspaceState(prev => ({
        ...prev,
        isSaving: false,
        syncError: error instanceof Error ? error.message : 'Save failed'
      }));
      
      return false;
    }
  }, [workspaceState, hasChanges, setHasChanges, userId]);

  // µ1_ Debounced Auto-Save mit 2 Sekunden Delay (verbesserte UX für F5-Persistenz)
  useEffect(() => {
    const { currentWorkspace, isSaving } = workspaceState;

    // Algebraischer Transistor für Auto-Save (immer aktiv für F5-Persistenz)
    const shouldAutoSave = UDFormat.transistor(
      hasChanges &&
      currentWorkspace !== null && 
      !isSaving
    );

    if (shouldAutoSave) {
      console.log('⏰ Debounced auto-save triggered - waiting 2 seconds...', {
        workspaceId: currentWorkspace?.id,
        itemCount: udDocument ? udDocument.μ6_getAllItems().length : 0
      });
      
      const debouncedSaveTimer = setTimeout(async () => {
        console.log('💾 Executing debounced auto-save...');
        const success = await µ1_saveWorkspace(false);
        
        if (success) {
          console.log('✅ Auto-save completed successfully - F5-ready!');
        } else {
          console.error('❌ Auto-save failed - F5 persistence at risk');
        }
      }, 2000); // 2 Sekunden Delay für bessere UX

      return () => {
        console.log('🚫 Auto-save debounce cancelled (new changes detected)');
        clearTimeout(debouncedSaveTimer);
      };
    }
  }, [hasChanges, workspaceState.currentWorkspace, workspaceState.isSaving, µ1_saveWorkspace]);

  // µ1_ Workspace beim Mount laden
  useEffect(() => {
    // Algebraischer Transistor für Initial Load
    const shouldInitialLoad = UDFormat.transistor(
      userId.length > 0 && 
      workspaceState.currentWorkspace === null && 
      !workspaceState.isLoading
    );

    if (shouldInitialLoad) {
      console.log('🚀 Initial workspace load for user:', userId);
      µ1_loadWorkspace();
    }
  }, [userId, workspaceState.currentWorkspace, workspaceState.isLoading, µ1_loadWorkspace]);

  // µ1_ F5-Persistenz: Save on Page Unload (beforeunload)
  useEffect(() => {
    const handleBeforeUnload = async (event: BeforeUnloadEvent) => {
      if (hasChanges && currentWorkspace && !isSaving) {
        console.log('🔄 F5-Protection: Saving workspace before page unload...');
        
        // Force synchronous save for F5-protection
        try {
          await µ1_saveWorkspace(true);
          console.log('✅ F5-Protection: Workspace saved successfully');
        } catch (error) {
          console.error('❌ F5-Protection: Failed to save workspace:', error);
          // Show browser warning if save fails
          event.preventDefault();
          event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
          return event.returnValue;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasChanges, workspaceState, µ1_saveWorkspace]);

  const µ1_addItem = (itemData: any, origin: any) => {
    if (!udDocument) return;
    const newItem = udDocument.μ6_createItem(itemData, origin);
    setHasChanges(true);
    return newItem;
  };

  const µ1_transformItem = (itemId: any, transformation: any, changes: any) => {
    if (!udDocument) return;
    const updatedItem = udDocument.μ6_transformItem(itemId, transformation, changes);
    setHasChanges(true);
    return updatedItem;
  };

  const µ1_removeItem = (itemId: any, agent: any) => {
    if (!udDocument) return;
    const result = udDocument.μ6_deleteItem(itemId, agent);
    setHasChanges(true);
    return result;
  };

  const µ1_getItemsByBagua = (aspects: any) => {
    if (!udDocument) return [];
    return udDocument.μ6_queryByBagua(aspects);
  };

  const µ1_documentMetadata = () => {
    if (!udDocument) return null;
    return udDocument.metadata;
  };

  return {
    // State
    workspaceState,
    documentState: {
      items: udDocument ? udDocument.μ6_getAllItems() : [],
      hasChanges,
      document: udDocument,
    },
    
    // µ1_ Campus-Modell Funktionen - NUR Workspace Management
    µ1_loadWorkspace,
    µ1_saveWorkspace,
    
    // Durchgeleitete UniversalDocument Funktionen
    µ1_addItem,
    µ1_transformItem,
    µ1_removeItem,
    µ1_getItemsByBagua,
    µ1_documentMetadata
  };
};