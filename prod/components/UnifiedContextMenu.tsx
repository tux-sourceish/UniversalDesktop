import React, { useState, useEffect, useRef } from 'react';
import './UnifiedContextMenu.css';

interface Position {
  x: number;
  y: number;
  z: number;
}

interface DesktopItemData {
  id: string;
  type: 'notizzettel' | 'tabelle' | 'code' | 'browser' | 'terminal' | 'tui' | 'media' | 'chart' | 'calendar';
  title: string;
  position: Position;
  content: any;
  created_at: string;
  updated_at: string;
  user_id: string;
  metadata?: Record<string, any>;
  width?: number;
  height?: number;
  is_contextual?: boolean;
}

interface UnifiedContextMenuItem {
  id: string;
  label: string;
  icon: string;
  action?: () => void;
  submenu?: UnifiedContextMenuItem[];
  category?: 'clipboard' | 'ai' | 'transform' | 'export' | 'visualize' | 'context';
  priority?: 'high' | 'medium' | 'low';
  separator?: boolean;
  shortcut?: string;
  disabled?: boolean;
}

interface UnifiedContextMenuProps {
  visible: boolean;
  position: Position;
  targetItem?: DesktopItemData;
  contextType: 'canvas' | 'window' | 'content';
  onClose: () => void;
  onAction: (actionId: string, item?: DesktopItemData) => void;
  onClipboardAction: (action: 'cut' | 'copy' | 'paste', item?: DesktopItemData) => void;
  onAIAction: (action: string, item?: DesktopItemData) => void;
  onContextToggle: (item: DesktopItemData) => void;
  canPaste: boolean;
  hasSelection: boolean;
}

const UnifiedContextMenu: React.FC<UnifiedContextMenuProps> = ({
  visible,
  position,
  targetItem,
  contextType,
  onClose,
  onAction,
  onClipboardAction,
  onAIAction,
  onContextToggle,
  canPaste,
  hasSelection
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const [submenuPosition, setSubmenuPosition] = useState<Position>({ x: 0, y: 0, z: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      const handleClickOutside = (event: MouseEvent) => {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          if (submenuRef.current && !submenuRef.current.contains(event.target as Node)) {
            onClose();
          }
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [visible, onClose]);

  const getClipboardActions = (): UnifiedContextMenuItem[] => {
    const actions: UnifiedContextMenuItem[] = [];

    if (contextType === 'content' || (contextType === 'window' && targetItem)) {
      if (hasSelection) {
        actions.push({
          id: 'cut',
          label: 'Ausschneiden',
          icon: '✂️',
          shortcut: 'Strg+X',
          category: 'clipboard',
          priority: 'high',
          action: () => onClipboardAction('cut', targetItem)
        });
      }

      actions.push({
        id: 'copy',
        label: 'Kopieren',
        icon: '📋',
        shortcut: 'Strg+C',
        category: 'clipboard',
        priority: 'high',
        action: () => onClipboardAction('copy', targetItem),
        disabled: !hasSelection && contextType === 'content'
      });
    }

    // Always show paste action but with status indicator
    actions.push({
      id: 'paste',
      label: canPaste ? 'Einfügen' : 'Einfügen (Zwischenablage leer)',
      icon: canPaste ? '📄' : '📋',
      shortcut: 'Strg+V',
      category: 'clipboard',
      priority: 'high',
      action: () => onClipboardAction('paste', targetItem),
      disabled: !canPaste
    });

    return actions;
  };

  const getAIWorkflowActions = (): UnifiedContextMenuItem[] => {
    if (!targetItem) return [];

    return [
      {
        id: 'ai-workflows',
        label: 'KI-Workflows',
        icon: '🤖',
        category: 'ai',
        priority: 'high',
        submenu: [
          {
            id: 'reasoner',
            label: 'Reasoner',
            icon: '🧠',
            category: 'ai',
            action: () => onAIAction('reasoner', targetItem)
          },
          {
            id: 'coder',
            label: 'Coder',
            icon: '💻',
            category: 'ai',
            action: () => onAIAction('coder', targetItem)
          },
          {
            id: 'refiner',
            label: 'Refiner',
            icon: '✨',
            category: 'ai',
            action: () => onAIAction('refiner', targetItem)
          },
          { id: 'separator-1', label: '', icon: '', separator: true },
          {
            id: 'full-chain',
            label: 'Full Chain',
            icon: '🔄',
            category: 'ai',
            action: () => onAIAction('full-chain', targetItem)
          }
        ]
      }
    ];
  };

  const getTypeSpecificActions = (): UnifiedContextMenuItem[] => {
    if (!targetItem) return [];

    const baseActions: UnifiedContextMenuItem[] = [
      {
        id: 'transform',
        label: 'Transform',
        icon: '🔄',
        submenu: getTransformActions()
      },
      {
        id: 'export',
        label: 'Export',
        icon: '📤',
        submenu: getExportActions()
      },
      {
        id: 'visualize',
        label: 'Visualize',
        icon: '📊',
        submenu: getVisualizeActions()
      }
    ];

    return baseActions;
  };

  const getTransformActions = (): UnifiedContextMenuItem[] => {
    if (!targetItem) return [];

    const commonActions = [
      {
        id: 'format',
        label: 'Format',
        icon: '🔤',
        action: () => onAction('format', targetItem)
      },
      {
        id: 'clean',
        label: 'Clean Data',
        icon: '🧹',
        action: () => onAction('clean', targetItem)
      }
    ];

    // Type-specific actions
    switch (targetItem.type) {
      case 'code':
        return [
          ...commonActions,
          {
            id: 'refactor',
            label: 'Refactor',
            icon: '🔨',
            action: () => onAction('refactor', targetItem)
          },
          {
            id: 'minify',
            label: 'Minify',
            icon: '📦',
            action: () => onAction('minify', targetItem)
          }
        ];
      case 'tui':
        return [
          ...commonActions,
          {
            id: 'ascii-convert',
            label: 'ASCII → Unicode',
            icon: '🔤',
            action: () => onAction('ascii-convert', targetItem)
          },
          {
            id: 'theme-switch',
            label: 'Switch Theme',
            icon: '🎨',
            action: () => onAction('theme-switch', targetItem)
          }
        ];
      case 'tabelle':
        return [
          ...commonActions,
          {
            id: 'sort',
            label: 'Sort Data',
            icon: '📶',
            action: () => onAction('sort', targetItem)
          },
          {
            id: 'filter',
            label: 'Filter Data',
            icon: '🔍',
            action: () => onAction('filter', targetItem)
          }
        ];
      default:
        return commonActions;
    }
  };

  const getExportActions = (): UnifiedContextMenuItem[] => {
    if (!targetItem) return [];

    const commonExports = [
      {
        id: 'export-clipboard',
        label: 'To Clipboard',
        icon: '📋',
        action: () => onAction('export-clipboard', targetItem)
      },
      {
        id: 'export-json',
        label: 'As JSON',
        icon: '📄',
        action: () => onAction('export-json', targetItem)
      },
      {
        id: 'export-pdf',
        label: 'As PDF',
        icon: '📕',
        action: () => onAction('export-pdf', targetItem)
      }
    ];

    // Type-specific exports
    switch (targetItem.type) {
      case 'tabelle':
        return [
          ...commonExports,
          {
            id: 'export-csv',
            label: 'As CSV',
            icon: '📊',
            action: () => onAction('export-csv', targetItem)
          },
          {
            id: 'export-excel',
            label: 'As Excel',
            icon: '📗',
            action: () => onAction('export-excel', targetItem)
          }
        ];
      case 'code':
        return [
          ...commonExports,
          {
            id: 'export-gist',
            label: 'To GitHub Gist',
            icon: '🐙',
            action: () => onAction('export-gist', targetItem)
          }
        ];
      default:
        return commonExports;
    }
  };

  const getVisualizeActions = (): UnifiedContextMenuItem[] => {
    if (!targetItem) return [];

    const commonVisualizations = [
      {
        id: 'view-structure',
        label: 'View Structure',
        icon: '🏗️',
        action: () => onAction('view-structure', targetItem)
      }
    ];

    switch (targetItem.type) {
      case 'tabelle':
        return [
          ...commonVisualizations,
          {
            id: 'create-chart',
            label: 'Create Chart',
            icon: '📈',
            action: () => onAction('create-chart', targetItem)
          },
          {
            id: 'create-graph',
            label: 'Create Graph',
            icon: '📊',
            action: () => onAction('create-graph', targetItem)
          }
        ];
      case 'code':
        return [
          ...commonVisualizations,
          {
            id: 'create-flowchart',
            label: 'Create Flowchart',
            icon: '📋',
            action: () => onAction('create-flowchart', targetItem)
          },
          {
            id: 'dependency-tree',
            label: 'Dependency Tree',
            icon: '🌳',
            action: () => onAction('dependency-tree', targetItem)
          }
        ];
      default:
        return commonVisualizations;
    }
  };

  const getContextActions = (): UnifiedContextMenuItem[] => {
    if (!targetItem) return [];

    const isInContext = targetItem.is_contextual || false;

    return [
      {
        id: 'context-toggle',
        label: isInContext ? 'Aus Kontext entfernen' : 'Zu Kontext hinzufügen',
        icon: isInContext ? '📍' : '📌',
        action: () => onContextToggle(targetItem)
      },
      {
        id: 'context-priority',
        label: 'Context Priority',
        icon: '⭐',
        submenu: [
          {
            id: 'priority-high',
            label: 'High Priority',
            icon: '🔴',
            action: () => onAction('priority-high', targetItem)
          },
          {
            id: 'priority-medium',
            label: 'Medium Priority',
            icon: '🟡',
            action: () => onAction('priority-medium', targetItem)
          },
          {
            id: 'priority-low',
            label: 'Low Priority',
            icon: '🟢',
            action: () => onAction('priority-low', targetItem)
          }
        ]
      }
    ];
  };

  const getBasicActions = (): UnifiedContextMenuItem[] => {
    const actions: UnifiedContextMenuItem[] = [];

    if (contextType === 'canvas') {
      actions.push({
        id: 'new-note',
        label: 'Neue Notiz',
        icon: '📝',
        action: () => onAction('new-note')
      });
      actions.push({
        id: 'new-table',
        label: 'Neue Tabelle',
        icon: '📊',
        action: () => onAction('new-table')
      });
      actions.push({
        id: 'ai-help',
        label: 'KI-Hilfe',
        icon: '🤖',
        action: () => onAction('ai-help')
      });
    } else if (targetItem) {
      actions.push({
        id: 'rename',
        label: 'Umbenennen',
        icon: '✏️',
        action: () => onAction('rename', targetItem)
      });
      actions.push({
        id: 'delete',
        label: 'Löschen',
        icon: '🗑️',
        action: () => onAction('delete', targetItem)
      });
    }

    return actions;
  };

  const buildMenuItems = (): UnifiedContextMenuItem[] => {
    const items: UnifiedContextMenuItem[] = [];

    // 1. Clipboard actions (always first)
    const clipboardActions = getClipboardActions();
    if (clipboardActions.length > 0) {
      items.push(...clipboardActions);
      items.push({ id: 'separator-clipboard', label: '', icon: '', separator: true });
    }

    // 2. AI Workflow actions
    const aiActions = getAIWorkflowActions();
    if (aiActions.length > 0) {
      items.push(...aiActions);
      items.push({ id: 'separator-ai', label: '', icon: '', separator: true });
    }

    // 3. Type-specific actions
    const typeActions = getTypeSpecificActions();
    if (typeActions.length > 0) {
      items.push(...typeActions);
      items.push({ id: 'separator-type', label: '', icon: '', separator: true });
    }

    // 4. Context actions
    const contextActions = getContextActions();
    if (contextActions.length > 0) {
      items.push(...contextActions);
      items.push({ id: 'separator-context', label: '', icon: '', separator: true });
    }

    // 5. Basic actions
    const basicActions = getBasicActions();
    items.push(...basicActions);

    return items;
  };

  const handleItemClick = (item: UnifiedContextMenuItem) => {
    if (item.disabled) return;

    if (item.submenu) {
      // Toggle submenu
      setActiveSubmenu(activeSubmenu === item.id ? null : item.id);
    } else if (item.action) {
      item.action();
      onClose();
    }
  };

  const handleMouseEnter = (item: UnifiedContextMenuItem, event: React.MouseEvent) => {
    if (item.submenu) {
      setActiveSubmenu(item.id);
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      setSubmenuPosition({
        x: rect.right + 5,
        y: rect.top,
        z: 0
      });
    }
  };

  const handleMouseLeave = () => {
    // Keep submenu open for better UX
  };

  const renderMenuItem = (item: UnifiedContextMenuItem) => {
    if (item.separator) {
      return <div key={item.id} className="context-menu-separator" />;
    }

    const isActive = activeSubmenu === item.id;
    const hasSubmenu = item.submenu && item.submenu.length > 0;

    return (
      <div
        key={item.id}
        className={`context-menu-item ${isActive ? 'active' : ''} ${item.disabled ? 'disabled' : ''}`}
        data-category={item.category}
        data-priority={item.priority}
        onClick={() => handleItemClick(item)}
        onMouseEnter={(e) => handleMouseEnter(item, e)}
        onMouseLeave={handleMouseLeave}
      >
        <span className="item-icon">{item.icon}</span>
        <span className="item-label">{item.label}</span>
        {item.shortcut && <span className="item-shortcut">{item.shortcut}</span>}
        {hasSubmenu && <span className="item-arrow">▶</span>}
      </div>
    );
  };

  const renderSubmenu = (items: UnifiedContextMenuItem[]) => {
    return (
      <div
        ref={submenuRef}
        className="context-submenu"
        style={{
          left: submenuPosition.x,
          top: submenuPosition.y
        }}
      >
        {items.map(renderMenuItem)}
      </div>
    );
  };

  if (!visible) return null;

  const menuItems = buildMenuItems();
  const activeSubmenuItems = menuItems.find(item => item.id === activeSubmenu)?.submenu;

  return (
    <>
      <div
        ref={menuRef}
        className="unified-context-menu"
        style={{
          left: position.x,
          top: position.y
        }}
      >
        <div className="context-menu-header">
          <span className="menu-title">
            {contextType === 'canvas' ? '🖥️ Desktop' : 
             targetItem ? `${getTypeIcon(targetItem.type)} ${targetItem.title}` : 'Menu'}
          </span>
        </div>
        <div className="context-menu-content">
          {menuItems.map(renderMenuItem)}
        </div>
      </div>

      {activeSubmenuItems && (
        <div className="context-submenu-overlay">
          {renderSubmenu(activeSubmenuItems)}
        </div>
      )}
    </>
  );
};

const getTypeIcon = (type: string): string => {
  switch (type) {
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

export default UnifiedContextMenu;