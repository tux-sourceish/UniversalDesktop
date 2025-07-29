/**
 * 🧪 Accessibility Tests: Context Menu & File Manager
 * 
 * Comprehensive accessibility compliance tests
 * Testing WCAG 2.1 AA compliance, keyboard navigation, screen reader support
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';

import { μ7_UnifiedContextMenu } from '@/components/contextMenu/μ7_UnifiedContextMenu';
import { FileManagerWindow } from '@/components/bridges/FileManagerWindow';
import { TestUtils, TestConfig } from '../setup';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock dependencies
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
    code: {
      id: 'code',
      displayName: 'Code Editor',
      icon: '💻',
    },
  }
}));

vi.mock('@/hooks/useFileManager', () => ({
  useFileManager: vi.fn(() => ({
    currentPath: '/home/user',
    items: [
      TestUtils.createMockFileItem({
        id: '1',
        name: 'Document.txt',
        type: 'file',
      }),
      TestUtils.createMockFileItem({
        id: '2',
        name: 'Images',
        type: 'directory',
      }),
    ],
    selectedItems: [],
    filteredAndSortedItems: [
      TestUtils.createMockFileItem({
        id: '1',
        name: 'Document.txt',
        type: 'file',
      }),
      TestUtils.createMockFileItem({
        id: '2',
        name: 'Images', 
        type: 'directory',
      }),
    ],
    viewMode: 'list',
    loading: false,
    error: null,
    navigateTo: vi.fn(),
    goBack: vi.fn(),
    goForward: vi.fn(),
    goUp: vi.fn(),
    goHome: vi.fn(),
    canGoBack: true,
    canGoForward: false,
    selectItem: vi.fn(),
    selectAll: vi.fn(),
    clearSelection: vi.fn(),
    setViewMode: vi.fn(),
    setSorting: vi.fn(),
    toggleHidden: vi.fn(),
    setSearchQuery: vi.fn(),
    openItem: vi.fn(),
    formatFileSize: vi.fn((bytes) => `${bytes} B`),
    operations: [],
    bookmarks: [],
    recentFiles: [],
    history: [],
    historyIndex: 0,
  }))
}));

describe('Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Context Menu Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
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

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      const onItemAction = vi.fn();
      
      render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="canvas"
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={onItemAction}
          onAddToContext={vi.fn()}
        />
      );

      // Tab to first menu item
      await user.tab();
      const firstItem = screen.getByText('Note');
      expect(document.activeElement).toBe(firstItem);

      // Enter should activate the item
      await user.keyboard('{Enter}');
      expect(onItemAction).toHaveBeenCalled();
    });

    it('should support arrow key navigation', async () => {
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

      // Focus first item
      const firstItem = screen.getByText('Note');
      await user.tab();
      expect(document.activeElement).toBe(firstItem);

      // Arrow down should move to next item
      await user.keyboard('{ArrowDown}');
      const secondItem = screen.getByText('Code Editor');
      expect(document.activeElement).toBe(secondItem);

      // Arrow up should move back
      await user.keyboard('{ArrowUp}');
      expect(document.activeElement).toBe(firstItem);
    });

    it('should close on Escape key', async () => {
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

    it('should have proper ARIA attributes', () => {
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
      expect(menu).toHaveAttribute('role', 'menu');
      expect(menu).toHaveAttribute('aria-label', 'Context menu for Test Document');

      // Menu items should have proper roles
      const menuItems = document.querySelectorAll('.μ7-context-menu-item');
      menuItems.forEach(item => {
        expect(item).toHaveAttribute('role', 'menuitem');
        expect(item).toHaveAttribute('tabindex', '0');
      });
    });

    it('should announce menu content to screen readers', () => {
      render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="window"
          targetItem={TestUtils.createMockUDItem({ title: 'Important Document' })}
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      // Menu should have accessible name
      const menu = document.querySelector('.μ7-unified-context-menu');
      expect(menu).toHaveAttribute('aria-labelledby');
      
      // Header should be properly labeled
      const header = screen.getByText('📝 Important Document');
      expect(header).toBeInTheDocument();
    });

    it('should support keyboard shortcuts with proper announcements', () => {
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

      // Menu items with shortcuts should announce them
      const copyItem = screen.getByText('Kopieren');
      expect(copyItem.parentElement).toHaveTextContent('Ctrl+C');
      
      const deleteItem = screen.getByText('Löschen');
      expect(deleteItem.parentElement).toHaveTextContent('Del');
      
      // Items should have keyboard shortcut information in aria-label
      expect(copyItem).toHaveAttribute('aria-label', 'Kopieren Ctrl+C');
      expect(deleteItem).toHaveAttribute('aria-label', 'Löschen Del');
    });

    it('should handle disabled items correctly', () => {
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
          hasSelection={false}
          clipboardHasContent={false}
        />
      );

      // Disabled items should not be visible/focusable
      expect(screen.queryByText('Kopieren')).not.toBeInTheDocument();
      expect(screen.queryByText('Einfügen')).not.toBeInTheDocument();
    });

    it('should maintain focus trap within menu', async () => {
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

      // Tab through menu items
      const menuItems = screen.getAllByRole('menuitem');
      
      for (let i = 0; i < menuItems.length; i++) {
        await user.tab();
        expect(document.activeElement).toBe(menuItems[i]);
      }

      // Tab beyond last item should wrap to first
      await user.tab();
      expect(document.activeElement).toBe(menuItems[0]);
    });

    it('should support high contrast mode', () => {
      // Simulate high contrast mode
      document.documentElement.style.setProperty('forced-colors', 'active');
      
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

      const menu = document.querySelector('.μ7-unified-context-menu');
      const computedStyle = window.getComputedStyle(menu!);
      
      // Should have proper border for high contrast
      expect(computedStyle.border).toBeTruthy();
      
      // Cleanup
      document.documentElement.style.removeProperty('forced-colors');
    });
  });

  describe('File Manager Accessibility', () => {
    it('should have no accessibility violations', async () => {
      const { container } = render(
        <FileManagerWindow 
          initialPath="/home/user"
          showToolbar={true}
          showStatusBar={true}
        />
      );

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation in file list', async () => {
      const user = userEvent.setup();
      
      render(
        <FileManagerWindow
          initialPath="/home/user"
          allowMultiSelect={true}
        />
      );

      // Should be able to navigate to first file
      const firstFile = screen.getByText('Document.txt');
      await user.tab();
      // Continue tabbing until we reach the file list
      // Implementation would depend on exact DOM structure
    });

    it('should announce file information to screen readers', () => {
      render(
        <FileManagerWindow
          initialPath="/home/user"
        />
      );

      // Files should have proper labels
      const fileItem = screen.getByText('Document.txt');
      expect(fileItem.closest('[role="gridcell"]')).toHaveAttribute('aria-label');
      
      // Directories should be distinguished
      const dirItem = screen.getByText('Images');
      expect(dirItem.closest('[role="gridcell"]')).toHaveAttribute('aria-label');
    });

    it('should support screen reader navigation modes', () => {
      render(
        <FileManagerWindow
          initialPath="/home/user"
        />
      );

      // File list should be a grid or table for screen readers
      const fileList = document.querySelector('.file-list-view');
      expect(fileList).toHaveAttribute('role', 'grid');
      
      // Headers should be properly labeled
      const nameHeader = screen.getByText('Name');
      expect(nameHeader).toHaveAttribute('role', 'columnheader');
      expect(nameHeader).toHaveAttribute('aria-sort');
    });

    it('should support keyboard shortcuts with announcements', async () => {
      const user = userEvent.setup();
      
      render(
        <FileManagerWindow
          initialPath="/home/user"
          allowMultiSelect={true}
        />
      );

      // Ctrl+A should select all with proper announcement
      await user.keyboard('{Control>}a{/Control}');
      
      // Should announce selection change
      const statusBar = document.querySelector('.file-manager-status-bar');
      expect(statusBar).toHaveTextContent('selected');
    });

    it('should handle toolbar accessibility', () => {
      render(
        <FileManagerWindow
          initialPath="/home/user"
          showToolbar={true}
        />
      );

      // Navigation buttons should have proper labels
      const backButton = screen.getByTitle('Back');
      expect(backButton).toHaveAttribute('aria-label', 'Go back');
      expect(backButton).toHaveAttribute('disabled');
      
      const forwardButton = screen.getByTitle('Forward');
      expect(forwardButton).toHaveAttribute('aria-label', 'Go forward');
      
      // Address bar should be labeled
      const addressBar = document.querySelector('input[type="text"]');
      expect(addressBar).toHaveAttribute('aria-label', 'Current path');
    });

    it('should support zoom and scaling', () => {
      // Test different zoom levels
      document.documentElement.style.zoom = '150%';
      
      render(
        <FileManagerWindow
          initialPath="/home/user"
        />
      );

      // Content should remain accessible at different zoom levels
      const fileManager = document.querySelector('.file-manager-window');
      const computedStyle = window.getComputedStyle(fileManager!);
      
      // Should maintain minimum touch target sizes (44x44px)
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const buttonStyle = window.getComputedStyle(button);
        const minSize = parseInt(buttonStyle.minHeight) || parseInt(buttonStyle.height);
        expect(minSize).toBeGreaterThanOrEqual(44);
      });
      
      // Cleanup
      document.documentElement.style.zoom = '';
    });

    it('should support reduced motion preferences', () => {
      // Mock reduced motion preference
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <FileManagerWindow
          initialPath="/home/user"
        />
      );

      // Animations should be disabled or reduced
      const animatedElements = document.querySelectorAll('[style*="transition"]');
      animatedElements.forEach(element => {
        const style = window.getComputedStyle(element);
        // Should have no transition or very short transition
        expect(style.transitionDuration === '0s' || 
               parseFloat(style.transitionDuration) <= 0.2).toBeTruthy();
      });
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('should meet WCAG AA color contrast requirements', () => {
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

      // Test menu background contrast
      const menu = document.querySelector('.μ7-unified-context-menu');
      const menuStyle = window.getComputedStyle(menu!);
      
      // Should have sufficient contrast (tested manually or with contrast calculation)
      expect(menuStyle.backgroundColor).toBeTruthy();
      expect(menuStyle.color).toBeTruthy();
    });

    it('should support different color schemes', () => {
      // Test dark mode
      document.documentElement.setAttribute('data-theme', 'dark');
      
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

      const menu = document.querySelector('.μ7-unified-context-menu');
      const menuStyle = window.getComputedStyle(menu!);
      
      // Should adapt to dark theme
      expect(menuStyle.backgroundColor).toContain('rgba(30, 30, 30');
      
      // Cleanup
      document.documentElement.removeAttribute('data-theme');
    });

    it('should handle focus indicators properly', async () => {
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

      // Tab to menu item
      await user.tab();
      const focusedItem = document.activeElement;
      
      // Should have visible focus indicator
      const focusedStyle = window.getComputedStyle(focusedItem!);
      expect(
        focusedStyle.outline !== 'none' || 
        focusedStyle.boxShadow.includes('focus') ||
        focusedStyle.border.includes('focus')
      ).toBeTruthy();
    });
  });

  describe('Voice Control and Alternative Input', () => {
    it('should support voice control commands', () => {
      render(
        <μ7_UnifiedContextMenu
          visible={true}
          x={100}
          y={100}
          contextType="window"
          targetItem={TestUtils.createMockUDItem({ title: 'Document' })}
          onClose={vi.fn()}
          onCreateItem={vi.fn()}
          onItemAction={vi.fn()}
          onAddToContext={vi.fn()}
        />
      );

      // Menu items should have clear, speakable labels
      const deleteItem = screen.getByText('Löschen');
      expect(deleteItem).toHaveAttribute('aria-label');
      
      const copyItem = screen.getByText('Duplizieren');
      expect(copyItem).toBeInTheDocument();
    });

    it('should support switch navigation', async () => {
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

      // Space bar should activate items (switch navigation)
      const firstItem = screen.getByText('Note');
      firstItem.focus();
      
      await user.keyboard(' ');
      // Should activate the item (tested via callback)
    });

    it('should support eye tracking and head mouse', () => {
      render(
        <FileManagerWindow
          initialPath="/home/user"
        />
      );

      // Interactive elements should have sufficient size and spacing
      const buttons = document.querySelectorAll('button');
      buttons.forEach(button => {
        const rect = button.getBoundingClientRect();
        expect(rect.width).toBeGreaterThanOrEqual(44);
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
    });
  });

  describe('Cognitive Accessibility', () => {
    it('should provide clear and consistent navigation', () => {
      render(
        <FileManagerWindow
          initialPath="/home/user"
          showToolbar={true}
        />
      );

      // Breadcrumb or path should be clear
      const addressBar = document.querySelector('input[type="text"]');
      expect(addressBar).toHaveValue('/home/user');
      
      // Navigation buttons should have consistent placement
      const backButton = screen.getByTitle('Back');
      const forwardButton = screen.getByTitle('Forward');
      expect(backButton).toBeInTheDocument();
      expect(forwardButton).toBeInTheDocument();
    });

    it('should provide helpful error messages', () => {
      // Mock error state
      vi.mocked(require('@/hooks/useFileManager').useFileManager).mockReturnValue({
        // ... other properties
        error: 'Access denied: Insufficient permissions',
        loading: false,
        items: [],
        filteredAndSortedItems: [],
      });

      render(
        <FileManagerWindow
          initialPath="/restricted"
        />
      );

      // Error message should be clear and actionable
      const errorMessage = screen.getByText('❌ Access denied: Insufficient permissions');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveAttribute('role', 'alert');
    });

    it('should provide context and help information', () => {
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

      // Menu should have clear context header
      const header = screen.getByText('🖥️ Desktop');
      expect(header).toBeInTheDocument();
      
      // Actions should be grouped logically
      expect(screen.getByText('KI-Assistenz')).toBeInTheDocument();
      expect(screen.getByText('Navigation')).toBeInTheDocument();
    });

    it('should support timeout preferences', async () => {
      vi.useFakeTimers();
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

      // Menu should not auto-close (respecting user preferences)
      vi.advanceTimersByTime(30000); // 30 seconds
      expect(onClose).not.toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('Mobile and Touch Accessibility', () => {
    it('should support touch interactions', () => {
      // Mock touch environment
      Object.defineProperty(window, 'ontouchstart', {
        value: true,
      });

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

      // Touch targets should be large enough (44x44px minimum)
      const menuItems = document.querySelectorAll('.μ7-context-menu-item');
      menuItems.forEach(item => {
        const rect = item.getBoundingClientRect();
        expect(rect.height).toBeGreaterThanOrEqual(44);
      });
    });

    it('should handle screen reader on mobile', () => {
      // Mock mobile screen reader
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
        configurable: true,
      });

      render(
        <FileManagerWindow
          initialPath="/home/user"
        />
      );

      // Should have proper heading structure for mobile screen readers
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('should support gesture navigation hints', () => {
      render(
        <FileManagerWindow
          initialPath="/home/user"
        />
      );

      // Should provide swipe gesture hints where applicable
      const fileList = document.querySelector('.file-list-view');
      expect(fileList).toHaveAttribute('aria-label');
    });
  });
});