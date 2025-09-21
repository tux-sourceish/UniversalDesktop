import { useState, useCallback, useMemo } from 'react';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface CanvasState {
  position: Position;
  scale: number;
  velocity: Position;
  isDragging: boolean;
  momentum: { x: number; y: number };
}

interface DesktopItemData {
  id: string;
  type: string;
  title: string;
  position: Position;
  content: any;
  width?: number;
  height?: number;
  is_contextual?: boolean;
}

interface MinimapViewport {
  position: Position;
  scale: number;
  width: number;
  height: number;
}

interface ContextZone {
  id: string;
  bounds: { x: number; y: number; width: number; height: number };
  items: DesktopItemData[];
  contextualItems: number;
  density: number;
}

export const useMinimap = (
  items: DesktopItemData[], 
  canvasState: CanvasState,
  canvasSize = { width: 4000, height: 4000 }
) => {
  const [minimapVisible, setMinimapVisible] = useState(true);
  const [contextZones, setContextZones] = useState<{ [key: string]: boolean }>({});
  const [isDragging, setIsDragging] = useState(false);
  const [lastInteraction, setLastInteraction] = useState<Date>(new Date());

  // StarCraft-Style Viewport Management
  const viewport: MinimapViewport = useMemo(() => ({
    position: canvasState.position,
    scale: canvasState.scale,
    width: window.innerWidth,
    height: window.innerHeight - 80 // Subtract header height
  }), [canvasState.position, canvasState.scale]);

  // Calculate proportional coverage (2x-8x Viewport-Skalierung)
  const calculateCoverage = useCallback(() => {
    const viewportArea = viewport.width * viewport.height;
    const canvasArea = canvasSize.width * canvasSize.height;
    const coverageRatio = viewportArea / canvasArea;
    
    // 2x-8x scaling based on zoom level
    const scalingFactor = Math.max(2, Math.min(8, 1 / viewport.scale));
    
    return {
      ratio: coverageRatio,
      scalingFactor,
      effectiveCoverage: coverageRatio * scalingFactor
    };
  }, [viewport, canvasSize]);

  // Intelligent damping system (3-stufiges Präzisionssystem)
  const applyIntelligentDamping = useCallback((deltaX: number, deltaY: number, precision: 'low' | 'medium' | 'high' = 'medium') => {
    const dampingLevels = {
      low: 1.0,      // Galaxy view - fast movement
      medium: 0.6,   // Normal navigation
      high: 0.3      // Precision mode (Ctrl+Drag)
    };
    
    const damping = dampingLevels[precision];
    
    return {
      x: deltaX * damping,
      y: deltaY * damping
    };
  }, []);

  // Enhanced viewport change handler
  const handleViewportChange = useCallback((position: Position, precision: 'low' | 'medium' | 'high' = 'medium') => {
    setLastInteraction(new Date());
    
    // Apply intelligent damping based on zoom level and precision mode
    const currentPos = canvasState.position;
    const deltaX = position.x - currentPos.x;
    const deltaY = position.y - currentPos.y;
    
    const dampedDelta = applyIntelligentDamping(deltaX, deltaY, precision);
    
    const finalPosition = {
      x: currentPos.x + dampedDelta.x,
      y: currentPos.y + dampedDelta.y,
      z: position.z || 0
    };
    
    return finalPosition;
  }, [canvasState.position, applyIntelligentDamping]);

  // Minimap-exclusive zoom with fine control
  const handleMinimapZoom = useCallback((zoomDelta: number, controlKey = false) => {
    const baseFactor = controlKey ? 0.05 : 0.1; // Ctrl+Scroll = fine control
    const scaleFactor = zoomDelta > 0 ? (1 - baseFactor) : (1 + baseFactor);
    const newScale = Math.max(0.1, Math.min(3, canvasState.scale * scaleFactor));
    
    if (import.meta.env.DEV) {
      console.log('🔍 Minimap Zoom:', {
        zoomDelta,
        controlKey,
        scaleFactor,
        currentScale: canvasState.scale,
        newScale,
        mode: controlKey ? 'precision' : 'normal'
      });
    }
    
    setLastInteraction(new Date());
    return newScale;
  }, [canvasState.scale]);

  // Context zone detection and management
  const detectContextZones = useCallback((): ContextZone[] => {
    if (items.length === 0) return [];
    
    // Group items by proximity (DBSCAN-style clustering)
    const epsilon = 300; // Distance threshold
    const minItems = 2;
    
    const zones: ContextZone[] = [];
    const visited = new Set<string>();
    
    items.forEach(item => {
      if (visited.has(item.id)) return;
      
      const neighbors = items.filter(other => {
        if (other.id === item.id || visited.has(other.id)) return false;
        const dx = item.position.x - other.position.x;
        const dy = item.position.y - other.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= epsilon;
      });
      
      if (neighbors.length >= minItems - 1) { // Include the item itself
        const cluster = [item, ...neighbors];
        cluster.forEach(clusterItem => visited.add(clusterItem.id));
        
        // Calculate zone bounds
        const xs = cluster.map(i => i.position.x);
        const ys = cluster.map(i => i.position.y);
        const minX = Math.min(...xs) - 50;
        const maxX = Math.max(...xs) + 300;
        const minY = Math.min(...ys) - 50;
        const maxY = Math.max(...ys) + 250;
        
        const contextualItems = cluster.filter(i => i.is_contextual).length;
        
        zones.push({
          id: `zone_${item.id}`,
          bounds: {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY
          },
          items: cluster,
          contextualItems,
          density: cluster.length / ((maxX - minX) * (maxY - minY) / 10000) // items per 100x100 area
        });
      }
    });
    
    return zones;
  }, [items]);

  // Context zone click handler with smart selection
  const handleContextZoneClick = useCallback((zoneItems: DesktopItemData[], zone: ContextZone) => {
    setLastInteraction(new Date());
    
    // Toggle zone context state
    const zoneId = zone.id;
    const isZoneActive = contextZones[zoneId];
    
    setContextZones(prev => ({
      ...prev,
      [zoneId]: !isZoneActive
    }));
    
    if (import.meta.env.DEV) {
      console.log('🗺️ Context Zone Click:', {
        zoneId,
        itemCount: zoneItems.length,
        contextualItems: zone.contextualItems,
        density: zone.density,
        newState: !isZoneActive
      });
    }
    
    return {
      zoneItems,
      shouldAddToContext: !isZoneActive,
      zone
    };
  }, [contextZones]);

  // Minimap visibility and state management
  const toggleVisibility = useCallback(() => {
    setMinimapVisible(!minimapVisible);
    setLastInteraction(new Date());
  }, [minimapVisible]);

  // Performance optimization: detect if minimap needs updates
  const shouldUpdateMinimap = useCallback(() => {
    const timeSinceLastInteraction = Date.now() - lastInteraction.getTime();
    const isRecentlyActive = timeSinceLastInteraction < 5000; // 5 seconds
    
    return minimapVisible && (isRecentlyActive || isDragging);
  }, [minimapVisible, lastInteraction, isDragging]);

  // Calculate minimap scale and positioning
  const getMinimapTransform = useCallback(() => {
    const minimapSize = { width: 200, height: 150 };
    const scaleX = minimapSize.width / canvasSize.width;
    const scaleY = minimapSize.height / canvasSize.height;
    const scale = Math.min(scaleX, scaleY);
    
    return {
      scale,
      width: canvasSize.width * scale,
      height: canvasSize.height * scale,
      viewportWidth: viewport.width * scale / viewport.scale,
      viewportHeight: viewport.height * scale / viewport.scale,
      viewportX: -viewport.position.x * scale / viewport.scale,
      viewportY: -viewport.position.y * scale / viewport.scale
    };
  }, [canvasSize, viewport]);

  // Get current context zones
  const currentContextZones = useMemo(() => detectContextZones(), [detectContextZones]);

  return {
    // State
    minimapVisible,
    contextZones,
    isDragging,
    viewport,
    currentContextZones,
    
    // Handlers
    handleViewportChange,
    handleMinimapZoom,
    handleContextZoneClick,
    toggleVisibility,
    
    // Utilities
    calculateCoverage,
    applyIntelligentDamping,
    getMinimapTransform,
    shouldUpdateMinimap,
    
    // Setters for external control
    setIsDragging,
    setMinimapVisible
  };
};