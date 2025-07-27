/**
 * µ2_useMinimap - Campus-Modell Hook für Minimap
 * BAGUA: WIND (☴) - View/UI - "Sichtbare Schnittstellen"
 * 
 * REGEL: NUR Minimap-Logik, NICHTS anderes!
 * Nutzt UDFormat.transistor für Bedingungen
 * 
 * @version 2.1.0-raimund-algebra
 */

import { useState, useCallback, useEffect } from 'react';
import { UDFormat } from '../core/UDFormat';
import type { UniversalDocument } from '../core/universalDocument';

export interface µ2_MinimapBounds {
  width: number;
  height: number;
}

export interface µ2_MinimapScale {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/**
 * µ2_useMinimap - Reine Minimap-Funktionalität
 * Campus-Modell: Macht NUR eine Sache - Minimap-Logik
 */
export const µ2_useMinimap = () => {
  const [minimapBounds, setMinimapBounds] = useState<µ2_MinimapBounds>({ 
    width: 200, 
    height: 150 
  });

  // µ2_ Algebraischer Transistor für Responsive Sizing
  const µ2_updateMinimapSize = useCallback(() => {
    const baseWidth = 250;
    const baseHeight = 180;
    
    // Algebraischer Transistor statt if-else
    const screenWidthFactor = UDFormat.transistor(window.innerWidth > 1920) * 1.2 +
                             UDFormat.transistor(window.innerWidth <= 1920) * 1.0 +
                             UDFormat.transistor(window.innerWidth <= 1280) * 0.8;
    
    const width = Math.min(baseWidth * screenWidthFactor, window.innerWidth * 0.15);
    const height = Math.min(baseHeight * screenWidthFactor, window.innerHeight * 0.15);
    
    setMinimapBounds({ width, height });
  }, []);

  // µ2_ Minimap-Skalierung - EINFACH aber zoom-responsive
  const µ2_calculateMinimapScale = useCallback((items: any[], canvasState?: any): µ2_MinimapScale => {
    // Algebraischer Transistor für Items-Check
    const hasItems = UDFormat.transistor(items.length > 0);
    
    // ZOOM-RESPONSIVE: Scale basiert auf Canvas-Zoom
    const zoomLevel = canvasState?.scale || 1.0;
    
    // Basis-Bounds: Entweder Items oder feste Welt-Größe
    let bounds;
    if (hasItems) {
      // ZOOM-RESPONSIVE: Aggressiveres Padding basiert auf Zoom-Level
      // Bei hohem Zoom (z.B. 4x) → sehr kleines Padding (25px)
      // Bei niedrigem Zoom (z.B. 0.1x) → sehr großes Padding (4000px)
      const basePadding = 400;
      const zoomResponsivePadding = basePadding / Math.max(zoomLevel, 0.1);
      
      bounds = {
        minX: Math.min(...items.map(item => item.position.x)) - zoomResponsivePadding,
        maxX: Math.max(...items.map(item => item.position.x + (item.width || 250))) + zoomResponsivePadding,
        minY: Math.min(...items.map(item => item.position.y)) - zoomResponsivePadding,
        maxY: Math.max(...items.map(item => item.position.y + (item.height || 200))) + zoomResponsivePadding
      };
      // console.log('🗺️ Minimap Scale (with items):', { itemCount: items.length, zoomLevel, padding: zoomResponsivePadding, bounds });
    } else {
      // ZOOM-EFFECT: Bei höherem Zoom kleinere Welt-Bounds in Minimap
      const worldSize = 2000 / Math.max(zoomLevel, 0.5); // Zoom-responsive world size
      bounds = {
        minX: -worldSize,
        maxX: worldSize,
        minY: -worldSize,
        maxY: worldSize
      };
      // console.log('🗺️ Minimap Scale (no items):', { zoomLevel, worldSize, bounds });
    }

    const worldWidth = bounds.maxX - bounds.minX;
    const worldHeight = bounds.maxY - bounds.minY;
    
    // Minimap-Skalierung berechnen
    const scaleX = minimapBounds.width / Math.max(worldWidth, 100);
    const scaleY = minimapBounds.height / Math.max(worldHeight, 100);
    const scale = Math.min(scaleX, scaleY, 1.0);

    // Offsets für korrekte Koordinaten-Konvertierung
    const offsetX = -bounds.minX * scale + (minimapBounds.width - worldWidth * scale) / 2;
    const offsetY = -bounds.minY * scale + (minimapBounds.height - worldHeight * scale) / 2;

    // console.log('🗺️ Minimap Scale Result:', { scale, offsetX, offsetY, minimapBounds, worldWidth, worldHeight });
    return { scale, offsetX, offsetY };
  }, [minimapBounds]);

  // µ2_ Koordinaten-Konvertierung - KOMPATIBEL mit Original MinimapWidget
  const µ2_convertMinimapToWorld = useCallback((
    clickX: number, 
    clickY: number, 
    scale: µ2_MinimapScale,
    items: any[],
    canvasState?: any
  ) => {
    void items; // Nicht benötigt für Koordinaten-Konvertierung
    void canvasState; // Canvas-State bereits in scale berücksichtigt
    
    // Feste Canvas-Größe wie im Original (Line 83 in MinimapWidget)
    const CANVAS_SIZE = 4000;
    
    // Rückkonvertierung: Minimap-Klick → Welt-Koordinaten
    // Entspricht der inversen Logik von: (item.position.x + CANVAS_SIZE/2) * transform.scale
    const worldX = (clickX / scale.scale) - CANVAS_SIZE / 2;
    const worldY = (clickY / scale.scale) - CANVAS_SIZE / 2;

    // Canvas-Position ist invertiert zu Welt-Koordinaten
    return { x: -worldX, y: -worldY, z: 0 };
  }, []);

  // Lifecycle: Responsive Updates
  useEffect(() => {
    µ2_updateMinimapSize();
    window.addEventListener('resize', µ2_updateMinimapSize);
    return () => window.removeEventListener('resize', µ2_updateMinimapSize);
  }, [µ2_updateMinimapSize]);

  // V1 Compatibility layer - TODO V2: Remove when MinimapWidget is fully modernized
  const [minimapVisible, setMinimapVisible] = useState(true);
  const [currentContextZones] = useState<any[]>([]);

  const getMinimapTransform = useCallback((items: any[] = [], canvasState?: any) => {
    const minimapScale = µ2_calculateMinimapScale(items, canvasState);
    
    // Calculate viewport dimensions based on canvas state
    const viewportScale = canvasState?.scale || 1.0;
    const viewportWidth = minimapBounds.width / viewportScale;
    const viewportHeight = minimapBounds.height / viewportScale;
    
    // Calculate viewport position
    const viewportX = canvasState?.position ? 
      (-canvasState.position.x * minimapScale.scale + minimapScale.offsetX - viewportWidth/2) : 0;
    const viewportY = canvasState?.position ? 
      (-canvasState.position.y * minimapScale.scale + minimapScale.offsetY - viewportHeight/2) : 0;
    
    return {
      scale: minimapScale.scale,
      offsetX: minimapScale.offsetX,
      offsetY: minimapScale.offsetY,
      viewportX,
      viewportY,
      viewportWidth,
      viewportHeight
    };
  }, [minimapBounds, µ2_calculateMinimapScale]);

  const toggleVisibility = useCallback(() => {
    setMinimapVisible(prev => !prev);
  }, []);

  const shouldUpdateMinimap = useCallback(() => true, []);

  const calculateCoverage = useCallback((items: any[] = []) => {
    const hasItems = UDFormat.transistor(items.length > 0);
    
    if (!hasItems) {
      return { coverage: 0, ratio: 0 };
    }
    
    // Calculate actual item bounds
    const bounds = {
      minX: Math.min(...items.map(item => item.position.x)),
      maxX: Math.max(...items.map(item => item.position.x + (item.width || 250))),
      minY: Math.min(...items.map(item => item.position.y)),
      maxY: Math.max(...items.map(item => item.position.y + (item.height || 200)))
    };
    
    const worldWidth = bounds.maxX - bounds.minX;
    const worldHeight = bounds.maxY - bounds.minY;
    const worldArea = worldWidth * worldHeight;
    
    // Canvas area (total available space)
    const canvasWidth = 4000; // TODO: Make dynamic based on actual canvas bounds
    const canvasHeight = 4000;
    const canvasArea = canvasWidth * canvasHeight;
    
    const coverage = worldArea;
    const ratio = UDFormat.transistor(canvasArea > 0) * (worldArea / canvasArea);
    
    return { coverage, ratio };
  }, []);

  return {
    // State
    minimapBounds,
    
    // µ2_ Campus-Modell Funktionen - NUR Minimap-Logik
    µ2_updateMinimapSize,
    µ2_calculateMinimapScale,
    µ2_convertMinimapToWorld,
    
    // V1 Compatibility Layer - TODO V2: Remove when bridge components are modernized
    minimapVisible,
    currentContextZones,
    getMinimapTransform,
    toggleVisibility,
    shouldUpdateMinimap,
    calculateCoverage
  };
};