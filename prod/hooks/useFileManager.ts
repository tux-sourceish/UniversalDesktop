import { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// File System Types
interface FileSystemItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory' | 'symlink' | 'mount';
  size: number;
  modified: Date;
  created: Date;
  accessed: Date;
  permissions: string;
  owner: string;
  group: string;
  isHidden: boolean;
  extension?: string;
  mimeType?: string;
  thumbnail?: string;
  metadata?: {
    description?: string;
    tags?: string[];
    rating?: number;
    isFavorite?: boolean;
    color?: string;
    icon?: string;
  };
}

interface FileManagerState {
  currentPath: string;
  items: FileSystemItem[];
  selectedItems: Set<string>;
  viewMode: 'list' | 'grid' | 'tree' | 'columns';
  sortBy: 'name' | 'size' | 'modified' | 'created' | 'type';
  sortOrder: 'asc' | 'desc';
  showHidden: boolean;
  searchQuery: string;
  filter: {
    type?: 'file' | 'directory';
    extension?: string[];
    sizeRange?: { min: number; max: number };
    dateRange?: { from: Date; to: Date };
  };
}

interface NavigationHistory {
  path: string;
  timestamp: Date;
  scrollPosition: number;
}

interface FileOperation {
  id: string;
  type: 'copy' | 'move' | 'delete' | 'rename' | 'create';
  source: string[];
  destination?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  error?: string;
}

interface DragDropState {
  isDragging: boolean;
  draggedItems: string[];
  dropTarget: string | null;
  dropEffect: 'copy' | 'move' | 'link' | 'none';
}

// Dolphin-inspired File Manager Hook
export const useFileManager = (
  initialPath: string = '/',
  onFileOpen?: (item: FileSystemItem) => void,
  onError?: (error: string) => void
) => {
  const [state, setState] = useState<FileManagerState>({
    currentPath: initialPath,
    items: [],
    selectedItems: new Set(),
    viewMode: 'list',
    sortBy: 'name',
    sortOrder: 'asc',
    showHidden: false,
    searchQuery: '',
    filter: {}
  });

  const [history, setHistory] = useState<NavigationHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [operations, setOperations] = useState<FileOperation[]>([]);
  const [dragDropState, setDragDropState] = useState<DragDropState>({
    isDragging: false,
    draggedItems: [],
    dropTarget: null,
    dropEffect: 'none'
  });

  const [bookmarks, setBookmarks] = useState<FileSystemItem[]>([]);
  const [recentFiles, setRecentFiles] = useState<FileSystemItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const operationIdRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Mock file system API (replace with actual FS API)
  const mockFileSystem = useCallback(async (path: string): Promise<FileSystemItem[]> => {
    // Simulate file system access
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const mockItems: FileSystemItem[] = [
      {
        id: '1',
        name: 'Documents',
        path: `${path}/Documents`,
        type: 'directory',
        size: 0,
        modified: new Date('2025-07-15'),
        created: new Date('2025-01-01'),
        accessed: new Date(),
        permissions: 'drwxr-xr-x',
        owner: 'user',
        group: 'users',
        isHidden: false,
        metadata: { icon: '📁', isFavorite: true }
      },
      {
        id: '2', 
        name: 'workspace.ud',
        path: `${path}/workspace.ud`,
        type: 'file',
        size: 2048576,
        modified: new Date('2025-07-17'),
        created: new Date('2025-07-17'),
        accessed: new Date(),
        permissions: '-rw-r--r--',
        owner: 'user',
        group: 'users',
        isHidden: false,
        extension: 'ud',
        mimeType: 'application/x-universaldocument',
        metadata: { 
          icon: '🌌', 
          description: 'UniversalDesktop workspace',
          tags: ['workspace', 'desktop', 'project'],
          rating: 5
        }
      },
      {
        id: '3',
        name: 'project.json',
        path: `${path}/project.json`,
        type: 'file',
        size: 4096,
        modified: new Date('2025-07-16'),
        created: new Date('2025-07-10'),
        accessed: new Date(),
        permissions: '-rw-r--r--',
        owner: 'user',
        group: 'users',
        isHidden: false,
        extension: 'json',
        mimeType: 'application/json',
        metadata: { icon: '📄', tags: ['config', 'project'] }
      },
      {
        id: '4',
        name: '.hidden-config',
        path: `${path}/.hidden-config`,
        type: 'file',
        size: 512,
        modified: new Date('2025-07-01'),
        created: new Date('2025-07-01'),
        accessed: new Date(),
        permissions: '-rw-------',
        owner: 'user',
        group: 'users',
        isHidden: true,
        extension: 'config',
        metadata: { icon: '⚙️' }
      }
    ];

    return mockItems;
  }, []);

  // Navigate to path
  const navigateTo = useCallback(async (path: string, addToHistory = true) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    try {
      const items = await mockFileSystem(path);

      setState(prev => ({
        ...prev,
        currentPath: path,
        items,
        selectedItems: new Set()
      }));

      if (addToHistory) {
        const newEntry: NavigationHistory = {
          path,
          timestamp: new Date(),
          scrollPosition: 0
        };

        setHistory(prev => {
          const newHistory = [...prev.slice(0, historyIndex + 1), newEntry];
          setHistoryIndex(newHistory.length - 1);
          return newHistory.slice(-50); // Keep last 50 entries
        });
      }

      if (import.meta.env.DEV) {
        console.log('📁 Navigated to:', { path, itemCount: items.length });
      }

    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load directory';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [mockFileSystem, historyIndex, onError]);

  // Navigation controls
  const goBack = useCallback(() => {
    if (historyIndex > 0) {
      const targetIndex = historyIndex - 1;
      const targetPath = history[targetIndex].path;
      setHistoryIndex(targetIndex);
      navigateTo(targetPath, false);
    }
  }, [history, historyIndex, navigateTo]);

  const goForward = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const targetIndex = historyIndex + 1;
      const targetPath = history[targetIndex].path;
      setHistoryIndex(targetIndex);
      navigateTo(targetPath, false);
    }
  }, [history, historyIndex, navigateTo]);

  const goUp = useCallback(() => {
    const parentPath = state.currentPath.split('/').slice(0, -1).join('/') || '/';
    navigateTo(parentPath);
  }, [state.currentPath, navigateTo]);

  const goHome = useCallback(() => {
    navigateTo('/home/user');
  }, [navigateTo]);

  // Selection management
  const selectItem = useCallback((itemId: string, multiSelect = false) => {
    setState(prev => {
      const newSelection = new Set(multiSelect ? prev.selectedItems : []);
      
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        newSelection.add(itemId);
      }

      return { ...prev, selectedItems: newSelection };
    });
  }, []);

  const selectAll = useCallback(() => {
    const visibleItems = filteredAndSortedItems.filter(item => 
      state.showHidden || !item.isHidden
    );
    setState(prev => ({
      ...prev,
      selectedItems: new Set(visibleItems.map(item => item.id))
    }));
  }, [state.showHidden]);

  const clearSelection = useCallback(() => {
    setState(prev => ({ ...prev, selectedItems: new Set() }));
  }, []);

  // View mode and sorting
  const setViewMode = useCallback((mode: FileManagerState['viewMode']) => {
    setState(prev => ({ ...prev, viewMode: mode }));
  }, []);

  const setSorting = useCallback((sortBy: FileManagerState['sortBy'], sortOrder?: 'asc' | 'desc') => {
    setState(prev => ({
      ...prev,
      sortBy,
      sortOrder: sortOrder || (prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc')
    }));
  }, []);

  const toggleHidden = useCallback(() => {
    setState(prev => ({ ...prev, showHidden: !prev.showHidden }));
  }, []);

  // Search and filtering
  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setFilter = useCallback((filter: Partial<FileManagerState['filter']>) => {
    setState(prev => ({ ...prev, filter: { ...prev.filter, ...filter } }));
  }, []);

  const clearFilter = useCallback(() => {
    setState(prev => ({ ...prev, filter: {}, searchQuery: '' }));
  }, []);

  // File operations
  const createOperation = useCallback((
    type: FileOperation['type'],
    source: string[],
    destination?: string
  ): string => {
    const operationId = `op_${++operationIdRef.current}`;
    
    const operation: FileOperation = {
      id: operationId,
      type,
      source,
      destination,
      status: 'pending',
      progress: 0
    };

    setOperations(prev => [...prev, operation]);
    return operationId;
  }, []);

  const copyItems = useCallback(async (itemIds: string[], destinationPath: string) => {
    const operationId = createOperation('copy', itemIds, destinationPath);
    
    // Simulate copy operation
    setOperations(prev => prev.map(op => 
      op.id === operationId 
        ? { ...op, status: 'processing' as const }
        : op
    ));

    // Mock progress simulation
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 50));
      setOperations(prev => prev.map(op => 
        op.id === operationId ? { ...op, progress } : op
      ));
    }

    setOperations(prev => prev.map(op => 
      op.id === operationId 
        ? { ...op, status: 'completed' as const, progress: 100 }
        : op
    ));

    // Refresh current directory
    await navigateTo(state.currentPath, false);
  }, [createOperation, navigateTo, state.currentPath]);

  const moveItems = useCallback(async (itemIds: string[], destinationPath: string) => {
    const operationId = createOperation('move', itemIds, destinationPath);
    
    setOperations(prev => prev.map(op => 
      op.id === operationId 
        ? { ...op, status: 'processing' as const }
        : op
    ));

    // Simulate move operation
    await new Promise(resolve => setTimeout(resolve, 500));

    setOperations(prev => prev.map(op => 
      op.id === operationId 
        ? { ...op, status: 'completed' as const, progress: 100 }
        : op
    ));

    await navigateTo(state.currentPath, false);
  }, [createOperation, navigateTo, state.currentPath]);

  const deleteItems = useCallback(async (itemIds: string[]) => {
    const operationId = createOperation('delete', itemIds);
    
    setOperations(prev => prev.map(op => 
      op.id === operationId 
        ? { ...op, status: 'processing' as const }
        : op
    ));

    await new Promise(resolve => setTimeout(resolve, 300));

    setOperations(prev => prev.map(op => 
      op.id === operationId 
        ? { ...op, status: 'completed' as const, progress: 100 }
        : op
    ));

    await navigateTo(state.currentPath, false);
  }, [createOperation, navigateTo, state.currentPath]);

  // Drag and drop
  const startDrag = useCallback((itemIds: string[]) => {
    setDragDropState({
      isDragging: true,
      draggedItems: itemIds,
      dropTarget: null,
      dropEffect: 'move'
    });
  }, []);

  const setDropTarget = useCallback((target: string | null, effect: DragDropState['dropEffect'] = 'move') => {
    setDragDropState(prev => ({
      ...prev,
      dropTarget: target,
      dropEffect: effect
    }));
  }, []);

  const completeDrop = useCallback(async () => {
    const { draggedItems, dropTarget, dropEffect } = dragDropState;
    
    if (!dropTarget || draggedItems.length === 0) return;

    if (dropEffect === 'move') {
      await moveItems(draggedItems, dropTarget);
    } else if (dropEffect === 'copy') {
      await copyItems(draggedItems, dropTarget);
    }

    setDragDropState({
      isDragging: false,
      draggedItems: [],
      dropTarget: null,
      dropEffect: 'none'
    });
  }, [dragDropState, moveItems, copyItems]);

  const cancelDrag = useCallback(() => {
    setDragDropState({
      isDragging: false,
      draggedItems: [],
      dropTarget: null,
      dropEffect: 'none'
    });
  }, []);

  // Bookmarks and recents
  const addBookmark = useCallback((item: FileSystemItem) => {
    setBookmarks(prev => {
      const exists = prev.some(bookmark => bookmark.path === item.path);
      if (exists) return prev;
      
      return [...prev, { ...item, metadata: { ...item.metadata, isFavorite: true } }];
    });
  }, []);

  const removeBookmark = useCallback((path: string) => {
    setBookmarks(prev => prev.filter(bookmark => bookmark.path !== path));
  }, []);

  const addToRecent = useCallback((item: FileSystemItem) => {
    setRecentFiles(prev => {
      const filtered = prev.filter(recent => recent.path !== item.path);
      return [{ ...item, accessed: new Date() }, ...filtered].slice(0, 20);
    });
  }, []);

  // File operations
  const openItem = useCallback((item: FileSystemItem) => {
    if (item.type === 'directory') {
      navigateTo(item.path);
    } else {
      addToRecent(item);
      onFileOpen?.(item);
    }
  }, [navigateTo, addToRecent, onFileOpen]);

  // Filtered and sorted items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = state.items;

    // Filter hidden files
    if (!state.showHidden) {
      filtered = filtered.filter(item => !item.isHidden);
    }

    // Apply search query
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(query) ||
        item.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply filters
    const { filter } = state;
    if (filter.type) {
      filtered = filtered.filter(item => item.type === filter.type);
    }
    if (filter.extension && filter.extension.length > 0) {
      filtered = filtered.filter(item => 
        item.extension && filter.extension!.includes(item.extension)
      );
    }
    if (filter.sizeRange) {
      filtered = filtered.filter(item => 
        item.size >= filter.sizeRange!.min && item.size <= filter.sizeRange!.max
      );
    }

    // Sort items
    filtered.sort((a, b) => {
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
        case 'created':
          comparison = a.created.getTime() - b.created.getTime();
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }

      return state.sortOrder === 'desc' ? -comparison : comparison;
    });

    // Directories first
    return filtered.sort((a, b) => {
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;
      return 0;
    });
  }, [state]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault();
            selectAll();
            break;
          case 'c':
            e.preventDefault();
            if (state.selectedItems.size > 0) {
              // Copy to clipboard
            }
            break;
          case 'x':
            e.preventDefault();
            if (state.selectedItems.size > 0) {
              // Cut to clipboard
            }
            break;
          case 'v':
            e.preventDefault();
            // Paste from clipboard
            break;
        }
      } else {
        switch (e.key) {
          case 'Delete':
            if (state.selectedItems.size > 0) {
              deleteItems(Array.from(state.selectedItems));
            }
            break;
          case 'F2':
            if (state.selectedItems.size === 1) {
              // Start rename
            }
            break;
          case 'Escape':
            clearSelection();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [state.selectedItems, selectAll, deleteItems, clearSelection]);

  // Initialize
  useEffect(() => {
    navigateTo(initialPath);
  }, []);

  return {
    // State
    ...state,
    history,
    historyIndex,
    operations,
    dragDropState,
    bookmarks,
    recentFiles,
    loading,
    error,
    
    // Navigation
    navigateTo,
    goBack,
    goForward,
    goUp,
    goHome,
    canGoBack: historyIndex > 0,
    canGoForward: historyIndex < history.length - 1,
    
    // Selection
    selectItem,
    selectAll,
    clearSelection,
    selectedItems: Array.from(state.selectedItems),
    
    // View controls
    setViewMode,
    setSorting,
    toggleHidden,
    
    // Search and filter
    setSearchQuery,
    setFilter,
    clearFilter,
    
    // File operations
    openItem,
    copyItems,
    moveItems,
    deleteItems,
    
    // Drag and drop
    startDrag,
    setDropTarget,
    completeDrop,
    cancelDrag,
    
    // Bookmarks and recents
    addBookmark,
    removeBookmark,
    
    // Computed data
    filteredAndSortedItems,
    
    // Utils
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