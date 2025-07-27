import React, { useRef, useCallback, useEffect, useState } from 'react';
import { µ2_useMinimap } from '../../hooks/µ2_useMinimap';

interface DesktopItemData {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; z: number };
  width?: number;
  height?: number;
  is_contextual?: boolean;
}

interface CanvasState {
  position: { x: number; y: number; z: number };
  scale: number;
  velocity: { x: number; y: number; z: number };
  isDragging: boolean;
  momentum: { x: number; y: number };
}

interface MinimapWidgetProps {
  items: DesktopItemData[];
  canvasState: CanvasState;
  onNavigationChange?: (position: { x: number; y: number; z: number }) => void;
  onZoomChange?: (scale: number) => void;
  className?: string;
  style?: React.CSSProperties;
  showControls?: boolean;
  showStats?: boolean;
  size?: { width: number; height: number };
}

/**
 * 🗺️ MinimapWidget - Hook-to-Component Bridge
 * 
 * Verbindet useMinimap Hook mit einer vollständigen StarCraft-Style Minimap.
 * Präzise Navigation, Context-Zones und Performance-Optimierung.
 */
export const MinimapWidget: React.FC<MinimapWidgetProps> = ({
  items = [],
  canvasState,
  onNavigationChange,
  onZoomChange,
  className = '',
  style = {},
  showControls = true,
  showStats = false,
  size = { width: 250, height: 180 }
}) => {
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  
  // Hook Integration - µ2_ Bagua Minimap System
  const minimap = µ2_useMinimap();

  // Handle navigation changes - TODO V2: Implement with µ2_ Bagua system
  const handleNavigationChange = useCallback((position: { x: number; y: number; z: number }) => {
    // TODO V2: Implement viewport change handling with µ2_ minimap system
    // const adjustedPosition = minimap.handleViewportChange(position, 'medium');
    onNavigationChange?.(position); // Direct passthrough for now
  }, [onNavigationChange]);

  // Handle zoom changes - TODO V2: Implement with µ2_ Bagua system
  const handleZoomChange = useCallback((zoomDelta: number, ctrlKey = false) => {
    // TODO V2: Implement zoom handling with µ2_ minimap system
    // const newScale = minimap.handleMinimapZoom(zoomDelta, ctrlKey);
    void zoomDelta; // Acknowledge parameter
    void ctrlKey; // Acknowledge parameter
    onZoomChange?.(1.0); // Default scale for now
  }, [onZoomChange]);

  // Canvas rendering
  const renderMinimap = useCallback(() => {
    const canvas = minimapRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = size;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Calculate minimap transform using µ2_ Bagua system with proper parameters
    const transform = minimap.getMinimapTransform(items, canvasState);
    
    // Dynamic canvas size based on zoom level
    const zoomLevel = canvasState?.scale || 1.0;
    const baseCanvasSize = 4000;
    const visibleCanvasSize = baseCanvasSize / Math.max(zoomLevel, 0.1);
    const canvasSize = { width: visibleCanvasSize, height: visibleCanvasSize };
    
    // Draw zoom-responsive background grid
    ctx.strokeStyle = 'rgba(26, 127, 86, 0.1)';
    ctx.lineWidth = 1;
    
    // Grid-Größe basierend auf Zoom - bei hohem Zoom größere Grid-Zellen
    const baseGridSize = 500; // Welt-Grid-Größe in Canvas-Koordinaten
    const gridSizeInMinimap = baseGridSize * transform.scale;
    
    // Zeichne nur Grids, die groß genug sind (mindestens 5px)
    if (gridSizeInMinimap > 5) {
      for (let x = 0; x < width; x += gridSizeInMinimap) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y < height; y += gridSizeInMinimap) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    // Draw items with zoom-responsive positioning
    items.forEach(item => {
      const itemX = (item.position.x + canvasSize.width/2) * transform.scale;
      const itemY = (item.position.y + canvasSize.height/2) * transform.scale;
      const itemW = (item.width || 250) * transform.scale;
      const itemH = (item.height || 200) * transform.scale;

      // Skip items outside minimap bounds
      if (itemX + itemW < 0 || itemX > width || itemY + itemH < 0 || itemY > height) {
        return;
      }

      // Color coding based on type
      const typeColors: Record<string, string> = {
        notizzettel: '#ffeb3b',
        tabelle: '#2196f3',
        code: '#9c27b0',
        tui: '#4caf50',
        browser: '#ff9800',
        media: '#e91e63',
        chart: '#00bcd4',
        calendar: '#8bc34a'
      };

      ctx.fillStyle = item.is_contextual ? 
        'rgba(26, 127, 86, 0.8)' : 
        typeColors[item.type] || 'rgba(100, 100, 100, 0.6)';
      
      ctx.fillRect(itemX, itemY, Math.max(2, itemW), Math.max(2, itemH));

      // Context highlight
      if (item.is_contextual) {
        ctx.strokeStyle = '#1a7f56';
        ctx.lineWidth = 2;
        ctx.strokeRect(itemX - 1, itemY - 1, itemW + 2, itemH + 2);
      }
    });

    // Draw context zones using µ2_ Bagua territory system
    minimap.currentContextZones.forEach((zone: any) => {
      const zoneX = (zone.bounds.x + canvasSize.width/2) * transform.scale;
      const zoneY = (zone.bounds.y + canvasSize.height/2) * transform.scale;
      const zoneW = zone.bounds.width * transform.scale;
      const zoneH = zone.bounds.height * transform.scale;

      ctx.strokeStyle = `rgba(26, 127, 86, ${zone.contextualItems > 0 ? 0.8 : 0.3})`;
      ctx.lineWidth = zone.contextualItems > 0 ? 3 : 1;
      ctx.setLineDash(zone.contextualItems > 0 ? [] : [5, 5]);
      ctx.strokeRect(zoneX, zoneY, zoneW, zoneH);
      ctx.setLineDash([]);
    });

    // Draw viewport rectangle
    const viewportX = transform.viewportX + width/2;
    const viewportY = transform.viewportY + height/2;
    const viewportW = transform.viewportWidth;
    const viewportH = transform.viewportHeight;

    ctx.strokeStyle = '#1a7f56';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, viewportY, viewportW, viewportH);
    
    // Viewport fill
    ctx.fillStyle = 'rgba(26, 127, 86, 0.1)';
    ctx.fillRect(viewportX, viewportY, viewportW, viewportH);

  }, [items, size, canvasState]);

  // Mouse interaction handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = minimapRef.current;
    if (!canvas) return;

    setIsInteracting(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert minimap coordinates to canvas coordinates using µ2_ system
    const transform = minimap.getMinimapTransform(items, canvasState);
    const minimapScale = minimap.µ2_calculateMinimapScale(items, canvasState);
    const newPosition = minimap.µ2_convertMinimapToWorld(x, y, minimapScale, items, canvasState);
    
    void e.ctrlKey; // Acknowledge parameter - TODO V2: Implement precision levels
    
    handleNavigationChange(newPosition);
  }, [minimap, handleNavigationChange]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isInteracting) return;
    handleMouseDown(e); // Continuous navigation while dragging
  }, [isInteracting, handleMouseDown]);

  const handleMouseUp = useCallback(() => {
    setIsInteracting(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? 1 : -1;
    handleZoomChange(zoomDelta, e.ctrlKey);
  }, [handleZoomChange]);

  // Keyboard shortcuts for minimap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        minimap.toggleVisibility();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [minimap]);

  // Render minimap when dependencies change
  useEffect(() => {
    requestAnimationFrame(renderMinimap);
  }, [items, canvasState.position.x, canvasState.position.y, canvasState.scale]);
  
  // µ2_renderMinimap trigger on coverage changes - REMOVED to prevent render loops
  // useEffect(() => {
  //   const coverage = minimap.calculateCoverage(items);
  //   // Trigger re-render when coverage changes significantly
  //   if (coverage.ratio > 0) {
  //     requestAnimationFrame(renderMinimap);
  //   }
  // }, [items, renderMinimap, minimap]);

  // Control buttons
  const ControlButton = ({ icon, title, onClick, active = false }: {
    icon: string;
    title: string;
    onClick: () => void;
    active?: boolean;
  }) => (
    <button
      className={`minimap-control ${active ? 'active' : ''}`}
      onClick={onClick}
      title={title}
      style={{
        background: active ? 'rgba(26, 127, 86, 0.8)' : 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        padding: '4px 6px',
        margin: '2px',
        cursor: 'pointer',
        fontSize: '12px',
        transition: 'all 0.2s ease'
      }}
    >
      {icon}
    </button>
  );

  // Stats display
  const StatsOverlay = () => {
    if (!showStats) return null;

    const coverage = minimap.calculateCoverage(items);
    const zones = minimap.currentContextZones;

    return (
      <div className="minimap-stats" style={{
        position: 'absolute',
        top: '4px',
        left: '4px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '4px 6px',
        borderRadius: '4px',
        fontSize: '10px',
        lineHeight: '1.2'
      }}>
        <div>📊 {items.length} items</div>
        <div>🎯 {zones.length} zones</div>
        <div>📐 {Math.round(coverage.ratio * 100)}% coverage</div>
        <div>🔍 {Math.round(canvasState.scale * 100)}%</div>
      </div>
    );
  };

  if (!minimap.minimapVisible) {
    return (
      <div className="minimap-hidden" style={{ 
        position: 'fixed', 
        bottom: '20px', 
        right: '20px',
        zIndex: 1000
      }}>
        <button
          onClick={minimap.toggleVisibility}
          style={{
            background: 'rgba(26, 127, 86, 0.9)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px',
            cursor: 'pointer'
          }}
        >
          🗺️ Minimap
        </button>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`minimap-widget ${className}`}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: `${size.width}px`,
        height: `${size.height + (showControls ? 40 : 0)}px`,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '2px solid rgba(26, 127, 86, 0.3)',
        borderRadius: '8px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        zIndex: 1000,
        ...style
      }}
    >
      {/* Minimap Canvas */}
      <div style={{ position: 'relative' }}>
        <canvas
          ref={minimapRef}
          width={size.width}
          height={size.height}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          style={{
            display: 'block',
            cursor: isInteracting ? 'grabbing' : 'grab'
          }}
        />
        
        <StatsOverlay />
      </div>

      {/* Control Panel */}
      {showControls && (
        <div className="minimap-controls" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '6px 8px',
          background: 'rgba(26, 127, 86, 0.1)',
          borderTop: '1px solid rgba(26, 127, 86, 0.2)'
        }}>
          <div className="minimap-controls-left">
            <ControlButton
              icon="🎯"
              title="Center View"
              onClick={() => handleNavigationChange({ x: 0, y: 0, z: 0 })}
            />
            <ControlButton
              icon="🔍"
              title="Fit All Items"
              onClick={() => {
                // Calculate bounds of all items
                if (items.length === 0) return;
                
                const xs = items.map(item => item.position.x);
                const ys = items.map(item => item.position.y);
                const minX = Math.min(...xs) - 100;
                const maxX = Math.max(...xs) + 300;
                const minY = Math.min(...ys) - 100;
                const maxY = Math.max(...ys) + 250;
                
                const centerX = (minX + maxX) / 2;
                const centerY = (minY + maxY) / 2;
                
                handleNavigationChange({ x: -centerX, y: -centerY, z: 0 });
              }}
            />
          </div>
          
          <div className="minimap-controls-right">
            <ControlButton
              icon="📊"
              title="Toggle Stats"
              onClick={() => {/* Toggle stats */}}
              active={showStats}
            />
            <ControlButton
              icon="✕"
              title="Hide Minimap"
              onClick={minimap.toggleVisibility}
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Export hook for external access - Updated for µ2_ Bagua System
export const useMinimapWidgetHook = () => 
  µ2_useMinimap();