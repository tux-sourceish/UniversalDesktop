import { ContextMenuItem } from './ImHexContextMenu';

interface DesktopItemData {
  id: string;
  type: 'notizzettel' | 'tabelle' | 'code' | 'browser' | 'terminal' | 'tui' | 'media' | 'chart' | 'calendar';
  title: string;
  content: any;
  position: { x: number; y: number; z: number };
  created_at: string;
  updated_at: string;
  user_id: string;
  metadata?: Record<string, any>;
  width?: number;
  height?: number;
  is_contextual?: boolean;
}

interface KIWorkflowCallbacks {
  onReasonerAction?: (item: DesktopItemData, action: string) => void;
  onCoderAction?: (item: DesktopItemData, action: string) => void;
  onRefinerAction?: (item: DesktopItemData, action: string) => void;
  onAddToContext?: (item: DesktopItemData) => void;
  onRemoveFromContext?: (item: DesktopItemData) => void;
  onExportItem?: (item: DesktopItemData, format: string) => void;
  onTransformItem?: (item: DesktopItemData, transformation: string) => void;
  onVisualizeItem?: (item: DesktopItemData, visualizationType: string) => void;
}

export class ContextMenuActions {
  private callbacks: KIWorkflowCallbacks;

  constructor(callbacks: KIWorkflowCallbacks) {
    this.callbacks = callbacks;
  }

  // Generate context menu items based on item type and context
  getContextMenuItems(item: DesktopItemData): ContextMenuItem[] {
    const baseItems: ContextMenuItem[] = [
      {
        id: 'transform',
        label: 'Transform',
        icon: '🔄',
        submenu: this.getTransformActions(item)
      },
      {
        id: 'export',
        label: 'Export',
        icon: '📤',
        submenu: this.getExportActions(item)
      },
      {
        id: 'execute',
        label: 'Execute',
        icon: '⚡',
        submenu: this.getExecuteActions(item)
      },
      {
        id: 'visualize',
        label: 'Visualize',
        icon: '📊',
        submenu: this.getVisualizeActions(item)
      },
      {
        id: 'separator1',
        label: '',
        icon: '',
        separator: true
      },
      {
        id: 'ai-actions',
        label: 'KI-Actions',
        icon: '🤖',
        submenu: this.getAIActions(item)
      },
      {
        id: 'context-actions',
        label: 'Context',
        icon: '📌',
        submenu: this.getContextActions(item)
      }
    ];

    // Add item-specific actions
    const specificActions = this.getItemSpecificActions(item);
    if (specificActions.length > 0) {
      baseItems.push(
        {
          id: 'separator2',
          label: '',
          icon: '',
          separator: true
        },
        ...specificActions
      );
    }

    return baseItems;
  }

  private getTransformActions(item: DesktopItemData): ContextMenuItem[] {
    const baseTransforms: ContextMenuItem[] = [
      {
        id: 'ai-analyze',
        label: 'Mit KI analysieren',
        icon: '🤖',
        action: () => this.callbacks.onReasonerAction?.(item, 'analyze')
      },
      {
        id: 'ai-optimize',
        label: 'KI-Optimierung',
        icon: '✨',
        action: () => this.callbacks.onRefinerAction?.(item, 'optimize')
      },
      {
        id: 'format-convert',
        label: 'Format konvertieren',
        icon: '🔧',
        action: () => this.callbacks.onTransformItem?.(item, 'format-convert')
      }
    ];

    // Add type-specific transforms
    switch (item.type) {
      case 'code':
        baseTransforms.push(
          {
            id: 'code-format',
            label: 'Code formatieren',
            icon: '💻',
            action: () => this.callbacks.onCoderAction?.(item, 'format')
          },
          {
            id: 'code-refactor',
            label: 'Code refactoring',
            icon: '🔄',
            action: () => this.callbacks.onCoderAction?.(item, 'refactor')
          }
        );
        break;
      case 'tui':
        baseTransforms.push(
          {
            id: 'tui-theme',
            label: 'Theme wechseln',
            icon: '🎨',
            action: () => this.callbacks.onTransformItem?.(item, 'theme-change')
          },
          {
            id: 'ascii-unicode',
            label: 'ASCII → Unicode',
            icon: '🔤',
            action: () => this.callbacks.onTransformItem?.(item, 'ascii-unicode')
          }
        );
        break;
      case 'tabelle':
        baseTransforms.push(
          {
            id: 'data-clean',
            label: 'Daten bereinigen',
            icon: '🧹',
            action: () => this.callbacks.onReasonerAction?.(item, 'clean-data')
          },
          {
            id: 'data-normalize',
            label: 'Daten normalisieren',
            icon: '📏',
            action: () => this.callbacks.onTransformItem?.(item, 'normalize')
          }
        );
        break;
    }

    return baseTransforms;
  }

  private getExportActions(item: DesktopItemData): ContextMenuItem[] {
    const baseExports: ContextMenuItem[] = [
      {
        id: 'export-json',
        label: 'Als JSON',
        icon: '💾',
        action: () => this.callbacks.onExportItem?.(item, 'json')
      },
      {
        id: 'export-pdf',
        label: 'Als PDF',
        icon: '📄',
        action: () => this.callbacks.onExportItem?.(item, 'pdf')
      },
      {
        id: 'export-clipboard',
        label: 'In Clipboard',
        icon: '📋',
        action: () => this.callbacks.onExportItem?.(item, 'clipboard')
      }
    ];

    // Add type-specific exports
    switch (item.type) {
      case 'code':
        baseExports.push(
          {
            id: 'export-gist',
            label: 'Als GitHub Gist',
            icon: '🐙',
            action: () => this.callbacks.onExportItem?.(item, 'gist')
          }
        );
        break;
      case 'tabelle':
        baseExports.push(
          {
            id: 'export-csv',
            label: 'Als CSV',
            icon: '📊',
            action: () => this.callbacks.onExportItem?.(item, 'csv')
          },
          {
            id: 'export-excel',
            label: 'Als Excel',
            icon: '📈',
            action: () => this.callbacks.onExportItem?.(item, 'excel')
          }
        );
        break;
      case 'tui':
        baseExports.push(
          {
            id: 'export-ansi',
            label: 'Als ANSI',
            icon: '🖥️',
            action: () => this.callbacks.onExportItem?.(item, 'ansi')
          }
        );
        break;
    }

    return baseExports;
  }

  private getExecuteActions(item: DesktopItemData): ContextMenuItem[] {
    return [
      {
        id: 'execute-reasoner',
        label: '→ Reasoner',
        icon: '🧠',
        action: () => this.callbacks.onReasonerAction?.(item, 'process')
      },
      {
        id: 'execute-coder',
        label: '→ Coder',
        icon: '💻',
        action: () => this.callbacks.onCoderAction?.(item, 'process')
      },
      {
        id: 'execute-refiner',
        label: '→ Refiner',
        icon: '✨',
        action: () => this.callbacks.onRefinerAction?.(item, 'process')
      },
      {
        id: 'separator',
        label: '',
        icon: '',
        separator: true
      },
      {
        id: 'execute-chain',
        label: '→ Full Chain',
        icon: '⚡',
        action: () => {
          // Execute full workflow chain
          this.callbacks.onReasonerAction?.(item, 'chain-start');
        }
      }
    ];
  }

  private getVisualizeActions(item: DesktopItemData): ContextMenuItem[] {
    const baseVisualizations: ContextMenuItem[] = [
      {
        id: 'visualize-minimap',
        label: 'In Minimap anzeigen',
        icon: '🗺️',
        action: () => this.callbacks.onVisualizeItem?.(item, 'minimap-focus')
      },
      {
        id: 'visualize-theme',
        label: 'Theme anpassen',
        icon: '🎨',
        action: () => this.callbacks.onVisualizeItem?.(item, 'theme-customize')
      }
    ];

    // Add type-specific visualizations
    switch (item.type) {
      case 'tabelle':
        baseVisualizations.push(
          {
            id: 'visualize-chart',
            label: 'Chart erstellen',
            icon: '📈',
            action: () => this.callbacks.onVisualizeItem?.(item, 'chart')
          },
          {
            id: 'visualize-graph',
            label: 'Graph erstellen',
            icon: '📊',
            action: () => this.callbacks.onVisualizeItem?.(item, 'graph')
          }
        );
        break;
      case 'code':
        baseVisualizations.push(
          {
            id: 'visualize-flowchart',
            label: 'Flowchart erstellen',
            icon: '📋',
            action: () => this.callbacks.onVisualizeItem?.(item, 'flowchart')
          },
          {
            id: 'visualize-dependency',
            label: 'Dependencies anzeigen',
            icon: '🔗',
            action: () => this.callbacks.onVisualizeItem?.(item, 'dependencies')
          }
        );
        break;
    }

    return baseVisualizations;
  }

  private getAIActions(item: DesktopItemData): ContextMenuItem[] {
    return [
      {
        id: 'ai-summary',
        label: 'KI-Zusammenfassung',
        icon: '📝',
        action: () => this.callbacks.onReasonerAction?.(item, 'summarize')
      },
      {
        id: 'ai-questions',
        label: 'KI-Fragen generieren',
        icon: '❓',
        action: () => this.callbacks.onReasonerAction?.(item, 'generate-questions')
      },
      {
        id: 'ai-suggestions',
        label: 'KI-Verbesserungsvorschläge',
        icon: '💡',
        action: () => this.callbacks.onRefinerAction?.(item, 'suggestions')
      },
      {
        id: 'ai-similar',
        label: 'Ähnliche Items finden',
        icon: '🔍',
        action: () => this.callbacks.onReasonerAction?.(item, 'find-similar')
      }
    ];
  }

  private getContextActions(item: DesktopItemData): ContextMenuItem[] {
    const isInContext = item.is_contextual || false;
    
    return [
      {
        id: 'context-toggle',
        label: isInContext ? 'Aus Kontext entfernen' : 'Zu Kontext hinzufügen',
        icon: isInContext ? '📍' : '📌',
        action: () => {
          if (isInContext) {
            this.callbacks.onRemoveFromContext?.(item);
          } else {
            this.callbacks.onAddToContext?.(item);
          }
        }
      },
      {
        id: 'context-priority',
        label: 'Kontext-Priorität',
        icon: '⭐',
        submenu: [
          {
            id: 'priority-high',
            label: 'Hoch',
            icon: '🔴',
            action: () => this.callbacks.onAddToContext?.(item)
          },
          {
            id: 'priority-medium',
            label: 'Mittel',
            icon: '🟡',
            action: () => this.callbacks.onAddToContext?.(item)
          },
          {
            id: 'priority-low',
            label: 'Niedrig',
            icon: '🟢',
            action: () => this.callbacks.onAddToContext?.(item)
          }
        ]
      },
      {
        id: 'context-share',
        label: 'Kontext teilen',
        icon: '🔗',
        action: () => this.callbacks.onExportItem?.(item, 'context-share')
      }
    ];
  }

  private getItemSpecificActions(item: DesktopItemData): ContextMenuItem[] {
    switch (item.type) {
      case 'tui':
        return [
          {
            id: 'tui-copy',
            label: 'Copy to Clipboard',
            icon: '📋',
            action: () => this.callbacks.onExportItem?.(item, 'clipboard')
          },
          {
            id: 'tui-terminal-analyze',
            label: 'Terminal-Analyse',
            icon: '🔍',
            action: () => this.callbacks.onReasonerAction?.(item, 'terminal-analyze')
          }
        ];
      case 'code':
        return [
          {
            id: 'code-run',
            label: 'Code ausführen',
            icon: '▶️',
            action: () => this.callbacks.onCoderAction?.(item, 'run')
          },
          {
            id: 'code-debug',
            label: 'Debug-Modus',
            icon: '🐛',
            action: () => this.callbacks.onCoderAction?.(item, 'debug')
          }
        ];
      case 'tabelle':
        return [
          {
            id: 'table-sort',
            label: 'Sortieren',
            icon: '🔢',
            action: () => this.callbacks.onTransformItem?.(item, 'sort')
          },
          {
            id: 'table-filter',
            label: 'Filtern',
            icon: '🔍',
            action: () => this.callbacks.onTransformItem?.(item, 'filter')
          }
        ];
      default:
        return [];
    }
  }
}

export default ContextMenuActions;