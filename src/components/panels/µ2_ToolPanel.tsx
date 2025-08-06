import React, { useCallback, useMemo } from 'react';
import { UDFormat } from '../../core/UDFormat';
import { μ1_WindowFactory, μ1_WINDOW_REGISTRY } from '../factories/μ1_WindowFactory';

/**
 * μ2_ToolPanel - WIND (☴) Views/UI 
 * 
 * Separate Werkzeugkasten-Komponente mit Raimunds Bagua-System.
 * Nutzt algebraische Transistoren für Button-States.
 */

interface μ2_ToolPanelProps {
  /** Callback für μ1_WindowFactory UDItem Creation */
  onCreateUDItem: (udItem: any) => void;
  /** Smart positioning calculator for viewport-centered windows */
  positionCalculator?: (requestedPosition: { x: number; y: number; z: number }) => { x: number; y: number; z: number };
  position?: 'left' | 'right' | 'floating';
  width?: number;
  visible: boolean;
  onToggle: () => void;
}

export const μ2_ToolPanel: React.FC<μ2_ToolPanelProps> = ({
  onCreateUDItem,
  positionCalculator,
  position = 'left',
  width = 280,
  visible,
  onToggle
}) => {

  // μ2_ Unified Creation Handler (WIND-Pattern: Views/UI Creation via μ1_WindowFactory)
  const μ2_createWindow = useCallback((windowType: string, customContent?: any) => {
    console.log('🚀 μ2_ToolPanel.μ2_createWindow called with:', { windowType, customContent });
    
    // FIXED: Use default position (0,0,0) to trigger viewport-centered positioning
    const pos = {
      x: 0,
      y: 0,
      z: 0
    };
    
    try {
      console.log('🏭 Calling μ1_WindowFactory.createUDItem with:', {
        type: windowType,
        position: pos,
        content: customContent,
        origin: 'human-tool'
      });
      
      const udItem = μ1_WindowFactory.createUDItem({
        type: windowType,
        position: pos,
        content: customContent,
        origin: 'human-tool'
      }, positionCalculator);
      
      console.log('✅ μ1_WindowFactory created UDItem:', udItem);
      
      onCreateUDItem(udItem);
    } catch (error) {
      console.error(`μ2_ToolPanel: Failed to create ${windowType}:`, error);
    }
  }, [onCreateUDItem]);

  // μ2_ Tool Configuration from μ1_WindowFactory Registry (UNIFIED!)
  const μ2_toolConfigs = useMemo(() => {
    // Get primary window types from factory registry  
    const primaryTypes = ['notizzettel', 'tabelle', 'terminal', 'tui', 'code', 'filemanager'];
    
    return primaryTypes
      .map(typeId => {
        const registryConfig = μ1_WINDOW_REGISTRY[typeId];
        if (!registryConfig) return null;
        
        // Color mapping for UI consistency
        const colorMap: Record<string, string> = {
          'notizzettel': '#4ade80',
          'tabelle': '#60a5fa', 
          'terminal': '#1f2937',
          'tui': '#10b981',
          'code': '#a78bfa',
          'filemanager': '#fbbf24'
        };
        
        return {
          id: registryConfig.id,
          icon: registryConfig.icon,
          label: registryConfig.displayName,
          handler: () => {
            μ2_createWindow(registryConfig.id, { 
              initialPath: '/home/tux/SingularUniverse/UniversalDesktop'
            });
          },
          bagua: registryConfig.defaultBagua,
          color: colorMap[registryConfig.id] || '#6b7280',
          category: registryConfig.category
        };
      })
      .filter((tool): tool is NonNullable<typeof tool> => tool !== null);
  }, [μ2_createWindow]);

  // Raimunds algebraischer Transistor für Panel-Sichtbarkeit
  const μ2_panelOpacity = UDFormat.transistor(!visible) * 0.05 + 0.95;
  const μ2_panelTransform = visible ? 'translateX(0)' : 
    (position === 'left' ? 'translateX(-100%)' : 'translateX(100%)');

  const μ2_panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: '80px', // Unter Header
    [position]: '0',
    width: `${width}px`,
    height: 'calc(100vh - 80px)',
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRight: position === 'left' ? '2px solid rgba(26, 127, 86, 0.3)' : 'none',
    borderLeft: position === 'right' ? '2px solid rgba(26, 127, 86, 0.3)' : 'none',
    transform: μ2_panelTransform,
    opacity: μ2_panelOpacity,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 200,
    overflowY: 'auto',
    boxShadow: position === 'left' ? '4px 0 20px rgba(0,0,0,0.3)' : 
               position === 'right' ? '-4px 0 20px rgba(0,0,0,0.3)' : 
               '0 4px 20px rgba(0,0,0,0.4)'
  };

  // Early return mit algebraischem Transistor
  const μ2_shouldRender = UDFormat.transistor(visible);
  if (μ2_shouldRender === 0) return null;

  return (
    <div className="μ2-tool-panel" style={μ2_panelStyle}>
      {/* Panel Header */}
      <div className="μ2-panel-header" style={{
        padding: '16px',
        borderBottom: '1px solid rgba(26, 127, 86, 0.3)',
        backgroundColor: 'rgba(26, 127, 86, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>🧰</span>
            <h3 style={{ 
              margin: 0, 
              color: '#4ade80',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Werkzeugkasten
            </h3>
          </div>
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#9ca3af',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="μ2-tools-grid" style={{
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '12px'
      }}>
        {μ2_toolConfigs.map(tool => {
          // Raimunds algebraischer Transistor für Button-Verfügbarkeit
          const μ2_toolEnabled = true; // TODO: Logik für Tool-Verfügbarkeit
          const μ2_buttonOpacity = UDFormat.transistor(!μ2_toolEnabled) * 0.3 + 0.7;
          
          return (
            <button
              key={tool.id}
              className="μ2-tool-button"
              onClick={tool.handler}
              disabled={!μ2_toolEnabled}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 12px',
                backgroundColor: 'rgba(45, 45, 45, 0.8)',
                border: `2px solid ${tool.color}40`,
                borderRadius: '12px',
                cursor: μ2_toolEnabled ? 'pointer' : 'not-allowed',
                opacity: μ2_buttonOpacity,
                transition: 'all 0.2s ease',
                fontSize: '14px',
                fontWeight: '500',
                color: '#e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transform: μ2_toolEnabled ? 'scale(1)' : 'scale(0.95)'
              }}
              onMouseEnter={(e) => {
                if (μ2_toolEnabled) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.borderColor = tool.color;
                }
              }}
              onMouseLeave={(e) => {
                if (μ2_toolEnabled) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = `${tool.color}20`;
                }
              }}
            >
              <span style={{ fontSize: '24px' }}>{tool.icon}</span>
              <span>{tool.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bagua Info Footer */}
      <div className="μ2-bagua-info" style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        right: '16px',
        padding: '12px',
        backgroundColor: 'rgba(26, 127, 86, 0.1)',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          μ2 WIND (☴) - Views/UI Creation
        </div>
        <div>
          Folgt Raimunds Bagua-System mit algebraischen Transistoren
        </div>
      </div>
    </div>
  );
};