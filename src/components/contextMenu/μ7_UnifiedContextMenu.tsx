import React, { useCallback, useMemo } from 'react';
import { UDFormat } from '../../core/UDFormat';
import { μ1_WINDOW_REGISTRY } from '../factories/μ1_WindowFactory';
import type { DesktopItemData } from '../../types';

/**
 * μ7_UnifiedContextMenu - DONNER (☳) Events/Interactions
 * 
 * Context-aware right-click menu system with V2 Bagua integration.
 * Supports canvas, window, and content contexts with algebraic transistor logic.
 * 
 * Features:
 * - Context-sensitive menu items
 * - Integration with μ1_WindowFactory for creation actions
 * - Integration with μ6_useContextManager for AI context (📌)
 * - Algebraic transistor visibility logic
 * - Historical V1 features restored with V2 architecture
 */

interface μ7_UnifiedContextMenuProps {
  /** Context menu visibility and position */
  visible: boolean;
  x: number;
  y: number;
  
  /** Context type determines available actions */
  contextType: 'canvas' | 'window' | 'content';
  
  /** Target item for window/content contexts */
  targetItem?: DesktopItemData;
  
  /** Callbacks for actions */
  onClose: () => void;
  onCreateItem?: (type: string, position: { x: number; y: number; z: number }) => void;
  onItemAction?: (action: string, item?: DesktopItemData) => void;
  onAddToContext?: (item: DesktopItemData) => void;
  
  /** System state for algebraic transistors */
  clipboardHasContent?: boolean;
  hasSelection?: boolean;
}

interface μ7_MenuSection {
  title: string;
  items: μ7_MenuItem[];
}

interface μ7_MenuItem {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  visible: number; // Algebraic transistor result (0 or 1)
  shortcut?: string;
  separator?: boolean;
  submenu?: μ7_MenuItem[];
}

export const μ7_UnifiedContextMenu: React.FC<μ7_UnifiedContextMenuProps> = ({
  visible,
  x,
  y,
  contextType,
  targetItem,
  onClose,
  onCreateItem,
  onItemAction,
  onAddToContext,
  clipboardHasContent = false,
  hasSelection = false
}) => {
  
  
  // μ7_ Algebraic Transistor Logic for Menu Item Visibility
  const μ7_getVisibility = useCallback((condition: boolean): number => {
    return UDFormat.transistor(condition);
  }, []);

  // μ7_ Canvas Context Menu Items
  const μ7_canvasMenuItems = useMemo((): μ7_MenuSection[] => {
    const createItems = Object.values(μ1_WINDOW_REGISTRY).map(config => ({
      id: `create_${config.id}`,
      label: config.displayName,
      icon: config.icon,
      action: () => {
        onCreateItem?.(config.id, { x: x - 200, y: y - 100, z: 10 });
        onClose();
      },
      visible: 1 // Always visible in canvas context
    }));

    return [
      {
        title: 'Erstellen',
        items: createItems
      },
      {
        title: 'KI-Assistenz',
        items: [
          {
            id: 'ai_help',
            label: 'KI-Hilfe',
            icon: '🤖',
            action: () => {
              onItemAction?.('ai-help');
              onClose();
            },
            visible: 1
          },
          {
            id: 'reasoning_mode',
            label: 'Reasoning Modus',
            icon: '🧠',
            action: () => {
              onItemAction?.('reasoning-mode');
              onClose();
            },
            visible: 1
          }
        ]
      },
      {
        title: 'Navigation',
        items: [
          {
            id: 'zoom_fit',
            label: 'Zoom to Fit',
            icon: '🔍',
            action: () => {
              onItemAction?.('zoom-to-fit');
              onClose();
            },
            visible: 1
          },
          {
            id: 'center_view',
            label: 'Ansicht zentrieren',
            icon: '📍',
            action: () => {
              onItemAction?.('center-view');
              onClose();
            },
            visible: 1
          }
        ]
      }
    ];
  }, [x, y, onCreateItem, onItemAction, onClose]);

  // μ7_ Window Context Menu Items
  const μ7_windowMenuItems = useMemo((): μ7_MenuSection[] => {
    if (!targetItem) return [];

    const canPin = μ7_getVisibility(!targetItem.is_contextual);
    const canUnpin = μ7_getVisibility(!!targetItem.is_contextual);

    return [
      {
        title: 'KI-Kontext',
        items: [
          {
            id: 'pin_context',
            label: 'Zu AI-Kontext hinzufügen',
            icon: '📌',
            action: () => {
              onAddToContext?.(targetItem);
              onClose();
            },
            visible: canPin
          },
          {
            id: 'unpin_context',
            label: 'Aus AI-Kontext entfernen',
            icon: '📍',
            action: () => {
              onItemAction?.('unpin-context', targetItem);
              onClose();
            },
            visible: canUnpin
          }
        ]
      },
      {
        title: 'Bearbeiten',
        items: [
          {
            id: 'select_all',
            label: 'Alles auswählen',
            icon: '🔘',
            action: () => {
              onItemAction?.('select-all', targetItem);
              onClose();
            },
            visible: 1,
            shortcut: 'Ctrl+A'
          },
          {
            id: 'copy_text',
            label: 'Kopieren',
            icon: '📋',
            action: () => {
              onItemAction?.('copy-text', targetItem);
              onClose();
            },
            visible: μ7_getVisibility(hasSelection),
            shortcut: 'Ctrl+C'
          },
          {
            id: 'cut_text',
            label: 'Ausschneiden',
            icon: '✂️',
            action: () => {
              onItemAction?.('cut-text', targetItem);
              onClose();
            },
            visible: μ7_getVisibility(hasSelection),
            shortcut: 'Ctrl+X'
          },
          {
            id: 'paste_text',
            label: 'Einfügen',
            icon: '📄',
            action: () => {
              onItemAction?.('paste-text', targetItem);
              onClose();
            },
            visible: μ7_getVisibility(clipboardHasContent),
            shortcut: 'Ctrl+V'
          }
        ]
      },
      {
        title: 'Fenster-Aktionen',
        items: [
          {
            id: 'rename',
            label: 'Umbenennen',
            icon: '✏️',
            action: () => {
              onItemAction?.('rename', targetItem);
              onClose();
            },
            visible: 1,
            shortcut: 'F2'
          },
          {
            id: 'duplicate',
            label: 'Duplizieren',
            icon: '📋',
            action: () => {
              onItemAction?.('duplicate', targetItem);
              onClose();
            },
            visible: 1,
            shortcut: 'Ctrl+D'
          },
          {
            id: 'delete',
            label: 'Löschen',
            icon: '🗑️',
            action: () => {
              onItemAction?.('delete', targetItem);
              onClose();
            },
            visible: 1,
            shortcut: 'Del'
          },
          {
            id: 'bring_front',
            label: 'In Vordergrund',
            icon: '⬆️',
            action: () => {
              onItemAction?.('bring-to-front', targetItem);
              onClose();
            },
            visible: 1
          }
        ]
      },
      {
        title: 'KI-Workflows',
        items: [
          {
            id: 'reasoner',
            label: 'Reasoner',
            icon: '🧠',
            action: () => {
              onItemAction?.('ai-reasoner', targetItem);
              onClose();
            },
            visible: 1
          },
          {
            id: 'coder',
            label: 'Coder',
            icon: '💻',
            action: () => {
              onItemAction?.('ai-coder', targetItem);
              onClose();
            },
            visible: 1
          },
          {
            id: 'refiner',
            label: 'Refiner',
            icon: '✨',
            action: () => {
              onItemAction?.('ai-refiner', targetItem);
              onClose();
            },
            visible: 1
          }
        ]
      },
      {
        title: 'Transformationen',
        items: [
          {
            id: 'export',
            label: 'Exportieren',
            icon: '📤',
            action: () => {
              onItemAction?.('export', targetItem);
              onClose();
            },
            visible: 1
          },
          {
            id: 'convert_type',
            label: 'Typ konvertieren',
            icon: '🔄',
            action: () => {
              onItemAction?.('convert-type', targetItem);
              onClose();
            },
            visible: 1
          },
          {
            id: 'optimize',
            label: 'Optimieren',
            icon: '⚡',
            action: () => {
              onItemAction?.('optimize', targetItem);
              onClose();
            },
            visible: 1
          }
        ]
      }
    ];
  }, [targetItem, μ7_getVisibility, onAddToContext, onItemAction, onClose]);

  // μ7_ Content Context Menu Items
  const μ7_contentMenuItems = useMemo((): μ7_MenuSection[] => {
    const canPaste = μ7_getVisibility(clipboardHasContent);
    const canCutCopy = μ7_getVisibility(hasSelection);

    return [
      {
        title: 'Zwischenablage',
        items: [
          {
            id: 'cut',
            label: 'Ausschneiden',
            icon: '✂️',
            action: () => {
              onItemAction?.('cut');
              onClose();
            },
            visible: canCutCopy,
            shortcut: 'Ctrl+X'
          },
          {
            id: 'copy',
            label: 'Kopieren',
            icon: '📋',
            action: () => {
              onItemAction?.('copy');
              onClose();
            },
            visible: canCutCopy,
            shortcut: 'Ctrl+C'
          },
          {
            id: 'paste',
            label: 'Einfügen',
            icon: '📄',
            action: () => {
              onItemAction?.('paste');
              onClose();
            },
            visible: canPaste,
            shortcut: 'Ctrl+V'
          }
        ]
      },
      {
        title: 'KI-Aktionen',
        items: [
          {
            id: 'explain',
            label: 'Auswahl erklären',
            icon: '💡',
            action: () => {
              onItemAction?.('ai-explain-selection');
              onClose();
            },
            visible: canCutCopy
          },
          {
            id: 'improve',
            label: 'Text verbessern',
            icon: '✨',
            action: () => {
              onItemAction?.('ai-improve-text');
              onClose();
            },
            visible: canCutCopy
          },
          {
            id: 'generate_code',
            label: 'Code generieren',
            icon: '💻',
            action: () => {
              onItemAction?.('ai-generate-code');
              onClose();
            },
            visible: 1
          }
        ]
      },
      {
        title: 'Formatierung',
        items: [
          {
            id: 'format',
            label: 'Auto-Format',
            icon: '🔤',
            action: () => {
              onItemAction?.('auto-format');
              onClose();
            },
            visible: 1
          },
          {
            id: 'clean_data',
            label: 'Daten bereinigen',
            icon: '🧹',
            action: () => {
              onItemAction?.('clean-data');
              onClose();
            },
            visible: 1
          }
        ]
      }
    ];
  }, [clipboardHasContent, hasSelection, μ7_getVisibility, onItemAction, onClose]);

  // μ7_ Get Menu Items Based on Context Type
  const μ7_menuSections = useMemo(() => {
    switch (contextType) {
      case 'canvas': return μ7_canvasMenuItems;
      case 'window': return μ7_windowMenuItems;
      case 'content': return μ7_contentMenuItems;
      default: return [];
    }
  }, [contextType, μ7_canvasMenuItems, μ7_windowMenuItems, μ7_contentMenuItems]);

  // μ7_ Render Menu Item
  const μ7_renderMenuItem = useCallback((item: μ7_MenuItem) => {
    // Algebraic transistor: Only render if visible
    if (item.visible === 0) return null;

    return (
      <div
        key={item.id}
        className="μ7-context-menu-item"
        onClick={item.action}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '13px',
          color: '#e5e5e5',
          transition: 'all 0.15s ease',
          borderBottom: item.separator ? '1px solid rgba(255,255,255,0.1)' : 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.8)';
          e.currentTarget.style.color = 'white';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#e5e5e5';
        }}
      >
        <span style={{ fontSize: '14px', minWidth: '16px' }}>{item.icon}</span>
        <span style={{ flex: 1 }}>{item.label}</span>
        {item.shortcut && (
          <span style={{ 
            fontSize: '11px', 
            opacity: 0.7,
            fontFamily: 'monospace',
            color: '#a1a1aa'
          }}>
            {item.shortcut}
          </span>
        )}
      </div>
    );
  }, []);

  // μ7_ Early Return with Algebraic Transistor
  const μ7_shouldRender = UDFormat.transistor(visible);
  if (μ7_shouldRender === 0) return null;

  return (
    <>
      {/* Background Overlay */}
      <div
        className="μ7-context-menu-overlay"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1000,
          background: 'transparent'
        }}
      />

      {/* Context Menu */}
      <div
        className="μ7-unified-context-menu"
        style={{
          position: 'fixed',
          left: `${x}px`,
          top: `${y}px`,
          minWidth: '220px',
          maxWidth: '300px',
          backgroundColor: 'rgba(30, 30, 30, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
          zIndex: 1001,
          overflow: 'hidden',
          animation: 'μ7-context-menu-appear 0.15s ease-out'
        }}
      >
        {/* Menu Header */}
        <div style={{
          padding: '8px 12px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          fontSize: '11px',
          fontWeight: '600',
          color: '#a1a1aa',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {contextType === 'canvas' && '🖥️ Desktop'}
          {contextType === 'window' && targetItem && `📝 ${targetItem.title || 'Fenster'}`}
          {contextType === 'content' && '📄 Inhalt'}
        </div>

        {/* Menu Sections */}
        {μ7_menuSections.map((section, sectionIndex) => {
          const visibleItems = section.items.filter(item => item.visible === 1);
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="μ7-menu-section">
              {sectionIndex > 0 && (
                <div style={{
                  height: '1px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  margin: '4px 0'
                }} />
              )}
              
              {/* Section Title */}
              {μ7_menuSections.length > 1 && (
                <div style={{
                  padding: '6px 12px 2px',
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#71717a',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  {section.title}
                </div>
              )}

              {/* Section Items */}
              {visibleItems.map(μ7_renderMenuItem)}
            </div>
          );
        })}
      </div>

      {/* CSS Animation - Inline keyframes */}
      <style>{`
        @keyframes μ7-context-menu-appear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-5px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </>
  );
};