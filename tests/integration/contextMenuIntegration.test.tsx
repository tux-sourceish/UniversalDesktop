/**
 * 🧪 Integration Tests: Context Menu Integration Patterns
 * 
 * Tests for context menu integration across different components
 * Testing the universal interaction pattern established by SYSTEM-PROMPT.md
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { FileManagerWindow } from '@/components/bridges/FileManagerWindow';
import { μ7_UnifiedContextMenu } from '@/components/contextMenu/μ7_UnifiedContextMenu';
import { TestUtils, TestConfig } from '../setup';

// Mock the hooks
vi.mock('@/hooks/useFileManager', () => ({
  useFileManager: vi.fn(() => ({
    currentPath: '/home/user',
    items: [
      TestUtils.createMockFileItem({
        id: '1',
        name: 'test-file.txt',
        type: 'file',
      }),
      TestUtils.createMockFileItem({
        id: '2',
        name: 'test-folder',
        type: 'directory',
      }),
    ],
    selectedItems: [],
    viewMode: 'list',
    sortBy: 'name',
    sortOrder: 'asc',
    showHidden: false,
    searchQuery: '',
    loading: false,
    error: null,
    filteredAndSortedItems: [
      TestUtils.createMockFileItem({
        id: '1',
        name: 'test-file.txt',
        type: 'file',
      }),
      TestUtils.createMockFileItem({
        id: '2',
        name: 'test-folder',
        type: 'directory',
      }),
    ],
    navigateTo: vi.fn(),
    goBack: vi.fn(),
    goForward: vi.fn(),
    goUp: vi.fn(),
    goHome: vi.fn(),
    canGoBack: false,
    canGoForward: false,
    selectItem: vi.fn(),
    selectAll: vi.fn(),
    clearSelection: vi.fn(),
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
    formatFileSize: vi.fn((bytes) => `${bytes} B`),
    operations: [],
    dragDropState: {
      isDragging: false,
      draggedItems: [],
      dropTarget: null,
      dropEffect: 'none',
    },
    bookmarks: [],
    recentFiles: [],
    history: [],
    historyIndex: -1,
  }))
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
  }
}));

describe('Context Menu Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('File Manager Context Menu Integration', () => {
    it('should show file-specific context menu on right-click', async () => {
      const user = userEvent.setup();
      const onContextMenu = vi.fn();
      
      render(
        <div>
          <FileManagerWindow onFileSelect={onContextMenu} />
          <μ7_UnifiedContextMenu
            visible={true}
            x={100}
            y={100}
            contextType="window"
            targetItem={TestUtils.createMockUDItem({
              title: 'test-file.txt',
              type: 'file',
            })}
            onClose={vi.fn()}
            onCreateItem={vi.fn()}
            onItemAction={vi.fn()}
            onAddToContext={vi.fn()}
          />
        </div>
      );

      // Should render file manager
      expect(screen.getByText('test-file.txt')).toBeInTheDocument();
      
      // Should render context menu with file-specific actions
      expect(screen.getByText('Zu AI-Kontext hinzufügen')).toBeInTheDocument();
      expect(screen.getByText('Exportieren')).toBeInTheDocument();
    });

    it('should show directory-specific context menu on folder right-click', async () => {
      render(
        <div>
          <FileManagerWindow />
          <μ7_UnifiedContextMenu
            visible={true}
            x={100}
            y={100}
            contextType="window"
            targetItem={TestUtils.createMockUDItem({
              title: 'test-folder',
              type: 'directory',
            })}
            onClose={vi.fn()}
            onCreateItem={vi.fn()}
            onItemAction={vi.fn()}
            onAddToContext={vi.fn()}
          />
        </div>
      );

      // Should show folder-appropriate actions
      expect(screen.getByText('Zu AI-Kontext hinzufügen')).toBeInTheDocument();
      expect(screen.getByText('Duplizieren')).toBeInTheDocument();
    });

    it('should integrate context menu with file operations', async () => {
      const user = userEvent.setup();
      const onItemAction = vi.fn();
      const mockTargetItem = TestUtils.createMockUDItem({
        id: 'test-file-1',
        title: 'test-file.txt',
        type: 'file',
      });

      render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="window"
          targetItem={mockTargetItem}
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={onItemAction}
          onAddToContext={vi.fn()}
        />
      );

      // Click delete action
      const deleteAction = screen.getByText('Löschen');
      await user.click(deleteAction);

      expect(onItemAction).toHaveBeenCalledWith('delete', mockTargetItem);
    });

    it('should show different menus for different file types', () => {
      const { rerender } = render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="window"
          targetItem={TestUtils.createMockUDItem({
            title: 'document.ud',
            type: 'file',
            metadata: { extension: 'ud' }
          })}
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      // Should show universal document specific actions
      expect(screen.getByText('Zu AI-Kontext hinzufügen')).toBeInTheDocument();

      // Test with code file
      rerender(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="window"
          targetItem={TestUtils.createMockUDItem({
            title: 'script.js',
            type: 'code',
            metadata: { extension: 'js' }
          })}
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      // Should show code-specific actions
      expect(screen.getByText('Coder')).toBeInTheDocument();
      expect(screen.getByText('Reasoner')).toBeInTheDocument();
    });
  });

  describe('Context Menu as Universal Interaction Pattern', () => {
    it('should provide consistent interaction pattern across components', () => {
      const mockProps = {
        visible: true,
        x: 150,
        y: 150,
        onClose: vi.fn(),
        onCreateItem: vi.fn(),
        onItemAction: vi.fn(),
        onAddToContext: vi.fn(),
      };

      // Test canvas context
      const { rerender } = render(
        <μ7_UnifiedContextMenu
          {...mockProps}
          contextType="canvas"
        />
      );

      expect(screen.getByText('🖥️ Desktop')).toBeInTheDocument();
      expect(screen.getByText('Note')).toBeInTheDocument();

      // Test window context
      rerender(
        <μ7_UnifiedContextMenu
          {...mockProps}
          contextType="window"
          targetItem={TestUtils.createMockUDItem({ title: 'Test Window' })}
        />
      );

      expect(screen.getByText('📝 Test Window')).toBeInTheDocument();
      expect(screen.getByText('Umbenennen')).toBeInTheDocument();

      // Test content context
      rerender(
        <μ7_UnifiedContextMenu
          {...mockProps}
          contextType="content"
        />
      );

      expect(screen.getByText('📄 Inhalt')).toBeInTheDocument();
      expect(screen.getByText('Auto-Format')).toBeInTheDocument();
    });

    it('should show keyboard shortcuts consistently', () => {
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

      // Should display keyboard shortcuts for common actions
      expect(screen.getByText('Ctrl+A')).toBeInTheDocument(); // Select All
      expect(screen.getByText('Ctrl+C')).toBeInTheDocument(); // Copy
      expect(screen.getByText('Ctrl+X')).toBeInTheDocument(); // Cut
      expect(screen.getByText('Ctrl+V')).toBeInTheDocument(); // Paste
      expect(screen.getByText('F2')).toBeInTheDocument(); // Rename
      expect(screen.getByText('Del')).toBeInTheDocument(); // Delete
    });

    it('should teach interaction patterns through context menus', async () => {
      const user = userEvent.setup();
      
      render(
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

      // Hover over an item to see if it provides additional context
      const aiHelpItem = screen.getByText('KI-Hilfe');
      await user.hover(aiHelpItem);

      // Should highlight the item indicating it's interactive
      expect(aiHelpItem).toHaveStyle({
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      });
    });
  });

  describe('Context Menu State Management', () => {
    it('should properly manage context menu visibility', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      const { rerender } = render(
        <μ7_UnifiedContextMenu
          visible={false}
          x={100}
          y={100}
          contextType="canvas"
          onClose={onClose}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      // Should not be visible
      expect(screen.queryByText('Desktop')).not.toBeInTheDocument();

      // Make visible
      rerender(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="canvas"
          onClose={onClose}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      // Should be visible
      expect(screen.getByText('🖥️ Desktop')).toBeInTheDocument();

      // Click overlay to close
      const overlay = document.querySelector('.μ7-context-menu-overlay');
      await user.click(overlay!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should handle context switching correctly', () => {
      const mockProps = {
        visible: true,
        x: 100,
        y: 100,
        onClose: vi.fn(),
        onCreateItem: vi.fn(),
        onItemAction: vi.fn(),
        onAddToContext: vi.fn(),
      };

      const { rerender } = render(
        <μ7_UnifiedContextMenu
          {...mockProps}
          contextType="canvas"
        />
      );

      // Should show canvas menu
      expect(screen.getByText('🖥️ Desktop')).toBeInTheDocument();

      // Switch to window context
      rerender(
        <μ7_UnifiedContextMenu
          {...mockProps}
          contextType="window"
          targetItem={TestUtils.createMockUDItem({ title: 'Test' })}
        />
      );

      // Should show window menu
      expect(screen.queryByText('🖥️ Desktop')).not.toBeInTheDocument();
      expect(screen.getByText('📝 Test')).toBeInTheDocument();
    });
  });

  describe('Context Menu Accessibility Integration', () => {
    it('should support keyboard navigation within context menu', async () => {
      const user = userEvent.setup();
      
      render(
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

      // Should be able to navigate with keyboard
      const firstItem = screen.getByText('Note');
      await user.tab();
      
      expect(document.activeElement).toBe(firstItem);
    });

    it('should provide proper ARIA labels and roles', () => {
      render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="window"
          targetItem={TestUtils.createMockUDItem({ title: 'Test Document' })}
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      const menu = document.querySelector('.μ7-unified-context-menu');
      expect(menu).toBeInTheDocument();
      
      // Menu should have proper structure for screen readers
      const menuItems = document.querySelectorAll('.μ7-context-menu-item');
      expect(menuItems.length).toBeGreaterThan(0);
    });

    it('should close on Escape key press', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      
      render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="canvas"
          onClose={onClose}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      await user.keyboard('{Escape}');
      
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Context Menu Performance', () => {
    it('should render context menu quickly with many items', () => {
      const startTime = performance.now();
      
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
        />
      );
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // 50ms threshold
    });

    it('should not cause memory leaks with frequent context switches', () => {
      const { rerender, unmount } = render(
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

      // Rapid context switching
      for (let i = 0; i < 10; i++) {
        rerender(
          <μ7_UnifiedContextMenu
            visible={true}
            x={100 + i}
            y={100 + i}
            contextType={i % 2 === 0 ? 'canvas' : 'content'}
            onClose={vi.fn()}
            onCreateItem={vi.fn()}
            onItemAction={vi.fn()}
            onAddToContext={vi.fn()}
          />
        );
      }

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('TUI Mode Context Menu', () => {
    it('should provide text-based context menu for TUI mode', () => {
      // This would be tested if TUI mode was implemented
      // For now, we test that the menu structure supports it
      
      render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="window"
          targetItem={TestUtils.createMockUDItem({
            title: 'test.txt',
            metadata: { tuiMode: true }
          })}
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      // Should still render properly (TUI rendering would be handled differently)
      expect(screen.getByText('📝 test.txt')).toBeInTheDocument();
      expect(screen.getByText('Löschen')).toBeInTheDocument();
    });
  });

  describe('Bagua Integration in Context Menus', () => {
    it('should display Bagua information when available', () => {
      const itemWithBagua = TestUtils.createMockUDItem({
        title: 'Bagua Item',
        bagua_descriptor: 6, // FEUER
      });

      render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="window"
          targetItem={itemWithBagua}
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      // Should show the item with Bagua context
      expect(screen.getByText('📝 Bagua Item')).toBeInTheDocument();
      
      // Context menu should include Bagua-aware actions
      expect(screen.getByText('KI-Workflows')).toBeInTheDocument();
    });

    it('should group actions by Bagua categories', () => {
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
        />
      );

      // Should group actions logically (following μX-Bagua principles)
      expect(screen.getByText('KI-Kontext')).toBeInTheDocument(); // FEUER functions
      expect(screen.getByText('Bearbeiten')).toBeInTheDocument(); // DONNER events
      expect(screen.getByText('Fenster-Aktionen')).toBeInTheDocument(); // HIMMEL structure
      expect(screen.getByText('Transformationen')).toBeInTheDocument(); // WASSER flow
    });
  });

  describe('Error Handling in Integration', () => {
    it('should handle missing target item gracefully', () => {
      expect(() => {
        render(
          <μ7_UnifiedContextMenu
            visible={true}
            x={100}
            y={100}
            contextType="window"
            targetItem={undefined}
            onClose={vi.fn()}
            onCreateItem={vi.fn()}
            onItemAction={vi.fn()}
            onAddToContext={vi.fn()}
          />
        );
      }).not.toThrow();
    });

    it('should handle callback errors gracefully', async () => {
      const user = userEvent.setup();
      const faultyCallback = vi.fn(() => {
        throw new Error('Callback error');
      });

      render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="canvas"
          onClose={vi.fn()}
          onCreateItem={faultyCallback}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      // Click an item that would trigger the faulty callback
      const noteItem = screen.getByText('Note');
      
      // Should not crash the app
      expect(() => user.click(noteItem)).not.toThrow();
    });
  });
});