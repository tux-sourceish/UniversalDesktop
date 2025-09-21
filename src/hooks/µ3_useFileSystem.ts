/**
 * µ3_useFileSystem - WASSER (☵) Procedures/Flow
 * 
 * Universal File System Abstraction Hook - Tauri-Ready Architecture
 * 
 * This hook provides a unified interface for file system operations that works:
 * - In browser with File System Access API fallback
 * - With Tauri native file system APIs
 * - With mock file system for development
 * 
 * Philosophy: The file system is like water - it flows through different environments
 * but maintains the same essential interface and behavior.
 */

import { useState, useCallback, useRef, useEffect, useReducer } from 'react';
import { UDFormat } from '../core/UDFormat';
import { µ3_FileManagerStateMachine, FileManagerStates, FileManagerEvents } from '../patterns/µX_StateManagement';

// File System Types
interface FileSystemItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink';
  size: number;
  modified: Date;
  created: Date;
  permissions: string;
  isHidden: boolean;
  extension?: string;
  mimeType?: string;
  metadata?: {
    description?: string;
    tags?: string[];
    icon?: string;
    baguaCategory?: keyof typeof UDFormat.BAGUA;
    baguaValue?: number;
    baguaSymbol?: string;
    baguaColor?: string;
    baguaDescription?: string;
  };
}

interface FileSystemCapabilities {
  canRead: boolean;
  canWrite: boolean;
  canExecute: boolean;
  canWatchChanges: boolean;
  hasNativeIntegration: boolean;
  supportsDragDrop: boolean;
  supportsSymlinks: boolean;
}

interface FileSystemState {
  currentPath: string;
  items: FileSystemItem[];
  history: string[];
  historyIndex: number;
  machine: µ3_FileManagerStateMachine;
  error: string | null;
  capabilities: FileSystemCapabilities;
}

interface FileOperation {
  id: string;
  type: 'read' | 'write' | 'copy' | 'move' | 'delete' | 'mkdir' | 'rename';
  source: string;
  destination?: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

// Tauri API detection
const isTauri = () => typeof window !== 'undefined' && '__TAURI__' in window;

// File System Access API detection
const hasFileSystemAccess = () => 
  typeof window !== 'undefined' && 'showDirectoryPicker' in window;

export const µ3_useFileSystem = (initialPath: string = '/') => {
  const [state, setState] = useState<FileSystemState>({
    currentPath: initialPath,
    items: [],
    history: [initialPath],
    historyIndex: 0,
    machine: new µ3_FileManagerStateMachine(),
    error: null,
    capabilities: {
      canRead: true,
      canWrite: false,
      canExecute: false,
      canWatchChanges: false,
      hasNativeIntegration: isTauri(),
      supportsDragDrop: true,
      supportsSymlinks: isTauri()
    }
  });

  const [operations, setOperations] = useState<FileOperation[]>([]);
  const operationIdRef = useRef(0);
  const watcherRef = useRef<any>(null);

  // Initialize capabilities based on environment
  useEffect(() => {
    const detectCapabilities = async (): Promise<FileSystemCapabilities> => {
      if (isTauri()) {
        // Tauri environment - full native capabilities
        try {
          const { invoke } = (window as any).__TAURI__.tauri;
          
          return {
            canRead: true,
            canWrite: true,
            canExecute: true,
            canWatchChanges: true,
            hasNativeIntegration: true,
            supportsDragDrop: true,
            supportsSymlinks: true
          };
        } catch (error) {
          console.warn('🚨 Tauri APIs not available:', error);
        }
      }

      if (hasFileSystemAccess()) {
        // Browser with File System Access API
        return {
          canRead: true,
          canWrite: true,
          canExecute: false,
          canWatchChanges: false,
          hasNativeIntegration: false,
          supportsDragDrop: true,
          supportsSymlinks: false
        };
      }

      // Fallback to mock/limited capabilities
      return {
        canRead: true,
        canWrite: false,
        canExecute: false,
        canWatchChanges: false,
        hasNativeIntegration: false,
        supportsDragDrop: false,
        supportsSymlinks: false
      };
    };

    detectCapabilities().then(capabilities => {
      setState(prev => ({ ...prev, capabilities }));
    });
  }, []);

  // Mock file system for development and fallback
  const mockFileSystem = useCallback(async (path: string): Promise<FileSystemItem[]> => {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));

    const mockItems: FileSystemItem[] = [
      {
        id: 'mock-1',
        name: 'Documents',
        path: `${path}/Documents`,
        type: 'directory',
        size: 0,
        modified: new Date('2025-07-20'),
        created: new Date('2025-01-01'),
        permissions: 'drwxr-xr-x',
        isHidden: false,
        metadata: { 
          icon: '📁', 
          baguaCategory: 'BERG',
          baguaValue: UDFormat.BAGUA.BERG,
          baguaSymbol: '☶',
          baguaColor: '#8B4513',
          baguaDescription: 'Directory - Stillness & Waiting',
          description: 'User documents folder'
        }
      },
      {
        id: 'mock-2',
        name: 'workspace.ud',
        path: `${path}/workspace.ud`,
        type: 'file',
        size: 2048576,
        modified: new Date('2025-07-28'),
        created: new Date('2025-07-20'),
        permissions: '-rw-r--r--',
        isHidden: false,
        extension: 'ud',
        mimeType: 'application/x-universaldocument',
        metadata: {
          icon: '🌌',
          baguaCategory: 'HIMMEL',
          baguaValue: UDFormat.BAGUA.HIMMEL,
          baguaSymbol: '☰',
          baguaColor: '#FFD700',
          baguaDescription: 'UniversalDocument - Creative Foundation',
          description: 'UniversalDesktop workspace document',
          tags: ['workspace', 'spatial', 'desktop']
        }
      },
      {
        id: 'mock-3',
        name: 'project.json',
        path: `${path}/project.json`,
        type: 'file',
        size: 4096,
        modified: new Date('2025-07-25'),
        created: new Date('2025-07-15'),
        permissions: '-rw-r--r--',
        isHidden: false,
        extension: 'json',
        mimeType: 'application/json',
        metadata: (() => {
          const bagua = getBaguaClassification('project.json');
          return {
            icon: '⚙️',
            baguaCategory: bagua.category,
            baguaValue: bagua.value,
            baguaSymbol: bagua.symbol,
            baguaColor: bagua.color,
            baguaDescription: bagua.description,
            description: 'Project configuration',
            tags: ['config', 'project']
          };
        })()
      },
      {
        id: 'mock-4',
        name: '.hidden-config',
        path: `${path}/.hidden-config`,
        type: 'file',
        size: 512,
        modified: new Date('2025-07-01'),
        created: new Date('2025-07-01'),
        permissions: '-rw-------',
        isHidden: true,
        extension: 'config',
        metadata: (() => {
          const bagua = getBaguaClassification('.hidden-config');
          return {
            icon: '⚙️',
            baguaCategory: bagua.category,
            baguaValue: bagua.value,
            baguaSymbol: bagua.symbol,
            baguaColor: bagua.color,
            baguaDescription: bagua.description,
            description: 'Hidden configuration file'
          };
        })()
      },
      {
        id: 'mock-5',
        name: 'src',
        path: `${path}/src`,
        type: 'directory',
        size: 0,
        modified: new Date('2025-07-28'),
        created: new Date('2025-07-10'),
        permissions: 'drwxr-xr-x',
        isHidden: false,
        metadata: {
          icon: '📂',
          baguaCategory: 'BERG',
          baguaValue: UDFormat.BAGUA.BERG,
          baguaSymbol: '☶',
          baguaColor: '#8B4513',
          baguaDescription: 'Directory - Stillness & Waiting',
          description: 'Source code directory'
        }
      }
    ];

    return mockItems;
  }, []);

  // Tauri file system operations
  const tauriReadDirectory = useCallback(async (path: string): Promise<FileSystemItem[]> => {
    try {
      const { invoke } = (window as any).__TAURI__.tauri;
      const entries = await invoke('read_directory', { path });
      
      return entries.map((entry: any, index: number) => ({
        id: `tauri-${index}-${entry.name}`,
        name: entry.name,
        path: entry.path,
        type: entry.is_dir ? 'directory' : entry.is_symlink ? 'symlink' : 'file',
        size: entry.size || 0,
        modified: new Date(entry.modified || Date.now()),
        created: new Date(entry.created || Date.now()),
        permissions: entry.permissions || 'unknown',
        isHidden: entry.name.startsWith('.'),
        extension: entry.name.includes('.') ? entry.name.split('.').pop() : undefined,
        mimeType: entry.mime_type,
        metadata: entry.is_dir ? {
          baguaCategory: 'BERG',
          baguaValue: UDFormat.BAGUA.BERG,
          baguaSymbol: '☶',
          baguaColor: '#8B4513',
          baguaDescription: 'Directory - Stillness & Waiting',
          icon: '📁'
        } : (() => {
          const bagua = getBaguaClassification(entry.name);
          return {
            baguaCategory: bagua.category,
            baguaValue: bagua.value,
            baguaSymbol: bagua.symbol,
            baguaColor: bagua.color,
            baguaDescription: bagua.description,
            icon: getFileIcon(entry.name)
          };
        })()
      }));
    } catch (error) {
      console.error('🚨 Tauri readDirectory failed:', error);
      throw error;
    }
  }, []);

  // File System Access API operations
  const webReadDirectory = useCallback(async (dirHandle: any): Promise<FileSystemItem[]> => {
    const items: FileSystemItem[] = [];
    let index = 0;

    for await (const [name, handle] of dirHandle.entries()) {
      const isDirectory = handle.kind === 'directory';
      let size = 0;
      let modified = new Date();

      if (!isDirectory) {
        try {
          const file = await handle.getFile();
          size = file.size;
          modified = new Date(file.lastModified);
        } catch (error) {
          console.warn('Could not get file info:', error);
        }
      }

      items.push({
        id: `web-${index++}-${name}`,
        name,
        path: `${state.currentPath}/${name}`,
        type: isDirectory ? 'directory' : 'file',
        size,
        modified,
        created: modified, // Web API doesn't provide creation time
        permissions: 'unknown',
        isHidden: name.startsWith('.'),
        extension: !isDirectory && name.includes('.') ? name.split('.').pop() : undefined,
        metadata: isDirectory ? {
          baguaCategory: 'BERG',
          baguaValue: UDFormat.BAGUA.BERG,
          baguaSymbol: '☶',
          baguaColor: '#8B4513',
          baguaDescription: 'Directory - Stillness & Waiting',
          icon: '📁'
        } : (() => {
          const bagua = getBaguaClassification(name);
          return {
            baguaCategory: bagua.category,
            baguaValue: bagua.value,
            baguaSymbol: bagua.symbol,
            baguaColor: bagua.color,
            baguaDescription: bagua.description,
            icon: getFileIcon(name)
          };
        })()
      });
    }

    return items;
  }, [state.currentPath]);

  // Revolutionary Bagua File Classification System
  const getBaguaClassification = useCallback((fileName: string): {
    category: keyof typeof UDFormat.BAGUA;
    value: number;
    symbol: string;
    color: string;
    description: string;
  } => {
    const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : '';
    
    // BAGUA FILE CLASSIFICATION MAPPING
    const baguaMapping: Record<string, {
      category: keyof typeof UDFormat.BAGUA;
      symbol: string;
      color: string;
      description: string;
    }> = {
      // HIMMEL (☰) - Templates, configs
      'json': { category: 'HIMMEL', symbol: '☰', color: '#FFD700', description: 'Configuration - Creative Foundation' },
      'yaml': { category: 'HIMMEL', symbol: '☰', color: '#FFD700', description: 'Configuration - Creative Foundation' },
      'yml': { category: 'HIMMEL', symbol: '☰', color: '#FFD700', description: 'Configuration - Creative Foundation' },
      'toml': { category: 'HIMMEL', symbol: '☰', color: '#FFD700', description: 'Configuration - Creative Foundation' },
      'env': { category: 'HIMMEL', symbol: '☰', color: '#FFD700', description: 'Environment - Creative Foundation' },
      'config': { category: 'HIMMEL', symbol: '☰', color: '#FFD700', description: 'Configuration - Creative Foundation' },
      'ud': { category: 'HIMMEL', symbol: '☰', color: '#FFD700', description: 'UniversalDocument - Creative Foundation' },
      
      // WIND (☴) - UI files, images
      'tsx': { category: 'WIND', symbol: '☴', color: '#87CEEB', description: 'React UI - Gentle Penetration' },
      'jsx': { category: 'WIND', symbol: '☴', color: '#87CEEB', description: 'React UI - Gentle Penetration' },
      'css': { category: 'WIND', symbol: '☴', color: '#87CEEB', description: 'Styles - Gentle Penetration' },
      'scss': { category: 'WIND', symbol: '☴', color: '#87CEEB', description: 'Styles - Gentle Penetration' },
      'less': { category: 'WIND', symbol: '☴', color: '#87CEEB', description: 'Styles - Gentle Penetration' },
      'png': { category: 'WIND', symbol: '☴', color: '#87CEEB', description: 'Image - Gentle Penetration' },
      'jpg': { category: 'WIND', symbol: '☴', color: '#87CEEB', description: 'Image - Gentle Penetration' },
      'jpeg': { category: 'WIND', symbol: '☴', color: '#87CEEB', description: 'Image - Gentle Penetration' },
      'gif': { category: 'WIND', symbol: '☴', color: '#87CEEB', description: 'Image - Gentle Penetration' },
      'svg': { category: 'WIND', symbol: '☴', color: '#87CEEB', description: 'Vector - Gentle Penetration' },
      'webp': { category: 'WIND', symbol: '☴', color: '#87CEEB', description: 'Image - Gentle Penetration' },
      
      // WASSER (☵) - Data files, logs
      'csv': { category: 'WASSER', symbol: '☵', color: '#4682B4', description: 'Data - Flowing Adaptation' },
      'log': { category: 'WASSER', symbol: '☵', color: '#4682B4', description: 'Logs - Flowing Adaptation' },
      'db': { category: 'WASSER', symbol: '☵', color: '#4682B4', description: 'Database - Flowing Adaptation' },
      'sqlite': { category: 'WASSER', symbol: '☵', color: '#4682B4', description: 'Database - Flowing Adaptation' },
      'sql': { category: 'WASSER', symbol: '☵', color: '#4682B4', description: 'Database - Flowing Adaptation' },
      'xml': { category: 'WASSER', symbol: '☵', color: '#4682B4', description: 'Data - Flowing Adaptation' },
      
      // BERG (☶) - Documentation
      'md': { category: 'BERG', symbol: '☶', color: '#8B4513', description: 'Documentation - Stillness & Waiting' },
      'txt': { category: 'BERG', symbol: '☶', color: '#8B4513', description: 'Text - Stillness & Waiting' },
      'pdf': { category: 'BERG', symbol: '☶', color: '#8B4513', description: 'Document - Stillness & Waiting' },
      'doc': { category: 'BERG', symbol: '☶', color: '#8B4513', description: 'Document - Stillness & Waiting' },
      'docx': { category: 'BERG', symbol: '☶', color: '#8B4513', description: 'Document - Stillness & Waiting' },
      'rtf': { category: 'BERG', symbol: '☶', color: '#8B4513', description: 'Document - Stillness & Waiting' },
      
      // SEE (☱) - Media files
      'mp4': { category: 'SEE', symbol: '☱', color: '#20B2AA', description: 'Video - Joyful Expression' },
      'avi': { category: 'SEE', symbol: '☱', color: '#20B2AA', description: 'Video - Joyful Expression' },
      'mkv': { category: 'SEE', symbol: '☱', color: '#20B2AA', description: 'Video - Joyful Expression' },
      'mov': { category: 'SEE', symbol: '☱', color: '#20B2AA', description: 'Video - Joyful Expression' },
      'mp3': { category: 'SEE', symbol: '☱', color: '#20B2AA', description: 'Audio - Joyful Expression' },
      'wav': { category: 'SEE', symbol: '☱', color: '#20B2AA', description: 'Audio - Joyful Expression' },
      'flac': { category: 'SEE', symbol: '☱', color: '#20B2AA', description: 'Audio - Joyful Expression' },
      'ogg': { category: 'SEE', symbol: '☱', color: '#20B2AA', description: 'Audio - Joyful Expression' },
      
      // FEUER (☲) - Code files
      'js': { category: 'FEUER', symbol: '☲', color: '#FF6347', description: 'Code - Brightness & Clarity' },
      'ts': { category: 'FEUER', symbol: '☲', color: '#FF6347', description: 'Code - Brightness & Clarity' },
      'py': { category: 'FEUER', symbol: '☲', color: '#FF6347', description: 'Code - Brightness & Clarity' },
      'rs': { category: 'FEUER', symbol: '☲', color: '#FF6347', description: 'Code - Brightness & Clarity' },
      'go': { category: 'FEUER', symbol: '☲', color: '#FF6347', description: 'Code - Brightness & Clarity' },
      'java': { category: 'FEUER', symbol: '☲', color: '#FF6347', description: 'Code - Brightness & Clarity' },
      'cpp': { category: 'FEUER', symbol: '☲', color: '#FF6347', description: 'Code - Brightness & Clarity' },
      'c': { category: 'FEUER', symbol: '☲', color: '#FF6347', description: 'Code - Brightness & Clarity' },
      'php': { category: 'FEUER', symbol: '☲', color: '#FF6347', description: 'Code - Brightness & Clarity' },
      'rb': { category: 'FEUER', symbol: '☲', color: '#FF6347', description: 'Code - Brightness & Clarity' },
      'html': { category: 'FEUER', symbol: '☲', color: '#FF6347', description: 'Code - Brightness & Clarity' },
      
      // DONNER (☳) - System files
      'exe': { category: 'DONNER', symbol: '☳', color: '#9932CC', description: 'Executable - Shocking Movement' },
      'bin': { category: 'DONNER', symbol: '☳', color: '#9932CC', description: 'Binary - Shocking Movement' },
      'so': { category: 'DONNER', symbol: '☳', color: '#9932CC', description: 'Library - Shocking Movement' },
      'dll': { category: 'DONNER', symbol: '☳', color: '#9932CC', description: 'Library - Shocking Movement' },
      'dylib': { category: 'DONNER', symbol: '☳', color: '#9932CC', description: 'Library - Shocking Movement' },
      'app': { category: 'DONNER', symbol: '☳', color: '#9932CC', description: 'Application - Shocking Movement' },
      'sh': { category: 'DONNER', symbol: '☳', color: '#9932CC', description: 'Script - Shocking Movement' },
      'bat': { category: 'DONNER', symbol: '☳', color: '#9932CC', description: 'Script - Shocking Movement' },
      
      // ERDE (☷) - Archives, packages
      'zip': { category: 'ERDE', symbol: '☷', color: '#696969', description: 'Archive - Receptive Nurturing' },
      'tar': { category: 'ERDE', symbol: '☷', color: '#696969', description: 'Archive - Receptive Nurturing' },
      'gz': { category: 'ERDE', symbol: '☷', color: '#696969', description: 'Archive - Receptive Nurturing' },
      'rar': { category: 'ERDE', symbol: '☷', color: '#696969', description: 'Archive - Receptive Nurturing' },
      '7z': { category: 'ERDE', symbol: '☷', color: '#696969', description: 'Archive - Receptive Nurturing' },
      'pkg': { category: 'ERDE', symbol: '☷', color: '#696969', description: 'Package - Receptive Nurturing' },
      'deb': { category: 'ERDE', symbol: '☷', color: '#696969', description: 'Package - Receptive Nurturing' },
      'rpm': { category: 'ERDE', symbol: '☷', color: '#696969', description: 'Package - Receptive Nurturing' },
      'dmg': { category: 'ERDE', symbol: '☷', color: '#696969', description: 'Package - Receptive Nurturing' },
    };
    
    const classification = baguaMapping[extension || ''] || {
      category: 'ERDE' as keyof typeof UDFormat.BAGUA,
      symbol: '☷',
      color: '#696969',
      description: 'Unknown - Receptive Nurturing'
    };
    
    return {
      ...classification,
      value: UDFormat.BAGUA[classification.category]
    };
  }, []);

  // Get file icon based on Bagua classification
  const getFileIcon = useCallback((fileName: string): string => {
    const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : '';
    
    const iconMap: Record<string, string> = {
      'ud': '🌌',
      'json': '⚙️',
      'js': '🔥',
      'ts': '🔥',
      'tsx': '💨',
      'jsx': '💨',
      'css': '💨',
      'html': '🔥',
      'md': '⛰️',
      'txt': '⛰️',
      'pdf': '⛰️',
      'jpg': '💨',
      'jpeg': '💨',
      'png': '💨',
      'gif': '💨',
      'svg': '💨',
      'mp4': '🌊',
      'mp3': '🌊',
      'wav': '🌊',
      'zip': '🌍',
      'tar': '🌍',
      'gz': '🌍',
      'py': '🔥',
      'rs': '🔥',
      'go': '🔥',
      'cpp': '🔥',
      'c': '🔥',
      'exe': '⚡',
      'bin': '⚡',
      'so': '⚡',
      'dll': '⚡'
    };

    return iconMap[extension || ''] || '📄';
  }, []);

  // Navigation operations
  const navigateTo = useCallback(async (path: string, addToHistory = true) => {
    state.machine.transition('load_directory');
    setState(prev => ({ ...prev, error: null }));

    try {
      let items: FileSystemItem[];

      if (state.capabilities.hasNativeIntegration) {
        items = await tauriReadDirectory(path);
      } else if (hasFileSystemAccess() && path === '/') {
        // Use File System Access API for root directory
        const dirHandle = await (window as any).showDirectoryPicker();
        items = await webReadDirectory(dirHandle);
      } else {
        // Fallback to mock file system
        items = await mockFileSystem(path);
      }

      state.machine.transition('load_directory');

      setState(prev => {
        let newHistory = prev.history;
        let newHistoryIndex = prev.historyIndex;

        if (addToHistory) {
          newHistory = [...prev.history.slice(0, prev.historyIndex + 1), path];
          newHistoryIndex = newHistory.length - 1;
        }

        return {
          ...prev,
          currentPath: path,
          items,
          history: newHistory,
          historyIndex: newHistoryIndex,
        };
      });

    } catch (error: any) {
      state.machine.transition('error_occurred');
      setState(prev => ({
        ...prev,
        error: error.message || 'Failed to navigate to directory'
      }));
    }
  }, [state.capabilities.hasNativeIntegration, tauriReadDirectory, webReadDirectory, mockFileSystem, state.machine]);

  // History navigation
  const goBack = useCallback(() => {
    if (state.historyIndex > 0) {
      const targetIndex = state.historyIndex - 1;
      const targetPath = state.history[targetIndex];
      setState(prev => ({ ...prev, historyIndex: targetIndex }));
      navigateTo(targetPath, false);
    }
  }, [state.historyIndex, state.history, navigateTo]);

  const goForward = useCallback(() => {
    if (state.historyIndex < state.history.length - 1) {
      const targetIndex = state.historyIndex + 1;
      const targetPath = state.history[targetIndex];
      setState(prev => ({ ...prev, historyIndex: targetIndex }));
      navigateTo(targetPath, false);
    }
  }, [state.historyIndex, state.history, navigateTo]);

  const goUp = useCallback(() => {
    const parentPath = state.currentPath.split('/').slice(0, -1).join('/') || '/';
    navigateTo(parentPath);
  }, [state.currentPath, navigateTo]);

  // File operations
  const createOperation = useCallback((
    type: FileOperation['type'],
    source: string,
    destination?: string
  ): string => {
    const operationId = `op_${++operationIdRef.current}`;
    
    const operation: FileOperation = {
      id: operationId,
      type,
      source,
      destination,
      progress: 0,
      status: 'pending'
    };

    setOperations(prev => [...prev, operation]);
    return operationId;
  }, []);

  const readFile = useCallback(async (path: string): Promise<string> => {
    const operationId = createOperation('read', path);
    state.machine.transition('operation_start');
    
    try {
      setOperations(prev => prev.map(op => 
        op.id === operationId ? { ...op, status: 'processing' } : op
      ));

      let content: string;

      if (state.capabilities.hasNativeIntegration) {
        const { invoke } = (window as any).__TAURI__.tauri;
        content = await invoke('read_file', { path });
      } else {
        // Mock file reading
        await new Promise(resolve => setTimeout(resolve, 200));
        content = `Mock content for ${path}`;
      }

      setOperations(prev => prev.map(op => 
        op.id === operationId ? { ...op, status: 'completed', progress: 100 } : op
      ));

      state.machine.transition('operation_complete');
      return content;
    } catch (error: any) {
      setOperations(prev => prev.map(op => 
        op.id === operationId ? { ...op, status: 'failed', error: error.message } : op
      ));
      state.machine.transition('error_occurred');
      throw error;
    }
  }, [state.capabilities.hasNativeIntegration, createOperation, state.machine]);

  const writeFile = useCallback(async (path: string, content: string): Promise<void> => {
    if (!state.capabilities.canWrite) {
      throw new Error('Write operations not supported in current environment');
    }

    const operationId = createOperation('write', path);
    state.machine.transition('operation_start');
    
    try {
      setOperations(prev => prev.map(op => 
        op.id === operationId ? { ...op, status: 'processing' } : op
      ));

      if (state.capabilities.hasNativeIntegration) {
        const { invoke } = (window as any).__TAURI__.tauri;
        await invoke('write_file', { path, content });
      } else {
        // Mock file writing
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      setOperations(prev => prev.map(op => 
        op.id === operationId ? { ...op, status: 'completed', progress: 100 } : op
      ));

      // Refresh directory if writing to current path
      if (path.startsWith(state.currentPath)) {
        await navigateTo(state.currentPath, false);
      }
      state.machine.transition('operation_complete');
    } catch (error: any) {
      setOperations(prev => prev.map(op => 
        op.id === operationId ? { ...op, status: 'failed', error: error.message } : op
      ));
      state.machine.transition('error_occurred');
      throw error;
    }
  }, [state.capabilities.canWrite, state.capabilities.hasNativeIntegration, state.currentPath, createOperation, navigateTo, state.machine]);

  // Initialize with default path
  useEffect(() => {
    navigateTo(initialPath);
  }, []);

  // Cleanup operations
  useEffect(() => {
    const interval = setInterval(() => {
      setOperations(prev => prev.filter(op => 
        op.status === 'processing' || 
        (op.status === 'completed' && Date.now() - (op as any).completedAt < 5000)
      ));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    // State
    ...state,
    loading: state.machine.currentState === 'loading',
    operations,
    
    // Navigation
    navigateTo,
    goBack,
    goForward,
    goUp,
    canGoBack: state.historyIndex > 0,
    canGoForward: state.historyIndex < state.history.length - 1,
    
    // File operations
    readFile,
    writeFile,
    
    // Utilities
    getFileIcon,
    getBaguaClassification,
    isDirectory: (item: FileSystemItem) => item.type === 'directory',
    isFile: (item: FileSystemItem) => item.type === 'file',
    
    // Format utilities
    formatFileSize: (bytes: number) => {
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let size = bytes;
      let unitIndex = 0;
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      
      return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
    },
    
    formatDate: (date: Date) => {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    }
  };
};