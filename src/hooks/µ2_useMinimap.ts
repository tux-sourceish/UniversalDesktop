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

  // µ2_ Minimap-Skalierung berechnen
  const µ2_calculateMinimapScale = useCallback((items: any[]): µ2_MinimapScale => {
    // Algebraischer Transistor für Items-Check
    const hasItems = UDFormat.transistor(items.length > 0);
    
    // Sichere Bounds-Berechnung - verhindert NaN bei leeren Arrays
    const bounds = hasItems ? {
      minX: Math.min(...items.map(item => item.position.x)),
      maxX: Math.max(...items.map(item => item.position.x + (item.dimensions?.width || 300))),
      minY: Math.min(...items.map(item => item.position.y)),
      maxY: Math.max(...items.map(item => item.position.y + (item.dimensions?.height || 200)))
    } : {
      minX: 0,
      maxX: minimapBounds.width,
      minY: 0,
      maxY: minimapBounds.height
    };

    // Algebraische Berechnung ohne if-else
    const worldWidth = hasItems * (bounds.maxX - bounds.minX) + (1 - hasItems) * minimapBounds.width;
    const worldHeight = hasItems * (bounds.maxY - bounds.minY) + (1 - hasItems) * minimapBounds.height;
    
    const scaleX = minimapBounds.width / worldWidth;
    const scaleY = minimapBounds.height / worldHeight;
    const scale = Math.min(scaleX, scaleY, 0.1);

    const offsetX = hasItems * (-bounds.minX * scale + (minimapBounds.width - worldWidth * scale) / 2);
    const offsetY = hasItems * (-bounds.minY * scale + (minimapBounds.height - worldHeight * scale) / 2);

    return { scale, offsetX, offsetY };
  }, [minimapBounds]);

  // µ2_ Koordinaten-Konvertierung (Minimap → World)
  const µ2_convertMinimapToWorld = useCallback((
    clickX: number, 
    clickY: number, 
    scale: µ2_MinimapScale,
    items: any[]
  ) => {
    const hasItems = UDFormat.transistor(items.length > 0);
    
    const worldX = hasItems * ((clickX - scale.offsetX) / scale.scale);
    const worldY = hasItems * ((clickY - scale.offsetY) / scale.scale);

    return { x: -worldX, y: -worldY, z: 0 };
  }, []);

  // Lifecycle: Responsive Updates
  useEffect(() => {
    µ2_updateMinimapSize();
    window.addEventListener('resize', µ2_updateMinimapSize);
    return () => window.removeEventListener('resize', µ2_updateMinimapSize);
  }, [µ2_updateMinimapSize]);

  return {
    // State
    minimapBounds,
    
    // µ2_ Campus-Modell Funktionen - NUR Minimap-Logik
    µ2_updateMinimapSize,
    µ2_calculateMinimapScale,
    µ2_convertMinimapToWorld
  };
};