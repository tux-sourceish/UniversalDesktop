import { useState, useCallback, useRef, useMemo } from 'react';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface DesktopItemData {
  id: string;
  type: 'notizzettel' | 'tabelle' | 'code' | 'browser' | 'terminal' | 'tui' | 'media' | 'chart' | 'calendar';
  title: string;
  position: Position;
  content: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  metadata?: Record<string, any>;
  width?: number;
  height?: number;
  is_contextual?: boolean;
}

interface ViewportInfo {
  width: number;
  height: number;
  canvasPosition: Position;
  canvasScale: number;
}

interface WindowSizingResult {
  position: Position;
  width: number;
  height: number;
  reason: string;
}

interface CollisionInfo {
  hasCollision: boolean;
  collisionCount: number;
  suggestedPosition?: Position;
}

export const µ1_useWindowManager = (
  userId?: string,
  saveCallback?: (items: DesktopItemData[]) => void
) => {
  const [items, setItems] = useState<DesktopItemData[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [clipboard, setClipboard] = useState<DesktopItemData | null>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced save system
  const debouncedSave = useCallback((updatedItems: DesktopItemData[]) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      saveCallback?.(updatedItems);
    }, 500);
  }, [saveCallback]);

  // Intelligent Window Sizing
  const calculateOptimalSize = useCallback((
    type: string, 
    content: any, 
    position: Position,
    viewportInfo: ViewportInfo
  ): WindowSizingResult => {
    const defaultSizes = {
      notizzettel: { width: 300, height: 200 },
      tabelle: { width: 400, height: 300 },
      code: { width: 500, height: 400 },
      tui: { width: 640, height: 400 }, // 80x25 character grid
      browser: { width: 800, height: 600 },
      media: { width: 400, height: 300 },
      chart: { width: 450, height: 350 },
      calendar: { width: 350, height: 400 },
      terminal: { width: 600, height: 400 }
    };

    let optimalSize = defaultSizes[type as keyof typeof defaultSizes] || { width: 250, height: 200 };
    let reason = `Default size for ${type}`;

    // Content-based sizing
    if (type === 'tabelle' && Array.isArray(content)) {
      const rows = content.length;
      const cols = content[0]?.length || 2;
      optimalSize.width = Math.min(800, Math.max(300, cols * 120));
      optimalSize.height = Math.min(600, Math.max(200, rows * 35 + 60));
      reason = `Table-optimized: ${rows}x${cols} cells`;
    } else if (type === 'code' && typeof content === 'string') {
      const lines = content.split('\n').length;
      const maxLineLength = Math.max(...content.split('\n').map(line => line.length));
      optimalSize.width = Math.min(1000, Math.max(400, maxLineLength * 8));
      optimalSize.height = Math.min(700, Math.max(300, lines * 20 + 100));
      reason = `Code-optimized: ${lines} lines, ${maxLineLength} max chars`;
    } else if (type === 'tui' && typeof content === 'string') {
      // TUI sizing based on content dimensions
      const lines = content.split('\n');
      const maxLineLength = Math.max(...lines.map(line => line.length));
      const charWidth = 8; // Monospace character width
      const lineHeight = 16; // Monospace line height
      
      optimalSize.width = Math.max(400, Math.min(1200, maxLineLength * charWidth + 40));
      optimalSize.height = Math.max(300, Math.min(800, lines.length * lineHeight + 80));
      reason = `TUI-optimized: ${lines.length} lines, ${maxLineLength} chars wide`;
    }

    // Viewport-aware positioning
    const margin = 50;
    const maxX = viewportInfo.width - optimalSize.width - margin;
    const maxY = viewportInfo.height - optimalSize.height - margin;
    
    // Adjust position if it would go off-screen
    const adjustedPosition = {
      x: Math.max(margin, Math.min(maxX, position.x)),
      y: Math.max(margin, Math.min(maxY, position.y)),
      z: position.z
    };

    // Check if position was adjusted
    if (adjustedPosition.x !== position.x || adjustedPosition.y !== position.y) {
      reason += ` (position adjusted for viewport)`;
    }

    return {
      position: adjustedPosition,
      width: optimalSize.width,
      height: optimalSize.height,
      reason
    };
  }, []);

  // Collision detection
  const checkCollisions = useCallback((
    newItem: { position: Position; width: number; height: number },
    existingItems: DesktopItemData[] = items
  ): CollisionInfo => {
    let collisionCount = 0;
    const collisions: DesktopItemData[] = [];

    for (const item of existingItems) {
      const itemWidth = item.width || 250;
      const itemHeight = item.height || 200;
      
      // Check if rectangles overlap
      const overlap = !(
        newItem.position.x + newItem.width < item.position.x ||
        item.position.x + itemWidth < newItem.position.x ||
        newItem.position.y + newItem.height < item.position.y ||
        item.position.y + itemHeight < newItem.position.y
      );

      if (overlap) {
        collisionCount++;
        collisions.push(item);
      }
    }

    // Suggest alternative position if there are collisions
    let suggestedPosition: Position | undefined;
    if (collisionCount > 0) {
      // Try positions in a spiral pattern
      const step = 50;
      for (let radius = 1; radius <= 10; radius++) {
        for (let angle = 0; angle < 360; angle += 45) {
          const testX = newItem.position.x + Math.cos(angle * Math.PI / 180) * radius * step;
          const testY = newItem.position.y + Math.sin(angle * Math.PI / 180) * radius * step;
          
          const testCollision = checkCollisions({
            position: { x: testX, y: testY, z: newItem.position.z },
            width: newItem.width,
            height: newItem.height
          }, existingItems);

          if (!testCollision.hasCollision) {
            suggestedPosition = { x: testX, y: testY, z: newItem.position.z };
            break;
          }
        }
        if (suggestedPosition) break;
      }
    }

    return {
      hasCollision: collisionCount > 0,
      collisionCount,
      suggestedPosition
    };
  }, [items]);

  // Create new item with intelligent positioning and sizing
  const createItem = useCallback((
    type: string, 
    position: Position, 
    content?: any,
    options?: { avoidCollisions?: boolean; priority?: 'high' | 'medium' | 'low' }
  ) => {
    const defaultContent = content || (type === 'tabelle' ? [['ID', 'Name'], ['1', 'Platzhalter']] : '');
    
    // Calculate optimal dimensions
    const viewportInfo: ViewportInfo = {
      width: window.innerWidth,
      height: window.innerHeight - 80,
      canvasPosition: { x: 0, y: 0, z: 0 }, // Will be provided by canvas hook
      canvasScale: 1
    };

    const sizing = calculateOptimalSize(type, defaultContent, position, viewportInfo);
    
    // Check for collisions and adjust if needed
    let finalPosition = sizing.position;
    if (options?.avoidCollisions !== false) { // Default to true
      const collision = checkCollisions({
        position: sizing.position,
        width: sizing.width,
        height: sizing.height
      });

      if (collision.hasCollision && collision.suggestedPosition) {
        finalPosition = collision.suggestedPosition;
        sizing.reason += ` (moved to avoid ${collision.collisionCount} collisions)`;
      }
    }

    const newItem: DesktopItemData = {
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: type as DesktopItemData['type'],
      title: `New ${type}`,
      position: finalPosition,
      content: defaultContent,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: userId || 'anonymous',
      width: sizing.width,
      height: sizing.height,
      metadata: {
        sizingReason: sizing.reason,
        priority: options?.priority || 'medium'
      }
    };

    setItems(prev => {
      const updated = [...prev, newItem];
      debouncedSave(updated);
      return updated;
    });

    if (import.meta.env.DEV) {
      console.log('🆕 Item Created:', {
        type,
        id: newItem.id,
        dimensions: `${sizing.width}x${sizing.height}`,
        reason: sizing.reason
      });
    }

    return newItem;
  }, [userId, calculateOptimalSize, checkCollisions, debouncedSave]);

  // Update item with validation
  const updateItem = useCallback((id: string, updates: Partial<DesktopItemData>) => {
    setItems(prev => {
      const updated = prev.map(item => {
        if (item.id === id) {
          const updatedItem = { 
            ...item, 
            ...updates, 
            updated_at: new Date().toISOString() 
          };

          // Validate position and size changes
          if (updates.position || updates.width || updates.height) {
            const collision = checkCollisions({
              position: updatedItem.position,
              width: updatedItem.width || 250,
              height: updatedItem.height || 200
            }, prev.filter(i => i.id !== id));

            if (collision.hasCollision) {
              if (import.meta.env.DEV) {
                console.warn('⚠️ Update causes collision:', {
                  id,
                  collisions: collision.collisionCount
                });
              }
            }
          }

          return updatedItem;
        }
        return item;
      });
      
      debouncedSave(updated);
      return updated;
    });
  }, [checkCollisions, debouncedSave]);

  // Delete item
  const deleteItem = useCallback((id: string) => {
    setItems(prev => {
      const updated = prev.filter(item => item.id !== id);
      debouncedSave(updated);
      return updated;
    });

    // Remove from selection if selected
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      newSelection.delete(id);
      return newSelection;
    });

    if (import.meta.env.DEV) {
      console.log('🗑️ Item Deleted:', id);
    }
  }, [debouncedSave]);

  // Rename item
  const renameItem = useCallback((id: string, newTitle: string) => {
    updateItem(id, { title: newTitle });
  }, [updateItem]);

  // Bulk operations
  const deleteSelectedItems = useCallback(() => {
    const selectedIds = Array.from(selectedItems);
    setItems(prev => {
      const updated = prev.filter(item => !selectedIds.includes(item.id));
      debouncedSave(updated);
      return updated;
    });
    setSelectedItems(new Set());
  }, [selectedItems, debouncedSave]);

  const duplicateItem = useCallback((id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const duplicatePosition = {
      x: item.position.x + 50,
      y: item.position.y + 50,
      z: item.position.z
    };

    createItem(item.type, duplicatePosition, item.content, { avoidCollisions: true });
  }, [items, createItem]);

  // Selection management
  const toggleSelection = useCallback((id: string) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedItems(new Set(items.map(item => item.id)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  // Statistics and queries
  const stats = useMemo(() => {
    const typeCount = items.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalArea = items.reduce((total, item) => {
      return total + (item.width || 250) * (item.height || 200);
    }, 0);

    return {
      totalItems: items.length,
      selectedItems: selectedItems.size,
      typeCount,
      totalArea,
      averageSize: items.length > 0 ? totalArea / items.length : 0
    };
  }, [items, selectedItems]);

  // Cleanup
  const cleanup = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
  }, []);

  return {
    // State
    items,
    setItems,
    selectedItems,
    clipboard,
    stats,

    // Core Operations
    createItem,
    updateItem,
    deleteItem,
    renameItem,
    duplicateItem,

    // Bulk Operations
    deleteSelectedItems,

    // Selection
    toggleSelection,
    selectAll,
    clearSelection,

    // Utilities
    calculateOptimalSize,
    checkCollisions,
    cleanup
  };
};