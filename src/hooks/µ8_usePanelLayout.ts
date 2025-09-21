import { useState, useCallback, useEffect } from 'react';
import { UDFormat } from '../core/UDFormat';

/**
 * µ8_usePanelLayout - ERDE (☷) Global/Base Panel Management
 * 
 * V1-Style Multi-Panel System mit Raimunds Bagua-Algebra.
 * Verwaltet separate floating Panels statt zusammengequetschte Sidebar.
 */

export interface µ8_PanelState {
  tools: boolean;
  ai: boolean;
  territory: boolean;
  context: boolean;
  minimap: boolean;
}

export interface µ8_PanelConfig {
  id: keyof µ8_PanelState;
  title: string;
  icon: string;
  position: 'left' | 'right' | 'bottom-right' | 'floating';
  width?: number;
  height?: number;
  bagua_descriptor: number;
  shortcut?: string;
}

export const µ8_usePanelLayout = () => {
  // µ8_ Panel Visibility State (Campus-Model: Ein Hook, eine Aufgabe)
  const [µ8_panelState, setµ8_PanelState] = useState<µ8_PanelState>({
    tools: false,    // µ2 WIND - Views/UI Creation
    ai: false,       // µ6 FEUER - Functions/Processing  
    territory: false, // µ5 SEE - Properties/Spatial
    context: false,   // µ6 FEUER - AI Context Management (V1 Genius-Feature!)
    minimap: true     // µ3 WASSER - Procedures/Flow
  });

  // µ8_ Panel Configurations (V1-Style Layout)
  const µ8_panelConfigs: µ8_PanelConfig[] = [
    {
      id: 'tools',
      title: 'Werkzeugkasten',
      icon: '🧰',
      position: 'left',
      width: 280,
      bagua_descriptor: UDFormat.BAGUA.WIND,
      shortcut: 'Ctrl+1'
    },
    {
      id: 'ai', 
      title: 'KI-Assistent',
      icon: '🤖',
      position: 'right',
      width: 320,
      bagua_descriptor: UDFormat.BAGUA.FEUER,
      shortcut: 'Ctrl+2'
    },
    {
      id: 'territory',
      title: 'Territory Management', 
      icon: '🏛️',
      position: 'right',
      width: 300,
      bagua_descriptor: UDFormat.BAGUA.SEE,
      shortcut: 'Ctrl+3'
    },
    {
      id: 'context',
      title: 'AI Context Manager',
      icon: '📌', 
      position: 'right',
      width: 350,
      bagua_descriptor: UDFormat.BAGUA.FEUER,
      shortcut: 'Ctrl+4'
    },
    {
      id: 'minimap',
      title: 'StarCraft Minimap',
      icon: '🗺️', 
      position: 'bottom-right',
      width: 240,
      height: 180,
      bagua_descriptor: UDFormat.BAGUA.WASSER,
      shortcut: 'Ctrl+M'
    }
  ];

  // µ8_ Toggle Panel mit algebraischem Transistor
  const µ8_togglePanel = useCallback((panelId: keyof µ8_PanelState) => {
    setµ8_PanelState(prev => {
      const currentState = prev[panelId];
      
      // Raimunds algebraischer Transistor für State-Change
      // transistor(true) = 1, transistor(false) = 0
      const transistorValue = UDFormat.transistor(currentState);
      const finalState = transistorValue === 0; // Umkehrung via transistor
      
      return {
        ...prev,
        [panelId]: finalState
      };
    });
  }, []);

  // µ8_ Panel-Sichtbarkeit prüfen
  const µ8_isPanelVisible = useCallback((panelId: keyof µ8_PanelState): boolean => {
    return µ8_panelState[panelId];
  }, [µ8_panelState]);

  // µ8_ Aktive Panel-Anzahl (für Layout-Berechnungen)
  const µ8_getActivePanelCount = useCallback((): number => {
    return Object.values(µ8_panelState).filter(visible => visible).length;
  }, [µ8_panelState]);

  // µ8_ Panels nach Position gruppieren
  const µ8_getPanelsByPosition = useCallback((position: 'left' | 'right' | 'bottom-right' | 'floating'): µ8_PanelConfig[] => {
    return µ8_panelConfigs.filter(config => config.position === position);
  }, []);

  // µ8_ Smart Panel-Sizing und Kollisionsvermeidung
  const µ8_getSmartPanelDimensions = useCallback((panelId: keyof µ8_PanelState): { width: number; offset: number } => {
    const rightPanels = µ8_getPanelsByPosition('right');
    const visibleRightPanels = rightPanels.filter(p => µ8_isPanelVisible(p.id));
    const panelIndex = rightPanels.findIndex(p => p.id === panelId);
    
    
    // Verfügbare Bildschirmbreite berechnen (minus Tools Panel und Margins)
    const screenWidth = window.innerWidth;
    const toolsWidth = µ8_isPanelVisible('tools') ? 280 : 0;
    const availableRightSpace = screenWidth - toolsWidth - 100; // 100px Margin
    
    let panelWidth: number;
    let offset = 0;
    
    if (visibleRightPanels.length > 0) {
      // Intelligente Breitenverteilung basierend auf Panel-Anzahl
      const maxPanelWidth = {
        1: 400,  // Ein Panel: Komfortabel breit
        2: 320,  // Zwei Panels: Mittel
        3: 280,  // Drei Panels: Kompakt
        4: 250   // Vier Panels: Minimal nutzbar
      };
      
      const targetWidth = maxPanelWidth[Math.min(visibleRightPanels.length, 4) as keyof typeof maxPanelWidth];
      const totalNeeded = targetWidth * visibleRightPanels.length;
      
      // Anpassung wenn nicht genug Platz
      panelWidth = totalNeeded > availableRightSpace 
        ? Math.max(220, Math.floor(availableRightSpace / visibleRightPanels.length))
        : targetWidth;
    } else {
      panelWidth = 320; // Default
    }
    
    // Offset für das aktuelle Panel berechnen
    for (let i = 0; i < panelIndex; i++) {
      const prevPanel = rightPanels[i];
      if (µ8_isPanelVisible(prevPanel.id)) {
        offset += panelWidth; // Alle verwenden jetzt die gleiche smarte Breite
      }
    }
    
    return { width: panelWidth, offset };
  }, [µ8_getPanelsByPosition, µ8_isPanelVisible]);

  // µ8_ Legacy-Kompatibilität für getRightPanelOffset
  const µ8_getRightPanelOffset = useCallback((panelId: keyof µ8_PanelState): number => {
    return µ8_getSmartPanelDimensions(panelId).offset;
  }, [µ8_getSmartPanelDimensions]);

  // µ8_ Keyboard Shortcuts (V1-Style)
  useEffect(() => {
    const µ8_handleKeyboard = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      
      // Raimunds algebraischer Transistor für Shortcut-Matching
      const shortcuts: Record<string, keyof µ8_PanelState> = {
        '1': 'tools',
        '2': 'ai', 
        '3': 'territory',
        '4': 'context',
        'm': 'minimap'
      };
      
      const panelId = shortcuts[e.key.toLowerCase()];
      if (panelId) {
        e.preventDefault();
        µ8_togglePanel(panelId);
      }
    };

    window.addEventListener('keydown', µ8_handleKeyboard);
    return () => window.removeEventListener('keydown', µ8_handleKeyboard);
  }, [µ8_togglePanel]);

  // µ8_ Panel-Layout-Berechnungen für Canvas-Offset (SMART VERSION)
  const µ8_getCanvasOffset = useCallback((): { left: number; right: number; bottom: number } => {
    let leftOffset = 0;
    let rightOffset = 0; 
    let bottomOffset = 0;

    // Links: Tools Panel
    if (µ8_isPanelVisible('tools')) {
      leftOffset = 280;
    }

    // Rechts: Smart calculation based on visible panels
    const rightPanels = µ8_getPanelsByPosition('right');
    const visibleRightPanels = rightPanels.filter(p => µ8_isPanelVisible(p.id));
    
    if (visibleRightPanels.length > 0) {
      // Berechne die tatsächliche Gesamtbreite aller sichtbaren rechten Panels
      const firstPanelDimensions = µ8_getSmartPanelDimensions(visibleRightPanels[0].id);
      rightOffset = firstPanelDimensions.width * visibleRightPanels.length;
    }

    // Unten: Minimap
    if (µ8_isPanelVisible('minimap')) {
      bottomOffset = 180;
    }

    return { left: leftOffset, right: rightOffset, bottom: bottomOffset };
  }, [µ8_isPanelVisible, µ8_getPanelsByPosition, µ8_getSmartPanelDimensions]);

  // µ8_ Panel-Animationen (V1-Style mit algebraischem Transistor)
  const µ8_getPanelTransform = useCallback((panelId: keyof µ8_PanelState, position: 'left' | 'right' | 'bottom-right' | 'floating'): string => {
    const isVisible = µ8_isPanelVisible(panelId);
    
    // Raimunds algebraischer Transistor für Animation-Direction
    const hiddenMultiplier = UDFormat.transistor(isVisible); // 0 wenn sichtbar, 1 wenn versteckt
    
    switch (position) {
      case 'left':
        return isVisible ? 'translateX(0)' : 'translateX(-100%)';
      case 'right':
        return isVisible ? 'translateX(0)' : 'translateX(100%)';
      case 'bottom-right':
        return isVisible ? 'translate(0, 0)' : 'translate(100%, 100%)';
      case 'floating':
        return isVisible ? 'scale(1)' : 'scale(0.8)';
      default:
        return 'none';
    }
  }, [µ8_isPanelVisible]);

  // µ8_ Panel-Opazität mit algebraischem Transistor
  const µ8_getPanelOpacity = useCallback((panelId: keyof µ8_PanelState): number => {
    const isVisible = µ8_isPanelVisible(panelId);
    
    // Raimunds algebraischer Transistor für Opacity
    const hiddenOpacity = UDFormat.transistor(isVisible) * 0.05; // 0.05 wenn versteckt, 0 wenn sichtbar
    return isVisible ? 1 : hiddenOpacity;
  }, [µ8_isPanelVisible]);

  return {
    // State
    panelState: µ8_panelState,
    panelConfigs: µ8_panelConfigs,
    
    // Actions
    togglePanel: µ8_togglePanel,
    
    // Queries
    isPanelVisible: µ8_isPanelVisible,
    getActivePanelCount: µ8_getActivePanelCount,
    getPanelsByPosition: µ8_getPanelsByPosition,
    getRightPanelOffset: µ8_getRightPanelOffset,
    getCanvasOffset: µ8_getCanvasOffset,
    
    // NEW: Smart Panel Sizing
    getSmartPanelDimensions: µ8_getSmartPanelDimensions,
    
    // Styling (V1-Style mit algebraischen Transistoren)
    getPanelTransform: µ8_getPanelTransform,
    getPanelOpacity: µ8_getPanelOpacity
  };
};