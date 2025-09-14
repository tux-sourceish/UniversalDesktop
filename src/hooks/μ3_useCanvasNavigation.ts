import { useState, useCallback, useRef, useEffect } from 'react';

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

const ZoomLevels = {
  GALAXY: { scale: 0.1, name: '🌌 Galaxy', description: 'Gesamtübersicht aller Projekte' },
  SYSTEM: { scale: 0.3, name: '🪐 System', description: 'Projekt-Übersicht' },
  PLANET: { scale: 0.7, name: '🌍 Planet', description: 'Arbeitsbereich-Ebene' },
  SURFACE: { scale: 1.0, name: '🏠 Surface', description: 'Detail-Ebene' },
  MICROSCOPE: { scale: 2.0, name: '🔬 Microscope', description: 'Ultra-Detail' }
} as const;

export const μ3_useCanvasNavigation = () => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    position: { x: 0, y: 0, z: 0 },
    scale: 1,
    velocity: { x: 0, y: 0, z: 0 },
    isDragging: false,
    momentum: { x: 0, y: 0 }
  });
  
  const [currentZoomLevel, setCurrentZoomLevel] = useState<string>('SURFACE');
  const animationRef = useRef<number>();

  // Canvas Physics System (from infinitechess.org analysis)
  const updateCanvasPhysics = useCallback(() => {
    setCanvasState(prev => {
      const damping = 0.92;
      const newVelocity = {
        x: prev.velocity.x * damping,
        y: prev.velocity.y * damping,
        z: 0
      };
      
      const newPosition = {
        x: prev.position.x + newVelocity.x,
        y: prev.position.y + newVelocity.y,
        z: prev.position.z
      };

      // Stop animation if velocity is very small
      if (Math.abs(newVelocity.x) < 0.1 && Math.abs(newVelocity.y) < 0.1) {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = undefined;
        }
        return { ...prev, velocity: { x: 0, y: 0, z: 0 }, position: newPosition };
      }

      return { ...prev, velocity: newVelocity, position: newPosition };
    });

    animationRef.current = requestAnimationFrame(updateCanvasPhysics);
  }, []);

  // Multi-Scale Navigation System
  const navigateToZoomLevel = useCallback((level: keyof typeof ZoomLevels, target?: Position) => {
    const zoomConfig = ZoomLevels[level];
    
    setCanvasState(prev => ({
      ...prev,
      scale: zoomConfig.scale,
      position: target || prev.position
    }));
    
    setCurrentZoomLevel(level);
  }, []);

  const getZoomLevelFromScale = useCallback((scale: number): string => {
    const levels = Object.entries(ZoomLevels);
    let closest = levels[0];
    let minDiff = Math.abs(scale - closest[1].scale);
    
    for (const [key, config] of levels) {
      const diff = Math.abs(scale - config.scale);
      if (diff < minDiff) {
        minDiff = diff;
        closest = [key, config];
      }
    }
    
    return closest[0];
  }, []);

  // Exponentiell-logarithmische Keyboard Navigation
  const handleKeyboardNavigation = useCallback((e: KeyboardEvent) => {
    // Only handle Ctrl+Arrow keys
    if (!e.ctrlKey) return;
    
    const isArrowKey = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key);
    if (!isArrowKey) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    // Exponentiell-logarithmische Bewegungsgeschwindigkeit für unendliche Desktops
    const baseSpeed = 80;
    const zoomFactor = canvasState.scale;
    const logMultiplier = Math.log(1 / zoomFactor) + 1;
    const exponentialSpeed = baseSpeed * Math.max(0.3, Math.min(5.0, logMultiplier));
    
    let deltaX = 0;
    let deltaY = 0;
    
    switch (e.key) {
      case 'ArrowUp':
        deltaY = exponentialSpeed;
        break;
      case 'ArrowDown':
        deltaY = -exponentialSpeed;
        break;
      case 'ArrowLeft':
        deltaX = exponentialSpeed;
        break;
      case 'ArrowRight':
        deltaX = -exponentialSpeed;
        break;
    }
    
    setCanvasState(prev => ({
      ...prev,
      position: {
        x: prev.position.x + deltaX,
        y: prev.position.y + deltaY,
        z: prev.position.z
      }
    }));
    
    // if (import.meta.env.DEV) {
    //   console.log(`🎮 Keyboard Navigation: ${e.key} (${Math.round(deltaX)}, ${Math.round(deltaY)}) at zoom ${Math.round(canvasState.scale * 100)}%`);
    // }
  }, [canvasState.scale]);

  // Reset Functions
  const resetPosition = useCallback(() => {
    setCanvasState(prev => ({ ...prev, position: { x: 0, y: 0, z: 0 } }));
  }, []);

  const resetZoom = useCallback(() => {
    // FIXED: Reset both zoom AND position to initial state
    setCanvasState(prev => ({ 
      ...prev, 
      scale: 1.0,
      position: { x: 0, y: 0, z: 0 }
    }));
    navigateToZoomLevel('SURFACE');
  }, [navigateToZoomLevel]);

  // Update zoom level when scale changes
  useEffect(() => {
    const detectedLevel = getZoomLevelFromScale(canvasState.scale);
    if (detectedLevel !== currentZoomLevel) {
      setCurrentZoomLevel(detectedLevel);
    }
  }, [canvasState.scale, currentZoomLevel, getZoomLevelFromScale]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // µ1_ Zoom-Level Setter für Header-Integration
  const setZoomLevel = useCallback((newZoom: number) => {
    const clampedZoom = Math.max(0.1, Math.min(5.0, newZoom));
    setCanvasState(prev => ({ ...prev, scale: clampedZoom }));
  }, []);

  return {
    canvasState,
    setCanvasState,
    currentZoomLevel,
    ZoomLevels,
    updateCanvasPhysics,
    navigateToZoomLevel,
    handleKeyboardNavigation,
    resetPosition,
    resetZoom,
    getZoomLevelFromScale,
    // µ1_ Header-kompatible Eigenschaften
    zoomLevel: canvasState.scale,
    setZoomLevel
  };
};