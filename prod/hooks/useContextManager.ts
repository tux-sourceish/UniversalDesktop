import { useState, useCallback, useMemo } from 'react';

interface ContextItem {
  id: string;
  title: string;
  type: 'window' | 'selection' | 'document';
  content: string;
  metadata?: Record<string, any>;
  tokenEstimate?: number;
  priority?: 'high' | 'medium' | 'low';
}

interface DesktopItemData {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; z: number };
  content: any;
  is_contextual?: boolean;
  metadata?: Record<string, any>;
}

interface TokenUsage {
  current: number;
  limit: number;
  percentage: number;
  warning: boolean;
  critical: boolean;
}

export const useContextManager = (
  maxTokens: number = 100000,
  updateItemCallback?: (id: string, updates: Partial<DesktopItemData>) => void
) => {
  const [activeContextItems, setActiveContextItems] = useState<ContextItem[]>([]);
  const [contextHistory, setContextHistory] = useState<ContextItem[][]>([]);
  const [autoOptimize, setAutoOptimize] = useState(true);

  // Token estimation utility
  const estimateTokens = useCallback((content: string): number => {
    // Rough estimation: ~4 characters per token for most content
    const baseTokens = Math.ceil(content.length / 4);
    
    // Adjust for content type
    if (content.includes('```') || content.includes('function') || content.includes('class')) {
      return Math.ceil(baseTokens * 1.2); // Code content uses more tokens
    }
    if (content.includes('|') && content.includes('\n')) {
      return Math.ceil(baseTokens * 0.9); // Table content is more efficient
    }
    
    return baseTokens;
  }, []);

  // Calculate current token usage
  const tokenUsage: TokenUsage = useMemo(() => {
    const current = activeContextItems.reduce((total, item) => {
      return total + (item.tokenEstimate || estimateTokens(item.content));
    }, 0);
    
    const percentage = (current / maxTokens) * 100;
    
    return {
      current,
      limit: maxTokens,
      percentage,
      warning: percentage > 70,
      critical: percentage > 90
    };
  }, [activeContextItems, maxTokens, estimateTokens]);

  // Add item to context with intelligent handling
  const addToContext = useCallback((item: DesktopItemData, priority: 'high' | 'medium' | 'low' = 'medium') => {
    const content = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
    const tokenEstimate = estimateTokens(content);
    
    // Check if adding this item would exceed token limit
    if (tokenUsage.current + tokenEstimate > maxTokens && autoOptimize) {
      // Remove lowest priority items to make space
      const sortedItems = [...activeContextItems].sort((a, b) => {
        const priorityOrder = { low: 1, medium: 2, high: 3 };
        return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
      });
      
      let removedTokens = 0;
      const itemsToRemove: string[] = [];
      
      for (const contextItem of sortedItems) {
        if (tokenUsage.current + tokenEstimate - removedTokens <= maxTokens) break;
        
        itemsToRemove.push(contextItem.id);
        removedTokens += contextItem.tokenEstimate || 0;
      }
      
      if (itemsToRemove.length > 0) {
        setActiveContextItems(prev => prev.filter(ci => !itemsToRemove.includes(ci.id)));
        
        // Update database for removed items
        itemsToRemove.forEach(id => {
          updateItemCallback?.(id, { is_contextual: false });
        });
        
        if (import.meta.env.DEV) {
          console.log('🧠 Context Auto-Optimization:', {
            removed: itemsToRemove.length,
            freedTokens: removedTokens,
            reason: 'Token limit exceeded'
          });
        }
      }
    }
    
    const contextItem: ContextItem = {
      id: item.id,
      title: item.title,
      type: 'window',
      content,
      metadata: item.metadata,
      tokenEstimate,
      priority
    };
    
    setActiveContextItems(prev => {
      const exists = prev.find(ci => ci.id === item.id);
      if (exists) return prev;
      
      const newItems = [...prev, contextItem];
      
      // Save to history for undo functionality
      setContextHistory(prevHistory => [...prevHistory.slice(-10), prev]);
      
      return newItems;
    });
    
    // Update database
    updateItemCallback?.(item.id, { is_contextual: true });
    
    if (import.meta.env.DEV) {
      console.log('📌 Added to Context:', {
        id: item.id,
        title: item.title,
        tokens: tokenEstimate,
        priority,
        totalTokens: tokenUsage.current + tokenEstimate
      });
    }
  }, [activeContextItems, tokenUsage, maxTokens, autoOptimize, estimateTokens, updateItemCallback]);

  // Remove item from context
  const removeFromContext = useCallback((itemId: string) => {
    const removedItem = activeContextItems.find(ci => ci.id === itemId);
    
    setActiveContextItems(prev => {
      const newItems = prev.filter(ci => ci.id !== itemId);
      
      // Save to history
      setContextHistory(prevHistory => [...prevHistory.slice(-10), prev]);
      
      return newItems;
    });
    
    // Update database
    updateItemCallback?.(itemId, { is_contextual: false });
    
    if (import.meta.env.DEV && removedItem) {
      console.log('📍 Removed from Context:', {
        id: itemId,
        title: removedItem.title,
        freedTokens: removedItem.tokenEstimate || 0
      });
    }
  }, [activeContextItems, updateItemCallback]);

  // Toggle item context
  const toggleItemContext = useCallback((item: DesktopItemData, priority: 'high' | 'medium' | 'low' = 'medium') => {
    const isInContext = activeContextItems.some(ci => ci.id === item.id);
    
    if (isInContext) {
      removeFromContext(item.id);
    } else {
      addToContext(item, priority);
    }
  }, [activeContextItems, addToContext, removeFromContext]);

  // Clear all context with confirmation
  const clearAllContext = useCallback((force = false) => {
    if (!force && activeContextItems.length > 3) {
      // For safety, require force flag for large context clears
      console.warn('🚨 Large context clear blocked. Use force=true to confirm.');
      return false;
    }
    
    // Save current state to history
    setContextHistory(prevHistory => [...prevHistory.slice(-10), activeContextItems]);
    
    // Update all items in database
    activeContextItems.forEach(item => {
      updateItemCallback?.(item.id, { is_contextual: false });
    });
    
    setActiveContextItems([]);
    
    if (import.meta.env.DEV) {
      console.log('🗑️ Context Cleared:', {
        itemCount: activeContextItems.length,
        freedTokens: tokenUsage.current
      });
    }
    
    return true;
  }, [activeContextItems, tokenUsage, updateItemCallback]);

  // Smart context optimization
  const optimizeContext = useCallback(() => {
    if (tokenUsage.percentage < 70) return;
    
    // Remove duplicate content
    const uniqueContent = new Map<string, ContextItem>();
    const duplicates: string[] = [];
    
    activeContextItems.forEach(item => {
      const contentHash = btoa(item.content).slice(0, 20); // Simple content hash
      
      if (uniqueContent.has(contentHash)) {
        duplicates.push(item.id);
      } else {
        uniqueContent.set(contentHash, item);
      }
    });
    
    // Remove duplicates
    if (duplicates.length > 0) {
      setActiveContextItems(prev => prev.filter(item => !duplicates.includes(item.id)));
      
      duplicates.forEach(id => {
        updateItemCallback?.(id, { is_contextual: false });
      });
      
      if (import.meta.env.DEV) {
        console.log('🔄 Context Optimized:', {
          removedDuplicates: duplicates.length,
          optimization: 'duplicate removal'
        });
      }
    }
  }, [activeContextItems, tokenUsage, updateItemCallback]);

  // Undo last context change
  const undoLastContextChange = useCallback(() => {
    if (contextHistory.length === 0) return false;
    
    const lastState = contextHistory[contextHistory.length - 1];
    setActiveContextItems(lastState);
    setContextHistory(prev => prev.slice(0, -1));
    
    // Update database to match restored state
    const currentIds = new Set(activeContextItems.map(item => item.id));
    const restoredIds = new Set(lastState.map(item => item.id));
    
    // Remove items that are no longer in context
    currentIds.forEach(id => {
      if (!restoredIds.has(id)) {
        updateItemCallback?.(id, { is_contextual: false });
      }
    });
    
    // Add items that are back in context
    restoredIds.forEach(id => {
      if (!currentIds.has(id)) {
        updateItemCallback?.(id, { is_contextual: true });
      }
    });
    
    if (import.meta.env.DEV) {
      console.log('↩️ Context Undone:', {
        restoredItems: lastState.length,
        currentItems: activeContextItems.length
      });
    }
    
    return true;
  }, [contextHistory, activeContextItems, updateItemCallback]);

  // Get context summary for AI prompts
  const getContextSummary = useCallback(() => {
    if (activeContextItems.length === 0) return '';
    
    let summary = '=== CONTEXT ===\n';
    
    activeContextItems
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium'];
      })
      .forEach(item => {
        summary += `[${item.type}: ${item.title}]\n${item.content}\n\n`;
      });
    
    summary += '=== END CONTEXT ===\n';
    
    return summary;
  }, [activeContextItems]);

  // Check if item is in context
  const isInContext = useCallback((itemId: string): boolean => {
    return activeContextItems.some(ci => ci.id === itemId);
  }, [activeContextItems]);

  return {
    // State
    activeContextItems,
    tokenUsage,
    autoOptimize,
    contextHistory,
    
    // Core Operations
    addToContext,
    removeFromContext,
    toggleItemContext,
    clearAllContext,
    
    // Advanced Operations
    optimizeContext,
    undoLastContextChange,
    
    // Utilities
    getContextSummary,
    isInContext,
    estimateTokens,
    
    // Settings
    setAutoOptimize
  };
};