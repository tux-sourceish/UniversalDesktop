/**
 * µX Component Reusability Patterns
 * 
 * Architectural patterns for component reusability within the µX-Bagua system.
 * These patterns ensure consistent integration across all UI elements while
 * maintaining the philosophical coherence of the system.
 */

import type { /* DesktopItemData, */ UDPosition } from '../types'; // TODO: DesktopItemData unused
import type { µ7_ContextMenuProvider } from '../types/ContextMenuTypes';
import type { FileSystemItem } from '../types/FileManagerTypes';

// Base Component Pattern
export interface µX_BaseComponent {
  id: string;
  baguaType: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8; // µ1-µ8 mapping
  position?: UDPosition;
  dimensions?: { width: number; height: number };
  metadata?: {
    bagua_descriptor?: number;
    created_by?: 'human' | 'ai';
    parent_component?: string;
    children_components?: string[];
  };
}

// Hook Integration Pattern
export interface µX_HookIntegration<TState, TActions> {
  // State exposure following Campus-Model pattern
  state: TState;
  actions: TActions;
  
  // Lifecycle integration
  onMount?: () => void;
  onUnmount?: () => void;
  onUpdate?: (prevState: TState) => void;
  
  // Cross-hook communication
  subscribe?: (event: string, callback: (data: any) => void) => () => void;
  emit?: (event: string, data: any) => void;
  
  // Context integration
  contextManager?: any; // µ6_useContextManager
  workspaceManager?: any; // µ1_useWorkspace
}

// Context Menu Integration Pattern
export interface µX_ContextMenuIntegration {
  contextMenuProvider: µ7_ContextMenuProvider;
  contextActions: Array<{
    id: string;
    label: string;
    icon: string;
    handler: (context: any) => void;
    condition?: (context: any) => boolean;
    priority?: number;
  }>;
  
  // Context types this component supports
  supportedContexts: Array<'canvas' | 'window' | 'content' | 'file' | 'directory'>;
  
  // Dynamic context menu building
  buildContextMenu?: (context: any) => any[];
}

// File System Integration Pattern
export interface µX_FileSystemIntegration {
  // File operations support
  canHandleFiles?: boolean;
  supportedFileTypes?: string[];
  supportedMimeTypes?: string[];
  
  // File event handlers
  onFileOpen?: (file: FileSystemItem) => void;
  onFileSelect?: (files: FileSystemItem[]) => void;
  onFileDrop?: (files: FileSystemItem[], target: any) => void;
  
  // File system actions
  exportToFile?: (data: any) => Promise<void>;
  importFromFile?: (file: FileSystemItem) => Promise<any>;
  saveToWorkspace?: (data: any) => Promise<boolean>;
}

// Spatial Integration Pattern (Canvas-aware components)
export interface µX_SpatialIntegration {
  position: UDPosition;
  dimensions: { width: number; height: number };
  
  // Spatial behavior
  isDraggable?: boolean;
  isResizable?: boolean;
  snapToGrid?: boolean;
  respectBounds?: boolean;
  
  // Spatial events
  onPositionChange?: (position: UDPosition) => void;
  onDimensionChange?: (dimensions: { width: number; height: number }) => void;
  onDragStart?: (position: UDPosition) => void;
  onDragEnd?: (position: UDPosition) => void;
  
  // Canvas integration
  canvasManager?: any; // µ3_useCanvasNavigation
  zIndex?: number;
  layer?: 'background' | 'content' | 'overlay' | 'ui';
}

// AI Integration Pattern
export interface µX_AIIntegration {
  // AI context awareness
  canBeAddedToContext?: boolean;
  contextPriority?: 'high' | 'medium' | 'low';
  contextType?: 'input' | 'output' | 'reference' | 'tool';
  
  // AI interaction handlers
  onAddToContext?: (contextManager: any) => void;
  onRemoveFromContext?: (contextManager: any) => void;
  onAIAction?: (action: string, data: any) => void;
  
  // AI-generated content support
  acceptsAIContent?: boolean;
  onAIContentReceived?: (content: any, source: string) => void;
  
  // AI workflow integration
  aiWorkflows?: Array<{
    id: string;
    name: string;
    description: string;
    handler: (context: any) => Promise<any>;
  }>;
}

// Performance Pattern
export interface µX_PerformancePattern {
  // Virtualization support
  supportsVirtualization?: boolean;
  virtualItemHeight?: number;
  virtualThreshold?: number;
  
  // Lazy loading
  supportsLazyLoading?: boolean;
  lazyLoadThreshold?: number;
  onLazyLoad?: (range: { start: number; end: number }) => Promise<any[]>;
  
  // Memoization
  memoizedProps?: string[];
  memoizedCallbacks?: string[];
  
  // Performance monitoring
  onPerformanceMetric?: (metric: string, value: number) => void;
}

// Accessibility Pattern
export interface µX_AccessibilityPattern {
  // ARIA support
  ariaLabel?: string;
  ariaDescription?: string;
  ariaRole?: string;
  ariaLive?: 'polite' | 'assertive' | 'off';
  
  // Keyboard navigation
  keyboardNavigable?: boolean;
  keyboardShortcuts?: Array<{
    key: string;
    modifier?: 'ctrl' | 'shift' | 'alt' | 'meta';
    handler: () => void;
    description: string;
  }>;
  
  // Focus management
  autoFocus?: boolean;
  focusable?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
  
  // Screen reader support
  screenReaderText?: string;
  announceChanges?: boolean;
}

// Complete Component Pattern (combines all patterns)
// TODO: Fix dimensions type conflict between BaseComponent and SpatialIntegration
export interface µX_CompleteComponent<TState = any, TActions = any> 
  extends µX_BaseComponent,
          µX_HookIntegration<TState, TActions>,
          µX_ContextMenuIntegration,
          µX_FileSystemIntegration,
          // µX_SpatialIntegration, // Commented out due to dimensions type conflict
          µX_AIIntegration,
          µX_PerformancePattern,
          µX_AccessibilityPattern {
  
  // Component lifecycle
  lifecycle: {
    initialized: boolean;
    mounted: boolean;
    ready: boolean;
    error?: string;
  };
  
  // Integration status
  integrations: {
    contextMenu: boolean;
    fileSystem: boolean;
    spatial: boolean;
    ai: boolean;
    workspace: boolean;
  };
}

// Component Factory Pattern
export interface µX_ComponentFactory<T extends µX_BaseComponent> {
  create: (config: Partial<T>) => T;
  register: (type: string, factory: (config: any) => T) => void;
  unregister: (type: string) => void;
  
  // Batch operations
  createBatch: (configs: Array<Partial<T>>) => T[];
  
  // Validation
  validate: (component: T) => { valid: boolean; errors: string[] };
  
  // Cloning and templating
  clone: (component: T, overrides?: Partial<T>) => T;
  createFromTemplate: (templateId: string, data: any) => T;
}

// Component Registry Pattern
export interface µX_ComponentRegistry {
  // Registration
  register: (id: string, component: µX_CompleteComponent) => void;
  unregister: (id: string) => void;
  
  // Lookup
  get: (id: string) => µX_CompleteComponent | null;
  getByType: (baguaType: number) => µX_CompleteComponent[];
  getByTag: (tag: string) => µX_CompleteComponent[];
  
  // Query
  query: (predicate: (component: µX_CompleteComponent) => boolean) => µX_CompleteComponent[];
  count: () => number;
  
  // Events
  onChange: (callback: (event: { type: 'add' | 'remove' | 'update'; component: µX_CompleteComponent }) => void) => () => void;
}

// Integration Helper Functions
export class µX_IntegrationHelpers {
  // Context Menu Integration
  static integrateContextMenu<T extends µX_BaseComponent>(
    component: T,
    contextMenuProvider: µ7_ContextMenuProvider,
    actions: Array<{ id: string; label: string; icon: string; handler: () => void }>
  ): T & µX_ContextMenuIntegration {
    return {
      ...component,
      contextMenuProvider,
      contextActions: actions,
      supportedContexts: ['window', 'content'],
      buildContextMenu: (_context: any) => actions.filter(_action => 
        // TODO: Fix condition property type - !action.condition || action.condition(context)
        true // Temporary workaround
      )
    } as T & µX_ContextMenuIntegration;
  }
  
  // File System Integration
  static integrateFileSystem<T extends µX_BaseComponent>(
    component: T,
    config: {
      canHandleFiles?: boolean;
      supportedTypes?: string[];
      onFileOpen?: (file: FileSystemItem) => void;
    }
  ): T & µX_FileSystemIntegration {
    return {
      ...component,
      canHandleFiles: config.canHandleFiles ?? false,
      supportedFileTypes: config.supportedTypes || [],
      onFileOpen: config.onFileOpen
    } as T & µX_FileSystemIntegration;
  }
  
  // Spatial Integration  
  static integrateSpatial<T extends µX_BaseComponent>(
    component: T,
    config: {
      position: UDPosition;
      dimensions: { width: number; height: number };
      isDraggable?: boolean;
      isResizable?: boolean;
    }
  ): T & µX_SpatialIntegration {
    return {
      ...component,
      position: config.position,
      dimensions: config.dimensions,
      isDraggable: config.isDraggable ?? true,
      isResizable: config.isResizable ?? true,
      zIndex: component.baguaType, // Use Bagua type as default z-index
      layer: 'content'
    } as T & µX_SpatialIntegration;
  }
  
  // AI Integration
  static integrateAI<T extends µX_BaseComponent>(
    component: T,
    config: {
      canBeAddedToContext?: boolean;
      contextPriority?: 'high' | 'medium' | 'low';
      aiWorkflows?: Array<{ id: string; name: string; handler: (context: any) => Promise<any> }>;
    }
  ): T & µX_AIIntegration {
    return {
      ...component,
      canBeAddedToContext: config.canBeAddedToContext ?? true,
      contextPriority: config.contextPriority || 'medium',
      contextType: 'reference',
      aiWorkflows: config.aiWorkflows || []
    } as T & µX_AIIntegration;
  }
  
  // Complete Integration (combines all)
  static integrateComplete<T extends µX_BaseComponent>(
    component: T,
    config: {
      contextMenu?: { provider: µ7_ContextMenuProvider; actions: any[] };
      fileSystem?: { canHandle: boolean; types: string[] };
      spatial?: { position: UDPosition; dimensions: { width: number; height: number } };
      ai?: { canBeAddedToContext: boolean; workflows: any[] };
    }
  ): µX_CompleteComponent {
    let integrated: any = component;
    
    if (config.contextMenu) {
      integrated = this.integrateContextMenu(integrated, config.contextMenu.provider, config.contextMenu.actions);
    }
    
    if (config.fileSystem) {
      integrated = this.integrateFileSystem(integrated, {
        canHandleFiles: config.fileSystem.canHandle,
        supportedTypes: config.fileSystem.types
      });
    }
    
    if (config.spatial) {
      integrated = this.integrateSpatial(integrated, config.spatial);
    }
    
    if (config.ai) {
      integrated = this.integrateAI(integrated, {
        canBeAddedToContext: config.ai.canBeAddedToContext,
        aiWorkflows: config.ai.workflows
      });
    }
    
    return {
      ...integrated,
      lifecycle: {
        initialized: true,
        mounted: false,
        ready: false
      },
      integrations: {
        contextMenu: !!config.contextMenu,
        fileSystem: !!config.fileSystem,
        spatial: !!config.spatial,
        ai: !!config.ai,
        workspace: true // Always integrated with workspace
      }
    };
  }
}

// Component Validation
export class µX_ComponentValidator {
  static validateComponent(component: µX_CompleteComponent): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic validation
    if (!component.id) errors.push('Component must have an id');
    if (!component.baguaType || component.baguaType < 1 || component.baguaType > 8) {
      errors.push('Component must have a valid baguaType (1-8)');
    }
    
    // Spatial validation
    if (component.position && (
      typeof component.position.x !== 'number' ||
      typeof component.position.y !== 'number' ||
      typeof component.position.z !== 'number'
    )) {
      errors.push('Position must have valid x, y, z coordinates');
    }
    
    // Integration validation
    if (component.integrations.contextMenu && !component.contextMenuProvider) {
      errors.push('Context menu integration requires a provider');
    }
    
    if (component.integrations.fileSystem && !component.canHandleFiles) {
      errors.push('File system integration requires canHandleFiles to be true');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  static validateBaguaCoherence(components: µX_CompleteComponent[]): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];
    const baguaCounts = new Map<number, number>();
    
    // Count components by Bagua type
    components.forEach(comp => {
      const count = baguaCounts.get(comp.baguaType) || 0;
      baguaCounts.set(comp.baguaType, count + 1);
    });
    
    // Check for imbalance (philosophical coherence)
    const totalComponents = components.length;
    for (const [baguaType, count] of baguaCounts) {
      const percentage = (count / totalComponents) * 100;
      if (percentage > 40) {
        warnings.push(`Bagua type ${baguaType} represents ${percentage.toFixed(1)}% of components - consider more balance`);
      }
    }
    
    // Check for missing essential types
    if (!baguaCounts.has(1)) warnings.push('Missing µ1 (HIMMEL) components - consider adding structural templates');
    if (!baguaCounts.has(8)) warnings.push('Missing µ8 (ERDE) components - consider adding foundation systems');
    
    return {
      valid: warnings.length === 0,
      warnings
    };
  }
}

export default {
  IntegrationHelpers: µX_IntegrationHelpers,
  ComponentValidator: µX_ComponentValidator
};