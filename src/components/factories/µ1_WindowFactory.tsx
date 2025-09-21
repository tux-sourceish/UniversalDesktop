import React from 'react';
import { UDItem, UniversalDocument } from '../../core/universalDocument';
import { UDFormat } from '../../core/UDFormat';

// Import our µX-Bagua Window Components
import { µ8_NoteWindow } from '../windows/µ8_NoteWindow';
import { µ2_TuiWindow } from '../windows/µ2_TuiWindow';
import { µ2_TableWindow } from '../windows/µ2_TableWindow';
import { µ2_FileManagerWindow } from '../windows/µ2_FileManagerWindow';
import { µ2_CodeWindow } from '../windows/µ2_CodeWindow';

/**
 * µ1_WindowFactory - HIMMEL (☰) Classes/Templates
 * 
 * THE UNITY BRIDGE - Raimunds algebraischer Universalisierer
 * 
 * Diese Factory UNIFIZIERT:
 * - Menschliche Tool-Creation (µ2_ToolPanel)
 * - KI-basierte Item-Creation (µ2_AIPanel)  
 * - Legacy V1 Window Types
 * - Neue µX-Bagua Window Components
 * 
 * "Ein System, alle Wege, eine Wahrheit" - Raimund Welsch
 * 
 * Features:
 * - Type Mapping: 'notizzettel' → µ8_NoteWindow
 * - UDItem Integration: Erstellt vollständige UDItems mit Bagua Descriptors
 * - Origin Tracking: Mensch vs KI Erstellung wird dokumentiert
 * - Algebraische Transistor Logik für Component Selection
 * - Backward Compatibility mit V1 Types
 */

// µ1_ Window Type Registry (HIMMEL-Pattern: Template Definitions)
export interface µ1_WindowTypeConfig {
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

export const µ1_WINDOW_REGISTRY: Record<string, µ1_WindowTypeConfig> = {
  // Text-based Windows (µ8 ERDE - Base Content)
  'notizzettel': {
    id: 'notizzettel',
    displayName: 'Notizzettel',
    component: µ8_NoteWindow,
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
  
  // Terminal/TUI Windows (µ2 WIND - Views/UI)
  'terminal': {
    id: 'terminal',
    displayName: 'Terminal',
    component: µ2_TuiWindow,
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
    component: µ2_TuiWindow,
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
  
  // Table/Data Windows (µ2 WIND - Views/UI) 
  'tabelle': {
    id: 'tabelle',
    displayName: 'Tabelle',
    component: µ2_TableWindow,
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
  
  // Code Windows (µ2 WIND - Views/UI with µ1 HIMMEL + µ6 FEUER)
  'code': {
    id: 'code',
    displayName: 'Code Editor',  
    component: µ2_CodeWindow, // NEW: Dedicated Code Editor with syntax highlighting
    defaultBagua: UDFormat.BAGUA.HIMMEL | UDFormat.BAGUA.FEUER, // Templates + Functions
    itemType: UniversalDocument.ItemType.KONSTRUKTOR,
    defaultDimensions: { width: 750, height: 550 }, // Slightly larger for line numbers
    createDefaultContent: (options = {}) => ({
      text: options.code || options.text || '// Neuer Code\nfunction µ1_create() {\n  // Raimunds Campus-Model Magic!\n  return "UniversalDesktop v2.1";\n}',
      code: options.code || options.text || '// Neuer Code\nfunction µ1_create() {\n  // Raimunds Campus-Model Magic!\n  return "UniversalDesktop v2.1";\n}',
      language: options.language || 'typescript',
      autoFormat: options.autoFormat !== false,
      ...options
    }),
    supportedAgents: ['coder', 'refiner'],
    icon: '💻',
    category: 'code'
  },
  
  // File Manager Windows (µ3 WASSER - Flow/Procedures)
  'filemanager': {
    id: 'filemanager',
    displayName: 'File Manager',
    component: µ2_FileManagerWindow,
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

// µ1_ Creation Origin Types
export type µ1_CreationOrigin = 'human-tool' | 'ai-reasoner' | 'ai-coder' | 'ai-refiner' | 'ai-multi' | 'system';

export interface µ1_WindowCreationRequest {
  /** Window type key from registry */
  type: string;
  /** 3D position for placement */
  position: { x: number; y: number; z: number };
  /** Optional content overrides */
  content?: any;
  /** Creation origin for tracking */
  origin: µ1_CreationOrigin;
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

export interface µ1_RenderedWindow {
  udItem: UDItem;
  component: React.ReactElement;
  typeConfig: µ1_WindowTypeConfig;
}

/**
 * µ1_WindowFactory - The Universal Window Creator
 */
export class µ1_WindowFactory {
  
  // µ1_ Static Registry Access
  static getWindowTypes(): µ1_WindowTypeConfig[] {
    return Object.values(µ1_WINDOW_REGISTRY);
  }
  
  static getWindowType(type: string): µ1_WindowTypeConfig | null {
    return µ1_WINDOW_REGISTRY[type] || null;
  }
  
  // µ1_ Algebraic Type Detection (Raimunds Transistor Magic)
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
  
  // µ1_ Create UDItem from Request (with optional smart positioning)
  static createUDItem(
    request: µ1_WindowCreationRequest, 
    positionCalculator?: (requestedPosition: { x: number; y: number; z: number }) => { x: number; y: number; z: number }
  ): UDItem {
    console.log('🏭 µ1_WindowFactory.createUDItem called with request:', request);
    
    const typeConfig = µ1_WindowFactory.getWindowType(request.type);
    console.log('🔍 Retrieved typeConfig for', request.type, ':', typeConfig);
    
    if (!typeConfig) {
      throw new Error(`µ1_WindowFactory: Unknown window type '${request.type}'`);
    }
    
    // Generate unique ID with Raimunds timestamp precision
    const baseTime = Date.now();
    const microTime = baseTime + (Math.floor(Math.random() * 1000));
    const id = `ud_item_${baseTime}_${Math.floor(Math.random() * 10000)}`;
    
    // Create origin information
    const origin = {
      host: "UniversalDesktop.localhost",
      path: "/workspace",
      tool: request.origin === 'human-tool' ? 'µ2_ToolPanel' : 'µ2_AIPanel',
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
    // FIXED: Use position calculator for smart positioning if provided
    const finalPosition = positionCalculator ? positionCalculator(request.position) : request.position;
    
    const udItem: UDItem = {
      id,
      type: typeConfig.itemType,
      title: request.title || `${typeConfig.displayName} ${new Date().toLocaleTimeString()}`,
      position: finalPosition,
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
  
  // µ1_ Render Window Component
  static renderWindow(
    udItem: UDItem, 
    onUDItemChange: (updatedItem: UDItem, description: string) => void,
    onAddToContext?: (item: UDItem) => void
  ): µ1_RenderedWindow | null {
    
    // Detect window type from UDItem (reverse lookup)
    let typeConfig: µ1_WindowTypeConfig | null = null;
    
    // Try direct type mapping first
    for (const config of Object.values(µ1_WINDOW_REGISTRY)) {
      if (config.itemType === udItem.type) {
        // Additional content-based verification
        const contentMatches = µ1_WindowFactory.verifyContentMatch(udItem.content, config);
        if (contentMatches) {
          typeConfig = config;
          break;
        }
      }
    }
    
    // Fallback: Content-based detection
    if (!typeConfig) {
      const detectedType = µ1_WindowFactory.detectOptimalType(udItem.content);
      typeConfig = µ1_WINDOW_REGISTRY[detectedType];
    }
    
    if (!typeConfig) {
      console.warn(`µ1_WindowFactory: Could not determine window type for UDItem ${udItem.id}`);
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
  
  // µ1_ Verify Content Match (helper for reverse type detection)
  private static verifyContentMatch(content: any, config: µ1_WindowTypeConfig): boolean {
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
  
  // µ1_ Get Supported Types for AI Agents
  static getSupportedTypesForAgents(agents: string[]): µ1_WindowTypeConfig[] {
    return Object.values(µ1_WINDOW_REGISTRY).filter(config => {
      if (!config.supportedAgents) return true;
      return agents.some(agent => config.supportedAgents!.includes(agent as any));
    });
  }
  
  // µ1_ Quick Creation Methods (convenience)
  static createNote(position: { x: number; y: number; z: number }, text: string = '', origin: µ1_CreationOrigin = 'human-tool'): UDItem {
    return µ1_WindowFactory.createUDItem({
      type: 'notizzettel',
      position,
      content: { text },
      origin
    });
  }
  
  static createTable(position: { x: number; y: number; z: number }, headers: string[] = [], rows: any[][] = [], origin: µ1_CreationOrigin = 'human-tool'): UDItem {
    return µ1_WindowFactory.createUDItem({
      type: 'tabelle',
      position,
      content: { headers, rows },
      origin
    });
  }
  
  static createTUI(position: { x: number; y: number; z: number }, content: string = '', preset: string = 'standard', origin: µ1_CreationOrigin = 'human-tool'): UDItem {
    return µ1_WindowFactory.createUDItem({
      type: 'tui',
      position,
      content: { text: content, tui_preset: preset },
      origin
    });
  }
}

export default µ1_WindowFactory;