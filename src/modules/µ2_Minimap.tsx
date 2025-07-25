/**
 * µ2_MINIMAP - StarCraft Minimap mit Bagua-Power
 * BAGUA: WIND (☴) - View/UI - "Sichtbare Schnittstellen"
 * 
 * @version 2.1.0-raimund-algebra
 * Resurrektion der geliebten StarCraft-Minimap mit philosophischer Fundierung
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { UDFormat } from '../core/UDFormat';
import type { DesktopItemData, CanvasState, Position } from '../types';
import { µ2_useMinimap } from '../hooks/µ2_useMinimap';
import { µ2_useBaguaColors } from '../hooks/µ2_useBaguaColors';
import { µ3_useNavigation } from '../hooks/µ3_useNavigation';
import '../styles/StarCraftMinimap.css';

interface MinimapProps {
  items: DesktopItemData[];
  canvasState: CanvasState;
  onNavigate: (position: Position) => void;
  onZoomChange?: (zoomLevel: number) => void;
  onItemSelect?: (itemId: string) => void;
  className?: string;
}

// Bagua-Farbschema wird jetzt durch µ2_useBaguaColors Hook bereitgestellt

export const µ2_Minimap: React.FC<MinimapProps> = ({
  items,
  canvasState,
  onNavigate,
  onZoomChange = () => {},
  onItemSelect = () => {},
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [coverage, setCoverage] = React.useState(4); // Zoom coverage level
  const [isDraggingViewport, setIsDraggingViewport] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  
  // Campus-Modell Hooks - Jeder macht NUR eine Sache
  const minimap = µ2_useMinimap();
  const baguaColors = µ2_useBaguaColors();
  const navigation = µ3_useNavigation();

  // µ2_ FEATURE 4 & 5: Zoom-Level Integration - StarCraft-Style
  const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];
  
  const µ2_calculateCoverage = useCallback((zoomLevel: number) => {
    // Bei Zoom 1x → Coverage 4x, Bei Zoom 0.25x → Coverage 8x, Bei Zoom 4x → Coverage 2x
    return 4 / Math.sqrt(Math.max(0.25, Math.min(4, zoomLevel)));
  }, []);

  // µ2_ Sync mit Canvas-Zoom - automatische Aktualisierung
  React.useEffect(() => {
    const newCoverage = µ2_calculateCoverage(canvasState.scale);
    if (Math.abs(newCoverage - coverage) > 0.1) { // Nur bei signifikanten Änderungen
      setCoverage(newCoverage);
      console.log('🔗 µ2_Minimap synced with Canvas zoom:', { 
        canvasScale: canvasState.scale, 
        newCoverage 
      });
    }
  }, [canvasState.scale, coverage, µ2_calculateCoverage]);

  // µ2_ FEATURE 1: ZOOM via Mausrad - Bagua-konform
  const µ2_handleMinimapWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    // Besseres Zoom-Mapping: Direkt Canvas-Scale beeinflussen
    const currentZoom = canvasState.scale;
    const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(5.0, currentZoom * zoomDelta));
    
    // Update Canvas zoom level - algebraischer Transistor
    const canZoom = UDFormat.transistor(newZoom >= 0.1 && newZoom <= 5.0);
    if (canZoom) {
      onZoomChange(newZoom);
      console.log('🎯 µ2_Minimap Wheel Zoom:', { 
        from: currentZoom.toFixed(2), 
        to: newZoom.toFixed(2),
        coverage: µ2_calculateCoverage(newZoom).toFixed(1)
      });
    }
  }, [canvasState.scale, onZoomChange, µ2_calculateCoverage]);

  // µ2_ Campus-Modell: Minimap-Skalierung
  const µ2_getMinimapScale = useCallback(() => {
    return minimap.µ2_calculateMinimapScale(items);
  }, [items, minimap]);

  // µ2_ FEATURE 3: Edge Indicators für Items außerhalb
  const µ2_isInMinimapBounds = useCallback((position: { x: number; y: number }) => {
    const { width, height } = minimap.minimapBounds;
    const scaleData = µ2_getMinimapScale();
    
    // Calculate world bounds
    const worldBounds = items.length > 0 ? {
      minX: Math.min(...items.map(item => item.position.x)),
      maxX: Math.max(...items.map(item => item.position.x + (item.width || 300))),
      minY: Math.min(...items.map(item => item.position.y)),
      maxY: Math.max(...items.map(item => item.position.y + (item.height || 200)))
    } : { minX: 0, maxX: width, minY: 0, maxY: height };

    const offsetX = -worldBounds.minX * scaleData.scale + (width - (worldBounds.maxX - worldBounds.minX) * scaleData.scale) / 2;
    const offsetY = -worldBounds.minY * scaleData.scale + (height - (worldBounds.maxY - worldBounds.minY) * scaleData.scale) / 2;

    const x = position.x * scaleData.scale + offsetX;
    const y = position.y * scaleData.scale + offsetY;

    return x >= 0 && x < width && y >= 0 && y < height;
  }, [items, minimap.minimapBounds, µ2_getMinimapScale]);

  const µ2_renderEdgeIndicators = useCallback(() => {
    const { width, height } = minimap.minimapBounds;
    const minimapCenter = { x: width / 2, y: height / 2 };
    const indicators: Array<{
      angle: number;
      position: { x: number; y: number };
      color: string;
      title: string;
    }> = [];

    items.forEach(item => {
      if (!µ2_isInMinimapBounds(item.position)) {
        const angle = Math.atan2(
          item.position.y - minimapCenter.y,
          item.position.x - minimapCenter.x
        );

        // Calculate edge position
        const radius = Math.min(width, height) / 2 - 20;
        const edgeX = minimapCenter.x + Math.cos(angle) * radius;
        const edgeY = minimapCenter.y + Math.sin(angle) * radius;

        indicators.push({
          angle,
          position: { x: edgeX, y: edgeY },
          color: baguaColors.µ2_getBaguaColor(item),
          title: item.title
        });
      }
    });

    return indicators;
  }, [items, minimap.minimapBounds, µ2_isInMinimapBounds, baguaColors]);

  // µ2_ Canvas Rendering - Campus-Modell konform
  const µ2_renderMinimap = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = minimap.minimapBounds;
    const scaleData = µ2_getMinimapScale();

    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Background with StarCraft-style border
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    ctx.strokeStyle = '#1a7f56';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);

    // Calculate world bounds for centering
    const worldBounds = items.length > 0 ? {
      minX: Math.min(...items.map(item => item.position.x)),
      maxX: Math.max(...items.map(item => item.position.x + (item.width || 300))),
      minY: Math.min(...items.map(item => item.position.y)),
      maxY: Math.max(...items.map(item => item.position.y + (item.height || 200)))
    } : { minX: 0, maxX: width, minY: 0, maxY: height };

    const offsetX = -worldBounds.minX * scaleData.scale + (width - (worldBounds.maxX - worldBounds.minX) * scaleData.scale) / 2;
    const offsetY = -worldBounds.minY * scaleData.scale + (height - (worldBounds.maxY - worldBounds.minY) * scaleData.scale) / 2;

    // Render Items mit Bagua-Farben
    items.forEach(item => {
      const x = item.position.x * scaleData.scale + offsetX;
      const y = item.position.y * scaleData.scale + offsetY;
      const w = Math.max(3, (item.width || 300) * scaleData.scale);
      const h = Math.max(2, (item.height || 200) * scaleData.scale);

      // Skip items outside minimap bounds
      if (x + w < 0 || x > width || y + h < 0 || y > height) return;

      // µ2_ Bagua-Farbe via Campus-Modell Hook
      ctx.fillStyle = baguaColors.µ2_getBaguaColor(item);
      ctx.fillRect(x, y, w, h);

      // Contextual items get special highlighting
      if (item.is_contextual) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - 1, y - 1, w + 2, h + 2);
      }
    });

    // Render Viewport Rectangle
    const viewportX = -canvasState.position.x * scaleData.scale + offsetX;
    const viewportY = -canvasState.position.y * scaleData.scale + offsetY;
    const viewportW = (window.innerWidth / canvasState.scale) * scaleData.scale;
    const viewportH = (window.innerHeight / canvasState.scale) * scaleData.scale;

    // Viewport background
    ctx.fillStyle = 'rgba(26, 127, 86, 0.1)';
    ctx.fillRect(viewportX, viewportY, viewportW, viewportH);

    // Viewport border
    ctx.strokeStyle = '#1a7f56';
    ctx.lineWidth = 2;
    ctx.strokeRect(viewportX, viewportY, viewportW, viewportH);
    
    // Debug: Nur bei Problemen einkommentieren
    // console.log('🎮 µ2_Minimap rendered!', { 
    //   itemCount: items.length,
    //   scale: scaleData.scale,
    //   viewport: { x: viewportX, y: viewportY, w: viewportW, h: viewportH }
    // });
  }, [items, canvasState, minimap, µ2_getMinimapScale]);

  // µ2_ FEATURE 2: Viewport Drag Detection
  const µ2_isInViewportRect = useCallback((x: number, y: number) => {
    const scaleData = µ2_getMinimapScale();
    const viewportX = -canvasState.position.x * scaleData.scale;
    const viewportY = -canvasState.position.y * scaleData.scale;
    const viewportW = (window.innerWidth / canvasState.scale) * scaleData.scale;
    const viewportH = (window.innerHeight / canvasState.scale) * scaleData.scale;
    
    return x >= viewportX && x <= viewportX + viewportW && 
           y >= viewportY && y <= viewportY + viewportH;
  }, [canvasState, µ2_getMinimapScale]);

  // µ2_ FEATURE 2: Mouse Down Handler - Drag vs Click
  const µ2_handleMinimapMouseDown = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const scaleData = µ2_getMinimapScale();

    // Prüfe ob im Viewport-Rechteck - algebraischer Transistor
    const inViewport = UDFormat.transistor(µ2_isInViewportRect(x, y));
    
    if (inViewport) {
      // Viewport Dragging initialisieren
      setIsDraggingViewport(true);
      const viewportX = -canvasState.position.x * scaleData.scale;
      const viewportY = -canvasState.position.y * scaleData.scale;
      setDragOffset({
        x: x - viewportX,
        y: y - viewportY
      });
      console.log('🎯 µ2_Viewport Drag Started');
    } else {
      // Direkter Jump zu dieser Position
      const targetPosition = navigation.µ3_convertMinimapToCanvas(
        x, y, scaleData.scale, scaleData.offsetX, scaleData.offsetY, items.length > 0
      );
      onNavigate(navigation.µ3_createNavigationState(targetPosition).position);
      console.log('🎯 µ2_Jump to Position:', targetPosition);
    }
  }, [canvasState, µ2_getMinimapScale, µ2_isInViewportRect, navigation, onNavigate, items]);

  // µ2_ FEATURE 2: Mouse Move Handler - Dragging
  const µ2_handleMinimapMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingViewport) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleData = µ2_getMinimapScale();
    const x = (event.clientX - rect.left) - dragOffset.x;
    const y = (event.clientY - rect.top) - dragOffset.y;

    // Convert zurück zu Canvas-Koordinaten
    const canvasX = -x / scaleData.scale;
    const canvasY = -y / scaleData.scale;

    onNavigate({ x: canvasX, y: canvasY, z: canvasState.position.z });
  }, [isDraggingViewport, dragOffset, µ2_getMinimapScale, onNavigate, canvasState.position.z]);

  // µ2_ FEATURE 2: Mouse Up Handler - Stop Dragging
  const µ2_handleMinimapMouseUp = useCallback(() => {
    if (isDraggingViewport) {
      setIsDraggingViewport(false);
      console.log('🎯 µ2_Viewport Drag Ended');
    }
  }, [isDraggingViewport]);

  // µ2_ Initialize canvas - Campus-Modell
  useEffect(() => {
    µ2_renderMinimap();
  }, [µ2_renderMinimap]);

  return (
    <div className={`µ2-minimap starcraft-minimap bagua-wind ${className}`} style={{ position: 'relative' }}>
      <div className="minimap-header">
        <span className="minimap-title">☴ UNIVERSAL MINIMAP</span>
        <div className="minimap-status">
          <span>{items.length} Items</span>
          <span className="minimap-zoom-info">
            Coverage: {coverage.toFixed(1)}x | Canvas: {Math.round(canvasState.scale * 100)}%
          </span>
        </div>
      </div>
      
      <div style={{ position: 'relative' }}>
        <canvas
          ref={canvasRef} 
          width={minimap.minimapBounds.width}
          height={minimap.minimapBounds.height}
          onWheel={µ2_handleMinimapWheel}
          onMouseDown={µ2_handleMinimapMouseDown}
          onMouseMove={µ2_handleMinimapMouseMove}
          onMouseUp={µ2_handleMinimapMouseUp}
          onMouseLeave={µ2_handleMinimapMouseUp}
          className={`minimap-canvas ${isDraggingViewport ? 'dragging' : ''}`}
          style={{ cursor: isDraggingViewport ? 'move' : 'crosshair' }}
        />
        
        {/* µ2_ FEATURE 3: Edge Indicators */}
        {µ2_renderEdgeIndicators().map((indicator, index) => (
          <div
            key={index}
            className="minimap-edge-indicator"
            title={indicator.title}
            style={{
              position: 'absolute',
              left: `${indicator.position.x}px`,
              top: `${indicator.position.y}px`,
              transform: `translate(-50%, -50%) rotate(${indicator.angle}rad)`,
              color: indicator.color,
              fontSize: '20px',
              textShadow: '0 0 4px rgba(0,0,0,0.8)',
              pointerEvents: 'none',
              animation: 'pulse 2s infinite',
              zIndex: 10
            }}
          >
            ➤
          </div>
        ))}
      </div>
      
      <div className="minimap-controls">
        <div className="minimap-zoom-controls">
          <button 
            onClick={() => {
              const newZoom = Math.max(0.1, canvasState.scale * 0.8);
              onZoomChange(newZoom);
            }}
            title="Zoom Out"
            style={{
              background: 'rgba(26, 127, 86, 0.2)',
              border: '1px solid rgba(26, 127, 86, 0.5)',
              color: '#1a7f56',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔍➖
          </button>
          <button 
            onClick={() => {
              onZoomChange(1.0); // Reset zu 100%
            }}
            title="Reset Zoom (100%)"
            style={{
              background: 'rgba(26, 127, 86, 0.2)',
              border: '1px solid rgba(26, 127, 86, 0.5)',
              color: '#1a7f56',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
              margin: '0 4px'
            }}
          >
            🎯
          </button>
          <button 
            onClick={() => {
              const newZoom = Math.min(5.0, canvasState.scale * 1.25);
              onZoomChange(newZoom);
            }}
            title="Zoom In"
            style={{
              background: 'rgba(26, 127, 86, 0.2)',
              border: '1px solid rgba(26, 127, 86, 0.5)',
              color: '#1a7f56',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            🔍➕
          </button>
        </div>
        
        <div className="bagua-legend">
          <div className="legend-item">
            <div className="color-dot" style={{ backgroundColor: baguaColors.µ2_BAGUA_COLORS[UDFormat.BAGUA.HIMMEL] }}></div>
            <span>☰ Code</span>
          </div>
          <div className="legend-item">
            <div className="color-dot" style={{ backgroundColor: baguaColors.µ2_BAGUA_COLORS[UDFormat.BAGUA.WIND] }}></div>
            <span>☴ Tables</span>
          </div>
          <div className="legend-item">
            <div className="color-dot" style={{ backgroundColor: baguaColors.µ2_BAGUA_COLORS[UDFormat.BAGUA.ERDE] }}></div>
            <span>☷ Notes</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Export für Integration in UniversalDesktopv2
export default µ2_Minimap;