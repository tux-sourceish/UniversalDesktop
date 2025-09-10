import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { μ3_useFileSystem } from '../hooks/μ3_useFileSystem';
import { μ7_UniversalContextMenu, useUniversalContextMenu } from './contextMenu/μ7_UniversalContextMenu';
import { UDFormat } from '../core/UDFormat';

/**
 * μ2_FileManager - WIND (☴) Views/UI
 *
 * Universal File Manager with Context-First Design
 * - Dual-mode architecture: GUI Mode (modern) + TUI Mode (Norton Commander style)
 * - Universal Context Menu integration
 * - Tauri-ready with web fallbacks
 * - Every file/folder action accessible via context menu
 * - Context menu teaches keyboard shortcuts
 * - Bagua-based file organization
 */

interface FileManagerProps {
  initialPath?: string;
  mode?: 'gui' | 'tui';
  onFileOpen?: (file: any) => void;
  onFileSelect?: (files: any[]) => void;
  className?: string;
  style?: React.CSSProperties;
  showToolbar?: boolean;
  showStatusBar?: boolean;
  allowMultiSelect?: boolean;
  onCreateUDItem?: (item: any) => void;
}

export const μ2_FileManager: React.FC<FileManagerProps> = ({
  initialPath = '/',
  mode: initialMode = 'gui',
  onFileOpen,
  onFileSelect,
  className = '',
  style = {},
  showToolbar = true,
  showStatusBar = true,
  allowMultiSelect = true,
  onCreateUDItem
}) => {
  // State management
  const [mode, setMode] = useState<'gui' | 'tui'>(initialMode);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'tree'>('list');
  const [showHidden, setShowHidden] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'modified' | 'type'>('name');
  const [sortOrder] = useState<'asc' | 'desc'>('asc'); // TODO: Implement sort order toggle
  // const [renamingItem, setRenamingItem] = useState<string | null>(null); // TODO: Implement inline renaming

  // Hooks
  const fileSystem = μ3_useFileSystem(initialPath);
  const { contextMenu, showContextMenu, hideContextMenu } = useUniversalContextMenu();

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const tuiRef = useRef<HTMLDivElement>(null);
  // const [renamingItem, setRenamingItem] = useState<any>(null); // TODO: Implement inline renaming
  const [clipboard, setClipboard] = useState<{items: any[], operation: 'copy' | 'cut'} | null>(null);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = fileSystem.items;

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.metadata?.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filter hidden files
    if (!showHidden) {
      filtered = filtered.filter(item => !item.isHidden);
    }

    // Sort items
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
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
      }

      const result = sortOrder === 'desc' ? -comparison : comparison;

      // Directories first
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;

      return result;
    });

    return filtered;
  }, [fileSystem.items, searchQuery, showHidden, sortBy, sortOrder]);

  // Handle item selection
  const handleItemClick = useCallback((item: any, event: React.MouseEvent) => {
    const multiSelect = allowMultiSelect && (event.ctrlKey || event.metaKey);

    setSelectedItems(prev => {
      const newSelection = new Set(multiSelect ? prev : []);

      if (newSelection.has(item.id)) {
        newSelection.delete(item.id);
      } else {
        newSelection.add(item.id);
      }

      const selectedFiles = filteredAndSortedItems.filter(f => newSelection.has(f.id));
      onFileSelect?.(selectedFiles);

      return newSelection;
    });
  }, [allowMultiSelect, filteredAndSortedItems, onFileSelect]);

  // Handle item double-click
  const handleItemDoubleClick = useCallback((item: any) => {
    if (item.type === 'directory') {
      fileSystem.navigateTo(item.path);
    } else {
      onFileOpen?.(item);
    }
  }, [fileSystem, onFileOpen]);

  // Handle context menu
  const handleContextMenu = useCallback((event: React.MouseEvent, item?: any) => {
    event.preventDefault();
    event.stopPropagation();

    const contextType = item
      ? (item.type === 'directory' ? 'folder' : 'file')
      : 'canvas';

    showContextMenu(event, item, contextType);
  }, [showContextMenu]);

  // Handle context menu actions
  const handleContextAction = useCallback((action: string, item?: any) => {
    switch (action) {
      case 'open':
        if (item) {
          handleItemDoubleClick(item);
        }
        break;

      case 'rename':
        if (item) {
          startRenaming(item);
        }
        break;

      case 'delete':
        if (item) {
          // TODO: Implement delete functionality
          console.log('Delete:', item.name);
        }
        break;

      case 'duplicate':
        if (item) {
          // TODO: Implement duplicate functionality
          console.log('Duplicate:', item.name);
        }
        break;

      case 'transform-to-ud':
        if (item && onCreateUDItem) {
          // Transform file to .ud document
          const udItem = {
            type: 8, // VARIABLE type number
            title: item.name,
            content: `File: ${item.path}\nSize: ${fileSystem.formatFileSize(item.size)}\nModified: ${fileSystem.formatDate(item.modified)}`,
            position: { x: 100, y: 100, z: 1 },
            dimensions: { width: 350, height: 250 },
            metadata: {
              originalPath: item.path,
              fileType: item.extension,
              bagua_descriptor: UDFormat.BAGUA.ERDE // Use ERDE instead of VARIABLE
            }
          };
          onCreateUDItem(udItem);
        }
        break;

      case 'transform-to-workspace':
        if (item && onCreateUDItem) {
          // Add file as workspace item
          const workspaceItem = {
            type: item.type === 'directory' ? 4 : 8, // INIT or VARIABLE type numbers
            title: item.name,
            content: item.path,
            position: { x: 200, y: 200, z: 1 },
            dimensions: { width: 300, height: 200 },
            metadata: {
              isFileReference: true,
              originalPath: item.path,
              fileSize: item.size,
              bagua_descriptor: item.type === 'directory' ? UDFormat.BAGUA.BERG : UDFormat.BAGUA.ERDE
            }
          };
          onCreateUDItem(workspaceItem);
        }
        break;

      case 'open-with-editor':
        if (item && item.type === 'file') {
          const editorItem = {
            type: 'code',
            title: `Edit ${item.name}`,
            content: item.path,
            position: { x: 150, y: 150, z: 2 },
            dimensions: { width: 600, height: 400 },
            metadata: {
              filePath: item.path,
              fileType: item.extension || 'text',
              bagua_descriptor: UDFormat.BAGUA.FEUER
            }
          };
          onCreateUDItem?.(editorItem);
        }
        break;

      case 'open-with-code':
        if (item && item.type === 'file') {
          const codeItem = {
            type: 'code',
            title: item.name,
            content: `// File: ${item.path}\n// Loading content...`,
            position: { x: 200, y: 200, z: 2 },
            dimensions: { width: 700, height: 500 },
            metadata: {
              filePath: item.path,
              language: getLanguageFromExtension(item.extension),
              bagua_descriptor: UDFormat.BAGUA.FEUER
            }
          };
          onCreateUDItem?.(codeItem);
        }
        break;

      case 'copy':
        if (selectedItems.size > 0) {
          const items = filteredAndSortedItems.filter(f => selectedItems.has(f.id));
          copyToClipboard(items);
        } else if (item) {
          copyToClipboard([item]);
        }
        break;

      case 'cut':
        if (selectedItems.size > 0) {
          const items = filteredAndSortedItems.filter(f => selectedItems.has(f.id));
          cutToClipboard(items);
        } else if (item) {
          cutToClipboard([item]);
        }
        break;

      case 'paste':
        pasteFromClipboard(fileSystem.currentPath);
        break;

      case 'show-properties':
        if (item) {
          showFileProperties(item);
        }
        break;

      case 'create-folder':
        createNewFolder();
        break;

      case 'preview':
        if (item && item.type === 'file') {
          showPreview(item);
        }
        break;

      default:
        console.log('Unhandled action:', action, item);
    }
  }, [handleItemDoubleClick, onCreateUDItem, fileSystem, selectedItems, filteredAndSortedItems]);

  // Helper functions for enhanced file operations
  const getLanguageFromExtension = useCallback((ext?: string): string => {
    if (!ext) return 'text';
    const langMap: Record<string, string> = {
      'js': 'javascript', 'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
      'py': 'python', 'rb': 'ruby', 'go': 'go', 'rs': 'rust', 'cpp': 'cpp', 'c': 'c',
      'java': 'java', 'php': 'php', 'html': 'html', 'css': 'css', 'scss': 'scss',
      'json': 'json', 'xml': 'xml', 'yaml': 'yaml', 'yml': 'yaml', 'md': 'markdown',
      'sh': 'bash', 'sql': 'sql', 'vue': 'vue', 'svelte': 'svelte'
    };
    return langMap[ext.toLowerCase()] || 'text';
  }, []);

  const startRenaming = useCallback((item: any) => {
    // TODO: Implement inline renaming UI
    const newName = prompt('Rename to:', item.name);
    if (newName && newName !== item.name) {
      console.log('Rename', item.name, 'to', newName);
      // fileSystem.rename(item.path, newName);
    }
  }, []);

  const copyToClipboard = useCallback((items: any[]) => {
    setClipboard({ items, operation: 'copy' });
    console.log('📋 Copied to clipboard:', items.map(i => i.name));
  }, []);

  const cutToClipboard = useCallback((items: any[]) => {
    setClipboard({ items, operation: 'cut' });
    console.log('✂️ Cut to clipboard:', items.map(i => i.name));
  }, []);

  const pasteFromClipboard = useCallback((targetPath: string) => {
    if (!clipboard) return;

    console.log(`📌 Paste ${clipboard.operation}:`, clipboard.items.map(i => i.name), 'to', targetPath);

    if (clipboard.operation === 'cut') {
      setClipboard(null);
    }
  }, [clipboard]);

  const showFileProperties = useCallback((item: any) => {
    if (onCreateUDItem) {
      const propertiesItem = {
        type: 'notizzettel',
        title: `Properties: ${item.name}`,
        content: `📄 **File Properties**\n\n` +
          `**Name:** ${item.name}\n` +
          `**Path:** ${item.path}\n` +
          `**Type:** ${item.type} ${item.extension ? `(.${item.extension})` : ''}\n` +
          `**Size:** ${fileSystem.formatFileSize(item.size)}\n` +
          `**Modified:** ${fileSystem.formatDate(item.modified)}\n` +
          `**Created:** ${fileSystem.formatDate(item.created)}\n` +
          `**Permissions:** ${item.permissions}\n` +
          `**Hidden:** ${item.isHidden ? 'Yes' : 'No'}\n\n` +
          `${item.metadata?.description || ''}\n\n` +
          `**MIME Type:** ${item.mimeType || 'Unknown'}\n` +
          `**Tags:** ${item.metadata?.tags?.join(', ') || 'None'}`,
        position: { x: 300, y: 200, z: 3 },
        dimensions: { width: 400, height: 500 },
        metadata: {
          isPropertiesWindow: true,
          sourceFile: item.path,
          bagua_descriptor: UDFormat.BAGUA.SEE
        }
      };
      onCreateUDItem(propertiesItem);
    }
  }, [onCreateUDItem, fileSystem]);

  const createNewFolder = useCallback(() => {
    const folderName = prompt('Enter folder name:', 'New Folder');
    if (folderName?.trim()) {
      console.log('Create folder:', folderName, 'in', fileSystem.currentPath);
    }
  }, [fileSystem.currentPath]);

  const showPreview = useCallback((item: any) => {
    if (!onCreateUDItem) return;

    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(item.extension);
    const isCode = ['js', 'jsx', 'ts', 'tsx', 'py', 'rb', 'go', 'rs', 'cpp', 'c', 'java', 'html', 'css', 'json'].includes(item.extension);

    const previewItem = {
      type: isImage ? 'media' : isCode ? 'code' : 'notizzettel',
      title: `👁️ Preview: ${item.name}`,
      content: isImage ? item.path : `Loading preview of ${item.path}...`,
      position: { x: 400, y: 150, z: 3 },
      dimensions: isImage ? { width: 500, height: 400 } : { width: 600, height: 500 },
      metadata: {
        isPreview: true,
        sourceFile: item.path,
        previewType: isImage ? 'image' : isCode ? 'code' : 'text',
        bagua_descriptor: UDFormat.BAGUA.SEE
      }
    };

    onCreateUDItem(previewItem);
  }, [onCreateUDItem]);

  // Toggle between GUI and TUI mode
  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'gui' ? 'tui' : 'gui');
  }, []);

  // Enhanced Keyboard shortcuts for dual-mode operation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Global mode toggle - works from anywhere
      if (event.key === 'F12') {
        event.preventDefault();
        toggleMode();
        return;
      }

      // Only handle other shortcuts when file manager is focused
      if (!containerRef.current?.contains(document.activeElement) &&
          !tuiRef.current?.contains(document.activeElement)) return;

      // Navigation and file operations
      switch (event.key) {
        case 'F5':
          event.preventDefault();
          fileSystem.navigateTo(fileSystem.currentPath, false);
          break;

        case 'Backspace':
          if (!event.target || (event.target as HTMLElement).tagName !== 'INPUT') {
            event.preventDefault();
            fileSystem.goUp();
          }
          break;

        case 'Enter':
          event.preventDefault();
          const selectedFileForOpen = filteredAndSortedItems.find(item => selectedItems.has(item.id));
          if (selectedFileForOpen) {
            handleItemDoubleClick(selectedFileForOpen);
          }
          break;

        case ' ': // Spacebar for selection toggle in TUI mode
          if (mode === 'tui') {
            event.preventDefault();
            const firstSelected = filteredAndSortedItems.find(item => selectedItems.has(item.id));
            if (firstSelected) {
              handleItemClick(firstSelected, { ctrlKey: true } as React.MouseEvent);
            }
          }
          break;

        case 'Delete':
          if (selectedItems.size > 0) {
            event.preventDefault();
            const confirmed = confirm(`Delete ${selectedItems.size} selected item(s)?`);
            if (confirmed) {
              // TODO: Implement actual delete
              console.log('Delete selected items:', Array.from(selectedItems));
              setSelectedItems(new Set());
            }
          }
          break;

        case 'F2':
          if (selectedItems.size === 1) {
            event.preventDefault();
            const selectedFileForRename = filteredAndSortedItems.find(item => selectedItems.has(item.id));
            if (selectedFileForRename) {
              const newName = prompt('Rename to:', selectedFileForRename.name);
              if (newName && newName !== selectedFileForRename.name) {
                // TODO: Implement actual rename
                console.log('Rename', selectedFileForRename.name, 'to', newName);
              }
            }
          }
          break;

        case 'F3': // View file
          if (selectedItems.size === 1) {
            event.preventDefault();
            const selectedFileForView = filteredAndSortedItems.find(item => selectedItems.has(item.id));
            if (selectedFileForView && selectedFileForView.type === 'file') {
              console.log('View file:', selectedFileForView.name);
              // TODO: Implement file viewer
            }
          }
          break;

        case 'F7': // Create directory
          event.preventDefault();
          const dirName = prompt('Create directory:');
          if (dirName) {
            console.log('Create directory:', dirName);
            // TODO: Implement directory creation
          }
          break;

        case 'F9': // Context menu
          event.preventDefault();
          const selectedFileForContext = filteredAndSortedItems.find(item => selectedItems.has(item.id));
          if (selectedFileForContext) {
            // Simulate right-click for context menu
            const rect = containerRef.current?.getBoundingClientRect();
            if (rect) {
              const fakeEvent = {
                preventDefault: () => {},
                stopPropagation: () => {},
                clientX: rect.left + rect.width / 2,
                clientY: rect.top + rect.height / 2
              } as React.MouseEvent;
              handleContextMenu(fakeEvent, selectedFileForContext);
            }
          }
          break;

        case 'Escape':
          event.preventDefault();
          setSelectedItems(new Set());
          hideContextMenu();
          break;

        // Arrow key navigation in TUI mode
        case 'ArrowUp':
          if (mode === 'tui') {
            event.preventDefault();
            const selectedFileForUp = filteredAndSortedItems.find(item => selectedItems.has(item.id));
            if (selectedFileForUp) {
              const currentIndex = filteredAndSortedItems.indexOf(selectedFileForUp);
              if (currentIndex > 0) {
                const newItem = filteredAndSortedItems[currentIndex - 1];
                setSelectedItems(new Set([newItem.id]));
              }
            } else if (filteredAndSortedItems.length > 0) {
              setSelectedItems(new Set([filteredAndSortedItems[0].id]));
            }
          }
          break;

        case 'ArrowDown':
          if (mode === 'tui') {
            event.preventDefault();
            const selectedFileForDown = filteredAndSortedItems.find(item => selectedItems.has(item.id));
            if (selectedFileForDown) {
              const currentIndex = filteredAndSortedItems.indexOf(selectedFileForDown);
              if (currentIndex < filteredAndSortedItems.length - 1) {
                const newItem = filteredAndSortedItems[currentIndex + 1];
                setSelectedItems(new Set([newItem.id]));
              }
            } else if (filteredAndSortedItems.length > 0) {
              setSelectedItems(new Set([filteredAndSortedItems[0].id]));
            }
          }
          break;
      }

      // Ctrl/Cmd shortcuts
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'a':
            event.preventDefault();
            setSelectedItems(new Set(filteredAndSortedItems.map(item => item.id)));
            break;

          case 'f':
            event.preventDefault();
            setSearchExpanded(true);
            // Focus search input if in GUI mode
            if (mode === 'gui') {
              setTimeout(() => {
                const searchInput = containerRef.current?.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                searchInput?.focus();
              }, 0);
            }
            break;

          case 'h': // Toggle hidden files
            event.preventDefault();
            setShowHidden(!showHidden);
            break;

          case 'r': // Refresh
            event.preventDefault();
            fileSystem.navigateTo(fileSystem.currentPath, false);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mode, toggleMode, fileSystem, filteredAndSortedItems, selectedItems, handleItemDoubleClick, handleItemClick, handleContextMenu, hideContextMenu, showHidden]);

  // GUI Mode Toolbar
  const renderToolbar = () => {
    if (!showToolbar) return null;

    return (
      <div className="file-manager-toolbar" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 12px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'var(--bg-medium)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Navigation */}
        <div className="nav-buttons" style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={fileSystem.goBack}
            disabled={!fileSystem.canGoBack}
            title="Back (Backspace)"
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: '4px',
              background: fileSystem.canGoBack ? 'rgba(26, 127, 86, 0.2)' : 'var(--bg-light)',
              cursor: fileSystem.canGoBack ? 'pointer' : 'not-allowed'
            }}
          >
            ⬅️
          </button>
          <button
            onClick={fileSystem.goForward}
            disabled={!fileSystem.canGoForward}
            title="Forward"
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: '4px',
              background: fileSystem.canGoForward ? 'rgba(26, 127, 86, 0.2)' : 'var(--bg-light)',
              cursor: fileSystem.canGoForward ? 'pointer' : 'not-allowed'
            }}
          >
            ➡️
          </button>
          <button
            onClick={fileSystem.goUp}
            title="Up Directory (Backspace)"
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: '4px',
              background: 'rgba(26, 127, 86, 0.2)',
              cursor: 'pointer'
            }}
          >
            ⬆️
          </button>
        </div>

        {/* Address Bar */}
        <div style={{ flex: 1, margin: '0 8px' }}>
          <input
            type="text"
            value={fileSystem.currentPath}
            onChange={(e) => fileSystem.navigateTo(e.target.value)}
            placeholder="Enter path..."
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              fontSize: '13px',
              fontFamily: 'monospace',
              backgroundColor: 'var(--bg-light)',
              color: 'var(--text-light)'
            }}
          />
        </div>

        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            onClick={() => setSearchExpanded(!searchExpanded)}
            title="Search (Ctrl+F)"
            style={{
              padding: '6px 8px',
              border: 'none',
              borderRadius: '4px',
              background: searchExpanded ? 'rgba(26, 127, 86, 0.3)' : 'rgba(26, 127, 86, 0.2)',
              cursor: 'pointer'
            }}
          >
            🔍
          </button>
          {searchExpanded && (
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 8px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                fontSize: '13px',
                width: '150px',
                backgroundColor: 'var(--bg-light)',
                color: 'var(--text-light)'
              }}
            />
          )}
        </div>

        {/* View Controls */}
        <div style={{ display: 'flex', gap: '2px' }}>
          {['list', 'grid', 'tree'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as any)}
              title={`${mode} view`}
              style={{
                padding: '6px 8px',
                border: 'none',
                borderRadius: '4px',
                background: viewMode === mode ? 'rgba(26, 127, 86, 0.4)' : 'rgba(26, 127, 86, 0.2)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {mode === 'list' && '📋'}
              {mode === 'grid' && '⊞'}
              {mode === 'tree' && '🌲'}
            </button>
          ))}
        </div>

        {/* Mode Toggle */}
        <button
          onClick={toggleMode}
          title="Toggle TUI Mode (F12)"
          style={{
            padding: '6px 8px',
            border: 'none',
            borderRadius: '4px',
            background: 'rgba(59, 130, 246, 0.1)',
            cursor: 'pointer'
          }}
        >
          💻
        </button>
      </div>
    );
  };

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filteredAndSortedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 34, // Höhe einer einzelnen Datei-Zeile in Pixel
    overscan: 10, // 10 zusätzliche Elemente oben/unten rendern für flüssiges Scrollen
  });

  // GUI Mode Content
  const renderGUIContent = () => {
    if (fileSystem.loading) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          fontSize: '14px',
          color: 'var(--text-medium)'
        }}>
          ⏳ Loading directory...
        </div>
      );
    }

    if (fileSystem.error) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          fontSize: '14px',
          color: 'var(--accent-red)'
        }}>
          ❌ {fileSystem.error}
        </div>
      );
    }

    if (viewMode === 'list') {
      return (
        <div className="file-list-view" style={{
          padding: '8px',
          backgroundColor: 'var(--bg-dark)',
          minHeight: '300px'
        }}>
          {/* Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto auto auto',
            gap: '12px',
            padding: '8px 4px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '12px',
            fontWeight: 'bold',
            color: 'var(--text-medium)',
            backgroundColor: 'var(--bg-medium)'
          }}>
            <div></div>
            <div
              onClick={() => setSortBy('name')}
              style={{ cursor: 'pointer' }}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div
              onClick={() => setSortBy('size')}
              style={{ cursor: 'pointer' }}
            >
              Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div
              onClick={() => setSortBy('type')}
              style={{ cursor: 'pointer' }}
            >
              Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
            </div>
            <div
              onClick={() => setSortBy('modified')}
              style={{ cursor: 'pointer' }}
            >
              Modified {sortBy === 'modified' && (sortOrder === 'asc' ? '↑' : '↓')}
            </div>
          </div>

          {/* Files */}
          <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
            <div style={{ height: `${rowVirtualizer.getTotalSize()}px`, width: '100%', position: 'relative' }}>
              {rowVirtualizer.getVirtualItems().map(virtualItem => {
                const item = filteredAndSortedItems[virtualItem.index];
                const isSelected = selectedItems.has(item.id);

                return (
                  <div
                    key={item.id}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto auto auto',
                      gap: '12px',
                      padding: '6px 4px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: selectedItems.has(item.id) ? 'rgba(26, 127, 86, 0.3)' : 'transparent',
                      fontSize: '13px',
                      transition: 'background-color 0.2s ease'
                    }}
                    className={`file-item ${isSelected ? 'selected' : ''}`}
                    onClick={(e) => handleItemClick(item, e)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                    onMouseEnter={(e) => {
                      if (!selectedItems.has(item.id)) {
                        e.currentTarget.style.backgroundColor = 'rgba(26, 127, 86, 0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedItems.has(item.id)) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '16px'
                    }}>
                      {fileSystem.getFileIcon(item.name)}
                      {/* Revolutionary Bagua Indicator */}
                      <div
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: item.metadata?.baguaColor || '#696969',
                          border: '1px solid rgba(255,255,255,0.3)',
                          boxShadow: `0 0 6px ${item.metadata?.baguaColor || '#696969'}40`,
                          flexShrink: 0
                        }}
                        title={`${item.metadata?.baguaSymbol} ${item.metadata?.baguaDescription || 'Unknown Bagua'}`}
                      />
                    </div>
                    <div style={{
                      fontWeight: item.type === 'directory' ? 'bold' : 'normal',
                      color: item.isHidden ? 'var(--text-dark)' : 'var(--text-light)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>{item.name}</span>
                      {/* Bagua Symbol Tooltip */}
                      <span
                        style={{
                          fontSize: '12px',
                          opacity: 0.6,
                          color: item.metadata?.baguaColor || 'var(--text-medium)'
                        }}
                        title={item.metadata?.baguaDescription}
                      >
                        {item.metadata?.baguaSymbol}
                      </span>
                    </div>
                    <div style={{ color: 'var(--text-medium)', fontSize: '12px' }}>
                      {item.type === 'file' ? fileSystem.formatFileSize(item.size) : '—'}
                    </div>
                    <div style={{ color: 'var(--text-medium)', fontSize: '12px' }}>
                      {item.extension || item.type}
                    </div>
                    <div style={{ color: 'var(--text-medium)', fontSize: '12px' }}>
                      {fileSystem.formatDate(item.modified)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    if (viewMode === 'grid') {
      return (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '12px',
          padding: '12px',
          backgroundColor: 'var(--bg-dark)',
          minHeight: '300px'
        }}>
          {filteredAndSortedItems.map(item => (
            <div
              key={item.id}
              onClick={(e) => handleItemClick(item, e)}
              onDoubleClick={() => handleItemDoubleClick(item)}
              onContextMenu={(e) => handleContextMenu(e, item)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px',
                borderRadius: '6px',
                cursor: 'pointer',
                backgroundColor: selectedItems.has(item.id) ? 'rgba(26, 127, 86, 0.3)' : 'transparent',
                transition: 'background-color 0.2s ease'
              }}
            >
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative'
              }}>
                <div style={{ fontSize: '32px', marginBottom: '4px' }}>
                  {fileSystem.getFileIcon(item.name)}
                </div>
                {/* Revolutionary Bagua Indicator for Grid */}
                <div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: item.metadata?.baguaColor || '#696969',
                    border: '2px solid white',
                    boxShadow: `0 0 8px ${item.metadata?.baguaColor || '#696969'}60`,
                    fontSize: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold'
                  }}
                  title={`${item.metadata?.baguaSymbol} ${item.metadata?.baguaDescription || 'Unknown Bagua'}`}
                >
                  {item.metadata?.baguaSymbol}
                </div>
              </div>
              <div style={{
                fontSize: '12px',
                textAlign: 'center',
                wordBreak: 'break-word',
                maxWidth: '100%',
                color: item.isHidden ? 'var(--text-dark)' : 'var(--text-light)'
              }}>
                {item.name}
              </div>
              {item.type === 'file' && (
                <div style={{ fontSize: '10px', color: 'var(--text-medium)', marginTop: '2px' }}>
                  {fileSystem.formatFileSize(item.size)}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    return <div>Tree view not implemented yet</div>;
  };

  // TUI Mode Content - Norton Commander Style with Full Functionality
  const renderTUIContent = () => {
    const selectedList = Array.from(selectedItems);
    const hasSelection = selectedList.length > 0;

    return (
      <div
        ref={tuiRef}
        className="file-manager-tui tui-window tui-theme-green"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
          fontSize: '14px',
          backgroundColor: '#001100',
          color: '#00ff00',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          border: '2px solid #00ff00',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
        tabIndex={0}
      >
        {/* TUI Header Bar */}
        <div className="tui-header" style={{
          backgroundColor: '#003300',
          borderBottom: '1px solid #00ff00',
          padding: '4px 8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🟢</span>
            <span>UniversalDesktop File Manager</span>
            <span style={{ opacity: 0.8 }}>v2.1</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ opacity: 0.7 }}>{mode.toUpperCase()} Mode</span>
            <span style={{
              backgroundColor: '#00ff00',
              color: '#001100',
              padding: '2px 6px',
              borderRadius: '2px'
            }}>F12</span>
          </div>
        </div>

        {/* Path Bar */}
        <div className="tui-path-bar" style={{
          backgroundColor: '#002200',
          padding: '4px 8px',
          borderBottom: '1px solid #00aa00',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: '#888' }}>Path:</span>
          <span style={{ fontWeight: 'mono' }}>{fileSystem.currentPath}</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <span style={{ opacity: 0.7 }}>{filteredAndSortedItems.length} items</span>
            {hasSelection && (
              <span style={{ color: '#ffff00' }}>({selectedList.length} selected)</span>
            )}
          </div>
        </div>

        {/* Main File List Area */}
        <div className="tui-main-area" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Column Headers */}
          <div className="tui-column-headers" style={{
            backgroundColor: '#004400',
            padding: '4px 8px',
            borderBottom: '1px solid #00aa00',
            display: 'grid',
            gridTemplateColumns: 'auto 3fr 100px 80px 120px',
            gap: '8px',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#ccffcc'
          }}>
            <span>✓</span>
            <span
              onClick={() => setSortBy('name')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
            </span>
            <span
              onClick={() => setSortBy('size')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Size {sortBy === 'size' && (sortOrder === 'asc' ? '↑' : '↓')}
            </span>
            <span
              onClick={() => setSortBy('type')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Type {sortBy === 'type' && (sortOrder === 'asc' ? '↑' : '↓')}
            </span>
            <span
              onClick={() => setSortBy('modified')}
              style={{ cursor: 'pointer', userSelect: 'none' }}
            >
              Modified {sortBy === 'modified' && (sortOrder === 'asc' ? '↑' : '↓')}
            </span>
          </div>

          {/* File List */}
          <div className="tui-file-list" style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: '#001100'
          }}>
            {fileSystem.loading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
                color: '#888'
              }}>
                ⏳ Loading directory...
              </div>
            ) : fileSystem.error ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
                color: '#ff4444'
              }}>
                ❌ {fileSystem.error}
              </div>
            ) : filteredAndSortedItems.length === 0 ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100px',
                color: '#888'
              }}>
                📂 Directory is empty
              </div>
            ) : (
              filteredAndSortedItems.map((item, index) => {
                const isSelected = selectedItems.has(item.id);
                const isEven = index % 2 === 0;

                return (
                  <div
                    key={item.id}
                    className="tui-file-row"
                    onClick={(e) => handleItemClick(item, e)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                    onContextMenu={(e) => handleContextMenu(e, item)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 3fr 100px 80px 120px',
                      gap: '8px',
                      padding: '2px 8px',
                      fontSize: '13px',
                      cursor: 'pointer',
                      backgroundColor: isSelected
                        ? '#006600'
                        : isEven
                        ? '#001a00'
                        : '#001100',
                      borderLeft: isSelected ? '3px solid #00ff00' : '3px solid transparent',
                      transition: 'background-color 0.1s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = '#003300';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.backgroundColor = isEven ? '#001a00' : '#001100';
                      }
                    }}
                  >
                    {/* Selection Checkbox */}
                    <span style={{ color: isSelected ? '#00ff00' : '#666', fontWeight: 'bold' }}>
                      {isSelected ? '✓' : '○'}
                    </span>

                    {/* File Name with Icon and Revolutionary Bagua */}
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontWeight: item.type === 'directory' ? 'bold' : 'normal',
                      color: item.isHidden ? '#888' : 'inherit'
                    }}>
                      <span style={{ fontSize: '16px' }}>{fileSystem.getFileIcon(item.name)}</span>
                      {/* Revolutionary Bagua Indicator for TUI */}
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: item.metadata?.baguaColor || '#696969',
                          border: '1px solid #00ff00',
                          boxShadow: `0 0 4px ${item.metadata?.baguaColor || '#696969'}`,
                          flexShrink: 0
                        }}
                        title={`${item.metadata?.baguaSymbol} ${item.metadata?.baguaDescription || 'Unknown Bagua'}`}
                      />
                      <span style={{
                        fontFamily: 'monospace',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {item.name}{item.type === 'directory' ? '/' : ''}
                      </span>
                      {/* Bagua Symbol in TUI */}
                      <span
                        style={{
                          fontSize: '10px',
                          opacity: 0.7,
                          color: item.metadata?.baguaColor || '#666',
                          marginLeft: '4px'
                        }}
                        title={item.metadata?.baguaDescription}
                      >
                        {item.metadata?.baguaSymbol}
                      </span>
                    </span>

                    {/* File Size */}
                    <span style={{
                      textAlign: 'right',
                      color: item.type === 'directory' ? '#666' : '#ccffcc',
                      fontFamily: 'monospace',
                      fontSize: '12px'
                    }}>
                      {item.type === 'file' ? fileSystem.formatFileSize(item.size) : '<DIR>'}
                    </span>

                    {/* File Type/Extension */}
                    <span style={{
                      color: '#999',
                      fontSize: '12px',
                      textAlign: 'center',
                      fontFamily: 'monospace'
                    }}>
                      {item.extension?.toUpperCase() || (item.type === 'directory' ? 'DIR' : '---')}
                    </span>

                    {/* Modified Date */}
                    <span style={{
                      color: '#888',
                      fontSize: '11px',
                      fontFamily: 'monospace'
                    }}>
                      {fileSystem.formatDate(item.modified).split(' ')[0]}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* TUI Status Bar - Norton Commander Style */}
        <div className="tui-status-bar" style={{
          backgroundColor: '#003300',
          borderTop: '1px solid #00aa00',
          padding: '4px 8px',
          fontSize: '11px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#ccffcc'
        }}>
          {/* Left Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontWeight: 'bold' }}>
              {hasSelection ? `${selectedList.length}/${filteredAndSortedItems.length}` : filteredAndSortedItems.length} items
            </span>
            {fileSystem.capabilities.hasNativeIntegration && (
              <span style={{ opacity: 0.8 }}>NATIVE</span>
            )}
            {showHidden && (
              <span style={{ color: '#ffff00' }}>HIDDEN</span>
            )}
            {searchQuery && (
              <span style={{ color: '#ff8800' }}>SEARCH: {searchQuery}</span>
            )}
          </div>

          {/* Center - Navigation Hints */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '10px',
            opacity: 0.8
          }}>
            <span>[↑↓] Navigate</span>
            <span>[Enter] Open</span>
            <span>[Space] Select</span>
            <span>[Del] Delete</span>
            <span>[F2] Rename</span>
          </div>

          {/* Right Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {fileSystem.operations.length > 0 && (
              <span style={{ color: '#ffff00' }}>
                📋 {fileSystem.operations.filter(op => op.status === 'processing').length} ops
              </span>
            )}
            <span style={{
              backgroundColor: '#00aa00',
              color: '#001100',
              padding: '1px 4px',
              borderRadius: '2px',
              fontWeight: 'bold'
            }}>
              F12
            </span>
          </div>
        </div>

        {/* Function Keys Bar - Norton Commander Style */}
        <div className="tui-function-keys" style={{
          backgroundColor: '#004400',
          borderTop: '1px solid #00aa00',
          padding: '2px 4px',
          fontSize: '10px',
          display: 'flex',
          justifyContent: 'space-between',
          color: '#ccffcc'
        }}>
          <span>F1:Help</span>
          <span>F2:Rename</span>
          <span>F3:View</span>
          <span>F4:Edit</span>
          <span>F5:Copy</span>
          <span>F6:Move</span>
          <span>F7:MkDir</span>
          <span>F8:Delete</span>
          <span>F9:Menu</span>
          <span>F10:Quit</span>
          <span style={{ fontWeight: 'bold', color: '#ffff00' }}>F12:GUI</span>
        </div>
      </div>
    );
  };

  // Status Bar
  const renderStatusBar = () => {
    if (!showStatusBar || mode === 'tui') return null;

    const selectedCount = selectedItems.size;
    const totalCount = filteredAndSortedItems.length;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '4px 12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'var(--bg-medium)',
        fontSize: '12px',
        color: 'var(--text-medium)'
      }}>
        <div>
          {selectedCount > 0 ? `${selectedCount} selected` : `${totalCount} items`}
          {fileSystem.capabilities.hasNativeIntegration && ' (Native)'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {fileSystem.loading && '⏳ Loading...'}
          {fileSystem.operations.length > 0 &&
            `📋 ${fileSystem.operations.filter(op => op.status === 'processing').length} operations`
          }
          <span style={{ opacity: 0.7 }}>
            F12: {mode === 'gui' ? 'TUI' : 'GUI'} Mode
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      className={`file-manager ${mode} ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: mode === 'gui' ? 'var(--bg-dark)' : '#1a1a1a',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        color: mode === 'gui' ? 'var(--text-light)' : 'inherit',
        borderRadius: '6px',
        overflow: 'hidden',
        ...style
      }}
      tabIndex={0}
    >
      {mode === 'gui' && renderToolbar()}

      <div style={{ flex: 1, overflow: 'auto' }}>
        {mode === 'gui' ? renderGUIContent() : renderTUIContent()}
      </div>

      {renderStatusBar()}

      {/* Context Menu */}
      <μ7_UniversalContextMenu
        element={contextMenu.element}
        visible={contextMenu.visible}
        x={contextMenu.x}
        y={contextMenu.y}
        contextType={contextMenu.contextType}
        onClose={hideContextMenu}
        onItemAction={handleContextAction}
        clipboardHasContent={!!clipboard}
        hasSelection={selectedItems.size > 0}
        currentPath={fileSystem.currentPath}
        selectedFiles={Array.from(selectedItems)}
      />
    </div>
  );
};
