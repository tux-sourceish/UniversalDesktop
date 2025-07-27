import { useState, useCallback, useMemo } from 'react';
import { UDFormat } from '../core/UDFormat';

/**
 * μ6_useContextManager - FEUER (☲) Functions - AI Context Management
 * 
 * V1-Style Genius-Feature mit μ-Präfix Architektur!
 * Selektive AI-Kontexte mit Token-Management und Auto-Optimization.
 */

interface μ6_ContextItem {
  id: string;
  title: string;
  type: 'window' | 'selection' | 'document' | 'code' | 'table' | 'image';
  content: string;
  metadata?: Record<string, any>;
  tokenEstimate?: number;
  priority?: 'high' | 'medium' | 'low';
  bagua_descriptor?: number;
  addedAt: Date;
  // NEW: Vision support
  imageData?: {
    base64: string;
    mimeType: string; // 'image/jpeg', 'image/png', 'image/webp'
    width?: number;
    height?: number;
  };
}

interface μ6_DesktopItemData {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; z: number };
  content: any;
  is_contextual?: boolean;
  metadata?: Record<string, any>;
  bagua_descriptor?: number;
}

interface μ6_TokenUsage {
  current: number;
  limit: number;
  percentage: number;
  warning: boolean;
  critical: boolean;
}

export const μ6_useContextManager = (
  maxTokens: number = 100000,
  updateItemCallback?: (id: string, updates: Partial<μ6_DesktopItemData>) => void
) => {
  
  // μ6_ Context State (FEUER-Pattern: Function/Processing State)
  const [μ6_activeContextItems, setμ6_ActiveContextItems] = useState<μ6_ContextItem[]>([]);
  const [μ6_contextHistory, setμ6_ContextHistory] = useState<μ6_ContextItem[][]>([]);
  const [μ6_autoOptimize, setμ6_AutoOptimize] = useState(true);

  // μ6_ Token Estimation mit algebraischem Transistor
  const μ6_estimateTokens = useCallback((content: string): number => {
    const baseTokens = Math.ceil(content.length / 4);
    
    // Raimunds algebraischer Transistor für Content-Type-Detection
    const isCode = UDFormat.transistor(!(content.includes('```') || content.includes('function') || content.includes('class')));
    const isTable = UDFormat.transistor(!(content.includes('|') && content.includes('\n')));
    
    // Content-specific multipliers
    const codeMultiplier = 1 + (0.2 * isCode); // 1.2 wenn Code, 1.0 wenn nicht
    const tableMultiplier = 1 - (0.1 * isTable); // 0.9 wenn Tabelle, 1.0 wenn nicht
    
    return Math.ceil(baseTokens * codeMultiplier * tableMultiplier);
  }, []);

  // μ6_ Token Usage Calculation
  const μ6_tokenUsage: μ6_TokenUsage = useMemo(() => {
    const current = μ6_activeContextItems.reduce((total, item) => {
      return total + (item.tokenEstimate || μ6_estimateTokens(item.content));
    }, 0);
    
    const percentage = (current / maxTokens) * 100;
    
    // Algebraischer Transistor für Warning States
    const isWarning = UDFormat.transistor(percentage <= 70);
    const isCritical = UDFormat.transistor(percentage <= 90);
    
    return {
      current,
      limit: maxTokens,
      percentage,
      warning: percentage > 70,
      critical: percentage > 90
    };
  }, [μ6_activeContextItems, maxTokens, μ6_estimateTokens]);

  // μ6_ Add Item to Context (GENIUS FEATURE!)
  const μ6_addToContext = useCallback((
    item: μ6_DesktopItemData, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    const content = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
    const tokenEstimate = μ6_estimateTokens(content);
    
    // Auto-Optimization wenn Token-Limit überschritten
    if (μ6_tokenUsage.current + tokenEstimate > maxTokens && μ6_autoOptimize) {
      // Sortiere nach Priorität (niedrigste zuerst)
      const priorityOrder = { low: 1, medium: 2, high: 3 };
      const sortedItems = [...μ6_activeContextItems].sort((a, b) => 
        priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium']
      );
      
      let removedTokens = 0;
      const itemsToRemove: string[] = [];
      
      for (const contextItem of sortedItems) {
        if (μ6_tokenUsage.current + tokenEstimate - removedTokens <= maxTokens) break;
        
        itemsToRemove.push(contextItem.id);
        removedTokens += contextItem.tokenEstimate || 0;
      }
      
      if (itemsToRemove.length > 0) {
        setμ6_ActiveContextItems(prev => prev.filter(ci => !itemsToRemove.includes(ci.id)));
        
        // Update database für entfernte Items
        itemsToRemove.forEach(id => {
          updateItemCallback?.(id, { is_contextual: false });
        });
        
        console.log('🧠 μ6 Context Auto-Optimization:', {
          removed: itemsToRemove.length,
          freedTokens: removedTokens,
          reason: 'Token limit exceeded'
        });
      }
    }
    
    const contextItem: μ6_ContextItem = {
      id: item.id,
      title: item.title,
      type: μ6_mapItemTypeToContextType(item.type),
      content,
      metadata: item.metadata,
      tokenEstimate,
      priority,
      bagua_descriptor: item.bagua_descriptor || UDFormat.BAGUA.FEUER,
      addedAt: new Date()
    };
    
    setμ6_ActiveContextItems(prev => {
      // Simple existence check (no algebraic transistor confusion)
      const exists = prev.find(ci => ci.id === item.id);
      
      if (exists) {
        console.log('⚠️ μ6 Item already in context, skipping add:', item.id);
        return prev; // Already exists
      }
      
      const newItems = [...prev, contextItem];
      
      // Save to history für Undo
      setμ6_ContextHistory(prevHistory => [...prevHistory.slice(-10), prev]);
      
      console.log('✅ μ6 Context item added to state:', {
        itemId: item.id,
        newCount: newItems.length,
        allIds: newItems.map(ci => ci.id)
      });
      
      return newItems;
    });
    
    // Update database
    updateItemCallback?.(item.id, { is_contextual: true });
    
    console.log('📌 μ6 Added to Context:', {
      id: item.id,
      title: item.title,
      tokens: tokenEstimate,
      priority,
      bagua: item.bagua_descriptor
    });
  }, [μ6_activeContextItems, μ6_tokenUsage, maxTokens, μ6_autoOptimize, μ6_estimateTokens, updateItemCallback]);

  // μ6_ Map Item Type to Context Type (Bagua-aware)
  const μ6_mapItemTypeToContextType = useCallback((itemType: string): μ6_ContextItem['type'] => {
    switch (itemType) {
      case 'code': return 'code';
      case 'tabelle': return 'table';
      case 'notizzettel': return 'document';
      case 'browser': return 'window';
      default: return 'window';
    }
  }, []);

  // μ6_ Remove from Context
  const μ6_removeFromContext = useCallback((itemId: string) => {
    const removedItem = μ6_activeContextItems.find(ci => ci.id === itemId);
    
    setμ6_ActiveContextItems(prev => {
      const newItems = prev.filter(ci => ci.id !== itemId);
      
      // Save to history
      setμ6_ContextHistory(prevHistory => [...prevHistory.slice(-10), prev]);
      
      return newItems;
    });
    
    // Update database
    updateItemCallback?.(itemId, { is_contextual: false });
    
    if (removedItem) {
      console.log('📍 μ6 Removed from Context:', {
        id: itemId,
        title: removedItem.title,
        freedTokens: removedItem.tokenEstimate || 0
      });
    }
  }, [μ6_activeContextItems, updateItemCallback]);

  // μ6_ Toggle Item Context (mit algebraischem Transistor)
  const μ6_toggleItemContext = useCallback((
    item: μ6_DesktopItemData, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    const isInContext = μ6_activeContextItems.some(ci => ci.id === item.id);
    
    console.log('🔧 μ6_toggleItemContext Logic:', {
      itemId: item.id,
      isInContext,
      action: isInContext ? 'REMOVE' : 'ADD'
    });
    
    // Simple toggle logic (no algebraic transistor here to avoid confusion)
    if (isInContext) {
      μ6_removeFromContext(item.id);
    } else {
      μ6_addToContext(item, priority);
    }
  }, [μ6_activeContextItems, μ6_addToContext, μ6_removeFromContext]);

  // μ6_ Clear All Context
  const μ6_clearAllContext = useCallback((force = false) => {
    // Safety check für große Context-Clears
    if (!force && μ6_activeContextItems.length > 3) {
      console.warn('🚨 μ6 Large context clear blocked. Use force=true to confirm.');
      return false;
    }
    
    // Save current state to history
    setμ6_ContextHistory(prevHistory => [...prevHistory.slice(-10), μ6_activeContextItems]);
    
    // Update all items in database
    μ6_activeContextItems.forEach(item => {
      updateItemCallback?.(item.id, { is_contextual: false });
    });
    
    setμ6_ActiveContextItems([]);
    
    console.log('🗑️ μ6 Context Cleared:', {
      itemCount: μ6_activeContextItems.length,
      freedTokens: μ6_tokenUsage.current
    });
    
    return true;
  }, [μ6_activeContextItems, μ6_tokenUsage, updateItemCallback]);

  // μ6_ Smart Context Optimization (GENIUS!)
  const μ6_optimizeContext = useCallback(() => {
    // Algebraischer Transistor für Optimization-Trigger
    const needsOptimization = UDFormat.transistor(μ6_tokenUsage.percentage < 70);
    if (needsOptimization === 1) return; // Keine Optimization nötig
    
    // Remove duplicate content
    const uniqueContent = new Map<string, μ6_ContextItem>();
    const duplicates: string[] = [];
    
    μ6_activeContextItems.forEach(item => {
      const contentHash = btoa(item.content).slice(0, 20); // Simple content hash
      
      if (uniqueContent.has(contentHash)) {
        duplicates.push(item.id);
      } else {
        uniqueContent.set(contentHash, item);
      }
    });
    
    // Remove duplicates
    if (duplicates.length > 0) {
      setμ6_ActiveContextItems(prev => prev.filter(item => !duplicates.includes(item.id)));
      
      duplicates.forEach(id => {
        updateItemCallback?.(id, { is_contextual: false });
      });
      
      console.log('🔄 μ6 Context Optimized:', {
        removedDuplicates: duplicates.length,
        optimization: 'duplicate removal'
      });
    }
  }, [μ6_activeContextItems, μ6_tokenUsage, updateItemCallback]);

  // μ6_ Undo Last Context Change
  const μ6_undoLastContextChange = useCallback(() => {
    // Algebraischer Transistor für History-Check
    const hasHistory = UDFormat.transistor(μ6_contextHistory.length === 0);
    if (hasHistory === 1) return false; // Keine History
    
    const lastState = μ6_contextHistory[μ6_contextHistory.length - 1];
    setμ6_ActiveContextItems(lastState);
    setμ6_ContextHistory(prev => prev.slice(0, -1));
    
    // Update database to match restored state
    const currentIds = new Set(μ6_activeContextItems.map(item => item.id));
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
    
    console.log('↩️ μ6 Context Undone:', {
      restoredItems: lastState.length,
      currentItems: μ6_activeContextItems.length
    });
    
    return true;
  }, [μ6_contextHistory, μ6_activeContextItems, updateItemCallback]);

  // μ6_ Get Context Summary für AI-Prompts (ESSENTIELL!)
  const μ6_getContextSummary = useCallback(() => {
    console.log('🔍 μ6_getContextSummary called:', {
      activeContextItemsCount: μ6_activeContextItems.length,
      activeContextItems: μ6_activeContextItems.map(item => ({ id: item.id, title: item.title }))
    });
    
    // Algebraischer Transistor für Empty-Check (FIXED!)
    const isEmpty = UDFormat.transistor(μ6_activeContextItems.length === 0);
    if (isEmpty === 1) {
      console.log('🔍 μ6_getContextSummary: Empty context (transistor result:', isEmpty, ')');
      return ''; // Kein Context
    }
    
    console.log('✅ μ6_getContextSummary: Building context from', μ6_activeContextItems.length, 'items');
    let summary = '=== μ6 CONTEXT (Bagua-Structured) ===\n';
    
    μ6_activeContextItems
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority || 'medium'] - priorityOrder[a.priority || 'medium'];
      })
      .forEach(item => {
        const baguaInfo = item.bagua_descriptor ? `[Bagua: ${item.bagua_descriptor.toString(2)}]` : '';
        
        // Handle image items differently
        if (item.type === 'image' && item.imageData) {
          summary += `[${item.type}: ${item.title}] ${baguaInfo}\n[IMAGE: ${item.imageData.mimeType}, ${item.imageData.width}x${item.imageData.height}]\n${item.content}\n\n`;
        } else {
          summary += `[${item.type}: ${item.title}] ${baguaInfo}\n${item.content}\n\n`;
        }
      });
    
    summary += '=== END μ6 CONTEXT ===\n';
    
    return summary;
  }, [μ6_activeContextItems]);

  // μ6_ Get Vision-Ready Context for Multi-Modal AI (UNIVERSAL!)
  const μ6_getVisionContext = useCallback(() => {
    const isEmpty = UDFormat.transistor(μ6_activeContextItems.length === 0);
    if (isEmpty === 1) return { textContent: '', images: [] };

    // Split text and image content
    const textItems: μ6_ContextItem[] = [];
    const imageItems: μ6_ContextItem[] = [];
    
    μ6_activeContextItems.forEach(item => {
      if (item.type === 'image' && item.imageData) {
        imageItems.push(item);
      } else {
        textItems.push(item);
      }
    });

    // Build text context
    let textContent = '=== μ6 CONTEXT (Vision-Ready) ===\n';
    textItems.forEach(item => {
      const baguaInfo = item.bagua_descriptor ? `[Bagua: ${item.bagua_descriptor.toString(2)}]` : '';
      textContent += `[${item.type}: ${item.title}] ${baguaInfo}\n${item.content}\n\n`;
    });
    
    if (imageItems.length > 0) {
      textContent += `=== IMAGES (${imageItems.length}) ===\n`;
      imageItems.forEach((item, index) => {
        textContent += `Image ${index + 1}: ${item.title} - ${item.content}\n`;
      });
    }
    
    textContent += '=== END μ6 CONTEXT ===\n';

    // Prepare image data for LiteLLM (OpenAI-compatible format)
    const images = imageItems.map(item => ({
      type: 'image_url' as const,
      image_url: {
        url: `data:${item.imageData!.mimeType};base64,${item.imageData!.base64}`
      }
    }));

    console.log('👁️ μ6_getVisionContext built:', {
      textLength: textContent.length,
      imageCount: images.length,
      totalItems: μ6_activeContextItems.length
    });

    return { textContent, images };
  }, [μ6_activeContextItems]);

  // μ6_ Check if Item is in Context
  const μ6_isInContext = useCallback((itemId: string): boolean => {
    return μ6_activeContextItems.some(ci => ci.id === itemId);
  }, [μ6_activeContextItems]);

  // μ6_ Get Context Statistics
  const μ6_getContextStats = useCallback(() => {
    const typeDistribution = μ6_activeContextItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityDistribution = μ6_activeContextItems.reduce((acc, item) => {
      const priority = item.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalItems: μ6_activeContextItems.length,
      typeDistribution,
      priorityDistribution,
      averageTokensPerItem: μ6_activeContextItems.length > 0 
        ? Math.round(μ6_tokenUsage.current / μ6_activeContextItems.length) 
        : 0,
      oldestItem: μ6_activeContextItems.length > 0 
        ? μ6_activeContextItems.reduce((oldest, item) => 
            item.addedAt < oldest.addedAt ? item : oldest
          ).addedAt
        : null
    };
  }, [μ6_activeContextItems, μ6_tokenUsage]);

  return {
    // State
    activeContextItems: μ6_activeContextItems,
    tokenUsage: μ6_tokenUsage,
    autoOptimize: μ6_autoOptimize,
    contextHistory: μ6_contextHistory,
    
    // Core Operations (GENIUS FEATURES!)
    addToContext: μ6_addToContext,
    removeFromContext: μ6_removeFromContext,
    toggleItemContext: μ6_toggleItemContext,
    clearAllContext: μ6_clearAllContext,
    
    // Advanced Operations
    optimizeContext: μ6_optimizeContext,
    undoLastContextChange: μ6_undoLastContextChange,
    
    // Utilities
    getContextSummary: μ6_getContextSummary,
    getVisionContext: μ6_getVisionContext,
    isInContext: μ6_isInContext,
    estimateTokens: μ6_estimateTokens,
    getContextStats: μ6_getContextStats,
    
    // Settings
    setAutoOptimize: setμ6_AutoOptimize
  };
};