import React, { useState, useRef, useEffect } from 'react';
import { useDraggable, useResizable } from '../hooks';
import type { DesktopItemData } from '../types';
import { μ2_TuiWindow } from './windows/μ2_TuiWindow';
import { μ2_TableWindow } from './windows/μ2_TableWindow';
import { μ8_NoteWindow } from './windows/μ8_NoteWindow';
import '../styles/DesktopItem.css';

export interface DesktopItemProps {
  item: DesktopItemData;
  onUpdate: (id: string, updates: Partial<DesktopItemData>) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onContextMenu: (e: React.MouseEvent, itemId: string) => void;
  onTitleBarClick: (e: React.MouseEvent, itemId: string) => void;
  onToggleContext: (item: DesktopItemData) => void;
  isInContext: boolean;
  canvasState: {
    position: { x: number; y: number; z: number };
    scale: number;
    velocity: { x: number; y: number; z: number };
    isDragging: boolean;
    momentum: { x: number; y: number };
  };
}

const DesktopItem: React.FC<DesktopItemProps> = ({
  item,
  onUpdate,
  onDelete,
  onRename,
  onContextMenu,
  onTitleBarClick,
  onToggleContext,
  isInContext,
  canvasState
}) => {
  // Defensive Programmierung: Prüfe, ob item vollständig ist
  if (!item || !item.position) {
    console.warn('⚠️ DesktopItem: Incomplete item data:', item);
    return null; // Rendere nichts, bis item vollständig ist
  }
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);

  const { ref: dragRef, onMouseDown } = useDraggable(item.id, onUpdate, canvasState);
  const { ref: resizeRef, onResizeStart } = useResizable(item.id, onUpdate, canvasState);

  // Refs zusammenführen
  const itemRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (itemRef.current) {
      (dragRef as any).current = itemRef.current;
      (resizeRef as any).current = itemRef.current;
    }
  }, []);

  const handleTitleEdit = () => {
    setIsEditing(true);
    setEditTitle(item.title);
  };

  const handleTitleDoubleClick = () => {
    if (item.type === 'tui') {
      // For TUI windows, double-click cycles through themes
      const themes = ['green', 'amber', 'white', 'blue'];
      const currentTheme = item.metadata?.tuiTheme || 'green';
      const currentIndex = themes.indexOf(currentTheme);
      const nextTheme = themes[(currentIndex + 1) % themes.length];
      onUpdate(item.id, { metadata: { ...item.metadata, tuiTheme: nextTheme } });
    } else {
      // For other windows, double-click to edit title
      handleTitleEdit();
    }
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'tui': return '🖥️';
      case 'code': return '💻';
      case 'tabelle': return '📊';
      case 'terminal': return '⌨️';
      case 'browser': return '🌐';
      case 'media': return '🎬';
      case 'chart': return '📈';
      case 'calendar': return '📅';
      default: return '📝';
    }
  };

  const getWindowSoulClass = () => {
    const baseClass = 'window-soul';
    switch (item.type) {
      case 'tui': return `${baseClass} tui-soul`;
      case 'code': return `${baseClass} code-soul`;
      case 'tabelle': return `${baseClass} table-soul`;
      case 'terminal': return `${baseClass} terminal-soul`;
      case 'browser': return `${baseClass} browser-soul`;
      case 'media': return `${baseClass} media-soul`;
      case 'chart': return `${baseClass} chart-soul`;
      case 'calendar': return `${baseClass} calendar-soul`;
      default: return `${baseClass} default-soul`;
    }
  };

  const getWindowSoulIndicator = () => {
    switch (item.type) {
      case 'tui':
        const tuiTheme = item.metadata?.tuiTheme || 'green';
        const themeColors = {
          green: '🟢',
          amber: '🟡',
          white: '⚪',
          blue: '🔵'
        };
        return themeColors[tuiTheme as keyof typeof themeColors] || '🟢';
      case 'code':
        return '💡'; // Indicates code intelligence
      case 'tabelle':
        return '📈'; // Indicates data processing
      case 'terminal':
        return '⚡'; // Indicates active terminal
      case 'browser':
        return '🌍'; // Indicates web connectivity
      case 'media':
        return '▶️'; // Indicates media playback
      case 'chart':
        return '📊'; // Indicates data visualization
      case 'calendar':
        return '⏰'; // Indicates time-based data
      default:
        return '✨'; // Default sparkle
    }
  };

  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle !== item.title) {
      onRename(item.id, editTitle.trim());
    }
    setIsEditing(false);
  };

  const handleTitleCancel = () => {
    setEditTitle(item.title);
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      handleTitleCancel();
    }
  };

  const handleWindowKeyDown = (e: React.KeyboardEvent) => {
    // Global window shortcuts
    if (e.ctrlKey) {
      switch (e.key) {
        case 'c':
          e.preventDefault();
          // Copy window content to clipboard
          if (typeof item.content === 'string') {
            navigator.clipboard.writeText(item.content);
          }
          break;
        case 'd':
          e.preventDefault();
          // Duplicate window
          onUpdate(`${item.id}_copy_${Date.now()}`, {
            ...item,
            id: `${item.id}_copy_${Date.now()}`,
            title: `${item.title} (Copy)`,
            position: {
              x: item.position.x + 20,
              y: item.position.y + 20,
              z: item.position.z + 1
            }
          });
          break;
        case 'Delete':
          e.preventDefault();
          // Delete window
          onDelete(item.id);
          break;
      }
    }
  };

  const renderContent = () => {
    switch (item.type) {
      case 'tabelle':
        // Convert DesktopItemData to UDItem for μ2_TableWindow
        const tableUDItem = {
          id: item.id,
          type: 8, // Table type in UDItem system
          title: item.title,
          position: item.position,
          dimensions: { width: item.width || 400, height: item.height || 300 },
          bagua_descriptor: item.bagua_descriptor || 0,
          content: Array.isArray(item.content) ? item.content : [['Header 1', 'Header 2', 'Header 3'], ['Row 1', 'Data 1', 'Data 2']],
          is_contextual: item.is_contextual || false,
          created_at: Date.now(),
          updated_at: Date.now(),
          transformation_history: []
        };
        return (
          <μ2_TableWindow
            udItem={tableUDItem}
            onUDItemChange={(updatedItem, description) => {
              onUpdate(item.id, { content: updatedItem.content });
            }}
            readOnly={item.metadata?.readOnly || false}
          />
        );
      
      case 'code':
        return (
          <div className="desktop-code-container">
            <pre className="desktop-code">
              <code>{item.content || '// Code hier eingeben'}</code>
            </pre>
          </div>
        );
      
      case 'terminal':
        return (
          <μ2_TuiWindow
            udItem={{
              id: item.id,
              type: 3,
              title: item.title,
              position: item.position,
              dimensions: { width: item.width || 600, height: item.height || 400 },
              bagua_descriptor: item.bagua_descriptor || 0,
              content: { 
                text: item.content || `╭─ SYSTEM INTERFACE ANALYSIS ─╮
│ UniversalDesktop Terminal    │
│ Type 'help' for commands     │
│ Status: OPERATIONAL          │
╰──────────────────────────────╯

╭─ ACTIVE WINDOWS ─╮
│ [DB] Datenbank    │ [NOTE] Notizzettel │ [CHART] Diagramme │
│ [CAL] Kalender    │ [MEDIA] Medien     │ [TERM] Terminal   │
│ [AI] KI-Response  │ [CHAT] AI Chat     │ [SYS] System Status │
╰─────────────────────────────────────────────────────────────╯

╭─ INTERFACE METRICS ─╮
│ Resolution: 80x25  │ Memory Usage: 47%  │ CPU Load: 23%     │
│ Active Processes: 12 │ Uptime: 04:32:17 │ Network: Connected │
╰─────────────────────────────────────────────────────────────╯

╭─ SYSTEM ARTWORK ─╮
│ ████████████████ │
│ ██            ██ │
│ ██ ████████████ │
│ ██ ██        ██ │
│ ██ ██████████ ██ │
│ ██            ██ │
│ ████████████████ │
╰─────────────────────╯

$ `,
                tui_preset: item.metadata?.tuiTheme || 'green'
              },
              is_contextual: item.is_contextual || false,
              created_at: Date.now(),
              updated_at: Date.now(),
              transformation_history: []
            }}
            onUDItemChange={(updatedItem: any, description: string) => {
              onUpdate(item.id, { 
                content: updatedItem.content.text,
                metadata: { ...item.metadata, tuiTheme: updatedItem.content.tui_preset }
              });
            }}
            readOnly={item.metadata?.readOnly || false}
          />
        );
      
      case 'tui':
        return (
          <μ2_TuiWindow
            udItem={{
              id: item.id,
              type: 3,
              title: item.title,
              position: item.position,
              dimensions: { width: item.width || 600, height: item.height || 400 },
              bagua_descriptor: item.bagua_descriptor || 0,
              content: { 
                text: item.content || '',
                tui_preset: item.metadata?.tuiTheme || 'green'
              },
              is_contextual: item.is_contextual || false,
              created_at: Date.now(),
              updated_at: Date.now(),
              transformation_history: []
            }}
            onUDItemChange={(updatedItem: any, description: string) => {
              onUpdate(item.id, { 
                content: updatedItem.content.text,
                metadata: { ...item.metadata, tuiTheme: updatedItem.content.tui_preset }
              });
            }}
            readOnly={item.metadata?.readOnly || false}
          />
        );
      
      default:
        return (
          <μ8_NoteWindow
            udItem={{
              id: item.id,
              type: 1, // Note type in UDItem system
              title: item.title,
              position: item.position,
              dimensions: { width: item.width || 400, height: item.height || 300 },
              bagua_descriptor: item.bagua_descriptor || 0,
              content: typeof item.content === 'string' ? item.content : '',
              is_contextual: item.is_contextual || false,
              created_at: Date.now(),
              updated_at: Date.now(),
              transformation_history: []
            }}
            onUDItemChange={(updatedItem: any, description: string) => {
              onUpdate(item.id, { content: updatedItem.content });
            }}
            readOnly={item.metadata?.readOnly || false}
          />
        );
    }
  };

  return (
    <div
      ref={itemRef}
      className={`desktop-item ${item.type} ${isInContext ? 'in-context' : ''} ${getWindowSoulClass()}`}
      style={{
        left: item.position?.x || 0,
        top: item.position?.y || 0,
        zIndex: item.position?.z || 10,
        width: item.width || 250,
        height: item.height || 200
      }}
      onContextMenu={(e) => onContextMenu(e, item.id)}
      onKeyDown={handleWindowKeyDown}
      tabIndex={0}
    >
      {/* Header */}
      <div 
        className="item-header"
        onMouseDown={onMouseDown}
        onClick={(e) => {
          // Only trigger titlebar click if not clicking on controls
          if (!e.target || !(e.target as Element).closest('.item-controls')) {
            onTitleBarClick(e, item.id);
          }
        }}
      >
        <div className="item-title-container">
          <span className="item-type-icon" title={`${item.type} window`}>
            {getTypeIcon()}
          </span>
          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleKeyPress}
              className="item-title-input"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span 
              className="item-title"
              onDoubleClick={handleTitleDoubleClick}
              title={item.type === 'tui' ? 'Doppelklick zum Theme wechseln' : 'Doppelklick zum Bearbeiten'}
            >
              {item.title}
            </span>
          )}
        </div>
        
        <div className="item-controls">
          <span 
            className="item-soul-indicator"
            title={`${item.type} window soul`}
          >
            {getWindowSoulIndicator()}
          </span>
          <button
            className={`item-control-btn context ${isInContext ? 'active' : ''}`}
            onClick={() => onToggleContext(item)}
            title={isInContext ? "Aus Kontext entfernen" : "Zu Kontext hinzufügen"}
          >
            {isInContext ? '📌' : '📍'}
          </button>
          <button
            className="item-control-btn edit"
            onClick={handleTitleEdit}
            title="Umbenennen"
          >
            ✏️
          </button>
          <button
            className="item-control-btn delete"
            onClick={() => onDelete(item.id)}
            title="Löschen"
          >
            ❌
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        className="item-content"
        onMouseDown={(e) => e.stopPropagation()}
        onWheel={(e) => e.stopPropagation()}
      >
        {renderContent()}
      </div>

      {/* Resize Handles */}
      <div className="resize-handles">
        <div 
          className="resize-handle resize-se"
          onMouseDown={(e) => onResizeStart(e, 'se')}
          title="Größe ändern"
        />
        <div 
          className="resize-handle resize-s"
          onMouseDown={(e) => onResizeStart(e, 's')}
        />
        <div 
          className="resize-handle resize-e"
          onMouseDown={(e) => onResizeStart(e, 'e')}
        />
      </div>
    </div>
  );
};

export default DesktopItem;

// μ8_ Bagua Export (ERDE - Global/Base)
export { DesktopItem as μ8_DesktopItem };