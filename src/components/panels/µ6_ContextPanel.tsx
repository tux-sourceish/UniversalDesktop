import React, { useMemo } from 'react';
import { UDFormat } from '../../core/UDFormat';

/**
 * μ6_ContextPanel - FEUER (☲) Functions - AI Context Management UI
 * 
 * V1 Genius-Feature als Panel! Selektive AI-Kontexte mit Visual Management.
 */

interface μ6_ContextPanelProps {
  activeContextItems: Array<{
    id: string;
    title: string; 
    type: 'window' | 'selection' | 'document' | 'code' | 'table';
    content: string;
    tokenEstimate?: number;
    priority?: 'high' | 'medium' | 'low';
    bagua_descriptor?: number;
    addedAt: Date;
  }>;
  tokenUsage: {
    current: number;
    limit: number;
    percentage: number;
    warning: boolean;
    critical: boolean;
  };
  onRemoveItem: (id: string) => void;
  onClearAll: (force?: boolean) => void;
  onOptimize: () => void;
  onUndo: () => void;
  position?: 'right' | 'left' | 'floating';
  width?: number;
  visible: boolean;
  onToggle: () => void;
  rightOffset?: number;
}

export const μ6_ContextPanel: React.FC<μ6_ContextPanelProps> = ({
  activeContextItems,
  tokenUsage,
  onRemoveItem,
  onClearAll,
  onOptimize,
  onUndo,
  position = 'right',
  width = 350,
  visible,
  onToggle,
  rightOffset = 0
}) => {

  // μ6_ Token Display Helpers
  const μ6_formatTokens = (tokens: number): string => {
    if (tokens > 1000) return `${(tokens / 1000).toFixed(1)}k`;
    return tokens.toString();
  };

  const μ6_getTokenWarningClass = (): string => {
    if (tokenUsage.critical) return 'token-critical';
    if (tokenUsage.warning) return 'token-warning';
    return 'token-ok';
  };

  // μ6_ Type Icon Mapping
  const μ6_getTypeIcon = (type: string): string => {
    switch (type) {
      case 'window': return '🪟';
      case 'document': return '📄';
      case 'code': return '💻';
      case 'table': return '📊';
      case 'selection': return '✂️';
      default: return '📋';
    }
  };

  // μ6_ Priority Color Mapping  
  const μ6_getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#6b7280';
      default: return '#f59e0b';
    }
  };

  // μ6_ Bagua Info Display
  const μ6_getBaguaInfo = (descriptor?: number): string => {
    if (!descriptor) return '';
    
    const baguaNames = {
      [UDFormat.BAGUA.HIMMEL]: 'HIMMEL ☰',
      [UDFormat.BAGUA.WIND]: 'WIND ☴', 
      [UDFormat.BAGUA.WASSER]: 'WASSER ☵',
      [UDFormat.BAGUA.BERG]: 'BERG ☶',
      [UDFormat.BAGUA.SEE]: 'SEE ☱',
      [UDFormat.BAGUA.FEUER]: 'FEUER ☲',
      [UDFormat.BAGUA.DONNER]: 'DONNER ☳',
      [UDFormat.BAGUA.ERDE]: 'ERDE ☷',
      [UDFormat.BAGUA.TAIJI]: 'TAIJI ☯'
    };
    
    return baguaNames[descriptor as keyof typeof baguaNames] || `Bagua ${descriptor}`;
  };

  // μ6_ Context Statistics
  const μ6_contextStats = useMemo(() => {
    const typeCount = activeContextItems.reduce((acc, item) => {
      acc[item.type] = (acc[item.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const priorityCount = activeContextItems.reduce((acc, item) => {
      const priority = item.priority || 'medium';
      acc[priority] = (acc[priority] || 0) + 1; 
      return acc;
    }, {} as Record<string, number>);

    return { typeCount, priorityCount };
  }, [activeContextItems]);

  // Raimunds algebraischer Transistor für Panel-Sichtbarkeit
  const μ6_panelTransform = visible ? 'translateX(0)' : 'translateX(100%)';
  const μ6_panelOpacity = UDFormat.transistor(!visible) * 0.05 + 0.95;

  const μ6_panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: '80px',
    right: `${rightOffset}px`,
    width: `${width}px`,
    height: 'calc(100vh - 80px)',
    backgroundColor: 'rgba(30, 30, 30, 0.95)',
    backdropFilter: 'blur(10px)',
    borderLeft: '2px solid rgba(239, 68, 68, 0.3)',
    transform: μ6_panelTransform,
    opacity: μ6_panelOpacity,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    zIndex: 200,
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '-4px 0 20px rgba(0,0,0,0.3)'
  };

  // Early return mit algebraischem Transistor
  const μ6_shouldRender = UDFormat.transistor(visible);
  if (μ6_shouldRender === 0) return null;

  return (
    <div className="μ6-context-panel" style={μ6_panelStyle}>
      {/* Panel Header */}
      <div className="μ6-context-header" style={{
        padding: '16px',
        borderBottom: '1px solid rgba(239, 68, 68, 0.2)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>📌</span>
            <h3 style={{ 
              margin: 0, 
              color: '#ef4444',
              fontSize: '16px',
              fontWeight: '600'
            }}>
              Context Manager
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

        {/* Token Usage Display */}
        <div className={`μ6-token-display μ6-${μ6_getTokenWarningClass()}`} style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          borderRadius: '8px',
          backgroundColor: 
            tokenUsage.critical ? 'rgba(239, 68, 68, 0.1)' :
            tokenUsage.warning ? 'rgba(245, 158, 11, 0.1)' :
            'rgba(34, 197, 94, 0.1)',
          border: `1px solid ${
            tokenUsage.critical ? 'rgba(239, 68, 68, 0.3)' :
            tokenUsage.warning ? 'rgba(245, 158, 11, 0.3)' :
            'rgba(34, 197, 94, 0.3)'
          }`
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '14px' }}>🪙</span>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 
                tokenUsage.critical ? '#ef4444' :
                tokenUsage.warning ? '#f59e0b' :
                '#22c55e'
            }}>
              {μ6_formatTokens(tokenUsage.current)}
            </span>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              / {μ6_formatTokens(tokenUsage.limit)}
            </span>
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: '500',
            color: 
              tokenUsage.critical ? '#ef4444' :
              tokenUsage.warning ? '#f59e0b' :
              '#22c55e'
          }}>
            {tokenUsage.percentage.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Context Items List */}
      <div className="μ6-context-items" style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px'
      }}>
        {activeContextItems.length === 0 ? (
          <div className="μ6-context-empty" style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
              Kein AI-Kontext aktiv
            </div>
            <div style={{ fontSize: '14px' }}>
              Klicke auf 📌 bei einem Item um es zum AI-Context hinzuzufügen
            </div>
          </div>
        ) : (
          activeContextItems.map(item => (
            <div
              key={item.id}
              className="μ6-context-item"
              style={{
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                backgroundColor: 'white',
                border: '1px solid rgba(239, 68, 68, 0.1)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Item Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <span style={{ fontSize: '16px' }}>{μ6_getTypeIcon(item.type)}</span>
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1
                    }}>
                      {item.title}
                    </span>
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: μ6_getPriorityColor(item.priority),
                        flexShrink: 0
                      }}
                      title={`Priority: ${item.priority || 'medium'}`}
                    />
                  </div>

                  {/* Token & Bagua Info */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '11px',
                    color: '#6b7280'
                  }}>
                    <span>🪙 {μ6_formatTokens(item.tokenEstimate || 0)}</span>
                    {item.bagua_descriptor && (
                      <span title="Bagua Descriptor">
                        {μ6_getBaguaInfo(item.bagua_descriptor)}
                      </span>
                    )}
                    <span>{item.addedAt.toLocaleTimeString()}</span>
                  </div>

                  {/* Content Preview */}
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#6b7280',
                    lineHeight: '1.4',
                    maxHeight: '40px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {item.content.substring(0, 120)}
                    {item.content.length > 120 && '...'}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => onRemoveItem(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ef4444',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: '4px',
                    borderRadius: '4px',
                    marginLeft: '8px',
                    opacity: 0.6,
                    transition: 'opacity 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                  title="Aus Context entfernen"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Context Actions */}
      {activeContextItems.length > 0 && (
        <div className="μ6-context-actions" style={{
          padding: '16px',
          borderTop: '1px solid rgba(239, 68, 68, 0.1)',
          backgroundColor: 'rgba(239, 68, 68, 0.02)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <button
              onClick={onOptimize}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                color: '#22c55e',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              🔄 Optimize
            </button>
            <button
              onClick={onUndo}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                borderRadius: '6px',
                border: '1px solid rgba(107, 114, 128, 0.3)',
                backgroundColor: 'rgba(107, 114, 128, 0.1)',
                color: '#6b7280',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ↩️ Undo
            </button>
          </div>
          
          <button
            onClick={() => onClearAll(false)}
            style={{
              width: '100%',
              padding: '10px',
              fontSize: '13px',
              borderRadius: '6px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            🗑️ Clear All Context
          </button>
        </div>
      )}

      {/* Context Statistics */}
      {activeContextItems.length > 0 && (
        <div className="μ6-context-stats" style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(239, 68, 68, 0.05)',
          borderTop: '1px solid rgba(239, 68, 68, 0.1)',
          fontSize: '11px',
          color: '#6b7280'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px'
          }}>
            <div>
              <strong>Items:</strong> {activeContextItems.length}
            </div>
            <div>
              <strong>Avg:</strong> {Math.round(tokenUsage.current / activeContextItems.length)} tokens
            </div>
            <div>
              <strong>Types:</strong> {Object.keys(μ6_contextStats.typeCount).length}
            </div>
            <div>
              <strong>High Priority:</strong> {μ6_contextStats.priorityCount.high || 0}
            </div>
          </div>
        </div>
      )}

      {/* Bagua Info Footer */}
      <div className="μ6-bagua-info" style={{
        padding: '12px 16px',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderTop: '1px solid rgba(239, 68, 68, 0.1)',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
          μ6 FEUER (☲) - AI Context Functions
        </div>
        <div>
          Selektive AI-Kontexte mit Token-Management und Auto-Optimization
        </div>
      </div>
    </div>
  );
};