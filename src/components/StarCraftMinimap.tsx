import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import '../styles/StarCraftMinimap.css';
import ImHexContextMenu from './ImHexContextMenu';
import ContextMenuActions from './ContextMenuActions';

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

interface ViewportState {
  position: Position;
  scale: number;
  width: number;
  height: number;
  zLevel?: number; // Current Z-context level for 4D navigation
}

interface ZContext {
  currentLevel: number; // 0-4 Z-levels
  lastClickedWindow: string | null;
  lastTerritory: string | null;
  lastSelection: string[];
  interactionDepth: number;
}

interface StarCraftMinimapProps {
  items: DesktopItemData[];
  viewport: ViewportState;
  onViewportChange: (position: Position) => void;
  onContextZoneClick: (items: DesktopItemData[]) => void;
  onZoom: (zoomDelta: number) => void;
  canvasSize: { width: number; height: number };
  visible?: boolean;
  onToggleVisibility?: () => void;
  // KI-Workflow callbacks
  onReasonerAction?: (item: DesktopItemData, action: string) => void;
  onCoderAction?: (item: DesktopItemData, action: string) => void;
  onRefinerAction?: (item: DesktopItemData, action: string) => void;
  onAddToContext?: (item: DesktopItemData) => void;
  onRemoveFromContext?: (item: DesktopItemData) => void;
  onExportItem?: (item: DesktopItemData, format: string) => void;
  onTransformItem?: (item: DesktopItemData, transformation: string) => void;
  onVisualizeItem?: (item: DesktopItemData, visualizationType: string) => void;
}

export const StarCraftMinimap: React.FC<StarCraftMinimapProps> = ({
  items,
  viewport,
  onViewportChange,
  onContextZoneClick,
  onZoom,
  visible = true,
  onToggleVisibility,
  // KI-Workflow callbacks
  onReasonerAction,
  onCoderAction,
  onRefinerAction,
  onAddToContext,
  onRemoveFromContext,
  onExportItem,
  onTransformItem,
  onVisualizeItem
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [minimapSize] = useState({ width: 200, height: 200 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  
  // Context Menu States
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    targetItem: DesktopItemData | null;
    items: DesktopItemData[];
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    targetItem: null,
    items: []
  });
  
  // 4D Navigation - Z-Context State
  const [zContext, setZContext] = useState<ZContext>({
    currentLevel: 0,
    lastClickedWindow: null,
    lastTerritory: null,
    lastSelection: [],
    interactionDepth: 0
  });

  // Z-Level Definitions (StarCraft-Style)
  const Z_LEVELS = {
    0: { name: '🌌 Strategic', description: 'Gesamtübersicht aller Items', color: '#4a90e2' },
    1: { name: '🏛️ Tactical', description: 'Territory-Focus', color: '#00bfff' },
    2: { name: '🪟 Operational', description: 'Fenster-Focus', color: '#00ffcc' },
    3: { name: '🎯 Micro', description: 'Selektion-Focus', color: '#ffcc00' },
    4: { name: '🧠 Context', description: 'Kontext-Items', color: '#ff8c00' }
  };

  // Context Menu Actions
  const contextMenuActions = useMemo(() => new ContextMenuActions({
    onReasonerAction,
    onCoderAction,
    onRefinerAction,
    onAddToContext,
    onRemoveFromContext,
    onExportItem,
    onTransformItem,
    onVisualizeItem
  }), [onReasonerAction, onCoderAction, onRefinerAction, onAddToContext, onRemoveFromContext, onExportItem, onTransformItem, onVisualizeItem]);

  // Z-Level Item Filtering (4D-Navigation)
  const getZLevelForItem = useCallback((item: DesktopItemData) => {
    // Dynamic Z-level assignment based on context
    if (item.is_contextual) return 4; // Context items highest priority
    if (zContext.lastClickedWindow === item.id) return 2; // Last clicked window
    if (zContext.lastSelection.includes(item.id)) return 3; // Selection focus
    return 0; // Default strategic level
  }, [zContext]);

  // Filter items based on current Z-level
  const filteredItems = useMemo(() => {
    if (zContext.currentLevel === 0) return items; // Strategic: show all
    
    return items.filter(item => {
      const itemZLevel = getZLevelForItem(item);
      const zTolerance = 1; // Show items within 1 Z-level
      return Math.abs(itemZLevel - zContext.currentLevel) <= zTolerance;
    });
  }, [items, zContext.currentLevel, getZLevelForItem]);

  // Calculate Z-depth opacity for items
  const getZOpacity = useCallback((item: DesktopItemData) => {
    const itemZLevel = getZLevelForItem(item);
    const zDistance = Math.abs(itemZLevel - zContext.currentLevel);
    return Math.max(0.2, 1 - (zDistance * 0.25)); // Fade with distance
  }, [getZLevelForItem, zContext.currentLevel]);

  // StarCraft-inspired color scheme
  const SC_COLORS = {
    // Background
    background: '#0a0a0a',
    border: '#2d4a5a',
    frame: '#1a2d3a',
    
    // Unit types (StarCraft inspired)
    notizzettel: '#ffff00',    // Yellow - like minerals
    tabelle: '#00ffff',        // Cyan - like vespene gas
    code: '#4a90e2',           // Blue - like command centers
    browser: '#9013fe',        // Purple - like protoss units
    terminal: '#00ff00',       // Green - like own units
    tui: '#00ff88',           // Bright green - like SCVs
    media: '#ff6b6b',         // Red - like enemy units
    chart: '#4ecdc4',         // Light blue - like buildings
    calendar: '#ffa500',      // Orange - like special units
    
    // States
    contextual: '#ffaa00',     // Orange - like selected units
    viewport: '#ffffff',       // White - classic SC viewport
    grid: '#1a1a1a',          // Dark grid
    zone: '#2a2a2a'           // Zone background
  };

  // Calculate dynamic minimap coverage with optimized zoom-level relationship
  const dynamicCoverage = useMemo(() => {
    // Progressive coverage scaling for intuitive zoom behavior
    const viewportWidth = viewport.width / viewport.scale;
    const viewportHeight = viewport.height / viewport.scale;
    
    // Coverage should be proportional to visible area but with reasonable limits
    const coverageMultiplier = Math.max(2, Math.min(8, 4 / viewport.scale)); // 2x to 8x viewport size
    const coverage = {
      width: Math.max(800, viewportWidth * coverageMultiplier),
      height: Math.max(600, viewportHeight * coverageMultiplier),
      centerX: -viewport.position.x, // KORREKTUR: Weltkoordinaten statt Canvas-Position
      centerY: -viewport.position.y
    };
    
    return coverage;
  }, [viewport.scale, viewport.position, viewport.width, viewport.height]);

  // Calculate scale factors for dynamic coverage area
  const scale = useMemo(() => ({
    x: minimapSize.width / dynamicCoverage.width,
    y: minimapSize.height / dynamicCoverage.height,
    z: 1 // Z-scale for depth visualization
  }), [minimapSize, dynamicCoverage]);

  // Center offset - Current viewport position should be in minimap center
  const centerOffset = useMemo(() => ({
    x: minimapSize.width * 0.5,
    y: minimapSize.height * 0.5,
    z: 0 // Base Z-level
  }), [minimapSize]);

  // Calculate viewport rectangle for dynamic coverage system - KORRIGIERT!
  const viewportRect = useMemo(() => {
    // Actual viewport dimensions in world coordinates
    const viewportWidth = viewport.width / viewport.scale;
    const viewportHeight = viewport.height / viewport.scale;
    
    // Actual viewport position in world coordinates
    // viewport.position ist die Canvas-Translation, wir brauchen die Weltkoordinaten
    // Inverse transformation: viewport.position = -actualWorldPosition * scale
    const actualViewportWorldX = -viewport.position.x / viewport.scale;
    const actualViewportWorldY = -viewport.position.y / viewport.scale;
    
    // Transform world coordinates to minimap coordinates
    // Viewport-Zentrum relativ zum dynamicCoverage-Zentrum
    const relativeToCenter = {
      x: actualViewportWorldX - dynamicCoverage.centerX,
      y: actualViewportWorldY - dynamicCoverage.centerY
    };
    
    // Debug viewport rectangle calculation
    if (import.meta.env.DEV && Math.random() < 0.05) {
      console.log('🔍 Viewport Rectangle Debug:', {
        viewportPos: viewport.position,
        viewportScale: viewport.scale,
        actualWorld: { x: actualViewportWorldX, y: actualViewportWorldY },
        dynamicCenter: { x: dynamicCoverage.centerX, y: dynamicCoverage.centerY },
        relativeToCenter,
        minimapCoords: { 
          x: centerOffset.x + (relativeToCenter.x * scale.x), 
          y: centerOffset.y + (relativeToCenter.y * scale.y) 
        }
      });
    }
    
    // Minimap-Koordinaten (gleiche Transformation wie bei Desktop-Items)
    const minimapX = centerOffset.x + (relativeToCenter.x * scale.x);
    const minimapY = centerOffset.y + (relativeToCenter.y * scale.y);
    const minimapWidth = viewportWidth * scale.x;
    const minimapHeight = viewportHeight * scale.y;
    
    // Debug-Logging für Viewport-Transformation
    if (import.meta.env.DEV && Math.random() < 0.02) { // 2% sampling
      console.log('📺 Viewport Transform:', {
        canvasPosition: { x: viewport.position.x, y: viewport.position.y },
        worldPosition: { x: actualViewportWorldX, y: actualViewportWorldY },
        relativeToCenter: relativeToCenter,
        minimapRect: { x: minimapX, y: minimapY, w: minimapWidth, h: minimapHeight },
        scale: viewport.scale,
        dynamicCoverage: dynamicCoverage
      });
    }
    
    return {
      x: minimapX,
      y: minimapY,
      width: minimapWidth,
      height: minimapHeight,
      z: viewport.position.z // Include Z-level for future 4D-UX
    };
  }, [viewport, scale, centerOffset, dynamicCoverage]);

  // Helper function to get mouse position relative to canvas (unified for all events)
  const getCanvasMousePosition = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  // Helper function to check if mouse is within viewport rectangle (white square)
  const isMouseInViewportRect = useCallback((mouseX: number, mouseY: number) => {
    const isInRect = mouseX >= viewportRect.x && 
                    mouseX <= viewportRect.x + viewportRect.width &&
                    mouseY >= viewportRect.y && 
                    mouseY <= viewportRect.y + viewportRect.height;
    
    // Enhanced debug viewport area detection for zoom issue
    if (import.meta.env.DEV && Math.random() < 0.3) { // Increased sampling for debugging
      console.log('🎯 Viewport Area Detection (Enhanced):', {
        mousePos: { x: mouseX, y: mouseY },
        viewportRect: { 
          x: viewportRect.x, 
          y: viewportRect.y, 
          w: viewportRect.width, 
          h: viewportRect.height,
          xEnd: viewportRect.x + viewportRect.width,
          yEnd: viewportRect.y + viewportRect.height
        },
        minimapSize: { w: minimapSize.width, h: minimapSize.height },
        checks: {
          xInRange: mouseX >= viewportRect.x && mouseX <= viewportRect.x + viewportRect.width,
          yInRange: mouseY >= viewportRect.y && mouseY <= viewportRect.y + viewportRect.height
        },
        isInViewportRect: isInRect,
        interaction: isInRect ? 'ALLOWED' : 'BLOCKED'
      });
    }
    
    return isInRect;
  }, [viewportRect, minimapSize]);

  // Efficient item clustering for large numbers of objects
  const clusteredItems = useMemo(() => {
    const clusters: { [key: string]: DesktopItemData[] } = {};
    const clusterSize = 50; // Pixel size for clustering
    
    items.forEach(item => {
      const clusterX = Math.floor(item.position.x / clusterSize);
      const clusterY = Math.floor(item.position.y / clusterSize);
      const key = `${clusterX}-${clusterY}`;
      
      if (!clusters[key]) clusters[key] = [];
      clusters[key].push(item);
    });
    
    return clusters;
  }, [items]);

  // Calculate edge indicators - show if content exists outside current coverage (infinitechess.com style)
  const edgeIndicators = useMemo(() => {
    const coverage = dynamicCoverage;
    const margin = 100; // Margin for edge detection
    
    const indicators = {
      north: false,
      south: false,
      east: false,
      west: false,
      northeast: false,
      northwest: false,
      southeast: false,
      southwest: false
    };
    
    items.forEach(item => {
      const x = item.position.x;
      const y = item.position.y;
      
      // Check if item is outside current coverage area
      if (x < coverage.centerX - coverage.width / 2 - margin) {
        indicators.west = true;
        if (y < coverage.centerY - coverage.height / 2 - margin) indicators.northwest = true;
        if (y > coverage.centerY + coverage.height / 2 + margin) indicators.southwest = true;
      }
      if (x > coverage.centerX + coverage.width / 2 + margin) {
        indicators.east = true;
        if (y < coverage.centerY - coverage.height / 2 - margin) indicators.northeast = true;
        if (y > coverage.centerY + coverage.height / 2 + margin) indicators.southeast = true;
      }
      if (y < coverage.centerY - coverage.height / 2 - margin) {
        indicators.north = true;
      }
      if (y > coverage.centerY + coverage.height / 2 + margin) {
        indicators.south = true;
      }
    });
    
    return indicators;
  }, [items, dynamicCoverage]);

  // Efficient rendering using Canvas API
  const renderMinimap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with StarCraft-style background
    ctx.fillStyle = SC_COLORS.background;
    ctx.fillRect(0, 0, minimapSize.width, minimapSize.height);
    
    // Draw grid pattern (subtle, like StarCraft)
    ctx.strokeStyle = SC_COLORS.grid;
    ctx.lineWidth = 0.5;
    const gridSize = 20;
    
    for (let x = 0; x < minimapSize.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, minimapSize.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < minimapSize.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(minimapSize.width, y);
      ctx.stroke();
    }
    
    // Draw context zones with dynamic coverage transformation (like StarCraft fog of war)
    Object.entries(clusteredItems).forEach(([key, clusterItems]) => {
      const [clusterX, clusterY] = key.split('-').map(Number);
      const relativeX = (clusterX * 50) - dynamicCoverage.centerX;
      const relativeY = (clusterY * 50) - dynamicCoverage.centerY;
      const x = centerOffset.x + relativeX * scale.x;
      const y = centerOffset.y + relativeY * scale.y;
      const size = 50 * Math.min(scale.x, scale.y);
      
      const hasContextual = clusterItems.some(item => item.is_contextual);
      
      if (hasContextual) {
        ctx.fillStyle = SC_COLORS.contextual + '40'; // Semi-transparent
        ctx.fillRect(x, y, size, size);
      } else if (clusterItems.length > 3) {
        ctx.fillStyle = SC_COLORS.zone + '20';
        ctx.fillRect(x, y, size, size);
      }
    });
    
    // Draw items as colored dots with 4D-positioning (Z-level aware)
    filteredItems.forEach(item => {
      // Apply coordinate transformation relative to dynamic coverage area
      const relativeX = item.position.x - dynamicCoverage.centerX;
      const relativeY = item.position.y - dynamicCoverage.centerY;
      const x = centerOffset.x + (relativeX * scale.x);
      const y = centerOffset.y + (relativeY * scale.y);
      
      // Skip if outside visible minimap area
      if (x < 0 || x > minimapSize.width || y < 0 || y > minimapSize.height) return;
      
      const color = SC_COLORS[item.type as keyof typeof SC_COLORS] || SC_COLORS.notizzettel;
      
      // 4D-UX: Z-level affects size and opacity
      const itemZLevel = getZLevelForItem(item);
      const zOpacity = getZOpacity(item);
      const baseSize = item.is_contextual ? 3 : 2;
      const zSizeFactor = itemZLevel === zContext.currentLevel ? 1.2 : 1.0; // Emphasize current Z-level
      const size = baseSize * zSizeFactor;
      
      // Create color with Z-opacity
      const colorWithAlpha = color + Math.floor(zOpacity * 255).toString(16).padStart(2, '0');
      
      ctx.fillStyle = colorWithAlpha;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
      
      // Add Z-level glow effect
      if (itemZLevel === zContext.currentLevel) {
        const currentZColor = Z_LEVELS[zContext.currentLevel as keyof typeof Z_LEVELS].color;
        ctx.shadowColor = currentZColor;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(x, y, size + 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      
      // Contextual items get extra emphasis
      if (item.is_contextual) {
        ctx.shadowColor = color;
        ctx.shadowBlur = 6 * zOpacity;
        ctx.beginPath();
        ctx.arc(x, y, size + 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    });
    
    // Draw viewport rectangle (enhanced for exclusive PAN control)
    const clampedRect = {
      x: Math.max(0, viewportRect.x),
      y: Math.max(0, viewportRect.y),
      width: Math.min(minimapSize.width - Math.max(0, viewportRect.x), viewportRect.width),
      height: Math.min(minimapSize.height - Math.max(0, viewportRect.y), viewportRect.height)
    };
    
    // Fill viewport with semi-transparent overlay
    ctx.fillStyle = isDragging ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)';
    ctx.fillRect(clampedRect.x, clampedRect.y, clampedRect.width, clampedRect.height);
    
    // Draw viewport border (thicker when dragging)
    ctx.strokeStyle = SC_COLORS.viewport;
    ctx.lineWidth = isDragging ? 3 : 2;
    ctx.strokeRect(clampedRect.x, clampedRect.y, clampedRect.width, clampedRect.height);
    
    // Add viewport corners (enhanced visibility)
    const cornerSize = isDragging ? 6 : 4;
    ctx.fillStyle = SC_COLORS.viewport;
    const corners = [
      { x: clampedRect.x, y: clampedRect.y },
      { x: clampedRect.x + clampedRect.width, y: clampedRect.y },
      { x: clampedRect.x, y: clampedRect.y + clampedRect.height },
      { x: clampedRect.x + clampedRect.width, y: clampedRect.y + clampedRect.height }
    ];
    
    corners.forEach(corner => {
      ctx.fillRect(corner.x - cornerSize/2, corner.y - cornerSize/2, cornerSize, cornerSize);
    });
    
    // Add dragging indicator
    if (isDragging) {
      ctx.shadowColor = SC_COLORS.viewport;
      ctx.shadowBlur = 10;
      ctx.strokeRect(clampedRect.x, clampedRect.y, clampedRect.width, clampedRect.height);
      ctx.shadowBlur = 0;
    }
    
    // Draw edge indicators (infinitechess.com style arrows)
    const arrowSize = 12;
    const arrowMargin = 8;
    ctx.fillStyle = SC_COLORS.viewport;
    ctx.strokeStyle = SC_COLORS.viewport;
    ctx.lineWidth = 2;
    
    // Draw directional arrows for content outside coverage area
    if (edgeIndicators.north) {
      // North arrow
      const x = minimapSize.width / 2;
      const y = arrowMargin;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - arrowSize/2, y + arrowSize);
      ctx.lineTo(x + arrowSize/2, y + arrowSize);
      ctx.closePath();
      ctx.fill();
    }
    
    if (edgeIndicators.south) {
      // South arrow
      const x = minimapSize.width / 2;
      const y = minimapSize.height - arrowMargin;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - arrowSize/2, y - arrowSize);
      ctx.lineTo(x + arrowSize/2, y - arrowSize);
      ctx.closePath();
      ctx.fill();
    }
    
    if (edgeIndicators.east) {
      // East arrow
      const x = minimapSize.width - arrowMargin;
      const y = minimapSize.height / 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - arrowSize, y - arrowSize/2);
      ctx.lineTo(x - arrowSize, y + arrowSize/2);
      ctx.closePath();
      ctx.fill();
    }
    
    if (edgeIndicators.west) {
      // West arrow
      const x = arrowMargin;
      const y = minimapSize.height / 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + arrowSize, y - arrowSize/2);
      ctx.lineTo(x + arrowSize, y + arrowSize/2);
      ctx.closePath();
      ctx.fill();
    }
    
    // Corner arrows (diagonal)
    if (edgeIndicators.northeast) {
      const x = minimapSize.width - arrowMargin;
      const y = arrowMargin;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - arrowSize, y);
      ctx.lineTo(x, y + arrowSize);
      ctx.closePath();
      ctx.fill();
    }
    
    if (edgeIndicators.northwest) {
      const x = arrowMargin;
      const y = arrowMargin;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + arrowSize, y);
      ctx.lineTo(x, y + arrowSize);
      ctx.closePath();
      ctx.fill();
    }
    
    if (edgeIndicators.southeast) {
      const x = minimapSize.width - arrowMargin;
      const y = minimapSize.height - arrowMargin;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - arrowSize, y);
      ctx.lineTo(x, y - arrowSize);
      ctx.closePath();
      ctx.fill();
    }
    
    if (edgeIndicators.southwest) {
      const x = arrowMargin;
      const y = minimapSize.height - arrowMargin;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + arrowSize, y);
      ctx.lineTo(x, y - arrowSize);
      ctx.closePath();
      ctx.fill();
    }
  }, [items, viewportRect, scale, clusteredItems, minimapSize, edgeIndicators]);

  // Animation loop for smooth updates
  useEffect(() => {
    const animate = () => {
      renderMinimap();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    if (visible) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [visible, renderMinimap]);

  // Native wheel event listener - ZOOM only within viewport rectangle
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !visible) return;

    const handleNativeWheel = (e: WheelEvent) => {
      e.preventDefault(); // This works with { passive: false }
      e.stopPropagation();
      
      // Get mouse position using unified helper function
      const mousePos = getCanvasMousePosition(e.clientX, e.clientY);
      
      // Check if mouse is within viewport rectangle using helper function
      const isInViewportRect = isMouseInViewportRect(mousePos.x, mousePos.y);
      
      // FALLBACK: If viewport detection fails, check if mouse is in minimap bounds
      const isInMinimapBounds = mousePos.x >= 0 && mousePos.x <= minimapSize.width && 
                               mousePos.y >= 0 && mousePos.y <= minimapSize.height;
      
      // Use either viewport detection or minimap bounds as fallback
      const allowZoom = isInViewportRect || isInMinimapBounds;
      
      // Debug viewport area zoom - ERWEITERT
      if (import.meta.env.DEV) {
        const canvas = canvasRef.current;
        const rect = canvas?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
        
        console.log('🔍 Viewport Area Zoom Debug - FIXED:', {
          mousePos: { x: mousePos.x, y: mousePos.y },
          canvasRect: { 
            left: rect.left, 
            top: rect.top, 
            width: rect.width, 
            height: rect.height 
          },
          clientPos: { x: e.clientX, y: e.clientY },
          viewportRect: { 
            x: viewportRect.x, 
            y: viewportRect.y, 
            w: viewportRect.width, 
            h: viewportRect.height 
          },
          minimapSize: { w: minimapSize.width, h: minimapSize.height },
          isInViewportRect,
          isInMinimapBounds,
          allowZoom,
          deltaY: e.deltaY,
          zoomAllowed: allowZoom,
          action: allowZoom ? 'ZOOM APPLIED' : 'ZOOM BLOCKED',
          eventType: 'NATIVE_WHEEL',
          approach: 'Viewport + Minimap bounds fallback'
        });
      }
      
      // Handle different scroll modes
      if (e.altKey) {
        // Alt+Scroll: Navigate through Z-levels (4D Navigation)
        const zDelta = e.deltaY > 0 ? 1 : -1;
        const newZLevel = Math.max(0, Math.min(4, zContext.currentLevel + zDelta));
        
        if (newZLevel !== zContext.currentLevel) {
          setZContext(prev => ({ ...prev, currentLevel: newZLevel }));
          
          if (import.meta.env.DEV) {
            console.log('🌌 Z-Level Navigation:', {
              oldLevel: zContext.currentLevel,
              newLevel: newZLevel,
              levelName: Z_LEVELS[newZLevel as keyof typeof Z_LEVELS].name,
              description: Z_LEVELS[newZLevel as keyof typeof Z_LEVELS].description
            });
          }
        }
      } else if (allowZoom) {
        // Regular scroll: Zoom (in viewport rectangle or minimap bounds)
        const zoomDelta = e.deltaY * 0.3;
        onZoom(zoomDelta);
      }
    };

    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    
    return () => {
      canvas.removeEventListener('wheel', handleNativeWheel);
    };
  }, [visible, onZoom, isMouseInViewportRect]);

  // Handle minimap navigation with dynamic coverage (infinitechess.com style)
  const handleMinimapClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert minimap coordinates to world coordinates within dynamic coverage
    const relativeX = (x - centerOffset.x) / scale.x;
    const relativeY = (y - centerOffset.y) / scale.y;
    const worldX = dynamicCoverage.centerX + relativeX;
    const worldY = dynamicCoverage.centerY + relativeY;
    
    onViewportChange({ x: worldX, y: worldY, z: viewport.position.z });
  }, [scale, viewport, onViewportChange, centerOffset, dynamicCoverage]);

  // Handle viewport dragging - PAN only within viewport rectangle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Check if event originated from a draggable desktop item (higher priority)
    const target = e.target as HTMLElement;
    const isDesktopItemDrag = target.closest('.desktop-item-header') || 
                             target.closest('.desktop-item-title') ||
                             target.closest('[draggable="true"]');
    
    if (isDesktopItemDrag) {
      // Desktop item drag has priority - don't interfere with minimap interaction
      return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if mouse is within viewport rectangle (white square)
    const isInViewportRect = isMouseInViewportRect(x, y);
    
    // COMPREHENSIVE DEBUG - Check if mouse events are triggered
    if (import.meta.env.DEV) {
      console.log('🖱️ MOUSE DOWN EVENT TRIGGERED:', {
        mousePos: { x, y },
        clientPos: { x: e.clientX, y: e.clientY },
        isInViewportRect,
        isDesktopItemDrag,
        canvasExists: !!canvas,
        eventTriggered: true,
        action: isInViewportRect ? 'PAN START' : 'CLICK NAVIGATION'
      });
    }
    
    if (isInViewportRect) {
      // PAN mode - drag within viewport rectangle
      setIsDragging(true);
      // Store initial mouse position (client coordinates for delta calculation)
      setLastMousePos({ x: e.clientX, y: e.clientY });
      
      if (import.meta.env.DEV) {
        console.log('🖱️ PAN DRAG START - DETAILED:', {
          canvasPos: { x, y },
          clientPos: { x: e.clientX, y: e.clientY },
          isDragging: true,
          lastMousePos: { x: e.clientX, y: e.clientY },
          approach: 'Simple pixel delta',
          stateSet: 'isDragging = true'
        });
      }
    } else {
      // Click navigation - outside viewport rectangle
      handleMinimapClick(e);
    }
  }, [isMouseInViewportRect, handleMinimapClick]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // COMPREHENSIVE DEBUG - Check if mouse move is triggered
    if (import.meta.env.DEV && Math.random() < 0.2) {
      console.log('🖱️ MOUSE MOVE EVENT:', {
        isDragging,
        hasCanvas: !!canvasRef.current,
        clientPos: { x: e.clientX, y: e.clientY },
        lastMousePos,
        eventTriggered: true,
        willProcess: isDragging && !!canvasRef.current
      });
    }
    
    if (!isDragging || !canvasRef.current) return;
    
    // Simple pixel delta calculation
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;
    
    // COMPREHENSIVE DEBUG - Check delta calculation
    if (import.meta.env.DEV) {
      console.log('🖱️ MOUSE MOVE PROCESSING:', {
        currentClient: { x: e.clientX, y: e.clientY },
        lastMousePos,
        pixelDelta: { x: deltaX, y: deltaY },
        hasMovement: deltaX !== 0 || deltaY !== 0,
        isDragging: true
      });
    }
    
    // Simple damping like keyboard PAN
    const dampingFactor = 0.5 * (e.ctrlKey ? 0.2 : 1.0);
    
    // Direct canvas coordinates like keyboard PAN
    const newCanvasX = viewport.position.x - (deltaX * dampingFactor);
    const newCanvasY = viewport.position.y - (deltaY * dampingFactor);
    
    // Update last mouse position for next delta calculation
    setLastMousePos({ x: e.clientX, y: e.clientY });
    
    // COMPREHENSIVE DEBUG - Check final values
    if (import.meta.env.DEV) {
      console.log('🖱️ CANVAS COORDINATE UPDATE (Fixed):', {
        pixelDelta: { x: deltaX, y: deltaY },
        dampingFactor,
        currentCanvas: { x: viewport.position.x, y: viewport.position.y },
        newCanvasPos: { x: newCanvasX, y: newCanvasY },
        approach: 'Direct canvas coordinates (like keyboard PAN)',
        onViewportChangeExists: !!onViewportChange
      });
    }
    
    onViewportChange({ x: newCanvasX, y: newCanvasY, z: viewport.position.z });
  }, [isDragging, lastMousePos, scale, onViewportChange, viewport.scale, viewport.position]);

  const handleMouseUp = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log('🖱️ MOUSE UP EVENT:', {
        wasDragging: isDragging,
        action: 'DRAG TERMINATED - MouseUp',
        eventTriggered: true,
        willSetFalse: isDragging
      });
    }
    setIsDragging(false);
  }, [isDragging]);

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Handle context zone clicks with dynamic coverage
  const handleContextZoneClick = useCallback((e: React.MouseEvent) => {
    if (e.ctrlKey) { // Ctrl+click for context zones
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Find items in clicked area with dynamic coverage transformation
      const clickRadius = 20;
      const nearbyItems = items.filter(item => {
        const relativeX = item.position.x - dynamicCoverage.centerX;
        const relativeY = item.position.y - dynamicCoverage.centerY;
        const itemX = centerOffset.x + (relativeX * scale.x);
        const itemY = centerOffset.y + (relativeY * scale.y);
        const distance = Math.sqrt((x - itemX) ** 2 + (y - itemY) ** 2);
        return distance <= clickRadius;
      });
      
      if (nearbyItems.length > 0) {
        onContextZoneClick(nearbyItems);
      }
    }
  }, [items, scale, onContextZoneClick, centerOffset, dynamicCoverage]);

  // Note: handleMinimapWheel was removed as we now use native event listeners

  // Handle context menu with ImHex-style integration
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    // Only handle if click is directly on the minimap canvas, not desktop items
    if (e.target !== canvasRef.current) {
      // Allow normal context menu behavior for desktop items
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    
    // Get canvas coordinates
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find items in clicked area with dynamic coverage transformation
    const clickRadius = 30;
    const nearbyItems = items.filter(item => {
      const relativeX = item.position.x - dynamicCoverage.centerX;
      const relativeY = item.position.y - dynamicCoverage.centerY;
      const itemX = centerOffset.x + (relativeX * scale.x);
      const itemY = centerOffset.y + (relativeY * scale.y);
      const distance = Math.sqrt((x - itemX) ** 2 + (y - itemY) ** 2);
      return distance <= clickRadius;
    });
    
    if (nearbyItems.length > 0) {
      // Show ImHex-style context menu
      const primaryItem = nearbyItems[0]; // Use closest item as primary
      
      setContextMenu({
        visible: true,
        position: { x: e.clientX, y: e.clientY }, // Use client coordinates for fixed positioning
        targetItem: primaryItem,
        items: nearbyItems
      });
      
      // Debug context menu
      if (import.meta.env.DEV) {
        console.log('🎯 Context Menu Triggered:', {
          position: { x: e.clientX, y: e.clientY },
          primaryItem: primaryItem.type,
          nearbyItems: nearbyItems.length,
          itemTitles: nearbyItems.map(item => item.title)
        });
      }
    }
  }, [items, scale, centerOffset, dynamicCoverage]);

  if (!visible) {
    return (
      <div className="starcraft-minimap-toggle">
        <button
          className="sc-minimap-toggle-btn"
          onClick={onToggleVisibility}
          title="Minimap aktivieren"
        >
          🗺️
        </button>
      </div>
    );
  }

  return (
    <div className="starcraft-minimap-container" ref={containerRef}>
      <div className="sc-minimap-header">
        <div className="sc-minimap-title">
          <span className="sc-title-text">MINIMAP</span>
          <div className="sc-stats">
            <span className="sc-stat">{items.length}</span>
            <span className="sc-stat-label">UNITS</span>
          </div>
          <div className="sc-zoom-indicator">
            <span className="sc-zoom-value">{Math.round(viewport.scale * 100)}%</span>
            <span className="sc-zoom-label">ZOOM</span>
          </div>
        </div>
        <div className="sc-minimap-controls">
          <button
            className="sc-control-btn"
            onClick={() => onViewportChange({ x: 0, y: 0, z: 0 })}
            title="Zentrum"
          >
            ⌖
          </button>
          <button
            className="sc-control-btn"
            onClick={onToggleVisibility}
            title="Schließen"
          >
            ✕
          </button>
        </div>
        
      </div>
      
      {/* 4D Z-Level Indicator */}
      <div className="sc-z-level-indicator">
        <div className="sc-z-current" style={{ 
          color: Z_LEVELS[zContext.currentLevel as keyof typeof Z_LEVELS].color 
        }}>
          {Z_LEVELS[zContext.currentLevel as keyof typeof Z_LEVELS].name}
        </div>
        <div className="sc-z-dots">
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`sc-z-dot ${zContext.currentLevel === level ? 'active' : ''}`}
              style={{
                backgroundColor: zContext.currentLevel === level 
                  ? Z_LEVELS[level as keyof typeof Z_LEVELS].color 
                  : '#333',
                cursor: 'pointer'
              }}
              onClick={() => setZContext(prev => ({ ...prev, currentLevel: level }))}
              title={`${Z_LEVELS[level as keyof typeof Z_LEVELS].name} - ${Z_LEVELS[level as keyof typeof Z_LEVELS].description}`}
            />
          ))}
        </div>
      </div>

      <div className="sc-minimap-frame">
        <canvas
          ref={canvasRef}
          width={minimapSize.width}
          height={minimapSize.height}
          className="sc-minimap-canvas"
          onMouseDown={handleMouseDown}
          onClick={handleContextZoneClick}
          onContextMenu={handleContextMenu}
          style={{ cursor: isDragging ? 'grabbing' : 'crosshair' }}
        />
      </div>

      <div className="sc-minimap-legend">
        <div className="sc-legend-row">
          <div className="sc-legend-item">
            <div className="sc-color-dot" style={{ backgroundColor: SC_COLORS.terminal }}></div>
            <span>TUI</span>
          </div>
          <div className="sc-legend-item">
            <div className="sc-color-dot" style={{ backgroundColor: SC_COLORS.code }}></div>
            <span>CODE</span>
          </div>
          <div className="sc-legend-item">
            <div className="sc-color-dot" style={{ backgroundColor: SC_COLORS.tabelle }}></div>
            <span>DATA</span>
          </div>
        </div>
        <div className="sc-legend-row">
          <div className="sc-legend-item">
            <div className="sc-color-dot" style={{ backgroundColor: SC_COLORS.contextual }}></div>
            <span>ACTIVE</span>
          </div>
          <div className="sc-control-hint">
            <span>SCROLL: ZOOM</span>
          </div>
        </div>
        <div className="sc-legend-row">
          <div className="sc-control-hint">
            <span>DRAG □: PAN</span>
          </div>
          <div className="sc-control-hint">
            <span>RIGHT-CLICK: CONTEXT</span>
          </div>
        </div>
      </div>

      {/* ImHex-Style Context Menu */}
      <ImHexContextMenu
        items={contextMenu.targetItem ? contextMenuActions.getContextMenuItems(contextMenu.targetItem) : []}
        position={contextMenu.position}
        onClose={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        visible={contextMenu.visible}
        targetItem={contextMenu.targetItem}
      />
    </div>
  );
};

export default StarCraftMinimap;