/**
 * 🧪 Unit Tests: μ6_useContextManager Hook  
 * 
 * Comprehensive tests for AI Context Management System
 * Testing μ6_ FEUER (☲) Functions - AI Context Management patterns
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { μ6_useContextManager } from '@/hooks/µ6_useContextManager';
import { TestUtils, TestConfig } from '../../setup';

// Mock UDFormat
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

describe('μ6_useContextManager', () => {
  const mockUpdateCallback = vi.fn();
  const maxTokens = 10000;

  const createMockDesktopItem = (overrides: any = {}) => ({
    id: crypto.randomUUID(),
    type: 'notizzettel',
    title: 'Test Item',
    position: { x: 100, y: 100, z: 1 },
    content: 'Test content for context',
    is_contextual: false,
    metadata: { tags: ['test'] },
    bagua_descriptor: 6, // FEUER
    ...overrides,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with empty context', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      expect(result.current.activeContextItems).toHaveLength(0);
      expect(result.current.tokenUsage.current).toBe(0);
      expect(result.current.tokenUsage.limit).toBe(maxTokens);
      expect(result.current.autoOptimize).toBe(true);
      expect(result.current.contextHistory).toHaveLength(0);
    });

    it('should initialize with custom token limit', () => {
      const customLimit = 50000;
      const { result } = renderHook(() => μ6_useContextManager(customLimit, mockUpdateCallback));
      
      expect(result.current.tokenUsage.limit).toBe(customLimit);
    });

    it('should work without update callback', () => {
      expect(() => {
        renderHook(() => μ6_useContextManager(maxTokens));
      }).not.toThrow();
    });
  });

  describe('Token Estimation', () => {
    it('should estimate tokens for plain text', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const text = 'This is a test string';
      const tokens = result.current.estimateTokens(text);
      
      expect(tokens).toBeGreaterThan(0);
      expect(tokens).toBe(Math.ceil(text.length / 4));
    });

    it('should apply code multiplier for code content', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const codeText = 'function test() { return true; }';
      const tokens = result.current.estimateTokens(codeText);
      
      expect(tokens).toBeGreaterThan(Math.ceil(codeText.length / 4));
    });

    it('should apply table multiplier for table content', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const tableText = '| Column 1 | Column 2 |\n| Value 1 | Value 2 |';
      const tokens = result.current.estimateTokens(tableText);
      
      expect(tokens).toBeLessThan(Math.ceil(tableText.length / 4) * 1.2);
    });
  });

  describe('Adding Items to Context', () => {
    it('should add item to context', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      const item = createMockDesktopItem();
      
      act(() => {
        result.current.addToContext(item, 'high');
      });
      
      expect(result.current.activeContextItems).toHaveLength(1);
      expect(result.current.activeContextItems[0].id).toBe(item.id);
      expect(result.current.activeContextItems[0].priority).toBe('high');
      expect(mockUpdateCallback).toHaveBeenCalledWith(item.id, { is_contextual: true });
    });

    it('should not add duplicate items', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      const item = createMockDesktopItem();
      
      act(() => {
        result.current.addToContext(item);
        result.current.addToContext(item); // Duplicate
      });
      
      expect(result.current.activeContextItems).toHaveLength(1);
    });

    it('should handle object content', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      const item = createMockDesktopItem({
        content: { data: 'test', values: [1, 2, 3] }
      });
      
      act(() => {
        result.current.addToContext(item);
      });
      
      expect(result.current.activeContextItems).toHaveLength(1);
      expect(result.current.activeContextItems[0].content).toBe(JSON.stringify(item.content));
    });

    it('should map item types to context types', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const codeItem = createMockDesktopItem({ type: 'code' });
      const tableItem = createMockDesktopItem({ type: 'tabelle' });
      const noteItem = createMockDesktopItem({ type: 'notizzettel' });
      const browserItem = createMockDesktopItem({ type: 'browser' });
      
      act(() => {
        result.current.addToContext(codeItem);
        result.current.addToContext(tableItem);
        result.current.addToContext(noteItem);
        result.current.addToContext(browserItem);
      });
      
      const items = result.current.activeContextItems;
      expect(items.find(i => i.id === codeItem.id)?.type).toBe('code');
      expect(items.find(i => i.id === tableItem.id)?.type).toBe('table');
      expect(items.find(i => i.id === noteItem.id)?.type).toBe('document');
      expect(items.find(i => i.id === browserItem.id)?.type).toBe('window');
    });
  });

  describe('Auto-Optimization', () => {
    it('should auto-optimize when token limit is exceeded', () => {
      const smallLimit = 100;
      const { result } = renderHook(() => μ6_useContextManager(smallLimit, mockUpdateCallback));
      
      // Add items that exceed limit
      const largeContentItem = createMockDesktopItem({
        content: 'A'.repeat(500), // Large content
        priority: 'low'
      });
      
      const importantItem = createMockDesktopItem({
        content: 'Small but important',
        priority: 'high'
      });
      
      act(() => {
        result.current.addToContext(largeContentItem);
        result.current.addToContext(importantItem);
      });
      
      // Low priority item should be removed, high priority kept
      expect(result.current.activeContextItems).toHaveLength(1);
      expect(result.current.activeContextItems[0].id).toBe(importantItem.id);
    });

    it('should disable auto-optimization when set to false', () => {
      const smallLimit = 100;
      const { result } = renderHook(() => μ6_useContextManager(smallLimit, mockUpdateCallback));
      
      act(() => {
        result.current.setAutoOptimize(false);
      });
      
      const largeItem = createMockDesktopItem({
        content: 'A'.repeat(500)
      });
      
      act(() => {
        result.current.addToContext(largeItem);
      });
      
      // Should not auto-optimize
      expect(result.current.activeContextItems).toHaveLength(1);
      expect(result.current.tokenUsage.current).toBeGreaterThan(smallLimit);
    });

    it('should prioritize items by priority during optimization', () => {
      const smallLimit = 200;
      const { result } = renderHook(() => μ6_useContextManager(smallLimit, mockUpdateCallback));
      
      const lowPriorityItem = createMockDesktopItem({
        content: 'Low priority content',
        priority: 'low'
      });
      
      const mediumPriorityItem = createMockDesktopItem({
        content: 'Medium priority content',
        priority: 'medium'
      });
      
      const highPriorityItem = createMockDesktopItem({
        content: 'High priority content',
        priority: 'high'
      });
      
      act(() => {
        result.current.addToContext(lowPriorityItem);
        result.current.addToContext(mediumPriorityItem);
        result.current.addToContext(highPriorityItem);
      });
      
      // Should keep higher priority items
      const remainingIds = result.current.activeContextItems.map(item => item.id);
      expect(remainingIds).toContain(highPriorityItem.id);
      expect(remainingIds).toContain(mediumPriorityItem.id);
    });
  });

  describe('Removing Items from Context', () => {
    it('should remove item from context', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      const item = createMockDesktopItem();
      
      act(() => {
        result.current.addToContext(item);
      });
      
      expect(result.current.activeContextItems).toHaveLength(1);
      
      act(() => {
        result.current.removeFromContext(item.id);
      });
      
      expect(result.current.activeContextItems).toHaveLength(0);
      expect(mockUpdateCallback).toHaveBeenCalledWith(item.id, { is_contextual: false });
    });

    it('should handle removing non-existent item gracefully', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      expect(() => {
        act(() => {
          result.current.removeFromContext('non-existent-id');
        });
      }).not.toThrow();
    });
  });

  describe('Toggle Item Context', () => {
    it('should add item when not in context', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      const item = createMockDesktopItem();
      
      act(() => {
        result.current.toggleItemContext(item, 'high');
      });
      
      expect(result.current.activeContextItems).toHaveLength(1);
      expect(result.current.activeContextItems[0].priority).toBe('high');
    });

    it('should remove item when already in context', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      const item = createMockDesktopItem();
      
      act(() => {
        result.current.addToContext(item);
      });
      
      expect(result.current.activeContextItems).toHaveLength(1);
      
      act(() => {
        result.current.toggleItemContext(item);
      });
      
      expect(result.current.activeContextItems).toHaveLength(0);
    });
  });

  describe('Clear All Context', () => {
    it('should clear all context items', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const item1 = createMockDesktopItem();
      const item2 = createMockDesktopItem();
      
      act(() => {
        result.current.addToContext(item1);
        result.current.addToContext(item2);
      });
      
      expect(result.current.activeContextItems).toHaveLength(2);
      
      act(() => {
        result.current.clearAllContext(true);
      });
      
      expect(result.current.activeContextItems).toHaveLength(0);
      expect(mockUpdateCallback).toHaveBeenCalledWith(item1.id, { is_contextual: false });
      expect(mockUpdateCallback).toHaveBeenCalledWith(item2.id, { is_contextual: false });
    });

    it('should prevent large context clear without force', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      // Add 5 items (more than 3)
      for (let i = 0; i < 5; i++) {
        const item = createMockDesktopItem({ id: `item-${i}` });
        act(() => {
          result.current.addToContext(item);
        });
      }
      
      expect(result.current.activeContextItems).toHaveLength(5);
      
      let result_clear;
      act(() => {
        result_clear = result.current.clearAllContext(false);
      });
      
      expect(result_clear).toBe(false);
      expect(result.current.activeContextItems).toHaveLength(5);
    });
  });

  describe('Context History and Undo', () => {
    it('should maintain context history', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      const item = createMockDesktopItem();
      
      act(() => {
        result.current.addToContext(item);
      });
      
      expect(result.current.contextHistory).toHaveLength(1);
      expect(result.current.contextHistory[0]).toHaveLength(0); // Previous empty state
    });

    it('should undo last context change', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      const item = createMockDesktopItem();
      
      act(() => {
        result.current.addToContext(item);
      });
      
      expect(result.current.activeContextItems).toHaveLength(1);
      
      act(() => {
        result.current.undoLastContextChange();
      });
      
      expect(result.current.activeContextItems).toHaveLength(0);
      expect(result.current.contextHistory).toHaveLength(0);
    });

    it('should handle undo with no history', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      let undoResult;
      act(() => {
        undoResult = result.current.undoLastContextChange();
      });
      
      expect(undoResult).toBe(false);
    });

    it('should limit history to 10 entries', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      // Add 15 items to exceed history limit
      for (let i = 0; i < 15; i++) {
        const item = createMockDesktopItem({ id: `item-${i}` });
        act(() => {
          result.current.addToContext(item);
        });
      }
      
      expect(result.current.contextHistory.length).toBeLessThanOrEqual(10);
    });
  });

  describe('Context Optimization', () => {
    it('should remove duplicate content during optimization', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const item1 = createMockDesktopItem({ content: 'Same content' });
      const item2 = createMockDesktopItem({ content: 'Same content' });
      
      act(() => {
        result.current.addToContext(item1);
        result.current.addToContext(item2);
      });
      
      expect(result.current.activeContextItems).toHaveLength(2);
      
      // Mock high token usage to trigger optimization
      const { UDFormat } = require('@/core/UDFormat');
      UDFormat.transistor.mockReturnValue(0); // Force optimization trigger
      
      act(() => {
        result.current.optimizeContext();
      });
      
      // Should remove one duplicate
      expect(result.current.activeContextItems).toHaveLength(1);
    });

    it('should not optimize when token usage is low', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const item = createMockDesktopItem();
      
      act(() => {
        result.current.addToContext(item);
      });
      
      // Mock low token usage
      const { UDFormat } = require('@/core/UDFormat');
      UDFormat.transistor.mockReturnValue(1); // No optimization needed
      
      act(() => {
        result.current.optimizeContext();
      });
      
      expect(result.current.activeContextItems).toHaveLength(1);
    });
  });

  describe('Context Summary Generation', () => {
    it('should generate empty summary for no context', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const summary = result.current.getContextSummary();
      expect(summary).toBe('');
    });

    it('should generate formatted context summary', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const item1 = createMockDesktopItem({
        title: 'Test Document',
        content: 'This is test content',
        priority: 'high'
      });
      
      const item2 = createMockDesktopItem({
        title: 'Code File',
        type: 'code',
        content: 'function test() {}',
        priority: 'medium'
      });
      
      act(() => {
        result.current.addToContext(item1);
        result.current.addToContext(item2);
      });
      
      const summary = result.current.getContextSummary();
      
      expect(summary).toContain('=== μ6 CONTEXT (Bagua-Structured) ===');
      expect(summary).toContain('Test Document');
      expect(summary).toContain('Code File');
      expect(summary).toContain('This is test content');
      expect(summary).toContain('function test() {}');
      expect(summary).toContain('=== END μ6 CONTEXT ===');
    });

    it('should sort items by priority in summary', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const lowItem = createMockDesktopItem({
        title: 'Low Priority',
        priority: 'low'
      });
      
      const highItem = createMockDesktopItem({
        title: 'High Priority',
        priority: 'high'
      });
      
      act(() => {
        result.current.addToContext(lowItem);
        result.current.addToContext(highItem);
      });
      
      const summary = result.current.getContextSummary();
      const highIndex = summary.indexOf('High Priority');
      const lowIndex = summary.indexOf('Low Priority');
      
      expect(highIndex).toBeLessThan(lowIndex);
    });
  });

  describe('Vision Context Support', () => {
    it('should generate vision-ready context for text items', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const textItem = createMockDesktopItem({
        title: 'Text Document',
        content: 'This is text content'
      });
      
      act(() => {
        result.current.addToContext(textItem);
      });
      
      const visionContext = result.current.getVisionContext();
      
      expect(visionContext.textContent).toContain('=== μ6 CONTEXT (Vision-Ready) ===');
      expect(visionContext.textContent).toContain('Text Document');
      expect(visionContext.images).toHaveLength(0);
    });

    it('should handle image items in vision context', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const imageItem = createMockDesktopItem({
        title: 'Test Image',
        type: 'image',
        content: 'Screenshot of application',
      });
      
      // Add image data manually to context item after creation
      act(() => {
        result.current.addToContext(imageItem);
        
        // Simulate image data being added
        const contextItem = result.current.activeContextItems[0];
        contextItem.type = 'image';
        contextItem.imageData = {
          base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          mimeType: 'image/png',
          width: 1,
          height: 1,
        };
      });
      
      const visionContext = result.current.getVisionContext();
      
      expect(visionContext.textContent).toContain('=== IMAGES (1) ===');
      expect(visionContext.images).toHaveLength(1);
      expect(visionContext.images[0].type).toBe('image_url');
      expect(visionContext.images[0].image_url.url).toContain('data:image/png;base64,');
    });

    it('should return empty vision context when no items', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const visionContext = result.current.getVisionContext();
      
      expect(visionContext.textContent).toBe('');
      expect(visionContext.images).toHaveLength(0);
    });
  });

  describe('Utility Functions', () => {
    it('should check if item is in context', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      const item = createMockDesktopItem();
      
      expect(result.current.isInContext(item.id)).toBe(false);
      
      act(() => {
        result.current.addToContext(item);
      });
      
      expect(result.current.isInContext(item.id)).toBe(true);
    });

    it('should generate context statistics', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const codeItem = createMockDesktopItem({ type: 'code', priority: 'high' });
      const docItem = createMockDesktopItem({ type: 'notizzettel', priority: 'medium' });
      
      act(() => {
        result.current.addToContext(codeItem);
        result.current.addToContext(docItem);
      });
      
      const stats = result.current.getContextStats();
      
      expect(stats.totalItems).toBe(2);
      expect(stats.typeDistribution.code).toBe(1);
      expect(stats.typeDistribution.document).toBe(1);
      expect(stats.priorityDistribution.high).toBe(1);
      expect(stats.priorityDistribution.medium).toBe(1);
      expect(stats.averageTokensPerItem).toBeGreaterThan(0);
      expect(stats.oldestItem).toBeInstanceOf(Date);
    });

    it('should handle empty context in statistics', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const stats = result.current.getContextStats();
      
      expect(stats.totalItems).toBe(0);
      expect(stats.typeDistribution).toEqual({});
      expect(stats.priorityDistribution).toEqual({});
      expect(stats.averageTokensPerItem).toBe(0);
      expect(stats.oldestItem).toBeNull();
    });
  });

  describe('Token Usage Calculations', () => {
    it('should calculate token usage correctly', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const shortItem = createMockDesktopItem({ content: 'Short' });
      const longItem = createMockDesktopItem({ content: 'A'.repeat(1000) });
      
      act(() => {
        result.current.addToContext(shortItem);
        result.current.addToContext(longItem);
      });
      
      const tokenUsage = result.current.tokenUsage;
      
      expect(tokenUsage.current).toBeGreaterThan(0);
      expect(tokenUsage.percentage).toBe((tokenUsage.current / maxTokens) * 100);
      expect(tokenUsage.limit).toBe(maxTokens);
    });

    it('should set warning and critical flags based on usage', () => {
      const smallLimit = 100;
      const { result } = renderHook(() => μ6_useContextManager(smallLimit, mockUpdateCallback));
      
      // Add item that causes warning level (>70%)
      const mediumItem = createMockDesktopItem({ content: 'A'.repeat(300) });
      
      act(() => {
        result.current.setAutoOptimize(false); // Prevent auto-optimization
        result.current.addToContext(mediumItem);
      });
      
      const tokenUsage = result.current.tokenUsage;
      
      expect(tokenUsage.warning).toBe(true);
      expect(tokenUsage.critical).toBe(true); // Will also be critical due to high usage
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed content gracefully', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens, mockUpdateCallback));
      
      const malformedItem = createMockDesktopItem({
        content: null as any
      });
      
      expect(() => {
        act(() => {
          result.current.addToContext(malformedItem);
        });
      }).not.toThrow();
    });

    it('should handle missing callback functions', () => {
      const { result } = renderHook(() => μ6_useContextManager(maxTokens));
      const item = createMockDesktopItem();
      
      expect(() => {
        act(() => {
          result.current.addToContext(item);
          result.current.removeFromContext(item.id);
        });
      }).not.toThrow();
    });

    it('should handle very large token limits', () => {
      const hugeLimit = Number.MAX_SAFE_INTEGER;
      
      expect(() => {
        renderHook(() => μ6_useContextManager(hugeLimit, mockUpdateCallback));
      }).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should handle large numbers of context items efficiently', () => {
      const { result } = renderHook(() => μ6_useContextManager(1000000, mockUpdateCallback));
      
      const startTime = performance.now();
      
      // Add 100 items
      act(() => {
        for (let i = 0; i < 100; i++) {
          const item = createMockDesktopItem({
            id: `item-${i}`,
            content: `Content for item ${i}`
          });
          result.current.addToContext(item);
        }
      });
      
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
      expect(result.current.activeContextItems).toHaveLength(100);
    });

    it('should generate summaries quickly for large contexts', () => {
      const { result } = renderHook(() => μ6_useContextManager(1000000, mockUpdateCallback));
      
      // Add 50 items
      act(() => {
        for (let i = 0; i < 50; i++) {
          const item = createMockDesktopItem({
            id: `item-${i}`,
            content: `Content for item ${i}`.repeat(10)
          });
          result.current.addToContext(item);
        }
      });
      
      const startTime = performance.now();
      const summary = result.current.getContextSummary();
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should generate within 100ms
      expect(summary).toContain('=== μ6 CONTEXT (Bagua-Structured) ===');
    });
  });
});