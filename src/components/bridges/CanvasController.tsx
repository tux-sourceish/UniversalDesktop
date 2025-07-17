import React, { useRef, useEffect, useCallback } from 'react';
import { useCanvasNavigation } from '../../hooks/useCanvasNavigation';

interface CanvasControllerProps {
  children: React.ReactNode;
  onNavigationChange?: (state: any) => void;
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
export const CanvasController: React.FC<CanvasControllerProps> = ({
  children,
  onNavigationChange,
  enableKeyboardShortcuts = true,
  enableMouseInteraction = true,
  className = '',
  style = {}
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Hook Integration
  const canvas = useCanvasNavigation();
  
  // Auto-notify parent component of navigation changes
  useEffect(() => {
    onNavigationChange?.(canvas.canvasState);
  }, [canvas.canvasState, onNavigationChange]);

  // Keyboard event integration
  useEffect(() => {
    if (!enableKeyboardShortcuts) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Delegate to hook's keyboard handler
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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableKeyboardShortcuts, canvas]);

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
    
    // Note: Canvas zoom is now handled by minimap only
    // This maintains the design decision from the main component
  }, [enableMouseInteraction]);

  // CSS Transform integration
  const canvasStyle: React.CSSProperties = {
    ...style,
    transform: `translate(${canvas.canvasState.position.x}px, ${canvas.canvasState.position.y}px) scale(${canvas.canvasState.scale})`,
    transformOrigin: '0 0',
    transition: canvas.canvasState.isDragging ? 'none' : 'transform 0.3s ease-out',
    willChange: 'transform',
    ...style
  };

  // Navigation info overlay
  const NavigationInfo = () => (
    <div className="canvas-navigation-info" style={{
      position: 'fixed',
      top: '80px',
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
      <div>🌌 {canvas.ZoomLevels[canvas.currentZoomLevel as keyof typeof canvas.ZoomLevels]?.name}</div>
      <div>📍 X: {Math.round(canvas.canvasState.position.x)}, Y: {Math.round(canvas.canvasState.position.y)}</div>
      <div>🔍 {Math.round(canvas.canvasState.scale * 100)}%</div>
    </div>
  );

  return (
    <div 
      ref={canvasRef}
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
        {canvas.ZoomLevels[canvas.currentZoomLevel as keyof typeof canvas.ZoomLevels]?.name}
      </div>
    </div>
  );
};

// Export hook for external access
export const useCanvasControllerHook = () => useCanvasNavigation();