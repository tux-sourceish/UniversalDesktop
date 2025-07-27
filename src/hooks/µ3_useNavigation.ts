/**
 * µ3_useNavigation - Campus-Modell Hook für Navigation
 * BAGUA: WASSER (☵) - Procedures/Flow - "Fließende Abläufe"
 * 
 * REGEL: NUR Navigation-Logik, NICHTS anderes!
 * Nutzt UDFormat.transistor für Bedingungen
 * 
 * @version 2.1.0-raimund-algebra
 */

import { useCallback } from 'react';
import { UDFormat } from '../core/UDFormat';

export interface µ3_Position {
  x: number;
  y: number;
  z: number;
}

export interface µ3_NavigationTarget {
  position: µ3_Position;
  velocity: µ3_Position;
  isDragging: boolean;
}

/**
 * µ3_useNavigation - Reine Navigation-Funktionalität
 * Campus-Modell: Macht NUR eine Sache - Navigation
 */
export const µ3_useNavigation = () => {

  // µ3_ Benutzerfreundliche Position-Konvertierung (verbesserte UX)
  const µ3_convertMinimapToCanvas = useCallback((
    clickX: number,
    clickY: number,
    scale: number,
    offsetX: number,
    offsetY: number,
    hasItems: boolean
  ): µ3_Position => {
    // REPARIERTE Koordinaten-Konvertierung - kompatibel mit µ2_calculateMinimapScale
    // Verwendet die Offsets und Scale aus der Minimap-Berechnung
    
    // Direkte Konvertierung unter Verwendung der Scale-Daten
    const worldX = (clickX - offsetX) / scale;
    const worldY = (clickY - offsetY) / scale;
    
    // Minimap-System nutzt Canvas-Position als inverted World-Position
    return {
      x: -worldX,
      y: -worldY,
      z: 0
    };
  }, []);

  // µ3_ Smooth Navigation mit Momentum-Stop
  const µ3_createNavigationState = useCallback((
    targetPosition: µ3_Position
  ): µ3_NavigationTarget => {
    return {
      position: targetPosition,
      velocity: { x: 0, y: 0, z: 0 }, // Stop momentum
      isDragging: false // End dragging state
    };
  }, []);

  // µ3_ Bounds-Checking mit algebraischem Transistor
  const µ3_validateNavigationBounds = useCallback((
    position: µ3_Position,
    minBounds: µ3_Position,
    maxBounds: µ3_Position
  ): µ3_Position => {
    // Algebraische Bounds-Clipping
    const xInBounds = UDFormat.transistor(position.x >= minBounds.x && position.x <= maxBounds.x);
    const yInBounds = UDFormat.transistor(position.y >= minBounds.y && position.y <= maxBounds.y);
    const zInBounds = UDFormat.transistor(position.z >= minBounds.z && position.z <= maxBounds.z);

    return {
      x: xInBounds * position.x + (1 - xInBounds) * Math.max(minBounds.x, Math.min(maxBounds.x, position.x)),
      y: yInBounds * position.y + (1 - yInBounds) * Math.max(minBounds.y, Math.min(maxBounds.y, position.y)),
      z: zInBounds * position.z + (1 - zInBounds) * Math.max(minBounds.z, Math.min(maxBounds.z, position.z))
    };
  }, []);

  // µ3_ Distance-based Navigation Speed
  const µ3_calculateNavigationSpeed = useCallback((
    currentPos: µ3_Position,
    targetPos: µ3_Position
  ): number => {
    const distance = Math.sqrt(
      Math.pow(targetPos.x - currentPos.x, 2) +
      Math.pow(targetPos.y - currentPos.y, 2) +
      Math.pow(targetPos.z - currentPos.z, 2)
    );

    // Algebraische Geschwindigkeits-Berechnung
    const isNearTarget = UDFormat.transistor(distance < 100);
    const isFarTarget = UDFormat.transistor(distance > 1000);
    
    return (
      isNearTarget * 0.3 +          // Slow for near targets
      (1 - isNearTarget - isFarTarget) * 0.6 + // Medium for normal distance
      isFarTarget * 1.0             // Fast for far targets
    );
  }, []);

  // µ3_ Precision Navigation (Ctrl+Click)
  const µ3_getPrecisionNavigation = useCallback((
    basePosition: µ3_Position,
    isPrecision: boolean
  ): µ3_Position => {
    const precisionFactor = UDFormat.transistor(isPrecision) * 0.1 + UDFormat.transistor(!isPrecision) * 1.0;
    
    return {
      x: basePosition.x * precisionFactor,
      y: basePosition.y * precisionFactor,
      z: basePosition.z * precisionFactor
    };
  }, []);

  return {
    // µ3_ Campus-Modell Funktionen - NUR Navigation
    µ3_convertMinimapToCanvas,
    µ3_createNavigationState,
    µ3_validateNavigationBounds,
    µ3_calculateNavigationSpeed,
    µ3_getPrecisionNavigation
  };
};