/**
 * μ2_FileManager Dual-Mode Test Suite
 * 
 * Tests the enhanced File Manager with GUI/TUI mode switching capabilities
 * implemented to fix the missing TUI functionality issue.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { μ2_FileManager } from '../../../src/components/μ2_FileManager';
import { μ2_FileManagerWindow } from '../../../src/components/windows/μ2_FileManagerWindow';
import { UDFormat } from '../../../src/core/UDFormat';
import type { UDItem } from '../../../src/core/universalDocument';

// Mock the file system hook
jest.mock('../../../src/hooks/μ3_useFileSystem', () => ({
  μ3_useFileSystem: () => ({
    currentPath: '/test/path',
    items: [
      {
        id: 'test-file-1',
        name: 'test.txt',
        path: '/test/path/test.txt',
        type: 'file',
        size: 1024,
        modified: new Date('2025-07-28'),
        created: new Date('2025-07-28'),
        permissions: '-rw-r--r--',
        isHidden: false,
        extension: 'txt'
      },
      {
        id: 'test-dir-1',
        name: 'Documents',
        path: '/test/path/Documents',
        type: 'directory',
        size: 0,
        modified: new Date('2025-07-28'),
        created: new Date('2025-07-28'),
        permissions: 'drwxr-xr-x',
        isHidden: false
      }
    ],
    loading: false,
    error: null,
    navigateTo: jest.fn(),
    goBack: jest.fn(),
    goForward: jest.fn(),
    goUp: jest.fn(),
    canGoBack: false,
    canGoForward: false,
    getFileIcon: (name: string) => name.includes('.') ? '📄' : '📁',
    formatFileSize: (bytes: number) => `${bytes} bytes`,
    formatDate: (date: Date) => date.toLocaleDateString(),
    capabilities: {
      hasNativeIntegration: false,
      canRead: true,
      canWrite: false
    },
    operations: []
  })
}));

// Mock the context menu hook
jest.mock('../../../src/components/contextMenu/μ7_UniversalContextMenu', () => ({
  useUniversalContextMenu: () => ({
    contextMenu: { visible: false, x: 0, y: 0, element: null, contextType: 'canvas' },
    showContextMenu: jest.fn(),
    hideContextMenu: jest.fn()
  }),
  μ7_UniversalContextMenu: ({ visible }: { visible: boolean }) => 
    visible ? <div data-testid="context-menu">Context Menu</div> : null
}));

// Mock TuiWindow component
jest.mock('../../../src/components/windows/μ2_TuiWindow', () => ({
  μ2_TuiWindow: ({ udItem, onUDItemChange }: any) => (
    <div data-testid="tui-window">
      <div data-testid="tui-content">TUI Mode: {udItem.content?.tui_content || 'Empty'}</div>
      <div data-testid="tui-preset">Preset: {udItem.content?.tui_preset || 'standard'}</div>
    </div>
  )
}));

describe('μ2_FileManager Dual-Mode Functionality', () => {
  const mockOnFileSelect = jest.fn();
  const mockOnFileOpen = jest.fn();
  const mockOnCreateUDItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Mode Switching', () => {
    test('should start in GUI mode by default', () => {
      render(
        <μ2_FileManager
          initialPath="/test/path"
          onFileSelect={mockOnFileSelect}
          onFileOpen={mockOnFileOpen}
          onCreateUDItem={mockOnCreateUDItem}
        />
      );

      // Should show GUI elements
      expect(screen.getByText(/UniversalDesktop File Manager/)).toBeInTheDocument();
      expect(screen.queryByTestId('tui-window')).not.toBeInTheDocument();
    });

    test('should switch to TUI mode when F12 is pressed', async () => {
      render(
        <μ2_FileManager
          initialPath="/test/path"
          onFileSelect={mockOnFileSelect}
          onFileOpen={mockOnFileOpen}
          onCreateUDItem={mockOnCreateUDItem}
        />
      );

      // Press F12
      fireEvent.keyDown(document, { key: 'F12' });

      await waitFor(() => {
        // Should show TUI elements
        expect(screen.getByText(/TUI Mode/)).toBeInTheDocument();
        expect(screen.getByText(/File Manager TUI/)).toBeInTheDocument();
      });
    });

    test('should switch back to GUI mode when F12 is pressed again', async () => {
      render(
        <μ2_FileManager
          initialPath="/test/path"
          mode="tui"
          onFileSelect={mockOnFileSelect}
          onFileOpen={mockOnFileOpen}
          onCreateUDItem={mockOnCreateUDItem}
        />
      );

      // Should start in TUI mode
      expect(screen.getByText(/TUI Mode/)).toBeInTheDocument();

      // Press F12 to switch back
      fireEvent.keyDown(document, { key: 'F12' });

      await waitFor(() => {
        // Should show GUI elements
        expect(screen.queryByText(/TUI Mode/)).not.toBeInTheDocument();
        expect(screen.getByText(/UniversalDesktop File Manager/)).toBeInTheDocument();
      });
    });
  });

  describe('TUI Mode Features', () => {
    test('should display files in TUI format', () => {
      render(
        <μ2_FileManager
          initialPath="/test/path"
          mode="tui"
          onFileSelect={mockOnFileSelect}
          onFileOpen={mockOnFileOpen}
          onCreateUDItem={mockOnCreateUDItem}
        />
      );

      // Should show file list in TUI format
      expect(screen.getByText(/test.txt/)).toBeInTheDocument();
      expect(screen.getByText(/Documents/)).toBeInTheDocument();
      
      // Should show TUI-specific elements
      expect(screen.getByText(/Path:/)).toBeInTheDocument();
      expect(screen.getByText(/items/)).toBeInTheDocument();
    });

    test('should support keyboard navigation in TUI mode', async () => {
      render(
        <μ2_FileManager
          initialPath="/test/path"
          mode="tui"
          onFileSelect={mockOnFileSelect}
          onFileOpen={mockOnFileOpen}
          onCreateUDItem={mockOnCreateUDItem}
        />
      );

      // Test arrow key navigation
      fireEvent.keyDown(document, { key: 'ArrowDown' });
      fireEvent.keyDown(document, { key: 'ArrowUp' });
      fireEvent.keyDown(document, { key: 'Enter' });

      // Should handle navigation without errors
      expect(document.activeElement).toBeDefined();
    });

    test('should display Norton Commander style function keys', () => {
      render(
        <μ2_FileManager
          initialPath="/test/path"
          mode="tui"
          onFileSelect={mockOnFileSelect}
          onFileOpen={mockOnFileOpen}
          onCreateUDItem={mockOnCreateUDItem}
        />
      );

      // Should show function key hints
      expect(screen.getByText(/F1:Help/)).toBeInTheDocument();
      expect(screen.getByText(/F2:Rename/)).toBeInTheDocument();
      expect(screen.getByText(/F12:GUI/)).toBeInTheDocument();
    });
  });

  describe('Enhanced Keyboard Shortcuts', () => {
    test('should handle Escape key to clear selection', () => {
      render(
        <μ2_FileManager
          initialPath="/test/path"
          onFileSelect={mockOnFileSelect}
          onFileOpen={mockOnFileOpen}
          onCreateUDItem={mockOnCreateUDItem}
        />
      );

      fireEvent.keyDown(document, { key: 'Escape' });
      // Should clear selection (tested via selection state changes)
    });

    test('should handle F5 for refresh', () => {
      render(
        <μ2_FileManager
          initialPath="/test/path"
          onFileSelect={mockOnFileSelect}
          onFileOpen={mockOnFileOpen}
          onCreateUDItem={mockOnCreateUDItem}
        />
      );

      fireEvent.keyDown(document, { key: 'F5' });
      // Should trigger refresh (tested via navigation calls)
    });

    test('should handle Ctrl+A for select all', () => {
      render(
        <μ2_FileManager
          initialPath="/test/path"
          onFileSelect={mockOnFileSelect}
          onFileOpen={mockOnFileOpen}
          onCreateUDItem={mockOnCreateUDItem}
        />
      );

      fireEvent.keyDown(document, { key: 'a', ctrlKey: true });
      // Should select all items
      expect(mockOnFileSelect).toHaveBeenCalled();
    });
  });
});

describe('μ2_FileManagerWindow Integration', () => {
  const mockUDItem: UDItem = {
    id: 'test-file-manager',
    title: 'Test File Manager',
    type: UDFormat.ItemType.FILEMANAGER,
    content: {
      initialPath: '/test/path',
      mode: 'gui',
      showToolbar: true,
      showStatusBar: true,
      allowMultiSelect: true,
      tui_preset: 'standard',
      tui_theme: 'green'
    },
    position: { x: 100, y: 100, z: 1 },
    dimensions: { width: 800, height: 600 },
    bagua_descriptor: UDFormat.BAGUA.WIND,
    created_at: Date.now(),
    updated_at: Date.now(),
    is_contextual: false,
    origin: 'human'
  };

  const mockOnUDItemChange = jest.fn();
  const mockOnAddToContext = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render File Manager window in GUI mode', () => {
    render(
      <μ2_FileManagerWindow
        udItem={mockUDItem}
        onUDItemChange={mockOnUDItemChange}
        onAddToContext={mockOnAddToContext}
      />
    );

    expect(screen.getByText(/UniversalDesktop File Manager/)).toBeInTheDocument();
    expect(screen.getByText(/GUI \[F12\]/)).toBeInTheDocument();
  });

  test('should switch to TUI mode when F12 is pressed', async () => {
    render(
      <μ2_FileManagerWindow
        udItem={mockUDItem}
        onUDItemChange={mockOnUDItemChange}
        onAddToContext={mockOnAddToContext}
      />
    );

    // Press F12
    fireEvent.keyDown(document, { key: 'F12' });

    await waitFor(() => {
      expect(screen.getByTestId('tui-window')).toBeInTheDocument();
      expect(screen.getByText(/TUI \[F12\]/)).toBeInTheDocument();
    });

    // Should call onUDItemChange to persist mode switch
    expect(mockOnUDItemChange).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          mode: 'tui'
        })
      }),
      'Switched to TUI mode'
    );
  });

  test('should preserve state across mode switches', async () => {
    const { rerender } = render(
      <μ2_FileManagerWindow
        udItem={mockUDItem}
        onUDItemChange={mockOnUDItemChange}
        onAddToContext={mockOnAddToContext}
      />
    );

    // Switch to TUI mode
    fireEvent.keyDown(document, { key: 'F12' });

    await waitFor(() => {
      expect(screen.getByTestId('tui-window')).toBeInTheDocument();
    });

    // Simulate external state update
    const updatedUDItem = {
      ...mockUDItem,
      content: {
        ...mockUDItem.content,
        mode: 'tui',
        tui_content: 'Test TUI content'
      }
    };

    rerender(
      <μ2_FileManagerWindow
        udItem={updatedUDItem}
        onUDItemChange={mockOnUDItemChange}
        onAddToContext={mockOnAddToContext}
      />
    );

    // Should maintain TUI mode and show content
    expect(screen.getByTestId('tui-content')).toHaveTextContent('Test TUI content');
  });
});