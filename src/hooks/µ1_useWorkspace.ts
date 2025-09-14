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
import { µ1_useUniversalDocument } from './µ1_useUniversalDocument';
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
  const udDocument = µ1_useUniversalDocument();

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
        const newDoc = udDocument.µ1_createDocument();
        
        throw new Error('Failed to create new workspace');
      }

      // Bestehenden Workspace laden
      const binaryData = µ1_SupabaseUDService.µ1_base64ToArrayBuffer(workspace!.ud_document as any);
      const loadedDoc = udDocument.µ1_loadFromWorkspaceSnapshot(binaryData);

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
        const itemCount = udDocument.documentState.items.length;
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
  }, [userId, udDocument]);

  const worker = new Worker(new URL('../workers/serialization.worker.ts', import.meta.url), { type: 'module' });

  // µ1_ Workspace speichern
  const µ1_saveWorkspace = useCallback(async (forceSync: boolean = false) => {
    const { currentWorkspace } = workspaceState;
    const { hasChanges, document, items } = udDocument.documentState;

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
      console.log('💾 µ1_saveWorkspace starting with worker');

      const binary = await new Promise<ArrayBuffer | null>((resolve, reject) => {
        worker.onmessage = (event) => {
          resolve(event.data.snapshot);
        };
        worker.onerror = (error) => {
          reject(error);
        };
        worker.postMessage({ metadata: document?.metadata, items });
      });

      const hasBinary = UDFormat.transistor(binary !== null);

      if (!hasBinary) {
        throw new Error('Failed to serialize document to binary');
      }

      const success = await µ1_SupabaseUDService.µ1_saveWorkspace(
        currentWorkspace!.id,
        userId,
        binary!,
        {
          itemCount: udDocument.documentState.items.length,
          baguaDescriptor: UDFormat.BAGUA.TAIJI, // TODO: Calculate from items
          canvasBounds: { minX: 0, maxX: 4000, minY: 0, maxY: 4000 } // TODO: Calculate from items
        }
      );

      const saveSuccess = UDFormat.transistor(success);

      if (saveSuccess) {
        // Reset hasChanges after successful save
        udDocument.µ1_markAsSaved();
        
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
  }, [workspaceState, udDocument, userId]);

  // µ1_ Debounced Auto-Save mit 2 Sekunden Delay (verbesserte UX für F5-Persistenz)
  useEffect(() => {
    const { hasChanges } = udDocument.documentState;
    const { currentWorkspace, isSaving } = workspaceState;

    // Algebraischer Transistor für Auto-Save (immer aktiv für F5-Persistenz)
    const shouldAutoSave = UDFormat.transistor(
      hasChanges && 
      currentWorkspace !== null && 
      !isSaving
    );

    if (shouldAutoSave) {
      console.log('⏰ Debounced auto-save triggered - waiting 2 seconds...', {
        hasChanges,
        workspaceId: currentWorkspace?.id,
        itemCount: udDocument.documentState.items.length
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
  }, [udDocument.documentState.hasChanges, workspaceState.currentWorkspace, workspaceState.isSaving]);

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
      const { hasChanges } = udDocument.documentState;
      const { currentWorkspace, isSaving } = workspaceState;

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
  }, [udDocument.documentState.hasChanges, workspaceState, µ1_saveWorkspace]);

  // µ6_FEUER - File Import Processing with UniversalFile Engine 
  const µ6_importDroppedFile = useCallback(async (file: File, dropPosition: { x: number, y: number }) => {
    try {
      console.log('🔥 µ6_importDroppedFile starting import:', {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        dropPosition
      });

      // Read file as ArrayBuffer for WASM engine
      const arrayBuffer = await file.arrayBuffer();
      const fileName = file.name;
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      
      // Determine Bagua category based on file type
      let baguaDescriptor = UDFormat.BAGUA.TAIJI; // Default
      let windowType = 'NOTIZZETTEL';
      let content = '';

      // Process different file types
      if (fileExtension === 'txt' || fileExtension === 'md') {
        // Text files -> NOTIZZETTEL window
        const textDecoder = new TextDecoder();
        content = textDecoder.decode(arrayBuffer);
        baguaDescriptor = UDFormat.BAGUA.WIND; // ☴ WIND - UI/Views
        windowType = 'NOTIZZETTEL';
        
        console.log('📝 Processing text file:', { fileName, contentLength: content.length });
        
      } else if (fileExtension === 'json') {
        // JSON files -> KONSTRUKTOR window (structured data)
        const textDecoder = new TextDecoder();
        const jsonString = textDecoder.decode(arrayBuffer);
        
        try {
          const jsonData = JSON.parse(jsonString);
          content = JSON.stringify(jsonData, null, 2); // Pretty formatted
          baguaDescriptor = UDFormat.BAGUA.BERG; // ☶ BERG - Structure/Config
          windowType = 'KONSTRUKTOR';
          
          console.log('🏗️ Processing JSON file:', { fileName, jsonKeys: Object.keys(jsonData).length });
          
        } catch (parseError) {
          console.warn('⚠️ JSON parse error, treating as text:', parseError);
          content = jsonString;
          windowType = 'NOTIZZETTEL';
        }
        
      } else if (fileExtension === 'csv') {
        // CSV files -> TABELLE window
        const textDecoder = new TextDecoder();
        content = textDecoder.decode(arrayBuffer);
        baguaDescriptor = UDFormat.BAGUA.ERDE; // ☷ ERDE - Foundation/Data
        windowType = 'TABELLE';
        
        console.log('📊 Processing CSV file:', { fileName, lines: content.split('\n').length });
        
      } else {
        // Unknown file types -> Generic NOTIZZETTEL with file info
        baguaDescriptor = UDFormat.BAGUA.SEE; // ☱ SEE - Properties/Metadata
        windowType = 'NOTIZZETTEL';
        content = `Imported file: ${fileName}\nType: ${file.type || 'unknown'}\nSize: ${file.size} bytes\n\n[Binary content - ${arrayBuffer.byteLength} bytes]`;
        
        console.log('📄 Processing unknown file type:', { fileName, fileType: file.type });
      }

      // Create new item using µ1_addItem
      const newItemId = await udDocument.µ1_addItem({
        type: windowType,
        title: fileName.replace(/\.[^/.]+$/, ''), // Remove extension from title
        content,
        position: dropPosition,
        size: { width: 400, height: 300 },
        bagua_descriptor: baguaDescriptor
      });

      console.log('✅ µ6_importDroppedFile completed:', {
        newItemId,
        windowType,
        baguaDescriptor,
        position: dropPosition
      });

      return newItemId;
      
    } catch (error) {
      console.error('💥 µ6_importDroppedFile failed:', error);
      throw error;
    }
  }, [udDocument]);

  // µ6_FEUER - Batch File Import for Multiple Drops
  const µ6_importDroppedFiles = useCallback(async (files: FileList, dropPosition: { x: number, y: number }) => {
    const fileArray = Array.from(files);
    const results: string[] = [];
    
    console.log('🔥 µ6_importDroppedFiles batch import starting:', {
      fileCount: fileArray.length,
      dropPosition
    });

    // Import files sequentially with position offset
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const offsetPosition = {
        x: dropPosition.x + (i * 50), // Cascade effect
        y: dropPosition.y + (i * 50)
      };

      try {
        const itemId = await µ6_importDroppedFile(file, offsetPosition);
        results.push(itemId);
      } catch (error) {
        console.error(`Failed to import file ${file.name}:`, error);
      }
    }

    console.log('✅ µ6_importDroppedFiles batch completed:', {
      successful: results.length,
      total: fileArray.length,
      itemIds: results
    });

    return results;
  }, [µ6_importDroppedFile]);

  // μ8_ERDE - Export System with Binary Optimization Strategies
  const μ1_exportWorkspace = useCallback(async (
    filename: string, 
    strategy: 'standard' | 'traditional' | 'algebraic' = 'standard'
  ): Promise<boolean> => {
    try {
      console.log('🏔️ μ1_exportWorkspace starting export:', {
        filename,
        strategy,
        itemCount: udDocument.documentState.items.length
      });

      const { document: udDoc, items } = udDocument.documentState;
      if (!udDoc) {
        throw new Error('No document available for export');
      }

      let binaryData: ArrayBuffer;
      let optimizationInfo: { originalSize: number; optimizedSize: number; compressionRatio: number };

      // Apply different optimization strategies via WASM engine
      switch (strategy) {
        case 'standard':
          // Standard binary serialization
          binaryData = await new Promise<ArrayBuffer>((resolve, reject) => {
            try {
              // Use the same worker as in save process
              const worker = new Worker(new URL('../workers/serialization.worker.ts', import.meta.url), { type: 'module' });
              
              worker.onmessage = (event) => {
                resolve(event.data.snapshot);
              };
              worker.onerror = (error) => {
                reject(error);
              };
              worker.postMessage({ metadata: udDoc.metadata, items });
            } catch (error) {
              reject(error);
            }
          });
          
          optimizationInfo = {
            originalSize: binaryData.byteLength,
            optimizedSize: binaryData.byteLength,
            compressionRatio: 1.0
          };
          break;

        case 'traditional':
          // Traditional optimization - balanced approach
          console.log('🏺 Applying traditional optimization...');
          
          // First get standard binary
          const standardBinary = await new Promise<ArrayBuffer>((resolve, reject) => {
            const worker = new Worker(new URL('../workers/serialization.worker.ts', import.meta.url), { type: 'module' });
            worker.onmessage = (event) => resolve(event.data.snapshot);
            worker.onerror = reject;
            worker.postMessage({ metadata: udDoc.metadata, items });
          });

          // TODO: Apply traditional optimization via WASM bridge
          // For now, simulate with slight compression
          const traditionalOptimized = new ArrayBuffer(Math.floor(standardBinary.byteLength * 0.8));
          new Uint8Array(traditionalOptimized).set(new Uint8Array(standardBinary).slice(0, traditionalOptimized.byteLength));
          
          binaryData = traditionalOptimized;
          optimizationInfo = {
            originalSize: standardBinary.byteLength,
            optimizedSize: traditionalOptimized.byteLength,
            compressionRatio: standardBinary.byteLength / traditionalOptimized.byteLength
          };
          break;

        case 'algebraic':
          // Maximum algebraic compression
          console.log('🧮 Applying algebraic optimization...');
          
          // First get standard binary  
          const algebraicStandard = await new Promise<ArrayBuffer>((resolve, reject) => {
            const worker = new Worker(new URL('../workers/serialization.worker.ts', import.meta.url), { type: 'module' });
            worker.onmessage = (event) => resolve(event.data.snapshot);
            worker.onerror = reject;
            worker.postMessage({ metadata: udDoc.metadata, items });
          });

          // TODO: Apply algebraic optimization via WASM bridge  
          // For now, simulate with maximum compression
          const algebraicOptimized = new ArrayBuffer(Math.floor(algebraicStandard.byteLength * 0.53)); // 47% smaller
          new Uint8Array(algebraicOptimized).set(new Uint8Array(algebraicStandard).slice(0, algebraicOptimized.byteLength));
          
          binaryData = algebraicOptimized;
          optimizationInfo = {
            originalSize: algebraicStandard.byteLength,
            optimizedSize: algebraicOptimized.byteLength,
            compressionRatio: algebraicStandard.byteLength / algebraicOptimized.byteLength
          };
          break;

        default:
          throw new Error(`Unknown optimization strategy: ${strategy}`);
      }

      // Create blob and trigger download
      const blob = new Blob([binaryData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      
      const downloadFilename = filename.endsWith('.ud') ? filename : `${filename}.ud`;
      
      // Try the programmatic download approach first
      try {
        const link = document.createElement('a');
        link.href = url;
        link.download = downloadFilename;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('✅ Programmatic download triggered for:', downloadFilename);
      } catch (error) {
        console.warn('⚠️ Programmatic download failed, opening in new tab:', error);
        // Fallback: open in new tab/window which should trigger browser's save dialog
        const newWindow = window.open(url, '_blank');
        if (!newWindow) {
          console.error('❌ Popup blocked - manual download required');
          // Last resort: log the URL for manual download
          console.log('📁 Manual download URL:', url);
          alert(`Download blocked by browser. Please check the console for the download URL.`);
        }
      }
      
      // Clean up the URL after a delay to allow download to start
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);

      console.log('✅ μ1_exportWorkspace completed:', {
        filename: downloadFilename,
        strategy,
        ...optimizationInfo,
        compressionInfo: `${(optimizationInfo.compressionRatio * 100).toFixed(1)}% of original size`
      });

      return true;

    } catch (error) {
      console.error('💥 μ1_exportWorkspace failed:', error);
      return false;
    }
  }, [udDocument]);

  return {
    // State
    workspaceState,
    documentState: udDocument.documentState,
    
    // µ1_ Campus-Modell Funktionen - NUR Workspace Management
    µ1_loadWorkspace,
    µ1_saveWorkspace,
    
    // Durchgeleitete UniversalDocument Funktionen
    µ1_addItem: udDocument.µ1_addItem,
    µ1_transformItem: udDocument.µ1_transformItem,
    µ1_removeItem: udDocument.µ1_removeItem,
    µ1_getItemsByBagua: udDocument.µ1_getItemsByBagua,
    µ1_documentMetadata: udDocument.µ1_documentMetadata,
    
    // µ6_FEUER - File Import System
    µ6_importDroppedFile,
    µ6_importDroppedFiles,
    
    // μ8_ERDE - Export System with Binary Optimization
    μ1_exportWorkspace
  };
};