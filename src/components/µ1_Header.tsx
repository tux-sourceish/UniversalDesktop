import React, { useCallback } from 'react';
import { µ8_PanelState, µ8_PanelConfig } from '../hooks/µ8_usePanelLayout';
import { UDFormat } from '../core/UDFormat';

/**
 * µ1_Header - HIMMEL (☰) - Classes/Templates
 * 
 * KONTEXT: UniversalDesktop nutzt Raimunds Bagua-System
 * REGELN:
 * - µ1_ Präfix nach Bagua (Himmel = Classes/Templates)
 * - Algebraischer Transistor statt if-else
 * - Hooks machen NUR EINE Sache
 * 
 * ZWECK: Header-Zeile mit Panel-Toggles und Zoom-Controls
 */
interface µ1_HeaderProps {
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  currentZoom?: number;
  // NEW: Panel-State als Props vom Parent
  panelState?: µ8_PanelState;
  panelConfigs?: µ8_PanelConfig[];
  onPanelToggle?: (panelId: keyof µ8_PanelState) => void;
  // NEW: Logout functionality
  onLogout?: () => void;
}

export const µ1_Header: React.FC<µ1_HeaderProps> = ({ 
  onZoomIn, 
  onZoomOut, 
  currentZoom = 1,
  panelState,
  panelConfigs,
  onPanelToggle,
  onLogout
}) => {
  // µ1_ Panel-Layout-Objekt aus Props - KEIN separater Hook!
  const panelLayout = {
    panelState: panelState || { tools: false, ai: false, territory: false, context: false, minimap: true },
    panelConfigs: panelConfigs || [],
    isPanelVisible: (id: keyof µ8_PanelState) => panelState ? panelState[id] : false,
    togglePanel: onPanelToggle || ((id: keyof µ8_PanelState) => console.warn('⚠️ Panel toggle not connected:', id))
  };

  // µ1_ Zoom-Handler mit Props (kein eigener Hook mehr!)
  const µ1_handleZoomIn = useCallback(() => {
    const newZoom = Math.min(5.0, currentZoom * 1.1);
    const canZoom = UDFormat.transistor(newZoom <= 5.0);
    if (canZoom && onZoomIn) {
      onZoomIn();
      console.log('🔍 Header Zoom In:', { from: currentZoom.toFixed(2), to: newZoom.toFixed(2) });
    }
  }, [currentZoom, onZoomIn]);

  const µ1_handleZoomOut = useCallback(() => {
    const newZoom = Math.max(0.1, currentZoom * 0.9);
    const canZoom = UDFormat.transistor(newZoom >= 0.1);
    if (canZoom && onZoomOut) {
      onZoomOut();
      console.log('🔍 Header Zoom Out:', { from: currentZoom.toFixed(2), to: newZoom.toFixed(2) });
    }
  }, [currentZoom, onZoomOut]);

  const µ1_handleResetZoom = useCallback(() => {
    // Reset zoom via props - nicht über eigenen Hook
    console.log('🎯 Header Zoom Reset to 100%');
    // TODO: Add onZoomReset prop if needed
  }, []);

  // µ7_ Logout Handler - DONNER (☳) Events - Algebraischer Transistor
  const µ7_handleLogout = useCallback(() => {
    const hasLogoutCallback = UDFormat.transistor(onLogout !== undefined);
    if (hasLogoutCallback && onLogout) {
      console.log('🚪 Header Logout triggered');
      onLogout();
    } else {
      console.warn('⚠️ Logout callback not connected');
    }
  }, [onLogout]);

  // µ1_ Panel-Toggle mit neuem µ8_usePanelLayout System
  const µ1_renderPanelToggle = useCallback((config: typeof panelLayout.panelConfigs[0]) => {
    const isVisible = panelLayout.isPanelVisible(config.id);
    
    
    // Algebraischer Transistor für Button-State
    const buttonActive = UDFormat.transistor(isVisible);
    const buttonInactive = UDFormat.transistor(!isVisible);

    return (
      <button
        key={config.id}
        className={`header-panel-toggle ${isVisible ? 'active' : ''}`}
        onClick={() => panelLayout.togglePanel(config.id)}
        title={`${config.title} ${isVisible ? 'ausblenden' : 'einblenden'} (${config.shortcut})`}
        style={{
          background: isVisible 
            ? `rgba(26, 127, 86, ${0.3 + 0.7 * buttonActive})`
            : `rgba(255, 255, 255, ${0.1 + 0.2 * buttonInactive})`,
          color: isVisible ? 'white' : 'rgba(144, 238, 144, 0.9)',
          border: '1px solid rgba(26, 127, 86, 0.3)',
          borderRadius: '6px',
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          transition: 'all 0.2s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span style={{ fontSize: '16px' }}>{config.icon}</span>
        <span>{config.title}</span>
      </button>
    );
  }, [panelLayout]);

  return (
    <header className="universal-header" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: 'rgba(26, 27, 30, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 1000
    }}>
      
      {/* µ1_ Logo/Brand */}
      <div className="header-brand" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '18px',
        fontWeight: '600',
        color: '#1a7f56'
      }}>
        <span>🌌</span>
        <span>UniversalDesktop</span>
        <span style={{ fontSize: '12px', opacity: 0.6 }}>v2.1</span>
      </div>

      {/* µ1_ Panel-Toggles (V1-Style Multi-Panel System!) */}
      <div className="header-panel-toggles" style={{
        display: 'flex',
        gap: '8px',
        flex: 1,
        justifyContent: 'center'
      }}>
        {panelLayout.panelConfigs.map(config => µ1_renderPanelToggle(config))}
      </div>

      {/* µ1_ Zoom-Controls */}
      <div className="header-zoom-controls" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgba(26, 127, 86, 0.1)',
        borderRadius: '8px',
        padding: '4px'
      }}>
        <button
          onClick={µ1_handleZoomOut}
          title="Herauszoomen"
          style={{
            background: 'none',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 8px',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#1a7f56',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26, 127, 86, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          ➖
        </button>
        
        <button
          onClick={µ1_handleResetZoom}
          title="Zoom zurücksetzen"
          style={{
            background: 'none',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 12px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600',
            color: '#1a7f56',
            minWidth: '50px',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26, 127, 86, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          {Math.round(currentZoom * 100)}%
        </button>
        
        <button
          onClick={µ1_handleZoomIn}
          title="Hineinzoomen"
          style={{
            background: 'none',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 8px',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#1a7f56',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(26, 127, 86, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          ➕
        </button>
      </div>

      {/* µ7_ Logout Button - DONNER (☳) Events */}
      <div className="header-logout" style={{
        display: 'flex',
        alignItems: 'center',
        marginLeft: '12px'
      }}>
        <button
          onClick={µ7_handleLogout}
          title="Abmelden"
          style={{
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '6px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.9)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
          }}
        >
          <span style={{ fontSize: '16px' }}>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};