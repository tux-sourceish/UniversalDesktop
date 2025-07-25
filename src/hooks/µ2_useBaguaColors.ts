/**
 * µ2_useBaguaColors - Campus-Modell Hook für Bagua-Farbsystem
 * BAGUA: WIND (☴) - View/UI - "Sichtbare Schnittstellen"
 * 
 * REGEL: NUR Bagua-Farb-Logik, NICHTS anderes!
 * Raimunds algebraischer Transistor statt if-else
 * 
 * @version 2.1.0-raimund-algebra
 */

import { useCallback } from 'react';
import { UDFormat } from '../core/UDFormat';
import type { UniversalDocument } from '../core/universalDocument';

// Bagua-Farbdefinitionen nach Raimunds System
const µ2_BAGUA_COLORS = {
  [UDFormat.BAGUA.HIMMEL]: '#4A90E2', // ☰ Blau - Code/Templates
  [UDFormat.BAGUA.WIND]:   '#7ED321', // ☴ Grün - Views/UI  
  [UDFormat.BAGUA.WASSER]: '#4AE2E2', // ☵ Cyan - Fließende Daten
  [UDFormat.BAGUA.BERG]:   '#8B4513', // ☶ Braun - Init/Setup
  [UDFormat.BAGUA.SEE]:    '#FFD700', // ☱ Gold - Properties
  [UDFormat.BAGUA.FEUER]:  '#E24A4A', // ☲ Rot - Funktionen
  [UDFormat.BAGUA.DONNER]: '#9013FE', // ☳ Lila - Events
  [UDFormat.BAGUA.ERDE]:   '#795548', // ☷ Erdbraun - Global/Base
  [UDFormat.BAGUA.TAIJI]:  '#FF9800'  // ☯ Orange - Center/Unity
} as const;

/**
 * µ2_useBaguaColors - Reine Bagua-Farb-Funktionalität
 * Campus-Modell: Macht NUR eine Sache - Bagua-Farben
 */
export const µ2_useBaguaColors = () => {

  // µ2_ Algebraischer Bagua-Farbrechner (KEIN if-else!)
  const µ2_getBaguaColor = useCallback((item: any): string => {
    // Legacy-Type zu Bagua mapping mit algebraischem Transistor
    const baguaDescriptor = 
      UDFormat.transistor(item.type === 'code') * UDFormat.BAGUA.HIMMEL +
      UDFormat.transistor(item.type === 'tabelle') * UDFormat.BAGUA.WIND +
      UDFormat.transistor(item.type === 'notizzettel') * UDFormat.BAGUA.ERDE +
      UDFormat.transistor(item.type === 'terminal') * UDFormat.BAGUA.DONNER +
      UDFormat.transistor(item.type === 'browser') * UDFormat.BAGUA.FEUER +
      UDFormat.transistor(item.type === 'media') * UDFormat.BAGUA.WASSER +
      UDFormat.transistor(item.type === 'tui') * UDFormat.BAGUA.BERG +
      UDFormat.transistor(item.type === 'calendar') * UDFormat.BAGUA.SEE +
      UDFormat.transistor(item.type === 'chart') * UDFormat.BAGUA.SEE;

    // Fallback zu TAIJI mit algebraischem Transistor
    const finalDescriptor = 
      UDFormat.transistor(baguaDescriptor > 0) * baguaDescriptor +
      UDFormat.transistor(baguaDescriptor === 0) * UDFormat.BAGUA.TAIJI;

    return µ2_BAGUA_COLORS[finalDescriptor] || µ2_BAGUA_COLORS[UDFormat.BAGUA.TAIJI];
  }, []);

  // µ2_ UniversalDocument Item Bagua-Farbe (für echte .ud Items)
  const µ2_getUDItemBaguaColor = useCallback((udItem: any): string => {
    // Nutze bereits berechneten bagua_descriptor aus UniversalDocument
    const descriptor = udItem.bagua_descriptor || UDFormat.BAGUA.TAIJI;
    return µ2_BAGUA_COLORS[descriptor] || µ2_BAGUA_COLORS[UDFormat.BAGUA.TAIJI];
  }, []);

  // µ2_ Bagua-Symbol für Display
  const µ2_getBaguaSymbol = useCallback((baguaDescriptor: number): string => {
    const symbolMap = {
      [UDFormat.BAGUA.HIMMEL]: '☰',
      [UDFormat.BAGUA.WIND]:   '☴',
      [UDFormat.BAGUA.WASSER]: '☵',
      [UDFormat.BAGUA.BERG]:   '☶',
      [UDFormat.BAGUA.SEE]:    '☱',
      [UDFormat.BAGUA.FEUER]:  '☲',
      [UDFormat.BAGUA.DONNER]: '☳',
      [UDFormat.BAGUA.ERDE]:   '☷',
      [UDFormat.BAGUA.TAIJI]:  '☯'
    };

    return symbolMap[baguaDescriptor] || '❓';
  }, []);

  // µ2_ Bagua-Name für Display
  const µ2_getBaguaName = useCallback((baguaDescriptor: number): string => {
    const nameMap = {
      [UDFormat.BAGUA.HIMMEL]: 'HIMMEL',
      [UDFormat.BAGUA.WIND]:   'WIND',
      [UDFormat.BAGUA.WASSER]: 'WASSER',
      [UDFormat.BAGUA.BERG]:   'BERG',
      [UDFormat.BAGUA.SEE]:    'SEE',
      [UDFormat.BAGUA.FEUER]:  'FEUER',
      [UDFormat.BAGUA.DONNER]: 'DONNER',
      [UDFormat.BAGUA.ERDE]:   'ERDE',
      [UDFormat.BAGUA.TAIJI]:  'TAIJI'
    };

    return nameMap[baguaDescriptor] || 'UNKNOWN';
  }, []);

  return {
    // Bagua-Farbdefinitionen
    µ2_BAGUA_COLORS,
    
    // µ2_ Campus-Modell Funktionen - NUR Bagua-Farben
    µ2_getBaguaColor,
    µ2_getUDItemBaguaColor,
    µ2_getBaguaSymbol,
    µ2_getBaguaName
  };
};