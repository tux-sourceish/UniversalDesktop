/**
 * µ1_enhancedSupabaseUDService - Campus-Modell Service für .ud Document Storage
 * BAGUA: HIMMEL (☰) - Templates/Classes - "Strukturelle Grundlagen"
 * 
 * REGEL: NUR Supabase + .ud Document-Logik, NICHTS anderes!
 * Nutzt UDFormat.transistor für Bedingungen
 * 
 * @version 2.1.0-raimund-algebra
 */

import { enhancedSupabase } from './μ8_supabaseClient';
import { UDFormat } from '../core/UDFormat';

export interface µ1_Workspace {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  ud_document: ArrayBuffer;
  ud_version: string;
  bagua_descriptor: number;
  item_count: number;
  canvas_bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  document_hash: string;
  revision_number: number;
  created_at: string;
  updated_at: string;
  last_accessed_at: string;
  settings: {
    minimap: { enabled: boolean; position: string };
    bagua_colors: boolean;
    auto_save: boolean;
    context_zones: boolean;
  };
  is_active: boolean;
}

export interface µ1_WorkspaceMetadata {
  id: string;
  name: string;
  item_count: number;
  bagua_descriptor: number;
  bagua_symbol: string;
  last_accessed_at: string;
  document_hash: string;
}

/**
 * µ1_enhancedSupabaseUDService - Reine Supabase + .ud Document Funktionalität
 * Campus-Modell: Macht NUR eine Sache - .ud Document Persistence
 */
export class µ1_SupabaseUDService {

  // µ1_ Aktuellen Workspace für User laden
  static async µ1_getCurrentWorkspace(userId: string): Promise<µ1_Workspace | null> {
    try {
      // console.log('📥 µ1_getCurrentWorkspace loading for user:', userId);

      const { data, error } = await enhancedSupabase
        .from('workspaces')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_accessed_at', { ascending: false })
        .limit(1)
        .single();

      // Algebraischer Transistor für Error-Handling
      const hasError = UDFormat.transistor(error !== null);
      const hasData = UDFormat.transistor(data !== null);

      if (hasError) {
        console.error('💥 µ1_getCurrentWorkspace error:', error);
        return null;
      }

      if (!hasData) {
        // console.log('ℹ️ µ1_getCurrentWorkspace: No workspace found');
        return null;
      }

      // console.log('✅ µ1_getCurrentWorkspace loaded:', {
      //   id: data.id,
      //   name: data.name,
      //   itemCount: data.item_count
      // });

      return data as µ1_Workspace;
    } catch (error) {
      console.error('💥 µ1_getCurrentWorkspace exception:', error);
      return null;
    }
  }

  // µ1_ Workspace-Metadaten laden (ohne Binary-Document)
  static async µ1_getWorkspaceMetadata(userId: string): Promise<µ1_WorkspaceMetadata[]> {
    try {
      // console.log('📋 µ1_getWorkspaceMetadata loading for user:', userId);

      const { data, error } = await enhancedSupabase
        .from('workspace_metadata')  // View ohne Binary-Daten
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('last_accessed_at', { ascending: false });

      // Algebraischer Transistor für Error-Handling
      const hasError = UDFormat.transistor(error !== null);
      const hasData = UDFormat.transistor(data !== null && data.length > 0);

      if (hasError) {
        console.error('💥 µ1_getWorkspaceMetadata error:', error);
        return [];
      }

      if (!hasData) {
        // console.log('ℹ️ µ1_getWorkspaceMetadata: No workspaces found');
        return [];
      }

      // console.log(`✅ µ1_getWorkspaceMetadata loaded ${data!.length} workspaces`);
      return data as µ1_WorkspaceMetadata[];
    } catch (error) {
      console.error('💥 µ1_getWorkspaceMetadata exception:', error);
      return [];
    }
  }

  // µ1_ Workspace mit .ud Document speichern
  static async µ1_saveWorkspace(
    workspaceId: string,
    userId: string,
    udDocument: ArrayBuffer,
    metadata: {
      name?: string;
      itemCount?: number;
      baguaDescriptor?: number;
      canvasBounds?: { minX: number; maxX: number; minY: number; maxY: number };
    } = {}
  ): Promise<boolean> {
    try {
      // console.log('💾 µ1_saveWorkspace saving:', {
      //   workspaceId,
      //   documentSize: udDocument.byteLength,
      //   itemCount: metadata.itemCount
      // });

      // Binary zu Base64 für Supabase
      const binaryArray = new Uint8Array(udDocument);
      const binaryString = Array.from(binaryArray, byte => String.fromCharCode(byte)).join('');
      const base64Document = btoa(binaryString);

      // Document Hash für Change Detection
      const hashBuffer = await crypto.subtle.digest('SHA-256', udDocument);
      const hashArray = new Uint8Array(hashBuffer);
      const documentHash = Array.from(hashArray, b => b.toString(16).padStart(2, '0')).join('');

      const updateData = {
        ud_document: base64Document,
        document_hash: documentHash,
        item_count: metadata.itemCount || 0,
        bagua_descriptor: metadata.baguaDescriptor || UDFormat.BAGUA.TAIJI,
        canvas_bounds: metadata.canvasBounds || { minX: 0, maxX: 4000, minY: 0, maxY: 4000 },
        last_accessed_at: new Date().toISOString(),
        ...(metadata.name && { name: metadata.name })
      };

      const updateResult = await enhancedSupabase
        .from('workspaces')
        .update(updateData)
        .eq('id', workspaceId);
      
      const { error } = updateResult;

      // Algebraischer Transistor für Success-Check
      const success = UDFormat.transistor(error === null);

      if (success) {
        // console.log('✅ µ1_saveWorkspace completed:', {
        //   workspaceId,
        //   documentHash: documentHash.substring(0, 8) + '...',
        //   itemCount: metadata.itemCount
        // });
      } else {
        console.error('💥 µ1_saveWorkspace error:', error);
      }

      return success === 1;
    } catch (error) {
      console.error('💥 µ1_saveWorkspace exception:', error);
      return false;
    }
  }

  // µ1_ Neuen Workspace erstellen
  static async µ1_createWorkspace(
    userId: string,
    name: string,
    udDocument: ArrayBuffer,
    description: string = ''
  ): Promise<string | null> {
    try {
      // console.log('🆕 µ1_createWorkspace creating:', { name, userId });

      // Binary zu Base64
      const binaryArray = new Uint8Array(udDocument);
      const binaryString = Array.from(binaryArray, byte => String.fromCharCode(byte)).join('');
      const base64Document = btoa(binaryString);

      // Document Hash
      const hashBuffer = await crypto.subtle.digest('SHA-256', udDocument);
      const hashArray = new Uint8Array(hashBuffer);
      const documentHash = Array.from(hashArray, b => b.toString(16).padStart(2, '0')).join('');

      const insertResult = await enhancedSupabase
        .from('workspaces')
        .insert({
          user_id: userId,
          name,
          description,
          ud_document: base64Document,
          ud_version: '2.1.0-raimund-algebra',
          bagua_descriptor: UDFormat.BAGUA.TAIJI,
          item_count: 0,
          document_hash: documentHash,
          settings: {
            minimap: { enabled: true, position: 'bottom-right' },
            bagua_colors: true,
            auto_save: true,
            context_zones: true
          }
        });
      
      const { data, error } = insertResult;

      // Algebraischer Transistor für Success-Check
      const success = UDFormat.transistor(error === null && data !== null);

      if (success) {
        // console.log('✅ µ1_createWorkspace completed:', {
        //   id: data.id,
        //   name
        // });
        return data.id;
      } else {
        console.error('💥 µ1_createWorkspace error:', error);
        return null;
      }
    } catch (error) {
      console.error('💥 µ1_createWorkspace exception:', error);
      return null;
    }
  }

  // µ1_ Base64 zu ArrayBuffer konvertieren
  static µ1_base64ToArrayBuffer(base64: string): ArrayBuffer {
    try {
      // console.log('🔄 µ1_base64ToArrayBuffer converting:', {
      //   base64Length: base64.length,
      //   base64Preview: base64.slice(0, 50) + '...'
      // });

      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // console.log('✅ µ1_base64ToArrayBuffer completed:', {
      //   inputBase64Length: base64.length,
      //   outputBufferSize: bytes.buffer.byteLength,
      //   firstBytes: Array.from(bytes.slice(0, 8)).map(b => b.toString(16).padStart(2, '0')).join(' ')
      // });
      
      return bytes.buffer;
    } catch (error) {
      console.error('💥 µ1_base64ToArrayBuffer failed:', error);
      throw error;
    }
  }

  // µ1_ Workspace Access Time aktualisieren
  static async µ1_updateAccessTime(workspaceId: string, userId: string): Promise<boolean> {
    try {
      const updateResult = await enhancedSupabase
        .from('workspaces')
        .update({ 
          last_accessed_at: new Date().toISOString() 
        })
        .eq('id', workspaceId);
      
      const { error } = updateResult;

      const success = UDFormat.transistor(error === null);
      return success === 1;
    } catch (error) {
      console.error('💥 µ1_updateAccessTime exception:', error);
      return false;
    }
  }
}