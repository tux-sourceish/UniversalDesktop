import React, { useState, useCallback } from 'react';
import { UDFormat } from '../../core/UDFormat';

/**
 * μ5_TerritoryPanel - SEE (☱) Properties - Territory Management
 * 
 * V1-Style Territory Management mit Raimunds Bagua-System.
 * Räumliche Organisation von Desktop-Items in Territories.
 */

interface μ5_TerritoryPanelProps {
  position?: 'right' | 'left' | 'floating';
  width?: number;
  visible: boolean;
  onToggle: () => void;
  rightOffset?: number; // Für Panel-Kollisionsvermeidung
}

interface μ5_Territory {
  id: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  color: string;
  project: string;
  itemCount: number;
  createdAt: Date;
  lastAccessed: Date;
  bagua_descriptor: number;
}

export const μ5_TerritoryPanel: React.FC<μ5_TerritoryPanelProps> = ({
  position: _position = 'right',
  width = 300,
  visible,
  onToggle,
  rightOffset = 0
}) => {

  // μ5_ Territory Management State (SEE-Pattern: Properties/Spatial)
  const [μ5_territories, setμ5_Territories] = useState<μ5_Territory[]>([
    {
      id: 'territory_1',
      name: 'Code Zone Alpha',
      bounds: { x: 100, y: 100, width: 400, height: 300 },
      color: '#4ade80',
      project: 'UniversalDesktop v2',
      itemCount: 3,
      createdAt: new Date(),
      lastAccessed: new Date(),
      bagua_descriptor: UDFormat.BAGUA.HIMMEL // Code Territory
    },
    {
      id: 'territory_2', 
      name: 'Research Hub',
      bounds: { x: 600, y: 200, width: 350, height: 250 },
      color: '#60a5fa',
      project: 'AI Integration',
      itemCount: 2,
      createdAt: new Date(),
      lastAccessed: new Date(),
      bagua_descriptor: UDFormat.BAGUA.WIND // Research Territory
    },
    {
      id: 'territory_3',
      name: 'Media Center',
      bounds: { x: 200, y: 500, width: 300, height: 200 },
      color: '#a78bfa',
      project: 'Content Creation',
      itemCount: 1,
      createdAt: new Date(),
      lastAccessed: new Date(),
      bagua_descriptor: UDFormat.BAGUA.WASSER // Media Territory
    }
  ]);

  const [μ5_settings, setμ5_Settings] = useState({
    autoGrouping: true,
    showBoundaries: true,
    snapToGrid: false,
    territoryOpacity: 0.3
  });

  const [μ5_selectedTerritory, setμ5_SelectedTerritory] = useState<string | null>(null);

  // μ5_ Create New Territory
  const μ5_createTerritory = useCallback(() => {
    const newTerritory: μ5_Territory = {
      id: `territory_${Date.now()}`,
      name: 'New Territory',
      bounds: { 
        x: Math.random() * 400, 
        y: Math.random() * 300, 
        width: 300, 
        height: 200 
      },
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      project: 'Untitled Project',
      itemCount: 0,
      createdAt: new Date(),
      lastAccessed: new Date(),
      bagua_descriptor: UDFormat.BAGUA.SEE
    };

    setμ5_Territories(prev => [...prev, newTerritory]);
  }, []);

  // μ5_ Delete Territory mit algebraischem Transistor
  const μ5_deleteTerritory = useCallback((territoryId: string) => {
    setμ5_Territories(prev => {
      const territoryExists = prev.some(t => t.id === territoryId);
      // Raimunds algebraischer Transistor für Existenz-Check
      const shouldDelete = UDFormat.transistor(!territoryExists); // 0 wenn existiert, 1 wenn nicht
      
      return shouldDelete === 1 ? prev : prev.filter(t => t.id !== territoryId);
    });
  }, []);

  // μ5_ Territory Settings Toggle
  const μ5_toggleSetting = useCallback((setting: keyof typeof μ5_settings) => {
    setμ5_Settings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  }, []);

  // μ5_ Territory Quick Actions
  const μ5_jumpToTerritory = useCallback((territory: μ5_Territory) => {
    // TODO: Integration mit Canvas Navigation
    console.log(`Jumping to territory: ${territory.name}`);
    setμ5_SelectedTerritory(territory.id === μ5_selectedTerritory ? null : territory.id);
  }, [μ5_selectedTerritory]);

  // Raimunds algebraischer Transistor für Panel-Sichtbarkeit
  const μ5_panelTransform = visible ? 'translateX(0)' : 'translateX(100%)';
  const μ5_panelOpacity = UDFormat.transistor(!visible) * 0.05 + 0.95;

  const μ5_panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: '80px', // Unter Header
    right: `${rightOffset}px`, // Panel-Kollisionsvermeidung
    width: `${width}px`,
    height: 'calc(100vh - 80px)',
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    backdropFilter: 'blur(10px)',
    borderLeft: '2px solid rgba(168, 85, 247, 0.3)',
    transform: μ5_panelTransform,
    opacity: μ5_panelOpacity,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.3)'
  };

  // Early return mit algebraischem Transistor
  const μ5_shouldRender = UDFormat.transistor(visible);
  if (μ5_shouldRender === 0) return null;

  return (
    <div className="μ5-territory-panel" style={μ5_panelStyle}>
      {/* Panel Header */}
      <div className="μ5-panel-header" style={{
        padding: '16px',
        borderBottom: '1px solid rgba(168, 85, 247, 0.2)',
        backgroundColor: 'rgba(168, 85, 247, 0.05)'
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
            <span style={{ fontSize: '20px' }}>🏛️</span>
            <h3 style={{ 
              margin: 0, 
              color: '#a855f7',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Territory Management
            </h3>
          </div>
          <button
            onClick={onToggle}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Territory Settings */}
      <div className="μ5-territory-settings" style={{
        padding: '16px',
        borderBottom: '1px solid rgba(168, 85, 247, 0.1)'
      }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151'
        }}>
          ⚙️ Territory Settings
        </h4>
        
        {[
          { key: 'autoGrouping', label: 'Auto-Grouping', icon: '🔄' },
          { key: 'showBoundaries', label: 'Show Boundaries', icon: '📐' },
          { key: 'snapToGrid', label: 'Snap to Grid', icon: '📊' }
        ].map(setting => (
          <label
            key={setting.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '8px',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.05)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <input
              type="checkbox"
              checked={μ5_settings[setting.key as keyof typeof μ5_settings] as boolean}
              onChange={() => μ5_toggleSetting(setting.key as keyof typeof μ5_settings)}
              style={{
                transform: 'scale(1.1)',
                accentColor: '#a855f7'
              }}
            />
            <span style={{ fontSize: '14px' }}>{setting.icon}</span>
            <span style={{ 
              fontSize: '14px',
              color: '#374151',
              fontWeight: '500'
            }}>
              {setting.label}
            </span>
          </label>
        ))}
      </div>

      {/* Active Territories List */}
      <div className="μ5-territories-list" style={{
        flex: 1,
        padding: '16px',
        borderBottom: '1px solid rgba(168, 85, 247, 0.1)',
        overflowY: 'auto'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151'
          }}>
            🏛️ Active Territories ({μ5_territories.length})
          </h4>
          <button
            onClick={μ5_createTerritory}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              borderRadius: '6px',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              backgroundColor: 'rgba(168, 85, 247, 0.1)',
              color: '#a855f7',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.1)';
            }}
          >
            + Add
          </button>
        </div>

        {μ5_territories.map(territory => {
          const isSelected = μ5_selectedTerritory === territory.id;
          
          return (
            <div
              key={territory.id}
              className="μ5-territory-item"
              style={{
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                backgroundColor: isSelected ? 'rgba(168, 85, 247, 0.1)' : 'white',
                border: `1px solid ${isSelected ? 'rgba(168, 85, 247, 0.3)' : 'rgba(168, 85, 247, 0.1)'}`,
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onClick={() => μ5_jumpToTerritory(territory)}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'rgba(168, 85, 247, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.backgroundColor = 'white';
                }
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                {/* Territory Color Indicator */}
                <div
                  className="μ5-territory-color"
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '4px',
                    backgroundColor: territory.color,
                    border: '1px solid rgba(0,0,0,0.1)',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                />
                
                {/* Territory Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <h5 style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap'
                    }}>
                      {territory.name}
                    </h5>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        μ5_deleteTerritory(territory.id);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '2px',
                        opacity: 0.6,
                        transition: 'opacity 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    {territory.itemCount} items • {territory.project}
                  </div>
                  
                  <div style={{
                    fontSize: '11px',
                    color: '#9ca3af'
                  }}>
                    {territory.bounds.width}×{territory.bounds.height} @ ({territory.bounds.x}, {territory.bounds.y})
                  </div>
                </div>
              </div>
              
              {/* Territory Actions (wenn selected) */}
              {isSelected && (
                <div className="μ5-territory-actions" style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid rgba(168, 85, 247, 0.2)',
                  display: 'flex',
                  gap: '6px'
                }}>
                  {[
                    { icon: '🎯', label: 'Center', action: 'center' },
                    { icon: '📐', label: 'Resize', action: 'resize' },
                    { icon: '🎨', label: 'Color', action: 'color' },
                    { icon: '📝', label: 'Rename', action: 'rename' }
                  ].map(action => (
                    <button
                      key={action.action}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log(`Territory action: ${action.action} on ${territory.name}`);
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        borderRadius: '4px',
                        border: '1px solid rgba(168, 85, 247, 0.2)',
                        backgroundColor: 'rgba(168, 85, 247, 0.05)',
                        color: '#a855f7',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{action.icon}</span>
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Territory Statistics */}
      <div className="μ5-territory-stats" style={{
        padding: '16px',
        backgroundColor: 'rgba(168, 85, 247, 0.05)',
        borderTop: '1px solid rgba(168, 85, 247, 0.1)'
      }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151'
        }}>
          📊 Territory Statistics
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <div>
            <strong>Total Items:</strong> {μ5_territories.reduce((sum, t) => sum + t.itemCount, 0)}
          </div>
          <div>
            <strong>Coverage:</strong> 87%
          </div>
          <div>
            <strong>Avg Size:</strong> {Math.round(μ5_territories.reduce((sum, t) => sum + (t.bounds.width * t.bounds.height), 0) / μ5_territories.length / 1000)}k px²
          </div>
          <div>
            <strong>Projects:</strong> {new Set(μ5_territories.map(t => t.project)).size}
          </div>
        </div>
      </div>

      {/* Bagua Info Footer */}
      <div className="μ5-bagua-info" style={{
        padding: '12px 16px',
        backgroundColor: 'rgba(168, 85, 247, 0.05)',
        borderTop: '1px solid rgba(168, 85, 247, 0.1)',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          μ5 SEE (☱) - Spatial Properties Management
        </div>
        <div>
          Organisiert Desktop-Items in logische Territories mit Bagua-Deskriptoren
        </div>
      </div>
    </div>
  );
};