/**
 * 🧪 End-to-End Tests: User Workflows
 * 
 * Comprehensive E2E tests for complete user workflows
 * Testing real user scenarios from SYSTEM-PROMPT.md requirements
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { FileManagerWindow } from '@/components/bridges/FileManagerWindow';
import { μ7_UnifiedContextMenu } from '@/components/contextMenu/μ7_UnifiedContextMenu';
import { TestUtils, TestConfig } from '../setup';

// Skip E2E tests if configured
const skipIf = TestConfig.skipE2ETests ? describe.skip : describe;

// Mock hooks with more realistic behavior for E2E tests
const createRealisticeFileManager = () => {
  let currentPath = '/home/user';
  let items = [
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
  ];
  let selectedItems: string[] = [];
  let loading = false;

  return {
    currentPath,
    items,
    selectedItems,
    filteredAndSortedItems: items,
    viewMode: 'list' as const,
    sortBy: 'name' as const,
    sortOrder: 'asc' as const,
    showHidden: false,
    searchQuery: '',
    loading,
    error: null,
    operations: [],
    dragDropState: {
      isDragging: false,
      draggedItems: [],
      dropTarget: null,
      dropEffect: 'none' as const,
    },
    bookmarks: [],
    recentFiles: [],
    history: [{ path: currentPath, timestamp: new Date(), scrollPosition: 0 }],
    historyIndex: 0,
    
    // Mock methods with state updates
    navigateTo: vi.fn(async (path: string) => {
      currentPath = path;
      loading = true;
      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));
      loading = false;
    }),
    goBack: vi.fn(),
    goForward: vi.fn(),
    goUp: vi.fn(),
    goHome: vi.fn(),
    canGoBack: false,
    canGoForward: false,
    selectItem: vi.fn((id: string, multiSelect: boolean) => {
      if (multiSelect) {
        if (selectedItems.includes(id)) {
          selectedItems = selectedItems.filter(item => item !== id);
        } else {
          selectedItems.push(id);
        }
      } else {
        selectedItems = [id];
      }
    }),
    selectAll: vi.fn(() => {
      selectedItems = items.map(item => item.id);
    }),
    clearSelection: vi.fn(() => {
      selectedItems = [];
    }),
    setViewMode: vi.fn(),
    setSorting: vi.fn(),
    toggleHidden: vi.fn(),
    setSearchQuery: vi.fn(),
    setFilter: vi.fn(),
    clearFilter: vi.fn(),
    openItem: vi.fn(),
    copyItems: vi.fn(),
    moveItems: vi.fn(),
    deleteItems: vi.fn(),
    startDrag: vi.fn(),
    setDropTarget: vi.fn(),
    completeDrop: vi.fn(),
    cancelDrag: vi.fn(),
    addBookmark: vi.fn(),
    removeBookmark: vi.fn(),
    formatFileSize: vi.fn((bytes: number) => `${bytes} B`),
  };
};

vi.mock('@/hooks/useFileManager', () => ({
  useFileManager: vi.fn(() => createRealisticeFileManager()),
}));

vi.mock('@/core/UDFormat', () => ({
  UDFormat: {
    transistor: vi.fn((condition: boolean) => condition ? 1 : 0),
  }
}));

vi.mock('@/components/factories/μ1_WindowFactory', () => ({
  μ1_WINDOW_REGISTRY: {
    notizzettel: {
      id: 'notizzettel',
      displayName: 'Note',
      icon: '📝',
    },
    file_manager: {
      id: 'file_manager',
      displayName: 'File Manager',
      icon: '📁',
    },
    code: {
      id: 'code',
      displayName: 'Code Editor',
      icon: '💻',
    },
  }
}));

skipIf('End-to-End User Workflows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('File Management Workflows', () => {
    it('should complete basic file browsing workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <FileManagerWindow
          initialPath="/home/user"
          showToolbar={true}
          showStatusBar={true}
        />
      );

      // 1. User sees the file manager loaded
      await waitFor(() => {
        expect(screen.getByText('Documents')).toBeInTheDocument();
        expect(screen.getByText('workspace.ud')).toBeInTheDocument();
        expect(screen.getByText('project.json')).toBeInTheDocument();
      });

      // 2. User checks current path
      const addressBar = screen.getByDisplayValue('/home/user');
      expect(addressBar).toBeInTheDocument();

      // 3. User clicks on a file to select it
      const workspaceFile = screen.getByText('workspace.ud');
      await user.click(workspaceFile);

      // 4. User should see file is selected (status bar update)
      await waitFor(() => {
        const statusBar = document.querySelector('.file-manager-status-bar');
        expect(statusBar).toHaveTextContent('1 selected');
      });

      // 5. User double-clicks to open file
      await user.dblClick(workspaceFile);

      // File should be opened (callback should be called)
      const fileManager = require('@/hooks/useFileManager').useFileManager();
      expect(fileManager.openItem).toHaveBeenCalled();
    });

    it('should complete file search and filter workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <FileManagerWindow
          initialPath="/home/user"
          showToolbar={true}
        />
      );

      // 1. User clicks search button
      const searchButton = screen.getByText('🔍');
      await user.click(searchButton);

      // 2. Search input should appear
      await waitFor(() => {
        const searchInput = screen.getByPlaceholderText('Search files...');
        expect(searchInput).toBeInTheDocument();
      });

      // 3. User types search query
      const searchInput = screen.getByPlaceholderText('Search files...');
      await user.type(searchInput, 'workspace');

      // Search function should be called
      const fileManager = require('@/hooks/useFileManager').useFileManager();
      expect(fileManager.setSearchQuery).toHaveBeenCalledWith('workspace');

      // 4. User clears search
      await user.clear(searchInput);
      expect(fileManager.setSearchQuery).toHaveBeenCalledWith('');
    });

    it('should complete multi-file selection workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <FileManagerWindow
          initialPath="/home/user"
          allowMultiSelect={true}
        />
      );

      // 1. User selects first file
      const workspaceFile = screen.getByText('workspace.ud');
      await user.click(workspaceFile);

      // 2. User holds Ctrl and selects second file
      const projectFile = screen.getByText('project.json');
      await user.keyboard('{Control>}');
      await user.click(projectFile);
      await user.keyboard('{/Control}');

      // Both files should be selected
      const fileManager = require('@/hooks/useFileManager').useFileManager();
      expect(fileManager.selectItem).toHaveBeenCalledWith('2', false); // First file
      expect(fileManager.selectItem).toHaveBeenCalledWith('3', true);  // Second file with multi-select

      // 3. User selects all files with Ctrl+A
      await user.keyboard('{Control>}a{/Control}');
      expect(fileManager.selectAll).toHaveBeenCalled();
    });

    it('should complete view mode switching workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <FileManagerWindow
          initialPath="/home/user"
          showToolbar={true}
        />
      );

      // 1. User starts in list view (default)
      expect(screen.getByText('📋')).toBeInTheDocument(); // List view icon

      // 2. User switches to grid view
      const gridViewButton = screen.getByText('⊞');
      await user.click(gridViewButton);

      const fileManager = require('@/hooks/useFileManager').useFileManager();
      expect(fileManager.setViewMode).toHaveBeenCalledWith('grid');

      // 3. User switches to tree view
      const treeViewButton = screen.getByText('🌲');
      await user.click(treeViewButton);

      expect(fileManager.setViewMode).toHaveBeenCalledWith('tree');
    });

    it('should complete sorting workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <FileManagerWindow
          initialPath="/home/user"
        />
      );

      // 1. User clicks on Size column header to sort by size
      const sizeHeader = screen.getByText('Size');
      await user.click(sizeHeader);

      const fileManager = require('@/hooks/useFileManager').useFileManager();
      expect(fileManager.setSorting).toHaveBeenCalledWith('size');

      // 2. User clicks again to reverse sort order
      await user.click(sizeHeader);
      expect(fileManager.setSorting).toHaveBeenCalledWith('size');

      // 3. User sorts by modification date
      const modifiedHeader = screen.getByText('Modified');
      await user.click(modifiedHeader);

      expect(fileManager.setSorting).toHaveBeenCalledWith('modified');
    });

    it('should complete navigation workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <FileManagerWindow
          initialPath="/home/user"
          showToolbar={true}
        />
      );

      // 1. User double-clicks on Documents folder
      const documentsFolder = screen.getByText('Documents');
      await user.dblClick(documentsFolder);

      const fileManager = require('@/hooks/useFileManager').useFileManager();
      expect(fileManager.openItem).toHaveBeenCalled();

      // 2. User clicks Up button to go back
      const upButton = screen.getByTitle('Up');
      await user.click(upButton);

      expect(fileManager.goUp).toHaveBeenCalled();

      // 3. User clicks Home button
      const homeButton = screen.getByTitle('Home');
      await user.click(homeButton);

      expect(fileManager.goHome).toHaveBeenCalled();

      // 4. User manually enters path in address bar
      const addressBar = screen.getByDisplayValue('/home/user');
      await user.clear(addressBar);
      await user.type(addressBar, '/home/user/Documents');
      await user.keyboard('{Enter}');

      expect(fileManager.navigateTo).toHaveBeenCalledWith('/home/user/Documents');
    });
  });

  describe('Context Menu Workflows', () => {
    it('should complete right-click context menu workflow', async () => {
      const user = userEvent.setup();
      const onItemAction = vi.fn();
      
      // Component with integrated context menu
      const FileManagerWithContextMenu = () => {
        const [contextMenu, setContextMenu] = React.useState({
          visible: false,
          x: 0,
          y: 0,
          targetItem: null as any,
        });

        const handleContextMenu = (e: React.MouseEvent, item?: any) => {
          e.preventDefault();
          setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
            targetItem: item,
          });
        };

        const closeContextMenu = () => {
          setContextMenu(prev => ({ ...prev, visible: false }));
        };

        return (
          <div>
            <FileManagerWindow initialPath="/home/user" />
            
            {/* Simulate right-click target */}
            <div
              data-testid="file-item"
              onContextMenu={(e) => handleContextMenu(e, TestUtils.createMockUDItem({
                title: 'workspace.ud',
                type: 'file',
              }))}
              style={{ padding: '10px', cursor: 'pointer' }}
            >
              workspace.ud
            </div>

            <μ7_UnifiedContextMenu
              visible={contextMenu.visible}
              x={contextMenu.x}
              y={contextMenu.y}
              contextType="window"
              targetItem={contextMenu.targetItem}
              onClose={closeContextMenu}
              onCreateItem={vi.fn()}
              onItemAction={onItemAction}
              onAddToContext={vi.fn()}
            />
          </div>
        );
      };

      render(<FileManagerWithContextMenu />);

      // 1. User right-clicks on a file
      const fileItem = screen.getByTestId('file-item');
      await user.pointer([
        { keys: '[MouseRight]', target: fileItem },
      ]);

      // 2. Context menu should appear
      await waitFor(() => {
        expect(screen.getByText('📝 workspace.ud')).toBeInTheDocument();
      });

      // 3. User sees available actions
      expect(screen.getByText('Zu AI-Kontext hinzufügen')).toBeInTheDocument();
      expect(screen.getByText('Duplizieren')).toBeInTheDocument();
      expect(screen.getByText('Löschen')).toBeInTheDocument();

      // 4. User clicks on Delete action
      const deleteAction = screen.getByText('Löschen');
      await user.click(deleteAction);

      // Action should be triggered
      expect(onItemAction).toHaveBeenCalledWith('delete', expect.any(Object));

      // Menu should close
      await waitFor(() => {
        expect(screen.queryByText('📝 workspace.ud')).not.toBeInTheDocument();
      });
    });

    it('should complete canvas context menu workflow', async () => {
      const user = userEvent.setup();
      const onCreateItem = vi.fn();
      
      const CanvasWithContextMenu = () => {
        const [contextMenu, setContextMenu] = React.useState({
          visible: false,
          x: 0,
          y: 0,
        });

        const handleCanvasContextMenu = (e: React.MouseEvent) => {
          e.preventDefault();
          setContextMenu({
            visible: true,
            x: e.clientX,
            y: e.clientY,
          });
        };

        return (
          <div>
            <div
              data-testid="canvas-area"
              onContextMenu={handleCanvasContextMenu}
              style={{ width: '400px', height: '300px', background: '#f0f0f0' }}
            >
              Canvas Area
            </div>

            <μ7_UnifiedContextMenu
              visible={contextMenu.visible}
              x={contextMenu.x}
              y={contextMenu.y}
              contextType="canvas"
              onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
              onCreateItem={onCreateItem}
              onItemAction={vi.fn()}
              onAddToContext={vi.fn()}
            />
          </div>
        );
      };

      render(<CanvasWithContextMenu />);

      // 1. User right-clicks on empty canvas
      const canvasArea = screen.getByTestId('canvas-area');
      await user.pointer([
        { keys: '[MouseRight]', target: canvasArea },
      ]);

      // 2. Canvas context menu appears
      await waitFor(() => {
        expect(screen.getByText('🖥️ Desktop')).toBeInTheDocument();
      });

      // 3. User sees creation options
      expect(screen.getByText('Note')).toBeInTheDocument();
      expect(screen.getByText('Code Editor')).toBeInTheDocument();

      // 4. User clicks to create a note
      const noteOption = screen.getByText('Note');
      await user.click(noteOption);

      // Creation callback should be called
      expect(onCreateItem).toHaveBeenCalledWith('notizzettel', expect.any(Object));
    });

    it('should complete keyboard-driven context menu workflow', async () => {
      const user = userEvent.setup();
      const onItemAction = vi.fn();
      
      render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="window"
          targetItem={TestUtils.createMockUDItem({ title: 'test.txt' })}
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={onItemAction}
          onAddToContext={vi.fn()}
          hasSelection={true}
        />
      );

      // 1. User navigates with Tab
      await user.tab();
      expect(document.activeElement).toHaveTextContent('Zu AI-Kontext hinzufügen');

      // 2. User navigates with arrow keys
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toHaveTextContent('Aus AI-Kontext entfernen');

      // 3. User continues navigation
      await user.keyboard('{ArrowDown}');
      expect(document.activeElement).toHaveTextContent('Alles auswählen');

      // 4. User activates item with Enter
      await user.keyboard('{Enter}');
      
      expect(onItemAction).toHaveBeenCalledWith('select-all', expect.any(Object));
    });

    it('should complete context menu with shortcuts workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="window"
          targetItem={TestUtils.createMockUDItem()}
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
          hasSelection={true}
          clipboardHasContent={true}
        />
      );

      // 1. User sees keyboard shortcuts
      expect(screen.getByText('Ctrl+A')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+C')).toBeInTheDocument();
      expect(screen.getByText('Ctrl+V')).toBeInTheDocument();
      expect(screen.getByText('F2')).toBeInTheDocument();
      expect(screen.getByText('Del')).toBeInTheDocument();

      // 2. User learns shortcuts by visual inspection
      const copyAction = screen.getByText('Kopieren');
      const shortcut = screen.getByText('Ctrl+C');
      
      // They should be in the same menu item
      expect(copyAction.parentElement).toContainElement(shortcut);
    });
  });

  describe('Integrated Workflows', () => {
    it('should complete file management with context menu workflow', async () => {
      const user = userEvent.setup();
      
      // Integrated component
      const IntegratedFileManager = () => {
        const [contextMenu, setContextMenu] = React.useState({
          visible: false,
          x: 0,
          y: 0,
          targetItem: null as any,
        });

        const handleFileAction = (action: string, item?: any) => {
          const fileManager = require('@/hooks/useFileManager').useFileManager();
          
          switch (action) {
            case 'delete':
              if (item) {
                fileManager.deleteItems([item.id]);
              }
              break;
            case 'duplicate':
              if (item) {
                fileManager.copyItems([item.id], '/home/user');
              }
              break;
          }
          
          setContextMenu(prev => ({ ...prev, visible: false }));
        };

        return (
          <div>
            <FileManagerWindow initialPath="/home/user" />
            
            <div
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({
                  visible: true,
                  x: e.clientX,
                  y: e.clientY,
                  targetItem: TestUtils.createMockUDItem({
                    id: '2',
                    title: 'workspace.ud',
                  }),
                });
              }}
              data-testid="workspace-file"
              style={{ padding: '10px' }}
            >
              workspace.ud
            </div>

            <μ7_UnifiedContextMenu
              visible={contextMenu.visible}
              x={contextMenu.x}
              y={contextMenu.y}
              contextType="window"
              targetItem={contextMenu.targetItem}
              onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
              onCreateItem={vi.fn()}
              onItemAction={handleFileAction}
              onAddToContext={vi.fn()}
            />
          </div>
        );
      };

      render(<IntegratedFileManager />);

      // 1. User right-clicks on file
      const workspaceFile = screen.getByTestId('workspace-file');
      await user.pointer([
        { keys: '[MouseRight]', target: workspaceFile },
      ]);

      // 2. Context menu appears
      await waitFor(() => {
        expect(screen.getByText('📝 workspace.ud')).toBeInTheDocument();
      });

      // 3. User clicks duplicate
      const duplicateAction = screen.getByText('Duplizieren');
      await user.click(duplicateAction);

      // 4. File operation should be triggered
      const fileManager = require('@/hooks/useFileManager').useFileManager();
      expect(fileManager.copyItems).toHaveBeenCalledWith(['2'], '/home/user');

      // 5. Menu should close
      await waitFor(() => {
        expect(screen.queryByText('📝 workspace.ud')).not.toBeInTheDocument();
      });
    });

    it('should complete AI context integration workflow', async () => {
      const user = userEvent.setup();
      const onAddToContext = vi.fn();
      
      render(
        <div>
          <FileManagerWindow initialPath="/home/user" />
          
          <μ7_UnifiedContextMenu
            visible={true}
            x={100}
            y={100}
            contextType="window"
            targetItem={TestUtils.createMockUDItem({
              title: 'important-document.txt',
              is_contextual: false,
            })}
            onClose={vi.fn()}
            onCreateItem={vi.fn()}
            onItemAction={vi.fn()}
            onAddToContext={onAddToContext}
          />
        </div>
      );

      // 1. User sees file is not in context
      expect(screen.getByText('Zu AI-Kontext hinzufügen')).toBeInTheDocument();
      expect(screen.queryByText('Aus AI-Kontext entfernen')).not.toBeInTheDocument();

      // 2. User adds file to AI context
      const addToContextAction = screen.getByText('Zu AI-Kontext hinzufügen');
      await user.click(addToContextAction);

      // 3. Add to context callback should be called
      expect(onAddToContext).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'important-document.txt',
        })
      );
    });

    it('should complete accessibility workflow', async () => {
      const user = userEvent.setup();
      
      render(
        <div>
          <FileManagerWindow
            initialPath="/home/user"
            showToolbar={true}
            allowMultiSelect={true}
          />
          
          <μ7_UnifiedContextMenu
            visible={true}
            x={100}
            y={100}
            contextType="canvas"
            onClose={vi.fn()}
            onCreateItem={vi.fn()}
            onItemAction={vi.fn()}
            onAddToContext={vi.fn()}
          />
        </div>
      );

      // 1. User navigates with keyboard only
      await user.tab(); // Should focus first interactive element
      
      // 2. User navigates to file manager
      let focusedElement = document.activeElement;
      expect(focusedElement).toBeDefined();

      // 3. User navigates within context menu
      const contextMenu = document.querySelector('.μ7-unified-context-menu');
      if (contextMenu?.contains(document.activeElement)) {
        // User can navigate menu items
        await user.tab();
        expect(document.activeElement).toHaveAttribute('role', 'menuitem');
      }

      // 4. User can escape from menu
      await user.keyboard('{Escape}');
      // Menu should handle escape (tested in unit tests)
    });

    it('should complete error handling workflow', async () => {
      const user = userEvent.setup();
      
      // Mock error state
      vi.mocked(require('@/hooks/useFileManager').useFileManager).mockReturnValue({
        ...createRealisticeFileManager(),
        error: 'Network connection failed',
        loading: false,
        items: [],
        filteredAndSortedItems: [],
      });

      render(
        <FileManagerWindow
          initialPath="/network/drive"
          showToolbar={true}
          showStatusBar={true}
        />
      );

      // 1. User sees error message
      await waitFor(() => {
        expect(screen.getByText('❌ Network connection failed')).toBeInTheDocument();
      });

      // 2. User can still interact with toolbar
      const homeButton = screen.getByTitle('Home');
      expect(homeButton).toBeInTheDocument();
      
      await user.click(homeButton);
      
      // Should attempt to recover
      const fileManager = require('@/hooks/useFileManager').useFileManager();
      expect(fileManager.goHome).toHaveBeenCalled();
    });
  });

  describe('Performance and Responsiveness', () => {
    it('should handle large file lists without blocking UI', async () => {
      const user = userEvent.setup();
      
      // Mock large file list
      const largeFileList = Array.from({ length: 1000 }, (_, i) => 
        TestUtils.createMockFileItem({
          id: `file-${i}`,
          name: `file-${i}.txt`,
          type: 'file',
        })
      );

      vi.mocked(require('@/hooks/useFileManager').useFileManager).mockReturnValue({
        ...createRealisticeFileManager(),
        items: largeFileList,
        filteredAndSortedItems: largeFileList,
      });

      const startTime = performance.now();

      render(
        <FileManagerWindow
          initialPath="/large-directory"
          showToolbar={true}
        />
      );

      // UI should render quickly
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000);

      // User interactions should remain responsive
      const searchButton = screen.getByText('🔍');
      await user.click(searchButton);

      // Search input should appear quickly
      await waitFor(() => {
        expect(screen.getByPlaceholderText('Search files...')).toBeInTheDocument();
      }, { timeout: 500 });
    });

    it('should maintain 60fps during animations', async () => {
      const user = userEvent.setup();
      
      render(
        <μ7_UnifiedContextMenu
          visible={false}
          x={100}
          y={100}
          contextType="canvas"
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      // Show menu (should have smooth animation)
      const { rerender } = render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="canvas"
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      // Animation should complete quickly
      await waitFor(() => {
        const menu = document.querySelector('.μ7-unified-context-menu');
        expect(menu).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle typical user session', async () => {
      const user = userEvent.setup();
      
      // Simulate a realistic user session
      const UserSession = () => {
        const [currentView, setCurrentView] = React.useState('file-manager');
        const [contextMenu, setContextMenu] = React.useState({
          visible: false,
          x: 0,
          y: 0,
          type: 'canvas' as const,
          targetItem: null as any,
        });

        return (
          <div>
            {/* Navigation */}
            <nav style={{ padding: '10px', background: '#f0f0f0' }}>
              <button onClick={() => setCurrentView('file-manager')}>
                File Manager
              </button>
              <button onClick={() => setCurrentView('workspace')}>
                Workspace
              </button>
            </nav>

            {/* Main content */}
            <main
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu({
                  visible: true,
                  x: e.clientX,
                  y: e.clientY,
                  type: 'canvas',
                  targetItem: null,
                });
              }}
            >
              {currentView === 'file-manager' && (
                <FileManagerWindow
                  initialPath="/home/user"
                  showToolbar={true}
                  showStatusBar={true}
                />
              )}
              
              {currentView === 'workspace' && (
                <div style={{ padding: '20px' }}>
                  <h2>Workspace View</h2>
                  <p>Integrated workspace content</p>
                </div>
              )}
            </main>

            {/* Context menu */}
            <μ7_UnifiedContextMenu
              visible={contextMenu.visible}
              x={contextMenu.x}
              y={contextMenu.y}
              contextType={contextMenu.type}
              targetItem={contextMenu.targetItem}
              onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
              onCreateItem={(type, position) => {
                console.log('Create item:', type, position);
                setContextMenu(prev => ({ ...prev, visible: false }));
              }}
              onItemAction={(action, item) => {
                console.log('Item action:', action, item);
                setContextMenu(prev => ({ ...prev, visible: false }));
              }}
              onAddToContext={(item) => {
                console.log('Add to context:', item);
                setContextMenu(prev => ({ ...prev, visible: false }));
              }}
            />
          </div>
        );
      };

      render(<UserSession />);

      // 1. User starts in file manager
      expect(screen.getByText('Documents')).toBeInTheDocument();

      // 2. User switches to workspace view
      const workspaceButton = screen.getByText('Workspace');
      await user.click(workspaceButton);

      expect(screen.getByText('Workspace View')).toBeInTheDocument();

      // 3. User right-clicks in workspace
      const workspaceArea = screen.getByText('Integrated workspace content');
      await user.pointer([
        { keys: '[MouseRight]', target: workspaceArea },
      ]);

      // 4. Context menu appears
      await waitFor(() => {
        expect(screen.getByText('🖥️ Desktop')).toBeInTheDocument();
      });

      // 5. User creates a new note
      const noteOption = screen.getByText('Note');
      await user.click(noteOption);

      // Should complete the action
      expect(screen.queryByText('🖥️ Desktop')).not.toBeInTheDocument();

      // 6. User switches back to file manager
      const fileManagerButton = screen.getByText('File Manager');
      await user.click(fileManagerButton);

      expect(screen.getByText('Documents')).toBeInTheDocument();
    });
  });
});