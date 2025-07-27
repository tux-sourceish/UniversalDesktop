import React, { useState, useCallback, useMemo } from 'react';
import { usePanelManager } from '../../hooks/usePanelManager';
import { UDFormat } from '../../core/UDFormat';

interface PanelSidebarProps {
  position?: 'left' | 'right' | 'top' | 'bottom';
  allowResize?: boolean;
  defaultWidth?: number;
  defaultHeight?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  showToggleButtons?: boolean;
  compactMode?: boolean;
  // µ1_ Campus-Model Integration
  onCreateItem?: (type: string, position: {x: number, y: number, z: number}, content: any) => void;
}

interface PanelContentProps {
  panelId: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  isVisible: boolean;
  onToggle: () => void;
}

/**
 * 🎛️ PanelSidebar - Hook-to-Component Bridge
 * 
 * Verbindet usePanelManager Hook mit einem vollständigen Panel-System.
 * Automatisches Layout, Resize-Handling und Panel-State-Management.
 */
export const PanelSidebar: React.FC<PanelSidebarProps> = ({
  position = 'left',
  allowResize = true,
  defaultWidth = 300,
  defaultHeight = 200,
  className = '',
  style = {},
  children,
  showToggleButtons = true,
  onCreateItem
}) => {
  const panels = usePanelManager();
  const [dimensions, setDimensions] = useState({
    width: defaultWidth,
    height: defaultHeight
  });

  // µ1_ Campus-Model Item-Creation Handlers
  const µ1_createNotizzettel = useCallback(() => {
    if (!onCreateItem) return;
    const position = {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      z: Date.now()
    };
    onCreateItem('notizzettel', position, { text: "Deine Gedanken hier..." });
  }, [onCreateItem]);

  const µ1_createTabelle = useCallback(() => {
    if (!onCreateItem) return;
    const position = {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      z: Date.now()
    };
    onCreateItem('tabelle', position, {
      headers: ['Spalte 1', 'Spalte 2'],
      rows: [['Daten', 'Hier']]
    });
  }, [onCreateItem]);

  const µ1_createCode = useCallback(() => {
    if (!onCreateItem) return;
    const position = {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      z: Date.now()
    };
    onCreateItem('code', position, {
      code: '// Neuer Code\nfunction µ1_create() {\n  // Campus-Model Magic!\n}',
      language: 'typescript'
    });
  }, [onCreateItem]);

  const µ1_createBrowser = useCallback(() => {
    if (!onCreateItem) return;
    const position = {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      z: Date.now()
    };
    onCreateItem('browser', position, { 
      url: 'https://universaldesktop.ai',
      title: 'Universal Browser'
    });
  }, [onCreateItem]);

  const µ1_createTerminal = useCallback(() => {
    if (!onCreateItem) return;
    const position = {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      z: Date.now()
    };
    onCreateItem('terminal', position, { 
      command: 'echo "UniversalDesktop v2.1 ready!"',
      history: []
    });
  }, [onCreateItem]);

  const µ1_createCalendar = useCallback(() => {
    if (!onCreateItem) return;
    const position = {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      z: Date.now()
    };
    onCreateItem('calendar', position, { 
      date: new Date().toISOString().split('T')[0],
      events: []
    });
  }, [onCreateItem]);

  const µ1_createMedia = useCallback(() => {
    if (!onCreateItem) return;
    const position = {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      z: Date.now()
    };
    onCreateItem('media', position, { 
      type: 'video',
      src: '',
      title: 'Neues Media Item'
    });
  }, [onCreateItem]);

  const µ1_createChart = useCallback(() => {
    if (!onCreateItem) return;
    const position = {
      x: Math.random() * 800 + 100,
      y: Math.random() * 600 + 100,
      z: Date.now()
    };
    onCreateItem('chart', position, {
      type: 'bar',
      data: [{ name: 'A', value: 10 }, { name: 'B', value: 20 }],
      title: 'Neues Diagramm'
    });
  }, [onCreateItem]);

  // µ1_ Button-Handler Mapping (Campus-Model konform)
  const µ1_buttonHandlers = useMemo(() => ({
    'notizzettel': µ1_createNotizzettel,
    'tabelle': µ1_createTabelle,
    'code': µ1_createCode,
    'browser': µ1_createBrowser,
    'terminal': µ1_createTerminal,
    'calendar': µ1_createCalendar,
    'media': µ1_createMedia,
    'chart': µ1_createChart
  }), [µ1_createNotizzettel, µ1_createTabelle, µ1_createCode, µ1_createBrowser, µ1_createTerminal, µ1_createCalendar, µ1_createMedia, µ1_createChart]);

  // Get panels for this position
  const _positionPanels = useMemo(() => 
    panels.getPanelsByPosition(position),
    [panels, position]
  );

  // Panel resize handler
  const handleResize = useCallback((newDimensions: { width?: number; height?: number }) => {
    setDimensions(prev => ({ ...prev, ...newDimensions }));
  }, []);

  // Panel configuration
  const panelConfigs = useMemo(() => ({
    tools: {
      title: 'Werkzeugkasten',
      icon: '🧰',
      content: (
        <div className="tools-panel-content">
          <div className="tool-grid">
            {['notizzettel', 'tabelle', 'code', 'browser', 'terminal', 'calendar', 'media', 'chart'].map(tool => {
              // Raimunds algebraischer Transistor für Button-State
              const canCreateItems = true; // TODO: Logik für Button-Verfügbarkeit
              const buttonEnabled = UDFormat.transistor(canCreateItems);
              
              return (
                <button
                  key={tool}
                  className={`tool-button ${tool}`}
                  onClick={() => µ1_buttonHandlers[tool as keyof typeof µ1_buttonHandlers]?.()}
                  style={{ opacity: 0.5 + 0.5 * buttonEnabled }}
                >
                <span className="tool-icon">
                  {tool === 'notizzettel' && '📝'}
                  {tool === 'tabelle' && '📊'}
                  {tool === 'code' && '💻'}
                  {tool === 'browser' && '🌐'}
                  {tool === 'terminal' && '⚫'}
                  {tool === 'calendar' && '📅'}
                  {tool === 'media' && '🎬'}
                  {tool === 'chart' && '📈'}
                </span>
                  <span className="tool-label">{tool}</span>
                </button>
              );
            })}
          </div>
        </div>
      )
    },
    ai: {
      title: 'KI-Assistent',
      icon: '🤖',
      content: (
        <div className="ai-panel-content">
          <div className="ai-mode-selector">
            <button className="mode-btn active">💬 Chat</button>
            <button className="mode-btn">🖥️ TUI</button>
            <button className="mode-btn">💻 Code</button>
          </div>
          <div className="ai-model-selector">
            <select>
              <option>🧠 Reasoning Model</option>
              <option>⚡ Fast Model</option>
              <option>💎 Premium Model</option>
            </select>
          </div>
          <div className="ai-input-area">
            <textarea placeholder="Beschreibe was du erstellen möchtest..." />
            <button className="ai-submit">🚀 Generate</button>
          </div>
        </div>
      )
    },
    territory: {
      title: 'Territory Management',
      icon: '🏛️',
      content: (
        <div className="territory-panel-content">
          <div className="territory-controls">
            <label>
              <input type="checkbox" defaultChecked />
              Auto-Grouping
            </label>
            <label>
              <input type="checkbox" defaultChecked />
              Show Boundaries
            </label>
          </div>
          <div className="territories-list">
            <h4>🏛️ Active Territories</h4>
            <div className="territory-item">
              <div className="territory-color" style={{ background: '#1a7f56' }}></div>
              <div>
                <div className="territory-name">Code Zone 1</div>
                <div className="territory-info">3 items • Project Alpha</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    minimap: {
      title: 'StarCraft Minimap',
      icon: '🗺️',
      content: (
        <div className="minimap-panel-content">
          <div className="minimap-container">
            <div className="minimap-canvas">
              {/* Minimap content will be rendered here */}
              <div className="minimap-placeholder">
                🗺️ Minimap Widget
              </div>
            </div>
            <div className="minimap-controls">
              <button>🎯 Center</button>
              <button>🔍 Fit All</button>
            </div>
          </div>
        </div>
      )
    }
  }), []);

  // Render individual panel
  const PanelContent: React.FC<PanelContentProps> = ({ 
    panelId: _panelId, 
    title, 
    icon, 
    children, 
    isVisible, 
    onToggle 
  }) => (
    <div className={`panel-section ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="panel-header" onClick={onToggle}>
        <span className="panel-icon">{icon}</span>
        <span className="panel-title">{title}</span>
        <button className="panel-toggle">
          {isVisible ? '📖' : '📕'}
        </button>
      </div>
      {isVisible && (
        <div className="panel-content">
          {children}
        </div>
      )}
    </div>
  );

  // Panel layout styles
  const sidebarStyle: React.CSSProperties = {
    position: 'fixed',
    [position]: 0,
    top: position === 'top' ? '60px' : (position === 'bottom' ? 'auto' : '60px'),
    bottom: position === 'bottom' ? 0 : 'auto',
    width: ['left', 'right'].includes(position) ? `${dimensions.width}px` : '100%',
    height: ['top', 'bottom'].includes(position) ? `${dimensions.height}px` : 'calc(100vh - 60px)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRight: position === 'left' ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
    borderLeft: position === 'right' ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
    borderBottom: position === 'top' ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
    borderTop: position === 'bottom' ? '1px solid rgba(0, 0, 0, 0.1)' : 'none',
    overflowY: 'auto',
    zIndex: 100,
    transform: panels.getActivePanelCount() === 0 ? 
      (position === 'left' ? 'translateX(-100%)' : 
       position === 'right' ? 'translateX(100%)' :
       position === 'top' ? 'translateY(-100%)' : 'translateY(100%)') : 'none',
    transition: 'transform 0.3s ease-in-out',
    ...style
  };

  // Toggle button bar
  const ToggleButtonBar = () => (
    <div className={`panel-toggle-bar panel-toggle-${position}`} style={{
      position: 'fixed',
      [position]: panels.getActivePanelCount() > 0 ? `${dimensions.width}px` : '0px',
      top: position === 'top' ? `${dimensions.height + 60}px` : (position === 'bottom' ? 'auto' : '60px'),
      bottom: position === 'bottom' ? `${dimensions.height}px` : 'auto',
      display: 'flex',
      flexDirection: ['left', 'right'].includes(position) ? 'column' : 'row',
      gap: '4px',
      padding: '8px',
      backgroundColor: 'rgba(26, 127, 86, 0.9)',
      borderRadius: position === 'left' ? '0 8px 8px 0' : 
                    position === 'right' ? '8px 0 0 8px' :
                    position === 'top' ? '0 0 8px 8px' : '8px 8px 0 0',
      zIndex: 101,
      transition: 'all 0.3s ease-in-out'
    }}>
      {Object.entries(panels.PANEL_CONFIGS).map(([panelId, config]) => (
        <button
          key={panelId}
          className={`panel-toggle-btn ${panels.isPanelVisible(panelId as any) ? 'active' : ''}`}
          onClick={() => panels.togglePanel(panelId as any)}
          title={`${config.title} ${panels.isPanelVisible(panelId as any) ? 'ausblenden' : 'einblenden'}`}
          style={{
            background: panels.isPanelVisible(panelId as any) ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.3)',
            color: panels.isPanelVisible(panelId as any) ? '#1a7f56' : 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            transition: 'all 0.2s ease'
          }}
        >
          {config.icon}
        </button>
      ))}
    </div>
  );

  // Resize handle
  const ResizeHandle = () => {
    if (!allowResize) return null;

    const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = dimensions.width;
      const startHeight = dimensions.height;

      const handleMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        if (['left', 'right'].includes(position)) {
          const newWidth = position === 'left' ? 
            Math.max(200, Math.min(600, startWidth + deltaX)) :
            Math.max(200, Math.min(600, startWidth - deltaX));
          handleResize({ width: newWidth });
        } else {
          const newHeight = position === 'top' ?
            Math.max(150, Math.min(400, startHeight + deltaY)) :
            Math.max(150, Math.min(400, startHeight - deltaY));
          handleResize({ height: newHeight });
        }
      };

      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    return (
      <div 
        className="resize-handle"
        onMouseDown={handleMouseDown}
        style={{
          position: 'absolute',
          [position === 'left' ? 'right' : position === 'right' ? 'left' : position === 'top' ? 'bottom' : 'top']: 0,
          [['left', 'right'].includes(position) ? 'top' : 'left']: 0,
          [['left', 'right'].includes(position) ? 'bottom' : 'right']: 0,
          [['left', 'right'].includes(position) ? 'width' : 'height']: '4px',
          cursor: ['left', 'right'].includes(position) ? 'col-resize' : 'row-resize',
          backgroundColor: 'rgba(26, 127, 86, 0.5)',
          opacity: 0,
          transition: 'opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
      />
    );
  };

  if (panels.getActivePanelCount() === 0) {
    return showToggleButtons ? <ToggleButtonBar /> : null;
  }

  return (
    <>
      <div className={`panel-sidebar panel-sidebar-${position} ${className}`} style={sidebarStyle}>
        {/* Panel Sections */}
        {Object.entries(panels.PANEL_CONFIGS)
          .filter(([panelId]) => panels.isPanelVisible(panelId as any))
          .map(([panelId, config]) => (
            <PanelContent
              key={panelId}
              panelId={panelId}
              title={config.title}
              icon={config.icon}
              isVisible={panels.isPanelVisible(panelId as any)}
              onToggle={() => panels.togglePanel(panelId as any)}
            >
              {panelConfigs[panelId as keyof typeof panelConfigs]?.content}
            </PanelContent>
          ))}
        
        {/* Custom children */}
        {children}
        
        {/* Resize handle */}
        <ResizeHandle />
      </div>

      {/* Toggle button bar */}
      {showToggleButtons && <ToggleButtonBar />}
    </>
  );
};

// Export hook for external access
export const usePanelSidebarHook = () => usePanelManager();