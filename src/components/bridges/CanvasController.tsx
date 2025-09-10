import React, { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { useCanvasNavigation } from '../../hooks';

interface CanvasControllerProps {
  children: React.ReactNode;
  canvasState?: any; // Optional external canvas state
  onNavigationChange?: (state: any) => void;
  onKeyboardNavigation?: (e: KeyboardEvent) => void; // For external keyboard handling
  enableKeyboardShortcuts?: boolean;
  enableMouseInteraction?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * 🎮 CanvasController - Hook-to-Component Bridge
 * 
 * Verbindet useCanvasNavigation Hook direkt mit React Component.
 * Automatisches Event-Handling, Keyboard-Shortcuts und CSS-Transform-Sync.
 */
const CanvasControllerWithRef = forwardRef<HTMLDivElement, CanvasControllerProps>(({ 
  children,
  canvasState: externalCanvasState,
  onNavigationChange,
  onKeyboardNavigation,
  enableKeyboardShortcuts = true,
  enableMouseInteraction = true,
  className = '',
  style = {}
}, ref) => {
  const internalCanvasRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => internalCanvasRef.current!);
  
  // Hook Integration: Externe State hat Priorität, sonst eigener Hook als Fallback
  const canvas = externalCanvasState ? null : useCanvasNavigation();
  const activeCanvasState = externalCanvasState || canvas?.canvasState || { 
    position: { x: 0, y: 0, z: 0 }, 
    scale: 1, 
    velocity: { x: 0, y: 0, z: 0 }, 
    isDragging: false, 
    momentum: { x: 0, y: 0 } 
  };
  
  // Auto-notify parent component of navigation changes
  useEffect(() => {
    if (!externalCanvasState && canvas && onNavigationChange) {
      onNavigationChange(canvas.canvasState);
    }
  }, [canvas?.canvasState, onNavigationChange, externalCanvasState]);

  // Keyboard event integration
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Delegate to external handler if available, otherwise use internal hook
      if (externalCanvasState && onKeyboardNavigation) {
        onKeyboardNavigation(e);
      } else if (canvas) {
        canvas.handleKeyboardNavigation(e);
        
        // Additional shortcuts specific to canvas
        if (e.ctrlKey) {
          switch (e.key) {
            case 'h':
              e.preventDefault();
              canvas.resetPosition();
              break;
            case 'r':
              e.preventDefault(); 
              canvas.resetZoom();
              break;
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
              e.preventDefault();
              const levels = ['GALAXY', 'SYSTEM', 'PLANET', 'SURFACE', 'MICROSCOPE'];
              canvas.navigateToZoomLevel(levels[parseInt(e.key) - 1] as any);
              break;
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, canvas, externalCanvasState, onKeyboardNavigation]);

  // Mouse interaction for panning
  const handleMouseEvents = useCallback(() => {
    if (!enableMouseInteraction || !canvas) return;
    
    const element = internalCanvasRef.current;
    if (!element) return;

    // Pan functionality
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0) { // Left mouse button
        // TODO: Restore dragging methods when canvas hook is updated
        // canvas.startDragging({ x: e.clientX, y: e.clientY, z: 0 });
      }
    };

    const handleMouseMove = (_e: MouseEvent) => {
      // TODO: Restore dragging methods when canvas hook is updated
      // canvas.updateDragging({ x: e.clientX, y: e.clientY, z: 0 });
    };

    const handleMouseUp = () => {
      // TODO: Restore dragging methods when canvas hook is updated
      // canvas.stopDragging();
    };

    element.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [enableMouseInteraction, canvas]);

  useEffect(() => {
    const cleanup = handleMouseEvents();
    return cleanup;
  }, [handleMouseEvents]);

  // Mouse wheel integration
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!enableMouseInteraction) return;
    
    // Allow normal scrolling in nested elements
    const target = e.target as HTMLElement;
    const scrollableElement = target.closest('.scrollable, .desktop-item, .panel');
    
    if (scrollableElement) {
      return; // Let the element handle its own scrolling
    }

    e.preventDefault();
    e.stopPropagation();
    
    // Zoom via mousewheel wenn kein externes State da ist
    if (!externalCanvasState && canvas) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const currentZoom = canvas.canvasState.scale;
      const newZoom = Math.max(0.1, Math.min(5.0, currentZoom * delta));
      canvas.setZoomLevel?.(newZoom);
    }
  }, [enableMouseInteraction, canvas, externalCanvasState]);

  // CSS Transform integration - use external state for rendering
  const canvasStyle: React.CSSProperties = {
    ...style,
    transform: `translate(${activeCanvasState.position.x}px, ${activeCanvasState.position.y}px) scale(${activeCanvasState.scale})`,
    transformOrigin: '0 0',
    transition: activeCanvasState.isDragging ? 'none' : 'transform 0.3s ease-out',
    willChange: activeCanvasState.isDragging ? 'transform' : 'auto' // Only during drag
  };

  // DEBUG: Log CSS transform vs canvasState (only during navigation changes)
  // Canvas transform updates are now silent for performance

  // Navigation info overlay
  const NavigationInfo = () => (
    <div className="canvas-navigation-info" style={{
      position: 'fixed',
      top: '120px',
      right: '20px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '12px',
      fontFamily: 'monospace',
      pointerEvents: 'none',
      zIndex: 1000
    }}>
      <div>🌌 {canvas?.ZoomLevels[canvas?.currentZoomLevel as keyof typeof canvas.ZoomLevels]?.name || 'External'}</div>
      <div>📍 X: {Math.round(activeCanvasState.position.x)}, Y: {Math.round(activeCanvasState.position.y)}</div>
      <div>🔍 {Math.round(activeCanvasState.scale * 100)}%</div>
    </div>
  );

  return (
    <div 
      ref={internalCanvasRef}
      className={`canvas-controller ${className}`}
      onWheel={handleWheel}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        cursor: 'default'
      }}
    >
      {/* Canvas Content with Transform */}
      <div 
        className="canvas-content"
        style={canvasStyle}
      >
        {children}
      </div>

      {/* Debug Info (Development Only) */}
      {import.meta.env.DEV && <NavigationInfo />}
      
      {/* Zoom Level Indicator */}
      <div className="zoom-level-indicator" style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        background: 'rgba(26, 127, 86, 0.9)',
        color: 'white',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'bold'
      }}>
        {canvas?.ZoomLevels[canvas?.currentZoomLevel as keyof typeof canvas.ZoomLevels]?.name || 'External'}
      </div>
    </div>
  );
});

export const CanvasController = CanvasControllerWithRef;

// Export hook for external access
export const useCanvasControllerHook = () => useCanvasNavigation();