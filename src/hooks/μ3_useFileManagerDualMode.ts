/**
 * μ3_useFileManagerDualMode - WASSER (☵) Procedures/Workflows
 * 
 * Advanced dual-mode file manager hook supporting both GUI and TUI interfaces
 * with Norton Commander inspiration and Tauri-ready architecture.
 * 
 * Features:
 * - Dual-pane Norton Commander layout
 * - GUI/TUI mode switching
 * - Advanced file operations with progress tracking
 * - Real-time file system watching
 * - Search and indexing capabilities
 * - Drag & drop support
 * - Bookmark and history management
 * - Integration with μ7_ContextMenu and μ6_AIContext
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { UDFormat } from '../core/UDFormat';
import { μ8_FileSystemAPI, μ8_PlatformCapabilities } from '../services/μ8_FileSystemAbstraction';
import type {
  μ3_FileManagerState,
  FileSystemItem,
  FileOperation,
  NavigationHistoryEntry,
  ClipboardData,
  // DragDropState, // TODO: Unused type declaration
  // FileFilter, // TODO: Unused type declaration
  // TUIConfiguration, // TODO: Unused type declaration
  NortonCommanderLayout,
  VirtualizationConfig,
  // FileManagerAction, // TODO: Unused type declaration
  SearchOptions
} from '../types/FileManagerTypes';

interface μ3_FileManagerOptions {
  initialPath?: string;
  mode?: 'gui' | 'tui' | 'dual';
  enableDualPane?: boolean;
  enableVirtualization?: boolean;
  virtualizationThreshold?: number;
  enableRealTimeWatch?: boolean;
  maxHistoryEntries?: number;
  maxRecentFiles?: number;
  onError?: (error: string) => void;
  onPathChange?: (path: string) => void;
  onSelectionChange?: (items: FileSystemItem[]) => void;
  contextMenuProvider?: any;
  aiContextManager?: any;
}

export const μ3_useFileManagerDualMode = (options: μ3_FileManagerOptions = {}) => {
  // Configuration with defaults
  const config = useMemo(() => ({
    initialPath: options.initialPath || '/home',
    mode: options.mode || 'gui',
    enableDualPane: options.enableDualPane ?? true,
    enableVirtualization: options.enableVirtualization ?? true,
    virtualizationThreshold: options.virtualizationThreshold || 1000,
    enableRealTimeWatch: options.enableRealTimeWatch ?? μ8_PlatformCapabilities.fileWatcher,
    maxHistoryEntries: options.maxHistoryEntries || 100,
    maxRecentFiles: options.maxRecentFiles || 20,
    ...options
  }), [options]);

  // Core State Management
  const [state, setState] = useState<μ3_FileManagerState>({
    // Navigation
    currentPath: config.initialPath,
    history: [],
    historyIndex: -1,
    bookmarks: [],
    recentFiles: [],
    
    // Content
    items: [],
    selectedItems: new Set(),
    clipboard: null,
    
    // View Configuration
    viewMode: 'list',
    sortBy: 'name',
    sortOrder: 'asc',
    showHidden: false,
    showSystem: false,
    
    // Search and Filter
    searchQuery: '',
    searchScope: 'current',
    filter: {},
    
    // Operations
    operations: [],
    dragDropState: {
      isDragging: false,
      draggedItems: [],
      dropTarget: null,
      dropEffect: 'none',
      ghostOffset: { x: 0, y: 0 },
      showDropIndicator: false
    },
    
    // UI State
    loading: false,
    error: null,
    previewItem: null,
    
    // Dual Mode Support
    mode: config.mode as 'gui' | 'tui',
    tuiConfig: {
      enabled: config.mode === 'tui' || config.mode === 'dual',
      theme: 'dark',
      keymap: 'default',
      showLineNumbers: false,
      showStatusBar: true,
      splitMode: config.enableDualPane ? 'dual' : 'single',
      panels: []
    }
  });

  // Norton Commander Dual-Pane State
  const [nortonLayout, setNortonLayout] = useState<NortonCommanderLayout>({
    leftPanel: {
      path: config.initialPath,
      active: true,
      items: [],
      selectedItems: new Set()
    },
    rightPanel: {
      path: config.initialPath,
      active: false,
      items: [],
      selectedItems: new Set()
    },
    activePanel: 'left',
    commandLine: {
      visible: false,
      content: '',
      history: []
    }
  });

  // Virtualization Configuration
  const [virtualizationConfig] = useState<VirtualizationConfig>({
    enabled: config.enableVirtualization,
    itemHeight: 24,
    overscan: 10,
    threshold: config.virtualizationThreshold
  });

  // Refs for performance and cleanup
  const operationIdRef = useRef(0);
  const watchersRef = useRef<Map<string, () => void>>(new Map());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Algebraic Transistor Utilities
  const μ3_shouldVirtualize = useCallback((itemCount: number): number => {
    return UDFormat.transistor(virtualizationConfig.enabled && itemCount > virtualizationConfig.threshold);
  }, [virtualizationConfig]);

  const μ3_canPerformOperation = useCallback((operation: string): number => {
    const platformSupport = μ8_PlatformCapabilities.nativeFileSystem;
    const hasSelection = state.selectedItems.size > 0;
    
    switch (operation) {
      case 'delete':
      case 'rename':
      case 'copy':
      case 'move':
        return UDFormat.transistor(hasSelection);
      case 'paste':
        return UDFormat.transistor(!!state.clipboard);
      case 'system-integration':
        return UDFormat.transistor(platformSupport);
      default:
        return 1;
    }
  }, [state.selectedItems.size, state.clipboard]);

  // File System Operations
  const loadDirectory = useCallback(async (path: string, panelId?: 'left' | 'right') => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const items = await μ8_FileSystemAPI.listDirectory(path, state.showHidden);
      
      if (config.enableDualPane && panelId) {
        // Update Norton Commander layout
        setNortonLayout(prev => ({
          ...prev,
          [panelId + 'Panel']: {
            ...(prev[panelId + 'Panel' as keyof NortonCommanderLayout] as { items: FileSystemItem[]; selectedItems: Set<string> }),
            items,
            selectedItems: new Set()
          }
        }));
      } else {
        // Update main state
        setState(prev => ({
          ...prev,
          items,
          selectedItems: new Set(),
          loading: false
        }));
      }

      // Set up file watcher if enabled
      if (config.enableRealTimeWatch && !watchersRef.current.has(path)) {
        try {
          const unwatch = await μ8_FileSystemAPI.watchDirectory(path, (changes) => {
            // Reload directory on changes
            loadDirectory(path, panelId);
          });
          watchersRef.current.set(path, unwatch);
        } catch (error) {
          console.warn('Failed to set up file watcher for:', path, error);
        }
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load directory';
      setState(prev => ({ ...prev, error: errorMessage, loading: false }));
      options.onError?.(errorMessage);
    }
  }, [state.showHidden, config.enableDualPane, config.enableRealTimeWatch, options]);

  // Navigation
  const navigateTo = useCallback(async (path: string, addToHistory = true, panelId?: 'left' | 'right') => {
    await loadDirectory(path, panelId);
    
    if (!panelId) {
      // Update main path and history
      setState(prev => {
        let newHistory = prev.history;
        let newHistoryIndex = prev.historyIndex;
        
        if (addToHistory) {
          const historyEntry: NavigationHistoryEntry = {
            path: prev.currentPath,
            timestamp: new Date(),
            scrollPosition: { x: 0, y: 0 },
            selectedItems: Array.from(prev.selectedItems),
            viewMode: prev.viewMode
          };
          
          newHistory = [...prev.history.slice(0, prev.historyIndex + 1), historyEntry]
            .slice(-config.maxHistoryEntries);
          newHistoryIndex = newHistory.length - 1;
        }
        
        return {
          ...prev,
          currentPath: path,
          history: newHistory,
          historyIndex: newHistoryIndex
        };
      });
      
      options.onPathChange?.(path);
    }
  }, [loadDirectory, config.maxHistoryEntries, options]);

  const goBack = useCallback(() => {
    if (state.historyIndex > 0) {
      const targetEntry = state.history[state.historyIndex - 1];
      setState(prev => ({
        ...prev,
        historyIndex: prev.historyIndex - 1
      }));
      navigateTo(targetEntry.path, false);
    }
  }, [state.history, state.historyIndex, navigateTo]);

  const goForward = useCallback(() => {
    if (state.historyIndex < state.history.length - 1) {
      const targetEntry = state.history[state.historyIndex + 1];
      setState(prev => ({
        ...prev,
        historyIndex: prev.historyIndex + 1
      }));
      navigateTo(targetEntry.path, false);
    }
  }, [state.history, state.historyIndex, navigateTo]);

  const goUp = useCallback(() => {
    const parentPath = state.currentPath.split('/').slice(0, -1).join('/') || '/';
    navigateTo(parentPath);
  }, [state.currentPath, navigateTo]);

  // Selection Management
  const selectItem = useCallback((itemId: string, multiSelect = false, panelId?: 'left' | 'right') => {
    if (config.enableDualPane && panelId) {
      setNortonLayout(prev => {
        const panel = prev[panelId + 'Panel' as keyof NortonCommanderLayout] as { items: FileSystemItem[]; selectedItems: Set<string> };
        const newSelection = new Set(multiSelect ? panel.selectedItems : []);
        
        if (newSelection.has(itemId)) {
          newSelection.delete(itemId);
        } else {
          newSelection.add(itemId);
        }
        
        return {
          ...prev,
          activePanel: panelId,
          [panelId + 'Panel']: {
            ...panel,
            selectedItems: newSelection
          }
        };
      });
    } else {
      setState(prev => {
        const newSelection = new Set(multiSelect ? prev.selectedItems : []);
        
        if (newSelection.has(itemId)) {
          newSelection.delete(itemId);
        } else {
          newSelection.add(itemId);
        }
        
        return { ...prev, selectedItems: newSelection };
      });
    }
    
    // Notify selection change
    const selectedItems = config.enableDualPane && panelId 
      ? nortonLayout[panelId + 'Panel'].items.filter((item: FileSystemItem) => 
          nortonLayout[panelId + 'Panel'].selectedItems.has(item.id))
      : state.items.filter((item: FileSystemItem) => state.selectedItems.has(item.id));
    
    options.onSelectionChange?.(selectedItems);
  }, [config.enableDualPane, nortonLayout, state.items, state.selectedItems, options]);

  const selectAll = useCallback((panelId?: 'left' | 'right') => {
    if (config.enableDualPane && panelId) {
      setNortonLayout(prev => ({
        ...prev,
        [panelId + 'Panel']: {
          ...prev[panelId + 'Panel'],
          selectedItems: new Set(prev[panelId + 'Panel'].items.map((item: FileSystemItem) => item.id))
        }
      }));
    } else {
      setState(prev => ({
        ...prev,
        selectedItems: new Set(prev.items.map(item => item.id))
      }));
    }
  }, [config.enableDualPane]);

  const clearSelection = useCallback((panelId?: 'left' | 'right') => {
    if (config.enableDualPane && panelId) {
      setNortonLayout(prev => ({
        ...prev,
        [panelId + 'Panel']: {
          ...prev[panelId + 'Panel'],
          selectedItems: new Set()
        }
      }));
    } else {
      setState(prev => ({ ...prev, selectedItems: new Set() }));
    }
  }, [config.enableDualPane]);

  // File Operations
  const createOperation = useCallback(async (
    type: FileOperation['type'],
    source: string[],
    destination?: string,
    newName?: string
  ): Promise<string> => {
    const operationId = `op_${++operationIdRef.current}`;
    
    const operation: FileOperation = {
      id: operationId,
      type,
      source,
      destination,
      newName,
      status: 'pending',
      progress: 0,
      metadata: {
        totalSize: 0,
        processedSize: 0,
        itemCount: source.length,
        processedItems: 0
      }
    };
    
    setState(prev => ({
      ...prev,
      operations: [...prev.operations, operation]
    }));
    
    return operationId;
  }, []);

  const executeFileOperation = useCallback(async (operationId: string) => {
    const operation = state.operations.find(op => op.id === operationId);
    if (!operation) return;
    
    try {
      setState(prev => ({
        ...prev,
        operations: prev.operations.map(op => 
          op.id === operationId ? { ...op, status: 'processing' } : op
        )
      }));
      
      // Execute based on operation type
      switch (operation.type) {
        case 'copy':
          for (let i = 0; i < operation.source.length; i++) {
            const sourcePath = operation.source[i];
            const destPath = operation.destination + '/' + sourcePath.split('/').pop();
            await μ8_FileSystemAPI.copyItem(sourcePath, destPath);
            
            // Update progress
            const progress = ((i + 1) / operation.source.length) * 100;
            setState(prev => ({
              ...prev,
              operations: prev.operations.map(op => 
                op.id === operationId ? { ...op, progress } : op
              )
            }));
          }
          break;
          
        case 'move':
          for (let i = 0; i < operation.source.length; i++) {
            const sourcePath = operation.source[i];
            const destPath = operation.destination + '/' + sourcePath.split('/').pop();
            await μ8_FileSystemAPI.moveItem(sourcePath, destPath);
            
            const progress = ((i + 1) / operation.source.length) * 100;
            setState(prev => ({
              ...prev,
              operations: prev.operations.map(op => 
                op.id === operationId ? { ...op, progress } : op
              )
            }));
          }
          break;
          
        case 'delete':
          for (let i = 0; i < operation.source.length; i++) {
            const sourcePath = operation.source[i];
            await μ8_FileSystemAPI.deleteItem(sourcePath);
            
            const progress = ((i + 1) / operation.source.length) * 100;
            setState(prev => ({
              ...prev,
              operations: prev.operations.map(op => 
                op.id === operationId ? { ...op, progress } : op
              )
            }));
          }
          break;
          
        case 'rename':
          if (operation.source.length === 1 && operation.newName) {
            const sourcePath = operation.source[0];
            const parentPath = sourcePath.split('/').slice(0, -1).join('/');
            const newPath = parentPath + '/' + operation.newName;
            await μ8_FileSystemAPI.renameItem(sourcePath, newPath);
          }
          break;
      }
      
      // Mark as completed
      setState(prev => ({
        ...prev,
        operations: prev.operations.map(op => 
          op.id === operationId ? { ...op, status: 'completed', progress: 100 } : op
        )
      }));
      
      // Refresh current directory
      await loadDirectory(state.currentPath);
      
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        operations: prev.operations.map(op => 
          op.id === operationId ? { 
            ...op, 
            status: 'failed', 
            error: error.message || 'Operation failed' 
          } : op
        )
      }));
    }
  }, [state.operations, state.currentPath, loadDirectory]);

  // Search and Filter
  const search = useCallback(async (query: string, options?: SearchOptions) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, searchQuery: '', filter: {} }));
      await loadDirectory(state.currentPath);
      return;
    }
    
    setState(prev => ({ ...prev, loading: true, searchQuery: query }));
    
    try {
      const searchResults = await μ8_FileSystemAPI.searchFiles(
        query, 
        state.currentPath, 
        ({
          recursive: state.searchScope === 'recursive',
          includeHidden: state.showHidden,
          includeSystem: state.showSystem,
          fileTypes: options?.fileTypes || [],
          maxResults: 1000,
          sortBy: 'relevance',
          ...options
        } as SearchOptions)
      );
      
      setState(prev => ({
        ...prev,
        items: searchResults,
        loading: false
      }));
      
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Search failed',
        loading: false
      }));
    }
  }, [state.currentPath, state.searchScope, state.showHidden, state.showSystem, loadDirectory]);

  // Clipboard Operations
  const copyToClipboard = useCallback(async (items: FileSystemItem[], operation: 'copy' | 'cut' = 'copy') => {
    const clipboardData: ClipboardData = {
      operation,
      items,
      timestamp: new Date(),
      source_path: state.currentPath
    };
    
    setState(prev => ({ ...prev, clipboard: clipboardData }));
    
    // Integrate with system clipboard if available
    if (μ8_PlatformCapabilities.systemIntegration) {
      try {
        // Future Tauri implementation would copy file paths to system clipboard
        const filePaths = items.map(item => item.path).join('\n');
        await navigator.clipboard.writeText(filePaths);
      } catch (error) {
        console.warn('Failed to copy to system clipboard:', error);
      }
    }
  }, [state.currentPath]);

  const pasteFromClipboard = useCallback(async (destinationPath: string) => {
    if (!state.clipboard) return;
    
    const operationId = await createOperation(
      state.clipboard.operation === 'cut' ? 'move' : 'copy',
      state.clipboard.items.map(item => item.path),
      destinationPath
    );
    
    await executeFileOperation(operationId);
    
    // Clear clipboard if it was a cut operation
    if (state.clipboard.operation === 'cut') {
      setState(prev => ({ ...prev, clipboard: null }));
    }
  }, [state.clipboard, createOperation, executeFileOperation]);

  // Mode Switching
  const switchMode = useCallback((newMode: 'gui' | 'tui') => {
    setState(prev => ({
      ...prev,
      mode: newMode,
      tuiConfig: {
        ...prev.tuiConfig,
        enabled: newMode === 'tui'
      }
    }) as μ3_FileManagerState);
  }, []);

  // Panel Management (Norton Commander)
  const switchActivePanel = useCallback(() => {
    setNortonLayout(prev => ({
      ...prev,
      activePanel: prev.activePanel === 'left' ? 'right' : 'left'
    }));
  }, []);

  const syncPanels = useCallback(() => {
    const inactivePanel = nortonLayout.activePanel === 'left' ? 'right' : 'left';
    const activePath = nortonLayout[nortonLayout.activePanel + 'Panel'].path;
    navigateTo(activePath, true, inactivePanel);
  }, [nortonLayout, navigateTo]);

  // Cleanup watchers on unmount
  useEffect(() => {
    return () => {
      watchersRef.current.forEach(unwatch => unwatch());
      watchersRef.current.clear();
    };
  }, []);

  // Initialize
  useEffect(() => {
    loadDirectory(config.initialPath);
  }, []);

  // Computed properties
  const filteredAndSortedItems = useMemo(() => {
    let items = state.items;
    
    // Apply filters
    if (state.filter.type) {
      items = items.filter((item: FileSystemItem) => 
        state.filter.type!.includes(item.type as 'file' | 'directory')
      );
    }
    
    if (state.filter.extensions) {
      items = items.filter(item => 
        item.extension && state.filter.extensions!.includes(item.extension)
      );
    }
    
    // Apply search
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Sort items
    items.sort((a, b) => {
      let comparison = 0;
      
      switch (state.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'modified':
          comparison = a.modified.getTime() - b.modified.getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'extension':
          comparison = (a.extension || '').localeCompare(b.extension || '');
          break;
      }
      
      return state.sortOrder === 'desc' ? -comparison : comparison;
    });
    
    // Directories first
    return items.sort((a, b) => {
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;
      return 0;
    });
  }, [state.items, state.filter, state.searchQuery, state.sortBy, state.sortOrder]);

  return {
    // Core State
    ...state,
    filteredAndSortedItems,
    
    // Norton Commander Layout
    nortonLayout,
    setNortonLayout,
    
    // Navigation
    navigateTo,
    goBack,
    goForward,
    goUp,
    canGoBack: state.historyIndex > 0,
    canGoForward: state.historyIndex < state.history.length - 1,
    
    // Selection
    selectItem,
    selectAll,
    clearSelection,
    selectedItems: Array.from(state.selectedItems),
    
    // File Operations
    createOperation,
    executeFileOperation,
    copyToClipboard,
    pasteFromClipboard,
    
    // Search
    search,
    
    // Mode Management
    switchMode,
    switchActivePanel,
    syncPanels,
    
    // Virtualization
    shouldVirtualize: μ3_shouldVirtualize(filteredAndSortedItems.length),
    virtualizationConfig,
    
    // Platform Capabilities
    platformCapabilities: μ8_PlatformCapabilities,
    canPerformOperation: μ3_canPerformOperation,
    
    // Utilities
    formatFileSize: (bytes: number) => {
      const units = ['B', 'KB', 'MB', 'GB', 'TB'];
      let size = bytes;
      let unitIndex = 0;
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      
      return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
    }
  };
};