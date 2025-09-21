import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { UDFormat } from '../core/UDFormat';

/**
 * µ6_useContextManager - FEUER (☲) Functions - AI Context Management
 * 
 * V1-Style Genius-Feature mit µ-Präfix Architektur!
 * Selektive AI-Kontexte mit Token-Management und Auto-Optimization.
 */

interface µ6_ContextItem {
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

interface µ6_DesktopItemData {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; z: number };
  content: any;
  is_contextual?: boolean;
  metadata?: Record<string, any>;
  bagua_descriptor?: number;
}

interface µ6_TokenUsage {
  current: number;
  limit: number;
  percentage: number;
  warning: boolean;
  critical: boolean;
}

export const µ6_useContextManager = (
  maxTokens: number = 100000,
  updateItemCallback?: (id: string, updates: Partial<µ6_DesktopItemData>) => void
) => {

  
  // µ6_ Context State (FEUER-Pattern: Function/Processing State)
  const [µ6_activeContextItems, setµ6_ActiveContextItems] = useState<µ6_ContextItem[]>([]);
  const [µ6_contextHistory, setµ6_ContextHistory] = useState<µ6_ContextItem[][]>([]);
  const [µ6_autoOptimize, setµ6_AutoOptimize] = useState(true);

  // µ6_ Token Estimation mit algebraischem Transistor
  const µ6_estimateTokens = useCallback((content: string): number => {
    const baseTokens = Math.ceil(content.length / 4);
    
    // Raimunds algebraischer Transistor für Content-Type-Detection
    const isCode = UDFormat.transistor(!(content.includes('```') || content.includes('function') || content.includes('class')));
    const isTable = UDFormat.transistor(!(content.includes('|') && content.includes('\n')));
    
    // Content-specific multipliers
    const codeMultiplier = 1 + (0.2 * isCode); // 1.2 wenn Code, 1.0 wenn nicht
    const tableMultiplier = 1 - (0.1 * isTable); // 0.9 wenn Tabelle, 1.0 wenn nicht
    
    return Math.ceil(baseTokens * codeMultiplier * tableMultiplier);
  }, []);

  // µ6_ Token Usage Calculation
  const µ6_tokenUsage: µ6_TokenUsage = useMemo(() => {
    const current = µ6_activeContextItems.reduce((total, item) => {
      return total + (item.tokenEstimate || µ6_estimateTokens(item.content));
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
  }, [µ6_activeContextItems, maxTokens, µ6_estimateTokens]);

  // µ6_ Add Item to Context (GENIUS FEATURE!)
  const µ6_addToContext = useCallback((
    item: µ6_DesktopItemData, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    const content = typeof item.content === 'string' ? item.content : JSON.stringify(item.content);
    const tokenEstimate = µ6_estimateTokens(content);
    
    // Auto-Optimization wenn Token-Limit überschritten
    if (µ6_tokenUsage.current + tokenEstimate > maxTokens && µ6_autoOptimize) {
      // Sortiere nach Priorität (niedrigste zuerst)
      const priorityOrder = { low: 1, medium: 2, high: 3 };
      const sortedItems = [...µ6_activeContextItems].sort((a, b) => 
        priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium']
      );
      
      let removedTokens = 0;
      const itemsToRemove: string[] = [];
      
      for (const contextItem of sortedItems) {
        if (µ6_tokenUsage.current + tokenEstimate - removedTokens <= maxTokens) break;
        
        itemsToRemove.push(contextItem.id);
        removedTokens += contextItem.tokenEstimate || 0;
      }
      
      if (itemsToRemove.length > 0) {
        setµ6_ActiveContextItems(prev => prev.filter(ci => !itemsToRemove.includes(ci.id)));
        
        // Update database für entfernte Items
        itemsToRemove.forEach(id => {
          updateItemCallback?.(id, { is_contextual: false });
        });
        
        console.log('🧠 µ6 Context Auto-Optimization:', {
          removed: itemsToRemove.length,
          freedTokens: removedTokens,
          reason: 'Token limit exceeded'
        });
      }
    }
    
    const contextItem: µ6_ContextItem = {
      id: item.id,
      title: item.title,
      type: µ6_mapItemTypeToContextType(item.type),
      content,
      metadata: item.metadata,
      tokenEstimate,
      priority,
      bagua_descriptor: item.bagua_descriptor || UDFormat.BAGUA.FEUER,
      addedAt: new Date()
    };
    
    setµ6_ActiveContextItems(prev => {
      // Simple existence check (no algebraic transistor confusion)
      const exists = prev.find(ci => ci.id === item.id);
      
      if (exists) {
        console.log('⚠️ µ6 Item already in context, skipping add:', item.id);
        return prev; // Already exists
      }
      
      const newItems = [...prev, contextItem];
      
      // Save to history für Undo
      setµ6_ContextHistory(prevHistory => [...prevHistory.slice(-10), prev]);
      
      
      return newItems;
    });
    
    // Update database
    updateItemCallback?.(item.id, { is_contextual: true });
    
  }, [µ6_activeContextItems, µ6_tokenUsage, maxTokens, µ6_autoOptimize, µ6_estimateTokens, updateItemCallback]);

  // µ6_ Map Item Type to Context Type (Bagua-aware)
  const µ6_mapItemTypeToContextType = useCallback((itemType: string): µ6_ContextItem['type'] => {
    switch (itemType) {
      case 'code': return 'code';
      case 'tabelle': return 'table';
      case 'notizzettel': return 'document';
      case 'browser': return 'window';
      default: return 'window';
    }
  }, []);

  // µ6_ Remove from Context
  const µ6_removeFromContext = useCallback((itemId: string) => {
    const removedItem = µ6_activeContextItems.find(ci => ci.id === itemId);
    
    setµ6_ActiveContextItems(prev => {
      const newItems = prev.filter(ci => ci.id !== itemId);
      
      // Save to history
      setµ6_ContextHistory(prevHistory => [...prevHistory.slice(-10), prev]);
      
      return newItems;
    });
    
    // Update database
    updateItemCallback?.(itemId, { is_contextual: false });
    
    if (removedItem) {
      console.log('📍 µ6 Removed from Context:', {
        id: itemId,
        title: removedItem.title,
        freedTokens: removedItem.tokenEstimate || 0
      });
    }
  }, [µ6_activeContextItems, updateItemCallback]);

  // µ6_ Toggle Item Context (mit algebraischem Transistor)
  const µ6_toggleItemContext = useCallback((
    item: µ6_DesktopItemData, 
    priority: 'high' | 'medium' | 'low' = 'medium'
  ) => {
    const isInContext = µ6_activeContextItems.some(ci => ci.id === item.id);
    
    console.log('🔧 µ6_toggleItemContext Logic:', {
      itemId: item.id,
      isInContext,
      action: isInContext ? 'REMOVE' : 'ADD'
    });
    
    // Simple toggle logic (no algebraic transistor here to avoid confusion)
    if (isInContext) {
      µ6_removeFromContext(item.id);
    } else {
      µ6_addToContext(item, priority);
    }
  }, [µ6_activeContextItems, µ6_addToContext, µ6_removeFromContext]);

  // µ6_ Clear All Context
  const µ6_clearAllContext = useCallback((force = false) => {
    // Safety check für große Context-Clears
    if (!force && µ6_activeContextItems.length > 3) {
      console.warn('🚨 µ6 Large context clear blocked. Use force=true to confirm.');
      return false;
    }
    
    // Save current state to history
    setµ6_ContextHistory(prevHistory => [...prevHistory.slice(-10), µ6_activeContextItems]);
    
    // Update all items in database
    µ6_activeContextItems.forEach(item => {
      updateItemCallback?.(item.id, { is_contextual: false });
    });
    
    setµ6_ActiveContextItems([]);
    
    console.log('🗑️ µ6 Context Cleared:', {
      itemCount: µ6_activeContextItems.length,
      freedTokens: µ6_tokenUsage.current
    });
    
    return true;
  }, [µ6_activeContextItems, µ6_tokenUsage, updateItemCallback]);

  // µ6_ Smart Context Optimization (GENIUS!)
  const µ6_optimizeContext = useCallback(() => {
    // Algebraischer Transistor für Optimization-Trigger
    const needsOptimization = UDFormat.transistor(µ6_tokenUsage.percentage < 70);
    if (needsOptimization === 1) return; // Keine Optimization nötig
    
    // Remove duplicate content
    const uniqueContent = new Map<string, µ6_ContextItem>();
    const duplicates: string[] = [];
    
    µ6_activeContextItems.forEach(item => {
      const contentHash = btoa(item.content).slice(0, 20); // Simple content hash
      
      if (uniqueContent.has(contentHash)) {
        duplicates.push(item.id);
      } else {
        uniqueContent.set(contentHash, item);
      }
    });
    
    // Remove duplicates
    if (duplicates.length > 0) {
      setµ6_ActiveContextItems(prev => prev.filter(item => !duplicates.includes(item.id)));
      
      duplicates.forEach(id => {
        updateItemCallback?.(id, { is_contextual: false });
      });
      
      console.log('🔄 µ6 Context Optimized:', {
        removedDuplicates: duplicates.length,
        optimization: 'duplicate removal'
      });
    }
  }, [µ6_activeContextItems, µ6_tokenUsage, updateItemCallback]);

  // µ6_ Undo Last Context Change
  const µ6_undoLastContextChange = useCallback(() => {
    // Algebraischer Transistor für History-Check
    const hasHistory = UDFormat.transistor(µ6_contextHistory.length === 0);
    if (hasHistory === 1) return false; // Keine History
    
    const lastState = µ6_contextHistory[µ6_contextHistory.length - 1];
    setµ6_ActiveContextItems(lastState);
    setµ6_ContextHistory(prev => prev.slice(0, -1));
    
    // Update database to match restored state
    const currentIds = new Set(µ6_activeContextItems.map(item => item.id));
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
    
    console.log('↩️ µ6 Context Undone:', {
      restoredItems: lastState.length,
      currentItems: µ6_activeContextItems.length
    });
    
    return true;
  }, [µ6_contextHistory, µ6_activeContextItems, updateItemCallback]);

  // µ6_ Get Context Summary für AI-Prompts (ESSENTIELL!)
  const µ6_getContextSummary = useCallback(() => {
    // Algebraischer Transistor für Empty-Check (FIXED!)
    const isEmpty = UDFormat.transistor(µ6_activeContextItems.length === 0);
    if (isEmpty === 1) {
      return ''; // Kein Context
    }
    let summary = '=== µ6 CONTEXT (Bagua-Structured) ===\n';
    
    µ6_activeContextItems
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
    
    summary += '=== END µ6 CONTEXT ===\n';
    
    return summary;
  }, [µ6_activeContextItems]);

  // µ6_ Get Vision-Ready Context for Multi-Modal AI (UNIVERSAL!)
  const µ6_getVisionContext = useCallback(() => {
    const isEmpty = UDFormat.transistor(µ6_activeContextItems.length === 0);
    if (isEmpty === 1) return { textContent: '', images: [] };

    // Split text and image content
    const textItems: µ6_ContextItem[] = [];
    const imageItems: µ6_ContextItem[] = [];
    
    µ6_activeContextItems.forEach(item => {
      if (item.type === 'image' && item.imageData) {
        imageItems.push(item);
      } else {
        textItems.push(item);
      }
    });

    // Build text context
    let textContent = '=== µ6 CONTEXT (Vision-Ready) ===\n';
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
    
    textContent += '=== END µ6 CONTEXT ===\n';

    // Prepare image data for LiteLLM (OpenAI-compatible format)
    const images = imageItems.map(item => ({
      type: 'image_url' as const,
      image_url: {
        url: `data:${item.imageData!.mimeType};base64,${item.imageData!.base64}`
      }
    }));

    console.log('👁️ µ6_getVisionContext built:', {
      textLength: textContent.length,
      imageCount: images.length,
      totalItems: µ6_activeContextItems.length
    });

    return { textContent, images };
  }, [µ6_activeContextItems]);

  // µ6_ Check if Item is in Context
  const µ6_isInContext = useCallback((itemId: string): boolean => {
    return µ6_activeContextItems.some(ci => ci.id === itemId);
  }, [µ6_activeContextItems]);

  // µ6_ Get Context Statistics
  const µ6_getContextStats = useCallback(() => {
    const typeDistribution = µ6_activeContextItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityDistribution = µ6_activeContextItems.reduce((acc, item) => {
      const priority = item.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalItems: µ6_activeContextItems.length,
      typeDistribution,
      priorityDistribution,
      averageTokensPerItem: µ6_activeContextItems.length > 0 
        ? Math.round(µ6_tokenUsage.current / µ6_activeContextItems.length) 
        : 0,
      oldestItem: µ6_activeContextItems.length > 0 
        ? µ6_activeContextItems.reduce((oldest, item) => 
            item.addedAt < oldest.addedAt ? item : oldest
          ).addedAt
        : null
    };
  }, [µ6_activeContextItems, µ6_tokenUsage]);

  // DEBUG: Return object with state verification
  const returnObject = {
    // State
    activeContextItems: µ6_activeContextItems,
    tokenUsage: µ6_tokenUsage,
    autoOptimize: µ6_autoOptimize,
    contextHistory: µ6_contextHistory,
    
    // Core Operations (GENIUS FEATURES!)
    addToContext: µ6_addToContext,
    removeFromContext: µ6_removeFromContext,
    toggleItemContext: µ6_toggleItemContext,
    clearAllContext: µ6_clearAllContext,
    
    // Advanced Operations
    optimizeContext: µ6_optimizeContext,
    undoLastContextChange: µ6_undoLastContextChange,
    
    // Utilities
    getContextSummary: µ6_getContextSummary,
    getVisionContext: µ6_getVisionContext,
    isInContext: µ6_isInContext,
    estimateTokens: µ6_estimateTokens,
    getContextStats: µ6_getContextStats,
    
    // Settings
    setAutoOptimize: setµ6_AutoOptimize
  };


  return returnObject;
};