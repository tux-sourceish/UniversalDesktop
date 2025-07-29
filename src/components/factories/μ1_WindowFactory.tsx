import React from 'react';
import { UDItem, UniversalDocument } from '../../core/universalDocument';
import { UDFormat } from '../../core/UDFormat';

// Import our μX-Bagua Window Components
import { μ8_NoteWindow } from '../windows/μ8_NoteWindow';
import { μ2_TuiWindow } from '../windows/μ2_TuiWindow';
import { μ2_TableWindow } from '../windows/μ2_TableWindow';
import { μ2_FileManagerWindow } from '../windows/μ2_FileManagerWindow';

/**
 * μ1_WindowFactory - HIMMEL (☰) Classes/Templates
 * 
 * THE UNITY BRIDGE - Raimunds algebraischer Universalisierer
 * 
 * Diese Factory UNIFIZIERT:
 * - Menschliche Tool-Creation (μ2_ToolPanel)
 * - KI-basierte Item-Creation (μ2_AIPanel)  
 * - Legacy V1 Window Types
 * - Neue μX-Bagua Window Components
 * 
 * "Ein System, alle Wege, eine Wahrheit" - Raimund Welsch
 * 
 * Features:
 * - Type Mapping: 'notizzettel' → μ8_NoteWindow
 * - UDItem Integration: Erstellt vollständige UDItems mit Bagua Descriptors
 * - Origin Tracking: Mensch vs KI Erstellung wird dokumentiert
 * - Algebraische Transistor Logik für Component Selection
 * - Backward Compatibility mit V1 Types
 */

// μ1_ Window Type Registry (HIMMEL-Pattern: Template Definitions)
export interface μ1_WindowTypeConfig {
  id: string;
  displayName: string;
  component: React.ComponentType<any>;
  defaultBagua: number;
  itemType: number;
  defaultDimensions: { width: number; height: number };
  createDefaultContent: (options?: any) => any;
  supportedAgents?: ('reasoner' | 'coder' | 'refiner')[];
  icon: string;
  category: 'text' | 'data' | 'code' | 'media' | 'system';
}

export const μ1_WINDOW_REGISTRY: Record<string, μ1_WindowTypeConfig> = {
  // Text-based Windows (μ8 ERDE - Base Content)
  'notizzettel': {
    id: 'notizzettel',
    displayName: 'Notizzettel',
    component: μ8_NoteWindow,
    defaultBagua: UDFormat.BAGUA.ERDE | UDFormat.BAGUA.WIND, // Base + UI
    itemType: UniversalDocument.ItemType.VARIABLE,
    defaultDimensions: { width: 400, height: 300 },
    createDefaultContent: (options = {}) => ({
      text: options.text || "Deine Gedanken hier...",
      ...options
    }),
    supportedAgents: ['reasoner', 'refiner'],
    icon: '📝',
    category: 'text'
  },
  
  // Terminal/TUI Windows (μ2 WIND - Views/UI)
  'terminal': {
    id: 'terminal',
    displayName: 'Terminal',
    component: μ2_TuiWindow,
    defaultBagua: UDFormat.BAGUA.WIND | UDFormat.BAGUA.DONNER, // UI + Events
    itemType: UniversalDocument.ItemType.EREIGNIS,
    defaultDimensions: { width: 600, height: 400 },
    createDefaultContent: (options = {}) => ({
      text: options.text || 'echo "UniversalDesktop v2.1 ready!"',
      tui_content: options.text || 'echo "UniversalDesktop v2.1 ready!"',
      tui_width: options.tui_width || 80,
      tui_height: options.tui_height || 25,
      tui_theme: options.tui_theme || 'green',
      tui_preset: options.tui_preset || 'standard',
      tui_codepage: options.tui_codepage || 'ascii',
      ...options
    }),
    supportedAgents: ['coder', 'reasoner'],
    icon: '⚫',
    category: 'system'
  },
  
  'tui': {
    id: 'tui',
    displayName: 'TUI Interface',
    component: μ2_TuiWindow,
    defaultBagua: UDFormat.BAGUA.WIND | UDFormat.BAGUA.FEUER, // UI + Functions  
    itemType: UniversalDocument.ItemType.FUNKTION,
    defaultDimensions: { width: 800, height: 500 },
    createDefaultContent: (options = {}) => ({
      text: options.text || '┌─ UniversalDesktop TUI ─┐\n│ Welcome to the system! │\n└────────────────────────┘',
      tui_content: options.text || '┌─ UniversalDesktop TUI ─┐\n│ Welcome to the system! │\n└────────────────────────┘',
      tui_width: options.tui_width || 80,
      tui_height: options.tui_height || 25,
      tui_theme: options.tui_theme || 'green',
      tui_preset: options.tui_preset || 'standard',
      tui_codepage: options.tui_codepage || 'ascii',
      ...options
    }),
    supportedAgents: ['coder', 'refiner'],
    icon: '🖥️',
    category: 'system'
  },
  
  // Table/Data Windows (μ2 WIND - Views/UI) 
  'tabelle': {
    id: 'tabelle',
    displayName: 'Tabelle',
    component: μ2_TableWindow,
    defaultBagua: UDFormat.BAGUA.WIND | UDFormat.BAGUA.SEE, // UI + Properties
    itemType: UniversalDocument.ItemType.TABELLE,
    defaultDimensions: { width: 600, height: 400 },
    createDefaultContent: (options = {}) => ({
      headers: options.headers || ['Spalte 1', 'Spalte 2', 'Spalte 3'],
      rows: options.rows || [['Daten', 'Hier', 'Eintragen']],
      columnTypes: options.columnTypes || ['text', 'text', 'text'],
      tableType: 'structured',
      ...options
    }),
    supportedAgents: ['reasoner', 'refiner'],
    icon: '📊',
    category: 'data'
  },
  
  // Code Windows (μ1 HIMMEL - Classes/Templates)
  'code': {
    id: 'code',
    displayName: 'Code Editor',  
    component: μ8_NoteWindow, // Temporarily use NoteWindow for code
    defaultBagua: UDFormat.BAGUA.HIMMEL | UDFormat.BAGUA.FEUER, // Templates + Functions
    itemType: UniversalDocument.ItemType.KONSTRUKTOR,
    defaultDimensions: { width: 700, height: 500 },
    createDefaultContent: (options = {}) => ({
      text: options.code || options.text || '// Neuer Code\nfunction μ1_create() {\n  // Raimunds Campus-Model Magic!\n  return "UniversalDesktop v2.1";\n}',
      code: options.code || options.text || '// Neuer Code\nfunction μ1_create() {\n  // Raimunds Campus-Model Magic!\n  return "UniversalDesktop v2.1";\n}',
      language: options.language || 'typescript',
      ...options
    }),
    supportedAgents: ['coder', 'refiner'],
    icon: '💻',
    category: 'code'
  },
  
  // File Manager Windows (μ3 WASSER - Flow/Procedures)
  'filemanager': {
    id: 'filemanager',
    displayName: 'File Manager',
    component: μ2_FileManagerWindow,
    defaultBagua: UDFormat.BAGUA.WASSER | UDFormat.BAGUA.WIND, // Flow + UI
    itemType: UniversalDocument.ItemType.FLUSS,
    defaultDimensions: { width: 800, height: 600 },
    createDefaultContent: (options = {}) => ({
      initialPath: options.initialPath || '/home/user',
      mode: options.mode || 'gui',
      showToolbar: options.showToolbar !== false,
      showStatusBar: options.showStatusBar !== false,
      allowMultiSelect: options.allowMultiSelect !== false,
      ...options
    }),
    supportedAgents: ['reasoner'],
    icon: '📁',
    category: 'system'
  }
};

// μ1_ Creation Origin Types
export type μ1_CreationOrigin = 'human-tool' | 'ai-reasoner' | 'ai-coder' | 'ai-refiner' | 'ai-multi' | 'system';

export interface μ1_WindowCreationRequest {
  /** Window type key from registry */
  type: string;
  /** 3D position for placement */
  position: { x: number; y: number; z: number };
  /** Optional content overrides */
  content?: any;
  /** Creation origin for tracking */
  origin: μ1_CreationOrigin;
  /** Optional title override */
  title?: string;
  /** Optional bagua descriptor override */
  baguaDescriptor?: number;
  /** Optional dimensions override */
  dimensions?: { width: number; height: number };
  /** AI agents that contributed (for AI origins) */
  contributingAgents?: string[];
  /** Optional metadata for tracking and context */
  metadata?: any;
}

export interface μ1_RenderedWindow {
  udItem: UDItem;
  component: React.ReactElement;
  typeConfig: μ1_WindowTypeConfig;
}

/**
 * μ1_WindowFactory - The Universal Window Creator
 */
export class μ1_WindowFactory {
  
  // μ1_ Static Registry Access
  static getWindowTypes(): μ1_WindowTypeConfig[] {
    return Object.values(μ1_WINDOW_REGISTRY);
  }
  
  static getWindowType(type: string): μ1_WindowTypeConfig | null {
    return μ1_WINDOW_REGISTRY[type] || null;
  }
  
  // μ1_ Algebraic Type Detection (Raimunds Transistor Magic)
  static detectOptimalType(content: any, agents: string[] = []): string {
    // Raimund's algebraic transistor for type detection
    const hasCode = typeof content === 'object' && (content.code || (typeof content.text === 'string' && content.text.includes('function')));
    const hasTable = typeof content === 'object' && (content.headers || content.rows);
    const hasTui = typeof content === 'object' && (content.tui_content || content.tui_width);
    const isText = typeof content === 'string' || (typeof content === 'object' && content.text);
    void isText; // Acknowledge for future use
    
    // AI Agent influence on type selection
    const coderWeight = UDFormat.transistor(agents.includes('coder'));
    const refinerWeight = UDFormat.transistor(agents.includes('refiner'));
    const reasonerWeight = UDFormat.transistor(agents.includes('reasoner'));
    
    // Algebraic type selection (priority order with weights)
    if (hasCode && coderWeight) return 'code';
    if (hasTable && (reasonerWeight || refinerWeight)) return 'tabelle';
    if (hasTui && coderWeight) return 'tui';
    if (hasCode) return 'code';
    if (hasTable) return 'tabelle';
    if (hasTui) return 'terminal';
    
    // Default to note for text content
    return 'notizzettel';
  }
  
  // μ1_ Create UDItem from Request
  static createUDItem(request: μ1_WindowCreationRequest): UDItem {
    console.log('🏭 μ1_WindowFactory.createUDItem called with request:', request);
    
    const typeConfig = μ1_WindowFactory.getWindowType(request.type);
    console.log('🔍 Retrieved typeConfig for', request.type, ':', typeConfig);
    
    if (!typeConfig) {
      throw new Error(`μ1_WindowFactory: Unknown window type '${request.type}'`);
    }
    
    // Generate unique ID with Raimunds timestamp precision
    const baseTime = Date.now();
    const microTime = baseTime + (Math.floor(Math.random() * 1000));
    const id = `ud_item_${baseTime}_${Math.floor(Math.random() * 10000)}`;
    
    // Create origin information
    const origin = {
      host: "UniversalDesktop.localhost",
      path: "/workspace",
      tool: request.origin === 'human-tool' ? 'μ2_ToolPanel' : 'μ2_AIPanel',
      device: `${request.origin}-creator`
    };
    
    // Create transformation history entry
    const creationTransform = {
      id: `ud_trans_${microTime}_create`,
      timestamp: microTime,
      verb: 'erschaffen',
      agent: request.origin === 'human-tool' ? 'user:human' : `ai:${request.contributingAgents?.join('+')}`,
      description: `${typeConfig.displayName} via ${request.origin} erstellt`
    };
    
    // Merge content with defaults
    const content = {
      ...typeConfig.createDefaultContent(request.content),
      ...request.content
    };
    
    // Create complete UDItem
    const udItem: UDItem = {
      id,
      type: typeConfig.itemType,
      title: request.title || `${typeConfig.displayName} ${new Date().toLocaleTimeString()}`,
      position: request.position,
      dimensions: request.dimensions || typeConfig.defaultDimensions,
      bagua_descriptor: request.baguaDescriptor || typeConfig.defaultBagua,
      content,
      is_contextual: false,
      origin,
      transformation_history: [creationTransform],
      created_at: microTime,
      updated_at: microTime
    };
    
    return udItem;
  }
  
  // μ1_ Render Window Component
  static renderWindow(
    udItem: UDItem, 
    onUDItemChange: (updatedItem: UDItem, description: string) => void,
    onAddToContext?: (item: UDItem) => void
  ): μ1_RenderedWindow | null {
    
    // Detect window type from UDItem (reverse lookup)
    let typeConfig: μ1_WindowTypeConfig | null = null;
    
    // Try direct type mapping first
    for (const config of Object.values(μ1_WINDOW_REGISTRY)) {
      if (config.itemType === udItem.type) {
        // Additional content-based verification
        const contentMatches = μ1_WindowFactory.verifyContentMatch(udItem.content, config);
        if (contentMatches) {
          typeConfig = config;
          break;
        }
      }
    }
    
    // Fallback: Content-based detection
    if (!typeConfig) {
      const detectedType = μ1_WindowFactory.detectOptimalType(udItem.content);
      typeConfig = μ1_WINDOW_REGISTRY[detectedType];
    }
    
    if (!typeConfig) {
      console.warn(`μ1_WindowFactory: Could not determine window type for UDItem ${udItem.id}`);
      return null;
    }
    
    // Create the component
    const WindowComponent = typeConfig.component;
    const component = React.createElement(WindowComponent, {
      udItem,
      onUDItemChange,
      onAddToContext,
      readOnly: false,
      key: udItem.id
    });
    
    return {
      udItem,
      component,
      typeConfig
    };
  }
  
  // μ1_ Verify Content Match (helper for reverse type detection)
  private static verifyContentMatch(content: any, config: μ1_WindowTypeConfig): boolean {
    switch (config.id) {
      case 'tabelle':
        return content && (content.headers || content.rows || content.tableType);
      case 'terminal':
      case 'tui':
        return content && (content.tui_content || content.tui_width || content.tui_theme);
      case 'code':
        return content && (content.code || content.language);
      case 'notizzettel':
        return content && (content.text || typeof content === 'string');
      default:
        return true; // Default match
    }
  }
  
  // μ1_ Get Supported Types for AI Agents
  static getSupportedTypesForAgents(agents: string[]): μ1_WindowTypeConfig[] {
    return Object.values(μ1_WINDOW_REGISTRY).filter(config => {
      if (!config.supportedAgents) return true;
      return agents.some(agent => config.supportedAgents!.includes(agent as any));
    });
  }
  
  // μ1_ Quick Creation Methods (convenience)
  static createNote(position: { x: number; y: number; z: number }, text: string = '', origin: μ1_CreationOrigin = 'human-tool'): UDItem {
    return μ1_WindowFactory.createUDItem({
      type: 'notizzettel',
      position,
      content: { text },
      origin
    });
  }
  
  static createTable(position: { x: number; y: number; z: number }, headers: string[] = [], rows: any[][] = [], origin: μ1_CreationOrigin = 'human-tool'): UDItem {
    return μ1_WindowFactory.createUDItem({
      type: 'tabelle',
      position,
      content: { headers, rows },
      origin
    });
  }
  
  static createTUI(position: { x: number; y: number; z: number }, content: string = '', preset: string = 'standard', origin: μ1_CreationOrigin = 'human-tool'): UDItem {
    return μ1_WindowFactory.createUDItem({
      type: 'tui',
      position,
      content: { text: content, tui_preset: preset },
      origin
    });
  }
}

export default μ1_WindowFactory;