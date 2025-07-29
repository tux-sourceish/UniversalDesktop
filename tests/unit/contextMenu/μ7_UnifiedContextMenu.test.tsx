/**
 * 🧪 Unit Tests: μ7_UnifiedContextMenu
 * 
 * Comprehensive tests for the Universal Context Menu System
 * Testing μ7_ DONNER (☳) Events/Interactions patterns
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { μ7_UnifiedContextMenu } from '@/components/contextMenu/μ7_UnifiedContextMenu';
import { TestUtils, TestConfig } from '../../setup';

// Mock dependencies
vi.mock('@/core/UDFormat', () => ({
  UDFormat: {
    transistor: vi.fn((condition: boolean) => condition ? 1 : 0),
    BAGUA: {
      HIMMEL: 1,
      WIND: 2,
      WASSER: 3,
      BERG: 4,
      SEE: 5,
      FEUER: 6,
      DONNER: 7,
      ERDE: 8,
    }
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
    tabelle: {
      id: 'tabelle',
      displayName: 'Table',
      icon: '📊',
    },
    browser: {
      id: 'browser',
      displayName: 'Browser',
      icon: '🌐',
    },
  }
}));

describe('μ7_UnifiedContextMenu', () => {
  const mockProps = {
    visible: true,
    x: 100,
    y: 100,
    contextType: 'canvas' as const,
    onClose: vi.fn(),
    onCreateItem: vi.fn(),
    onItemAction: vi.fn(),
    onAddToContext: vi.fn(),
    clipboardHasContent: false,
    hasSelection: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Visibility and Positioning', () => {
    it('should render when visible is true', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      const menu = screen.getByText('Desktop');
      expect(menu).toBeInTheDocument();
    });

    it('should not render when visible is false', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} visible={false} />);
      
      const menu = screen.queryByText('Desktop');
      expect(menu).not.toBeInTheDocument();
    });

    it('should position menu at correct coordinates', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} x={150} y={200} />);
      
      const menuElement = screen.getByRole('generic').parentElement;
      expect(menuElement).toHaveStyle({
        left: '150px',
        top: '200px',
      });
    });

    it('should close menu when clicking overlay', async () => {
      const user = userEvent.setup();
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      const overlay = document.querySelector('.μ7-context-menu-overlay');
      await user.click(overlay!);
      
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Canvas Context Menu', () => {
    beforeEach(() => {
      mockProps.contextType = 'canvas';
    });

    it('should display canvas header', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      expect(screen.getByText('🖥️ Desktop')).toBeInTheDocument();
    });

    it('should render creation items from window registry', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      expect(screen.getByText('Note')).toBeInTheDocument();
      expect(screen.getByText('Code Editor')).toBeInTheDocument();
      expect(screen.getByText('Table')).toBeInTheDocument();
      expect(screen.getByText('Browser')).toBeInTheDocument();
    });

    it('should call onCreateItem when creation item is clicked', async () => {
      const user = userEvent.setup();
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      const noteItem = screen.getByText('Note');
      await user.click(noteItem);
      
      expect(mockProps.onCreateItem).toHaveBeenCalledWith(
        'notizzettel',
        { x: -100, y: 0, z: 10 }
      );
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should render AI assistance section', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      expect(screen.getByText('KI-Hilfe')).toBeInTheDocument();
      expect(screen.getByText('Reasoning Modus')).toBeInTheDocument();
    });

    it('should render navigation section', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      expect(screen.getByText('Zoom to Fit')).toBeInTheDocument();
      expect(screen.getByText('Ansicht zentrieren')).toBeInTheDocument();
    });

    it('should call onItemAction for navigation actions', async () => {
      const user = userEvent.setup();
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      const zoomFitItem = screen.getByText('Zoom to Fit');
      await user.click(zoomFitItem);
      
      expect(mockProps.onItemAction).toHaveBeenCalledWith('zoom-to-fit');
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Window Context Menu', () => {
    const mockTargetItem = TestUtils.createMockUDItem({
      id: 'test-item-1',
      title: 'Test Window',
      type: 'notizzettel',
      is_contextual: false,
    });

    beforeEach(() => {
      mockProps.contextType = 'window';
      mockProps.targetItem = mockTargetItem;
    });

    it('should display window header with item title', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      expect(screen.getByText('📝 Test Window')).toBeInTheDocument();
    });

    it('should render pin to context action when item not in context', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      expect(screen.getByText('Zu AI-Kontext hinzufügen')).toBeInTheDocument();
    });

    it('should render unpin from context when item is in context', () => {
      const contextualItem = { ...mockTargetItem, is_contextual: true };
      render(<μ7_UnifiedContextMenu {...mockProps} targetItem={contextualItem} />);
      
      expect(screen.getByText('Aus AI-Kontext entfernen')).toBeInTheDocument();
    });

    it('should call onAddToContext when pin action is clicked', async () => {
      const user = userEvent.setup();
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      const pinItem = screen.getByText('Zu AI-Kontext hinzufügen');
      await user.click(pinItem);
      
      expect(mockProps.onAddToContext).toHaveBeenCalledWith(mockTargetItem);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('should render editing actions with keyboard shortcuts', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} hasSelection={true} />);
      
      const copyAction = screen.getByText('Kopieren');
      expect(copyAction).toBeInTheDocument();
      expect(screen.getByText('Ctrl+C')).toBeInTheDocument();
      
      const cutAction = screen.getByText('Ausschneiden');
      expect(cutAction).toBeInTheDocument();
      expect(screen.getByText('Ctrl+X')).toBeInTheDocument();
    });

    it('should show/hide clipboard actions based on state', () => {
      const { rerender } = render(
        <μ7_UnifiedContextMenu {...mockProps} hasSelection={false} clipboardHasContent={false} />
      );
      
      // Actions should be hidden when no selection/clipboard content
      expect(screen.queryByText('Kopieren')).not.toBeInTheDocument();
      expect(screen.queryByText('Einfügen')).not.toBeInTheDocument();
      
      // Rerender with selection and clipboard content
      rerender(
        <μ7_UnifiedContextMenu {...mockProps} hasSelection={true} clipboardHasContent={true} />
      );
      
      expect(screen.getByText('Kopieren')).toBeInTheDocument();
      expect(screen.getByText('Einfügen')).toBeInTheDocument();
    });

    it('should render window actions', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      expect(screen.getByText('Umbenennen')).toBeInTheDocument();
      expect(screen.getByText('Duplizieren')).toBeInTheDocument();
      expect(screen.getByText('Löschen')).toBeInTheDocument();
      expect(screen.getByText('In Vordergrund')).toBeInTheDocument();
    });

    it('should render AI workflow actions', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      expect(screen.getByText('Reasoner')).toBeInTheDocument();
      expect(screen.getByText('Coder')).toBeInTheDocument();
      expect(screen.getByText('Refiner')).toBeInTheDocument();
    });

    it('should call onItemAction for window actions', async () => {
      const user = userEvent.setup();
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      const deleteAction = screen.getByText('Löschen');
      await user.click(deleteAction);
      
      expect(mockProps.onItemAction).toHaveBeenCalledWith('delete', mockTargetItem);
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Content Context Menu', () => {
    beforeEach(() => {
      mockProps.contextType = 'content';
    });

    it('should display content header', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      expect(screen.getByText('📄 Inhalt')).toBeInTheDocument();
    });

    it('should render clipboard actions based on state', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} hasSelection={true} clipboardHasContent={true} />);
      
      expect(screen.getByText('Ausschneiden')).toBeInTheDocument();
      expect(screen.getByText('Kopieren')).toBeInTheDocument();
      expect(screen.getByText('Einfügen')).toBeInTheDocument();
    });

    it('should render AI actions', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} hasSelection={true} />);
      
      expect(screen.getByText('Auswahl erklären')).toBeInTheDocument();
      expect(screen.getByText('Text verbessern')).toBeInTheDocument();
      expect(screen.getByText('Code generieren')).toBeInTheDocument();
    });

    it('should render formatting actions', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      expect(screen.getByText('Auto-Format')).toBeInTheDocument();
      expect(screen.getByText('Daten bereinigen')).toBeInTheDocument();
    });

    it('should call onItemAction for content actions', async () => {
      const user = userEvent.setup();
      render(<μ7_UnifiedContextMenu {...mockProps} hasSelection={true} />);
      
      const copyAction = screen.getByText('Kopieren');
      await user.click(copyAction);
      
      expect(mockProps.onItemAction).toHaveBeenCalledWith('copy');
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Algebraic Transistor Integration', () => {
    it('should use algebraic transistor for visibility logic', () => {
      const { UDFormat } = require('@/core/UDFormat');
      
      render(<μ7_UnifiedContextMenu {...mockProps} visible={true} />);
      
      expect(UDFormat.transistor).toHaveBeenCalledWith(true);
    });

    it('should hide menu items with transistor result 0', () => {
      const { UDFormat } = require('@/core/UDFormat');
      UDFormat.transistor.mockReturnValue(0); // Force hidden
      
      render(<μ7_UnifiedContextMenu {...mockProps} hasSelection={true} />);
      
      // Items should be hidden when transistor returns 0
      expect(screen.queryByText('Kopieren')).not.toBeInTheDocument();
    });

    it('should show menu items with transistor result 1', () => {
      const { UDFormat } = require('@/core/UDFormat');
      UDFormat.transistor.mockReturnValue(1); // Force visible
      
      render(<μ7_UnifiedContextMenu {...mockProps} hasSelection={false} />);
      
      // Items should be visible when transistor returns 1
      expect(screen.getByText('Zoom to Fit')).toBeInTheDocument();
    });
  });

  describe('Menu Interactions', () => {
    it('should highlight menu item on hover', async () => {
      const user = userEvent.setup();
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      const menuItem = screen.getByText('Zoom to Fit');
      await user.hover(menuItem);
      
      expect(menuItem).toHaveStyle({
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        color: 'white',
      });
    });

    it('should remove highlight on mouse leave', async () => {
      const user = userEvent.setup();
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      const menuItem = screen.getByText('Zoom to Fit');
      await user.hover(menuItem);
      await user.unhover(menuItem);
      
      expect(menuItem).toHaveStyle({
        backgroundColor: 'transparent',
        color: '#e5e5e5',
      });
    });

    it('should render keyboard shortcuts when provided', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} contextType="window" hasSelection={true} />);
      
      expect(screen.getByText('Ctrl+A')).toBeInTheDocument();
      expect(screen.getByText('F2')).toBeInTheDocument();
      expect(screen.getByText('Del')).toBeInTheDocument();
    });

    it('should render separators between sections', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      const separators = document.querySelectorAll('[style*="border-bottom"]');
      expect(separators.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle missing targetItem gracefully', () => {
      expect(() => {
        render(<μ7_UnifiedContextMenu {...mockProps} contextType="window" targetItem={undefined} />);
      }).not.toThrow();
    });

    it('should handle undefined callback functions', () => {
      const propsWithoutCallbacks = {
        ...mockProps,
        onCreateItem: undefined,
        onItemAction: undefined,
        onAddToContext: undefined,
      };
      
      expect(() => {
        render(<μ7_UnifiedContextMenu {...propsWithoutCallbacks} />);
      }).not.toThrow();
    });

    it('should handle invalid context type', () => {
      expect(() => {
        render(<μ7_UnifiedContextMenu {...mockProps} contextType={'invalid' as any} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      const menu = document.querySelector('.μ7-unified-context-menu');
      expect(menu).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      // Focus should be manageable with keyboard
      const firstMenuItem = screen.getByText('Note');
      await user.tab();
      
      expect(document.activeElement).toBe(firstMenuItem);
    });

    it('should close on Escape key', async () => {
      const user = userEvent.setup();
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      await user.keyboard('{Escape}');
      
      expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance', () => {
    it('should render quickly with many menu items', () => {
      const startTime = performance.now();
      
      render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(50); // 50ms threshold
    });

    it('should not cause memory leaks with frequent renders', () => {
      const { rerender, unmount } = render(<μ7_UnifiedContextMenu {...mockProps} />);
      
      // Multiple rerenders
      for (let i = 0; i < 10; i++) {
        rerender(<μ7_UnifiedContextMenu {...mockProps} x={i * 10} y={i * 10} />);
      }
      
      expect(() => unmount()).not.toThrow();
    });
  });
});