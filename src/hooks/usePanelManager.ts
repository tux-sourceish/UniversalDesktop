import { useState, useCallback } from 'react';

// Centralized Panel State Management System
interface PanelState {
  tools: boolean;      // Werkzeugkasten/Tools Panel
  ai: boolean;         // KI-Assistent Panel  
  territory: boolean;  // Territory Management Panel
  minimap: boolean;    // StarCraft Minimap Panel
}

interface UnifiedPanelConfig {
  id: keyof PanelState;
  title: string;
  icon: string;
  shortcut: string;
  defaultVisible: boolean;
  position: 'left' | 'right' | 'top' | 'bottom';
  resizable: boolean;
  minimizable: boolean;
}

const PANEL_CONFIGS: Record<keyof PanelState, UnifiedPanelConfig> = {
  tools: {
    id: 'tools',
    title: 'Werkzeugkasten',
    icon: '🧰',
    shortcut: 'Ctrl+T',
    defaultVisible: true,
    position: 'left',
    resizable: true,
    minimizable: true
  },
  ai: {
    id: 'ai',
    title: 'KI-Assistent',
    icon: '🤖',
    shortcut: 'Ctrl+A',
    defaultVisible: false,
    position: 'right',
    resizable: true,
    minimizable: true
  },
  territory: {
    id: 'territory',
    title: 'Territory Management',
    icon: '🏛️',
    shortcut: 'Ctrl+Shift+T',
    defaultVisible: false,
    position: 'right',
    resizable: true,
    minimizable: true
  },
  minimap: {
    id: 'minimap',
    title: 'StarCraft Minimap',
    icon: '🗺️',
    shortcut: 'Ctrl+M',
    defaultVisible: true,
    position: 'bottom',
    resizable: false,
    minimizable: true
  }
};

export const usePanelManager = () => {
  const [panelState, setPanelState] = useState<PanelState>({
    tools: PANEL_CONFIGS.tools.defaultVisible,
    ai: PANEL_CONFIGS.ai.defaultVisible,
    territory: PANEL_CONFIGS.territory.defaultVisible,
    minimap: PANEL_CONFIGS.minimap.defaultVisible
  });

  // Panel toggle functions with enhanced logic
  const togglePanel = useCallback((panel: keyof PanelState) => {
    setPanelState(prev => ({
      ...prev,
      [panel]: !prev[panel]
    }));
    
    if (import.meta.env.DEV) {
      console.log(`🎛️ Panel Toggle: ${panel} -> ${!panelState[panel]}`);
    }
  }, [panelState]);

  // Show/Hide specific panel
  const showPanel = useCallback((panel: keyof PanelState) => {
    setPanelState(prev => ({
      ...prev,
      [panel]: true
    }));
  }, []);

  const hidePanel = useCallback((panel: keyof PanelState) => {
    setPanelState(prev => ({
      ...prev,
      [panel]: false
    }));
  }, []);

  // Panel layout management
  const getVisiblePanels = useCallback((): (keyof PanelState)[] => {
    return Object.keys(panelState).filter(panel => 
      panelState[panel as keyof PanelState]
    ) as (keyof PanelState)[];
  }, [panelState]);

  const getPanelsByPosition = useCallback((position: 'left' | 'right' | 'top' | 'bottom') => {
    return getVisiblePanels().filter(panel => 
      PANEL_CONFIGS[panel].position === position
    );
  }, [getVisiblePanels]);

  // Panel state queries
  const isPanelVisible = useCallback((panel: keyof PanelState): boolean => {
    return panelState[panel];
  }, [panelState]);

  const getActivePanelCount = useCallback((): number => {
    return getVisiblePanels().length;
  }, [getVisiblePanels]);

  // Advanced panel operations
  const hideAllPanels = useCallback(() => {
    setPanelState({
      tools: false,
      ai: false,
      territory: false,
      minimap: false
    });
  }, []);

  const resetPanelsToDefault = useCallback(() => {
    setPanelState({
      tools: PANEL_CONFIGS.tools.defaultVisible,
      ai: PANEL_CONFIGS.ai.defaultVisible,
      territory: PANEL_CONFIGS.territory.defaultVisible,
      minimap: PANEL_CONFIGS.minimap.defaultVisible
    });
  }, []);

  // Panel focus management
  const focusPanel = useCallback((panel: keyof PanelState) => {
    if (!panelState[panel]) {
      showPanel(panel);
    }
    // TODO: Implement panel z-index management for focus
  }, [panelState, showPanel]);

  // Workspace modes
  const setWorkspaceMode = useCallback((mode: 'minimal' | 'development' | 'presentation') => {
    switch (mode) {
      case 'minimal':
        setPanelState({
          tools: false,
          ai: false,
          territory: false,
          minimap: true
        });
        break;
      case 'development':
        setPanelState({
          tools: true,
          ai: true,
          territory: false,
          minimap: true
        });
        break;
      case 'presentation':
        setPanelState({
          tools: false,
          ai: false,
          territory: true,
          minimap: false
        });
        break;
    }
  }, []);

  return {
    // State
    panelState,
    PANEL_CONFIGS,
    
    // Core Operations
    togglePanel,
    showPanel,
    hidePanel,
    
    // Queries
    isPanelVisible,
    getVisiblePanels,
    getPanelsByPosition,
    getActivePanelCount,
    
    // Advanced Operations
    hideAllPanels,
    resetPanelsToDefault,
    focusPanel,
    setWorkspaceMode
  };
};