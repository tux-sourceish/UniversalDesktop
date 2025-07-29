/**
 * 🧪 Unit Tests: useFileManager Hook
 * 
 * Comprehensive tests for File-Manager dual-mode operations
 * Testing file system operations, navigation, selection, and drag & drop
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { useFileManager } from '@/hooks/useFileManager';
import { TestUtils, TestConfig } from '../../setup';

// Mock file system API
const mockFileSystemAPI = {
  readDirectory: vi.fn(),
  createFile: vi.fn(),
  createDirectory: vi.fn(),
  deleteItem: vi.fn(),
  moveItem: vi.fn(),
  copyItem: vi.fn(),
  renameItem: vi.fn(),
  getItemStats: vi.fn(),
};

// Mock implementation with test data
const mockFileSystemItems = [
  TestUtils.createMockFileItem({
    id: '1',
    name: 'Documents',
    type: 'directory',
    path: '/home/user/Documents',
  }),
  TestUtils.createMockFileItem({
    id: '2',
    name: 'workspace.ud',
    type: 'file',
    path: '/home/user/workspace.ud',
    extension: 'ud',
    size: 2048576,
  }),
  TestUtils.createMockFileItem({
    id: '3',
    name: 'project.json',
    type: 'file',
    path: '/home/user/project.json',
    extension: 'json',
    size: 4096,
  }),
  TestUtils.createMockFileItem({
    id: '4',
    name: '.hidden-config',
    type: 'file',
    path: '/home/user/.hidden-config',
    isHidden: true,
    size: 512,
  }),
];

describe('useFileManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mock implementations
    mockFileSystemAPI.readDirectory.mockResolvedValue(mockFileSystemItems);
    mockFileSystemAPI.createFile.mockResolvedValue(true);
    mockFileSystemAPI.createDirectory.mockResolvedValue(true);
    mockFileSystemAPI.deleteItem.mockResolvedValue(true);
    mockFileSystemAPI.moveItem.mockResolvedValue(true);
    mockFileSystemAPI.copyItem.mockResolvedValue(true);
    mockFileSystemAPI.renameItem.mockResolvedValue(true);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
      
      expect(result.current.currentPath).toBe('/home/user');
      expect(result.current.viewMode).toBe('list');
      expect(result.current.sortBy).toBe('name');
      expect(result.current.sortOrder).toBe('asc');
      expect(result.current.showHidden).toBe(false);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.selectedItems).toHaveLength(0);
    });

    it('should load initial directory', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => {
        expect(result.current.items).toHaveLength(4);
      });
      
      expect(result.current.items[0].name).toBe('Documents');
      expect(result.current.items[1].name).toBe('workspace.ud');
    });

    it('should handle initialization with custom path', async () => {
      const { result } = renderHook(() => useFileManager('/custom/path'));
      
      await waitFor(() => {
        expect(result.current.currentPath).toBe('/custom/path');
      });
    });

    it('should call onError callback when directory loading fails', async () => {
      const onError = vi.fn();
      mockFileSystemAPI.readDirectory.mockRejectedValue(new Error('Access denied'));
      
      renderHook(() => useFileManager('/restricted', undefined, onError));
      
      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith('Access denied');
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate to different path', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      await act(async () => {
        await result.current.navigateTo('/home/user/Documents');
      });
      
      expect(result.current.currentPath).toBe('/home/user/Documents');
      expect(result.current.history).toHaveLength(2);
    });

    it('should maintain navigation history', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      await act(async () => {
        await result.current.navigateTo('/home/user/Documents');
      });
      
      await act(async () => {
        await result.current.navigateTo('/home/user/Downloads');
      });
      
      expect(result.current.history).toHaveLength(3);
      expect(result.current.historyIndex).toBe(2);
    });

    it('should support back navigation', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      await act(async () => {
        await result.current.navigateTo('/home/user/Documents');
      });
      
      expect(result.current.canGoBack).toBe(true);
      
      await act(async () => {
        result.current.goBack();
      });
      
      expect(result.current.currentPath).toBe('/home/user');
    });

    it('should support forward navigation', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      await act(async () => {
        await result.current.navigateTo('/home/user/Documents');
      });
      
      await act(async () => {
        result.current.goBack();
      });
      
      expect(result.current.canGoForward).toBe(true);
      
      await act(async () => {
        result.current.goForward();
      });
      
      expect(result.current.currentPath).toBe('/home/user/Documents');
    });

    it('should support up navigation', async () => {
      const { result } = renderHook(() => useFileManager('/home/user/Documents'));
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      await act(async () => {
        result.current.goUp();
      });
      
      expect(result.current.currentPath).toBe('/home/user');
    });

    it('should support home navigation', async () => {
      const { result } = renderHook(() => useFileManager('/tmp'));
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      await act(async () => {
        result.current.goHome();
      });
      
      expect(result.current.currentPath).toBe('/home/user');
    });
  });

  describe('Selection Management', () => {
    it('should select single item', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.selectItem('1', false);
      });
      
      expect(result.current.selectedItems).toContain('1');
      expect(result.current.selectedItems).toHaveLength(1);
    });

    it('should support multi-select', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.selectItem('1', false);
        result.current.selectItem('2', true); // multi-select
      });
      
      expect(result.current.selectedItems).toContain('1');
      expect(result.current.selectedItems).toContain('2');
      expect(result.current.selectedItems).toHaveLength(2);
    });

    it('should toggle selection', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.selectItem('1', false);
      });
      
      expect(result.current.selectedItems).toContain('1');
      
      act(() => {
        result.current.selectItem('1', false);
      });
      
      expect(result.current.selectedItems).not.toContain('1');
    });

    it('should select all visible items', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.selectAll();
      });
      
      // Should select visible items (hidden files excluded by default)
      expect(result.current.selectedItems).toHaveLength(3);
    });

    it('should clear selection', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.selectItem('1', false);
        result.current.selectItem('2', true);
      });
      
      expect(result.current.selectedItems).toHaveLength(2);
      
      act(() => {
        result.current.clearSelection();
      });
      
      expect(result.current.selectedItems).toHaveLength(0);
    });
  });

  describe('View Mode and Sorting', () => {
    it('should change view mode', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      act(() => {
        result.current.setViewMode('grid');
      });
      
      expect(result.current.viewMode).toBe('grid');
    });

    it('should change sorting', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      act(() => {
        result.current.setSorting('size');
      });
      
      expect(result.current.sortBy).toBe('size');
      expect(result.current.sortOrder).toBe('asc');
    });

    it('should toggle sort order when same field selected', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      act(() => {
        result.current.setSorting('name'); // Already default
      });
      
      expect(result.current.sortOrder).toBe('desc');
    });

    it('should toggle hidden files visibility', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      expect(result.current.showHidden).toBe(false);
      
      act(() => {
        result.current.toggleHidden();
      });
      
      expect(result.current.showHidden).toBe(true);
    });
  });

  describe('Search and Filtering', () => {
    it('should filter by search query', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.setSearchQuery('workspace');
      });
      
      expect(result.current.searchQuery).toBe('workspace');
      
      // Check filtered results
      const filtered = result.current.filteredAndSortedItems;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].name).toBe('workspace.ud');
    });

    it('should filter by file type', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.setFilter({ type: 'file' });
      });
      
      const filtered = result.current.filteredAndSortedItems;
      const fileItems = filtered.filter(item => item.type === 'file');
      expect(fileItems).toHaveLength(filtered.length);
    });

    it('should filter by extension', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.setFilter({ extension: ['json'] });
      });
      
      const filtered = result.current.filteredAndSortedItems;
      expect(filtered).toHaveLength(1);
      expect(filtered[0].extension).toBe('json');
    });

    it('should filter by size range', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.setFilter({ sizeRange: { min: 1000, max: 10000 } });
      });
      
      const filtered = result.current.filteredAndSortedItems;
      filtered.forEach(item => {
        expect(item.size).toBeGreaterThanOrEqual(1000);
        expect(item.size).toBeLessThanOrEqual(10000);
      });
    });

    it('should clear filters', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.setSearchQuery('test');
        result.current.setFilter({ type: 'file' });
      });
      
      act(() => {
        result.current.clearFilter();
      });
      
      expect(result.current.searchQuery).toBe('');
      expect(result.current.filter).toEqual({});
    });
  });

  describe('File Operations', () => {
    it('should copy items', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      await act(async () => {
        await result.current.copyItems(['1'], '/home/user/Documents');
      });
      
      expect(result.current.operations).toHaveLength(1);
      
      await waitFor(() => {
        const operation = result.current.operations[0];
        expect(operation.type).toBe('copy');
        expect(operation.status).toBe('completed');
        expect(operation.progress).toBe(100);
      });
    });

    it('should move items', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      await act(async () => {
        await result.current.moveItems(['2'], '/home/user/Documents');
      });
      
      expect(result.current.operations).toHaveLength(1);
      
      await waitFor(() => {
        const operation = result.current.operations[0];
        expect(operation.type).toBe('move');
        expect(operation.status).toBe('completed');
      });
    });

    it('should delete items', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      await act(async () => {
        await result.current.deleteItems(['3']);
      });
      
      const operation = result.current.operations[0];
      expect(operation.type).toBe('delete');
      
      await waitFor(() => {
        expect(operation.status).toBe('completed');
      });
    });

    it('should open file and call callback', async () => {
      const onFileOpen = vi.fn();
      const { result } = renderHook(() => useFileManager('/home/user', onFileOpen));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      const fileItem = result.current.items.find(item => item.type === 'file');
      
      act(() => {
        result.current.openItem(fileItem!);
      });
      
      expect(onFileOpen).toHaveBeenCalledWith(fileItem);
      expect(result.current.recentFiles).toContain(fileItem);
    });

    it('should navigate when opening directory', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      const dirItem = result.current.items.find(item => item.type === 'directory');
      
      await act(async () => {
        result.current.openItem(dirItem!);
      });
      
      expect(result.current.currentPath).toBe(dirItem!.path);
    });
  });

  describe('Drag and Drop', () => {
    it('should start drag operation', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.startDrag(['1', '2']);
      });
      
      expect(result.current.dragDropState.isDragging).toBe(true);
      expect(result.current.dragDropState.draggedItems).toEqual(['1', '2']);
      expect(result.current.dragDropState.dropEffect).toBe('move');
    });

    it('should set drop target', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.startDrag(['1']);
        result.current.setDropTarget('/home/user/Documents', 'copy');
      });
      
      expect(result.current.dragDropState.dropTarget).toBe('/home/user/Documents');
      expect(result.current.dragDropState.dropEffect).toBe('copy');
    });

    it('should complete drop operation', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.startDrag(['1']);
        result.current.setDropTarget('/home/user/Documents', 'move');
      });
      
      await act(async () => {
        await result.current.completeDrop();
      });
      
      expect(result.current.dragDropState.isDragging).toBe(false);
      expect(result.current.dragDropState.draggedItems).toHaveLength(0);
      expect(result.current.operations).toHaveLength(1);
    });

    it('should cancel drag operation', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.startDrag(['1']);
      });
      
      expect(result.current.dragDropState.isDragging).toBe(true);
      
      act(() => {
        result.current.cancelDrag();
      });
      
      expect(result.current.dragDropState.isDragging).toBe(false);
      expect(result.current.dragDropState.draggedItems).toHaveLength(0);
    });
  });

  describe('Bookmarks and Recent Files', () => {
    it('should add bookmark', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      const item = result.current.items[0];
      
      act(() => {
        result.current.addBookmark(item);
      });
      
      expect(result.current.bookmarks).toContain(item);
      expect(result.current.bookmarks[0].metadata?.isFavorite).toBe(true);
    });

    it('should remove bookmark', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      const item = result.current.items[0];
      
      act(() => {
        result.current.addBookmark(item);
      });
      
      expect(result.current.bookmarks).toHaveLength(1);
      
      act(() => {
        result.current.removeBookmark(item.path);
      });
      
      expect(result.current.bookmarks).toHaveLength(0);
    });

    it('should prevent duplicate bookmarks', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      const item = result.current.items[0];
      
      act(() => {
        result.current.addBookmark(item);
        result.current.addBookmark(item);
      });
      
      expect(result.current.bookmarks).toHaveLength(1);
    });

    it('should maintain recent files list', async () => {
      const onFileOpen = vi.fn();
      const { result } = renderHook(() => useFileManager('/home/user', onFileOpen));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      const fileItem = result.current.items.find(item => item.type === 'file');
      
      act(() => {
        result.current.openItem(fileItem!);
      });
      
      expect(result.current.recentFiles).toHaveLength(1);
      expect(result.current.recentFiles[0]).toEqual(expect.objectContaining({
        path: fileItem!.path,
      }));
    });

    it('should limit recent files to 20 items', async () => {
      const onFileOpen = vi.fn();
      const { result } = renderHook(() => useFileManager('/home/user', onFileOpen));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      // Add 25 recent files
      for (let i = 0; i < 25; i++) {
        const mockFile = TestUtils.createMockFileItem({
          id: `recent-${i}`,
          name: `file-${i}.txt`,
          path: `/test/file-${i}.txt`,
        });
        
        act(() => {
          result.current.openItem(mockFile);
        });
      }
      
      expect(result.current.recentFiles).toHaveLength(20);
    });
  });

  describe('Utility Functions', () => {
    it('should format file sizes correctly', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      expect(result.current.formatFileSize(0)).toBe('0 B');
      expect(result.current.formatFileSize(1024)).toBe('1.0 KB');
      expect(result.current.formatFileSize(1048576)).toBe('1.0 MB');
      expect(result.current.formatFileSize(1073741824)).toBe('1.0 GB');
    });

    it('should sort items correctly', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      // Test name sorting (default)
      const nameSort = result.current.filteredAndSortedItems;
      expect(nameSort[0].type).toBe('directory'); // Directories first
      expect(nameSort[0].name).toBe('Documents');
      
      // Test size sorting
      act(() => {
        result.current.setSorting('size');
      });
      
      const sizeSort = result.current.filteredAndSortedItems;
      const fileSizes = sizeSort.filter(item => item.type === 'file').map(item => item.size);
      expect(fileSizes).toEqual([...fileSizes].sort((a, b) => a - b));
    });

    it('should filter hidden files by default', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      const filtered = result.current.filteredAndSortedItems;
      const hiddenItems = filtered.filter(item => item.isHidden);
      expect(hiddenItems).toHaveLength(0);
    });

    it('should show hidden files when enabled', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      act(() => {
        result.current.toggleHidden();
      });
      
      const filtered = result.current.filteredAndSortedItems;
      const hiddenItems = filtered.filter(item => item.isHidden);
      expect(hiddenItems).toHaveLength(1);
      expect(hiddenItems[0].name).toBe('.hidden-config');
    });
  });

  describe('Performance', () => {
    it('should handle large file lists efficiently', async () => {
      const largeFileList = Array.from({ length: 1000 }, (_, i) => 
        TestUtils.createMockFileItem({
          id: `file-${i}`,
          name: `file-${i}.txt`,
          path: `/test/file-${i}.txt`,
        })
      );
      
      mockFileSystemAPI.readDirectory.mockResolvedValue(largeFileList);
      
      const startTime = performance.now();
      const { result } = renderHook(() => useFileManager('/test'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(1000));
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should load within 1 second
    });

    it('should debounce rapid navigation calls', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      // Rapid navigation calls
      const promises = [
        result.current.navigateTo('/path1'),
        result.current.navigateTo('/path2'),
        result.current.navigateTo('/path3'),
      ];
      
      await Promise.all(promises);
      
      // Only the last path should be current
      expect(result.current.currentPath).toBe('/path3');
    });
  });

  describe('Error Handling', () => {
    it('should handle file operation errors gracefully', async () => {
      const { result } = renderHook(() => useFileManager('/home/user'));
      
      await waitFor(() => expect(result.current.items).toHaveLength(4));
      
      mockFileSystemAPI.copyItem.mockRejectedValue(new Error('Permission denied'));
      
      await act(async () => {
        await result.current.copyItems(['1'], '/restricted');
      });
      
      const operation = result.current.operations[0];
      expect(operation.status).toBe('failed');
      expect(operation.error).toBe('Permission denied');
    });

    it('should handle navigation errors', async () => {
      const onError = vi.fn();
      const { result } = renderHook(() => useFileManager('/home/user', undefined, onError));
      
      await waitFor(() => expect(result.current.loading).toBe(false));
      
      mockFileSystemAPI.readDirectory.mockRejectedValue(new Error('Directory not found'));
      
      await act(async () => {
        await result.current.navigateTo('/nonexistent');
      });
      
      expect(result.current.error).toBe('Directory not found');
      expect(onError).toHaveBeenCalledWith('Directory not found');
    });
  });
});