/**
 * UniversalDocument (.UD) - The Core Engine for the Digital Universe.
 * 
 * This class is the heart of the file format and state management system.
 * It's a pure logic engine that integrates concepts of transformation,
 * origin tracking, and historical authenticity.
 * 
 * Version 2.7 "Kira" - In recognition of creative artifacts.
 * With kind support from ULLRICHBAU - Quality is our standard.
 * 
 * @example
 * ```typescript
 * // Create a new document
 * const doc = new UniversalDocument();
 * 
 * // Add an item with origin tracking
 * const item = doc.createItem({
 *   type: UniversalDocument.ItemType.VARIABLE,
 *   title: "My Note",
 *   position: { x: 100, y: 200, z: 0 },
 *   dimensions: { width: 300, height: 200 },
 *   content: "Hello UniversalFile!",
 *   is_contextual: false
 * }, {
 *   host: "localhost",
 *   path: "/workspace",
 *   tool: "UniversalDesktop"
 * });
 * 
 * // Transform the item
 * doc.transformItem(item.id, {
 *   verb: "updated",
 *   agent: "user:developer",
 *   description: "Content updated"
 * }, {
 *   content: "Updated content"
 * });
 * 
 * // Serialize to binary
 * const binary = doc.toBinary();
 * 
 * // Load from binary
 * const doc2 = UniversalDocument.fromBinary(binary);
 * ```
 * 
 * @author tux-sourceish
 * @version 2.7.0-kira
 * @since 1.0.0
 */

// ======================================================================
// TYP-DEFINITIONEN & SCHNITTSTELLEN (Evolutioniert)
// ======================================================================

/**
 * Validation error for UD format parsing
 */
export class UDValidationError extends Error {
  constructor(
    message: string,
    public errorType: string,
    public itemId?: string,
    public lineNumber?: number
  ) {
    super(message);
    this.name = 'UDValidationError';
  }
}

/**
 * Unique identifier for UniversalDocument items
 * @typedef {string} UDID
 */
export type UDID = string;

/**
 * Rectangular bounds definition for spatial elements
 * @interface UDRect
 */
export interface UDRect { 
  /** X coordinate of the top-left corner */
  x: number; 
  /** Y coordinate of the top-left corner */
  y: number; 
  /** Width of the rectangle */
  width: number; 
  /** Height of the rectangle */
  height: number; 
}

/**
 * 3D position in space for spatial computing
 * @interface UDPosition
 */
export interface UDPosition { 
  /** X coordinate in 3D space */
  x: number; 
  /** Y coordinate in 3D space */
  y: number; 
  /** Z coordinate (layer/depth) in 3D space */
  z: number; 
}

/**
 * The origin of an element. Where does it come from? What was it created with?
 * Inspired by ASCII-Art: [Where?], [With what?], [Hardware].
 * 
 * @interface UDOrigin
 * @example
 * ```typescript
 * const origin: UDOrigin = {
 *   host: "Office.localhost",
 *   path: "/Desktop.desktop",
 *   tool: "UniversalDesktop",
 *   device: "Device@TPU@usb"
 * };
 * ```
 */
export interface UDOrigin {
  /** Host identifier, e.g., "Office.localhost", "Building.server" */
  host: string;
  /** Path identifier, e.g., "/Desktop.desktop" */
  path: string;
  /** Tool used for creation, e.g., "UniversalDesktop", "Hand-Import" */
  tool: string;
  /** Optional device identifier, e.g., "Device@TPU@usb" */
  device?: string;
}

/**
 * A transformation step in the history of an element.
 * Inspired by: "sublimate", "crystallize", "distill", "iterate".
 * 
 * @interface UDTransformation
 * @example
 * ```typescript
 * const transformation: UDTransformation = {
 *   id: "transform_123",
 *   timestamp: Date.now(),
 *   verb: "crystallized",
 *   agent: "user:tux-sourceish",
 *   description: "Table extracted from note",
 *   previous_state_ref: "item_456"
 * };
 * ```
 */
export interface UDTransformation {
  /** Unique identifier for this transformation */
  readonly id: UDID;
  /** Timestamp when transformation occurred */
  timestamp: number;
  /** Action verb, e.g., "created", "iterated", "crystallized" */
  verb: string;
  /** Agent that performed the transformation, e.g., "user:tux-sourceish", "ai:gemini-2.5-pro" */
  agent: string;
  /** Description of what was done, e.g., "Table extracted from note" */
  description: string;
  /** Reference to a previous state */
  previous_state_ref?: UDID;
}

/**
 * Represents a single element with origin and history tracking.
 * Core data structure for all UniversalDocument items.
 * 
 * @interface UDItem
 * @example
 * ```typescript
 * const item: UDItem = {
 *   id: "item_123",
 *   type: UniversalDocument.ItemType.VARIABLE,
 *   title: "My Note",
 *   position: { x: 100, y: 200, z: 0 },
 *   dimensions: { width: 300, height: 200 },
 *   bagua_descriptor: UniversalDocument.BAGUA.ERDE | UniversalDocument.BAGUA.WIND,
 *   content: "Hello World",
 *   is_contextual: false,
 *   origin: { host: "localhost", path: "/workspace", tool: "UniversalDesktop" },
 *   transformation_history: [],
 *   created_at: Date.now(),
 *   updated_at: Date.now()
 * };
 * ```
 */
export interface UDItem {
  /** Unique identifier for this item */
  readonly id: UDID;
  /** Item type from UniversalDocument.ItemType enum */
  type: number;
  /** Human-readable title */
  title: string;
  /** 3D position in space */
  position: UDPosition;
  /** 2D dimensions for rendering */
  dimensions: { width: number; height: number; };
  /** Bagua-based metadata descriptor (9-bit field) */
  bagua_descriptor: number;
  /** Content data (any type) */
  content: any;
  /** Whether item is contextual to current session */
  is_contextual: boolean;
  
  /** Origin information - where item came from */
  origin?: UDOrigin;
  /** Complete transformation history */
  transformation_history: UDTransformation[];

  /** Creation timestamp */
  readonly created_at: number;
  /** Last update timestamp */
  updated_at: number;
}

/**
 * Metadata for the entire document, now with TUI presets.
 * Contains document-level information and configuration.
 * 
 * @interface UDMetadata
 * @example
 * ```typescript
 * const metadata: UDMetadata = {
 *   format_version: "2.7.0-kira",
 *   creator: "UniversalDesktop",
 *   created_at: "2025-07-17T10:00:00Z",
 *   canvas_bounds: { x: -16000, y: -16000, width: 32000, height: 32000 },
 *   item_count: 42,
 *   presets: {
 *     tui_formats: {
 *       "Standard": { width: 80, height: 25, codepage: 437 },
 *       "Commodore64": { width: 40, height: 25 }
 *     }
 *   }
 * };
 * ```
 */
export interface UDMetadata {
  /** Format version string */
  format_version: string;
  /** Creator/author of the document */
  creator: string;
  /** ISO timestamp of document creation */
  created_at: string;
  /** Spatial bounds of the document canvas */
  canvas_bounds: UDRect;
  /** Current number of items in document */
  item_count: number;
  
  /** TUI format presets for authenticity */
  presets?: {
    /** Terminal/TUI format definitions */
    tui_formats: Record<string, { 
      /** Terminal width in characters */
      width: number, 
      /** Terminal height in characters */
      height: number, 
      /** Optional codepage for character encoding */
      codepage?: number 
    }>
  };
}

// ======================================================================
// DIE UNIVERSALDOCUMENT KLASSE (v2.7 "Kira")
// ======================================================================

/**
 * UniversalDocument - Core class for spatial document management
 * 
 * Features:
 * - Bagua-based metadata system (I Ching philosophy)
 * - Binary serialization with DataView
 * - Transformation history tracking
 * - 3D positioning and spatial computing
 * - Origin tracking and authenticity
 * 
 * @class UniversalDocument
 * @version 2.7.0-kira
 */
export class UniversalDocument {
  
  /** Current format version */
  private static readonly VERSION = "2.1.0-raimund"; // Version 2.1.0 "Raimund"
  /** Binary magic number for file identification */
  private static readonly MAGIC = 0x55444152; // "UDAR" in hex
  
  // RAIMUNDS "FRÜHER HIMMEL" BAGUA SYSTEM
  static readonly BAGUA = {
    HIMMEL: 0b000000001,  // 1 - Classes/Templates (☰)
    WIND:   0b000000010,  // 2 - Views/UI (☴)
    WASSER: 0b000000100,  // 3 - Procedures/Flow (☵)
    BERG:   0b000001000,  // 4 - Init/Setup (☶)
    SEE:    0b000010000,  // 5 - Properties (☱)
    FEUER:  0b000100000,  // 6 - Functions (☲)
    DONNER: 0b001000000,  // 7 - Events (☳)
    ERDE:   0b010000000,  // 8 - Global/Base (☷)
    TAIJI:  0b100000000   // 9 - Center/Unity (☯)
  };

  // Raimunds Namen-Mapping mit deutschen Begriffen
  static readonly BAGUA_NAMES = new Map([
    [0b000000001, { symbol: '☰', name: 'Himmel', meaning: 'Classes/Templates', description: 'Meister-Elemente die geklont werden' }],
    [0b000000010, { symbol: '☴', name: 'Wind',   meaning: 'Views/UI', description: 'Sichtbare Schnittstellen' }],
    [0b000000100, { symbol: '☵', name: 'Wasser', meaning: 'Procedures/Flow', description: 'Fließende Abläufe' }],
    [0b000001000, { symbol: '☶', name: 'Berg',   meaning: 'Init/Setup', description: 'Feste Initialisierung' }],
    [0b000010000, { symbol: '☱', name: 'See',    meaning: 'Properties', description: 'Eigenschaften und Attribute' }],
    [0b000100000, { symbol: '☲', name: 'Feuer',  meaning: 'Functions', description: 'Aktive Berechnungen' }],
    [0b001000000, { symbol: '☳', name: 'Donner', meaning: 'Events', description: 'Ereignisse und Reaktionen' }],
    [0b010000000, { symbol: '☷', name: 'Erde',   meaning: 'Global/Base', description: 'Grundlegende Daten' }],
    [0b100000000, { symbol: '☯', name: 'Taiji',  meaning: 'Center/Unity', description: 'Die Einheit aller Dinge' }]
  ]);

  // ALGEBRAISCHER TRANSISTOR - Raimunds Geniestreich!
  static transistor(condition: boolean): number {
    return Math.pow(0, condition ? 0 : 1);
    // true:  0^0 = 1 (AN)
    // false: 0^1 = 0 (AUS)
  }

  // Polare Beziehungen des Frühen Himmels
  static readonly POLAR_PAIRS = new Map([
    [0b000000001, 0b010000000], // HIMMEL ↔ ERDE (1 ↔ 8)
    [0b000000010, 0b001000000], // WIND ↔ DONNER (2 ↔ 7)
    [0b000000100, 0b000100000], // WASSER ↔ FEUER (3 ↔ 6)
    [0b000001000, 0b000010000], // BERG ↔ SEE (4 ↔ 5)
    [0b010000000, 0b000000001], // ERDE ↔ HIMMEL (8 ↔ 1)
    [0b001000000, 0b000000010], // DONNER ↔ WIND (7 ↔ 2)
    [0b000100000, 0b000000100], // FEUER ↔ WASSER (6 ↔ 3)
    [0b000010000, 0b000001000], // SEE ↔ BERG (5 ↔ 4)
  ]);

  static readonly ItemType = {
    VORTEX: 0,        // ☯ Unknown/Origin (TAIJI)
    KONSTRUKTOR: 1,   // ☰ Code/Templates (HIMMEL)
    TABELLE: 2,       // ☴ Tables/Views (WIND)
    FLUSS: 3,         // ☵ Media/Streams (WASSER)
    INIT: 4,          // ☶ Configuration (BERG)
    EIGENSCHAFT: 5,   // ☱ Properties (SEE)
    FUNKTION: 6,      // ☲ Functions (FEUER)
    EREIGNIS: 7,      // ☳ Events/Triggers (DONNER)
    VARIABLE: 8,      // ☷ Data/Storage (ERDE)
    DATABASE: 9,      // Extended: Hyperdimensional
    SYSTEM: 10        // Extended: System-level
  } as const;

  /** Internal storage for document items */
  private items: Map<UDID, UDItem> = new Map();
  /** Document metadata */
  public metadata: UDMetadata;
  /** Counter for unique ID generation */
  private static idCounter = 0;

  // ====================================================================
  // KONSTRUKTOR & INITIALISIERUNG
  // ====================================================================
  
  /**
   * Creates a new UniversalDocument instance
   * 
   * @constructor
   * @example
   * ```typescript
   * const doc = new UniversalDocument();
   * console.log(doc.metadata.format_version); // "2.7.0-kira"
   * ```
   */
  constructor() {
    this.metadata = {
      format_version: "2.1.0",
      creator: "UniversalFile with Raimund's Bagua",
      created_at: new Date().toISOString(),
      canvas_bounds: { x: 0, y: 0, width: 4096, height: 4096 },
      item_count: 0
    };
  }
  

  // ====================================================================
  // KERN-API (mit transformativer Logik)
  // ====================================================================

  /**
   * Creates a new item with origin tracking in its history.
   * 
   * @param options - Item configuration without generated fields
   * @param origin - Origin information for tracking provenance
   * @returns The created UDItem
   * 
   * @example
   * ```typescript
   * const item = doc.createItem({
   *   type: UniversalDocument.ItemType.VARIABLE,
   *   title: "My Note",
   *   position: { x: 100, y: 200, z: 0 },
   *   dimensions: { width: 300, height: 200 },
   *   content: "Hello World",
   *   is_contextual: false
   * }, {
   *   host: "localhost",
   *   path: "/workspace",
   *   tool: "UniversalDesktop"
   * });
   * ```
   */
  public createItem(options: Omit<UDItem, 'id' | 'created_at' | 'updated_at' | 'transformation_history' | 'bagua_descriptor'> & { bagua_descriptor?: number }, origin: UDOrigin): UDItem {
    // Robust timestamp generation with microsecond precision
    const baseTime = Date.now();
    const microTime = baseTime + (++UniversalDocument.idCounter % 1000);
    const id = `ud_item_${baseTime}_${UniversalDocument.idCounter}`;

    const creation_transform: UDTransformation = {
      id: `ud_trans_${microTime}_${UniversalDocument.idCounter}`,
      timestamp: microTime,
      verb: 'erschaffen',
      agent: origin.tool,
      description: `Element vom Typ '${Object.keys(UniversalDocument.ItemType)[options.type]}' erstellt.`
    };

    const newItem: UDItem = {
      ...options,
      id,
      bagua_descriptor: options.bagua_descriptor || this.getDefaultBagua(options.type),
      created_at: microTime,
      updated_at: microTime,
      origin: origin,
      transformation_history: [creation_transform],
    };
    
    this.items.set(id, newItem);
    this.metadata.item_count = this.items.size;
    return newItem;
  }

  /**
   * Modifies an item and adds a transformation entry to its history.
   * 
   * @param id - ID of the item to transform
   * @param transformation - Transformation metadata (without id/timestamp)
   * @param updates - Partial updates to apply to the item
   * @returns The updated item or undefined if not found
   * 
   * @example
   * ```typescript
   * const updated = doc.transformItem("item_123", {
   *   verb: "crystallized",
   *   agent: "user:developer",
   *   description: "Content refined and structured"
   * }, {
   *   content: "Refined content",
   *   title: "Updated Title"
   * });
   * ```
   */
  public transformItem(id: UDID, transformation: Omit<UDTransformation, 'id'|'timestamp'>, updates: Partial<Omit<UDItem, 'id' | 'created_at'>>): UDItem | undefined {
    const item = this.items.get(id);
    if (!item) return undefined;

    // Robust timestamp generation
    const baseTime = Date.now();
    const microTime = baseTime + (++UniversalDocument.idCounter % 1000);

    const newTransform: UDTransformation = {
        id: `ud_trans_${microTime}`,
        timestamp: microTime,
        ...transformation
    };

    const updatedItem = { 
        ...item, 
        ...updates, 
        updated_at: microTime,
        transformation_history: [...item.transformation_history, newTransform]
    };
    
    this.items.set(id, updatedItem);
    return updatedItem;
  }
  
  /**
   * Gets all items in the document
   * 
   * @returns Read-only array of all items
   * 
   * @example
   * ```typescript
   * const items = doc.allItems;
   * console.log(`Document contains ${items.length} items`);
   * ```
   */
  public get allItems(): readonly UDItem[] { return Array.from(this.items.values()); }

  /**
   * Gets default Bagua descriptor for an item type
   * 
   * @param type - Item type
   * @returns Default Bagua descriptor
   * 
   * @example
   * ```typescript
   * const bagua = UniversalDocument.getDefaultBagua(UniversalDocument.ItemType.VARIABLE);
   * console.log(`Default Bagua: ${bagua.toString(2)}`);
   * ```
   */
  // Updated default Bagua assignments following Raimund's logic
  public getDefaultBagua(type: number): number {
    const defaults: Record<number, number> = {
      [UniversalDocument.ItemType.VORTEX]: 
        UniversalDocument.BAGUA.TAIJI, // Unity
      [UniversalDocument.ItemType.KONSTRUKTOR]: 
        UniversalDocument.BAGUA.HIMMEL | UniversalDocument.BAGUA.BERG, // Template with structure
      [UniversalDocument.ItemType.TABELLE]: 
        UniversalDocument.BAGUA.BERG | UniversalDocument.BAGUA.SEE, // Structure with properties
      [UniversalDocument.ItemType.FLUSS]: 
        UniversalDocument.BAGUA.WASSER | UniversalDocument.BAGUA.FEUER, // Flow with functions
      [UniversalDocument.ItemType.INIT]: 
        UniversalDocument.BAGUA.BERG, // Init/Setup
      [UniversalDocument.ItemType.EIGENSCHAFT]: 
        UniversalDocument.BAGUA.SEE, // Properties
      [UniversalDocument.ItemType.FUNKTION]: 
        UniversalDocument.BAGUA.FEUER, // Functions
      [UniversalDocument.ItemType.EREIGNIS]: 
        UniversalDocument.BAGUA.SEE | UniversalDocument.BAGUA.DONNER, // Properties with events
      [UniversalDocument.ItemType.VARIABLE]: 
        UniversalDocument.BAGUA.ERDE | UniversalDocument.BAGUA.WIND, // Base data with UI
      [UniversalDocument.ItemType.DATABASE]: 
        UniversalDocument.BAGUA.ERDE | UniversalDocument.BAGUA.WASSER, // Base with flow
      [UniversalDocument.ItemType.SYSTEM]: 
        UniversalDocument.BAGUA.WASSER | UniversalDocument.BAGUA.TAIJI // Flow with unity
    };
    return defaults[type] || UniversalDocument.BAGUA.ERDE;
  }

  // NEW: Query with algebraic transistor
  public queryWithTransistor(query: Partial<Record<keyof typeof UniversalDocument.BAGUA, boolean>>, condition: boolean): UDItem[] {
    const factor = UniversalDocument.transistor(condition);
    
    if (factor === 0) return []; // Optimization: skip if transistor is OFF
    
    let mask = 0;
    let required = 0;

    for (const [key, shouldHave] of Object.entries(query)) {
      const bit = UniversalDocument.BAGUA[key as keyof typeof UniversalDocument.BAGUA];
      if (bit !== undefined) {
        mask |= bit;
        if (shouldHave) required |= bit;
      }
    }

    return this.allItems.filter(item => 
      (item.bagua_descriptor & mask) === required
    );
  }

  // NEW: Find polar opposite items
  public findPolarOpposite(item: UDItem): UDItem[] {
    const polarBagua = UniversalDocument.POLAR_PAIRS.get(item.bagua_descriptor);
    if (polarBagua !== undefined) {
      return this.allItems.filter(i => i.bagua_descriptor & polarBagua);
    }
    return [];
  }

  // NEW: Algebraic sort based on Bagua precedence
  public sortByBaguaPrecedence(): UDItem[] {
    return [...this.allItems].sort((a, b) => {
      // Sort by Bagua value (Himmel first, then Wind, etc.)
      const aBagua = Math.log2(a.bagua_descriptor & -a.bagua_descriptor); // Get lowest set bit
      const bBagua = Math.log2(b.bagua_descriptor & -b.bagua_descriptor);
      return aBagua - bBagua;
    });
  }

  // Helper: Get Bagua symbols string
  private getBaguaSymbols(descriptor: number): string {
    let symbols = '';
    for (const [value, info] of UniversalDocument.BAGUA_NAMES) {
      if (descriptor & value) {
        symbols += info.symbol;
      }
    }
    return symbols || '○'; // Empty circle if no Bagua
  }

  // Helper: Get type name
  private getTypeName(type: number): string {
    const names: Record<number, string> = {
      0: 'VORTEX',
      1: 'KONSTRUKTOR',
      2: 'TABELLE',
      3: 'FLUSS',
      4: 'INIT',
      5: 'EIGENSCHAFT',
      6: 'FUNKTION',
      7: 'EREIGNIS',
      8: 'VARIABLE',
      9: 'DATABASE',
      10: 'SYSTEM'
    };
    return names[type] || 'VORTEX';
  }

  // Helper: Serialize content based on type
  private serializeContent(type: number, content: any): string {
    switch (type) {
      case UniversalDocument.ItemType.VARIABLE:
        if (typeof content === 'string') return content;
        return content.text || JSON.stringify(content);
        
      case UniversalDocument.ItemType.TABELLE:
        if (content.headers && content.rows) {
          let result = '| ' + content.headers.join(' | ') + ' |\n';
          result += '| ' + content.headers.map(() => '---').join(' | ') + ' |\n';
          for (const row of content.rows) {
            result += '| ' + row.join(' | ') + ' |\n';
          }
          return result;
        }
        return JSON.stringify(content);
        
      case UniversalDocument.ItemType.KONSTRUKTOR:
        if (content.code) return '```typescript\n' + content.code + '\n```';
        return JSON.stringify(content);
        
      default:
        return JSON.stringify(content);
    }
  }

  // Bracket validation with helpful errors
  private static validateBrackets(text: string): void {
    const stack: { bracket: string, line: number, col: number }[] = [];
    const lines = text.split('\n');
    const bracketPairs = { '(': ')', '[': ']', '{': '}' };
    const closingBrackets = new Set([')', ']', '}']);
    
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      for (let col = 0; col < line.length; col++) {
        const char = line[col];
        
        if (char in bracketPairs) {
          stack.push({ bracket: char, line: lineNum + 1, col: col + 1 });
        } else if (closingBrackets.has(char)) {
          if (stack.length === 0) {
            throw new UDValidationError(
              `Unexpected closing bracket '${char}' at line ${lineNum + 1}, column ${col + 1}`,
              'brackets',
              undefined,
              lineNum + 1
            );
          }
          
          const opened = stack.pop()!;
          const expected = bracketPairs[opened.bracket as keyof typeof bracketPairs];
          if (char !== expected) {
            throw new UDValidationError(
              `Mismatched brackets: expected '${expected}' but found '${char}' at line ${lineNum + 1}, column ${col + 1} (opened at line ${opened.line}, column ${opened.col})`,
              'brackets',
              undefined,
              lineNum + 1
            );
          }
        }
      }
    }
    
    if (stack.length > 0) {
      const unclosed = stack[stack.length - 1];
      throw new UDValidationError(
        `Unclosed bracket '${unclosed.bracket}' opened at line ${unclosed.line}, column ${unclosed.col}`,
        'brackets',
        undefined,
        unclosed.line
      );
    }
  }

  // Helper: Parse fields from block
  private static parseFields(block: string): Record<string, string> {
    const fields: Record<string, string> = {};
    const lines = block.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('([{') && !trimmed.startsWith('}])') && !trimmed.startsWith('-')) {
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > 0) {
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim();
          fields[key] = value;
        }
      }
    }
    
    return fields;
  }

  // Helper: Parse type name to number
  private static parseType(typeName: string): number {
    const typeMap: Record<string, number> = {
      'VORTEX': 0,
      'KONSTRUKTOR': 1,
      'TABELLE': 2,
      'FLUSS': 3,
      'INIT': 4,
      'EIGENSCHAFT': 5,
      'FUNKTION': 6,
      'EREIGNIS': 7,
      'VARIABLE': 8,
      'DATABASE': 9,
      'SYSTEM': 10
    };
    return typeMap[typeName] || 0;
  }

  // Helper: Parse position string
  private static parsePosition(positionStr: string): UDPosition {
    const match = positionStr.match(/\{x:\s*(-?\d+),\s*y:\s*(-?\d+),\s*z:\s*(-?\d+)\}/);
    if (match) {
      return {
        x: parseInt(match[1]),
        y: parseInt(match[2]),
        z: parseInt(match[3])
      };
    }
    return { x: 0, y: 0, z: 0 };
  }

  // Helper: Parse dimensions string
  private static parseDimensions(dimensionsStr: string): { width: number; height: number } {
    const match = dimensionsStr.match(/\{width:\s*(\d+),\s*height:\s*(\d+)\}/);
    if (match) {
      return {
        width: parseInt(match[1]),
        height: parseInt(match[2])
      };
    }
    return { width: 100, height: 100 };
  }

  // Helper: Parse Bagua descriptor
  private static parseBagua(baguaStr: string): number {
    const match = baguaStr.match(/\((\d+)\)$/);
    if (match) {
      return parseInt(match[1]);
    }
    return 0;
  }

  // Helper: Parse origin block
  private static parseOriginBlock(block: string): UDOrigin {
    const fields = this.parseFields(block);
    return {
      host: fields.host || 'localhost',
      path: fields.path || '/workspace',
      tool: fields.tool || 'UniversalDocument',
      device: fields.device
    };
  }

  // Helper: Parse history block
  private static parseHistoryBlock(block: string): UDTransformation[] {
    const history: UDTransformation[] = [];
    const lines = block.split('\n');
    let currentTransform: Partial<UDTransformation> = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('- verb:')) {
        // Save previous transform if complete
        if (currentTransform.verb) {
          history.push(currentTransform as UDTransformation);
        }
        // Start new transform
        currentTransform = {
          id: `ud_trans_${Date.now()}_${Math.random()}`,
          verb: trimmed.substring(7).trim()
        };
      } else if (trimmed.startsWith('agent:')) {
        currentTransform.agent = trimmed.substring(6).trim();
      } else if (trimmed.startsWith('timestamp:')) {
        const timeStr = trimmed.substring(10).trim();
        currentTransform.timestamp = new Date(timeStr).getTime();
      } else if (trimmed.startsWith('description:')) {
        currentTransform.description = trimmed.substring(12).trim();
      } else if (trimmed.startsWith('previous_state_ref:')) {
        currentTransform.previous_state_ref = trimmed.substring(19).trim();
      }
    }
    
    // Save last transform
    if (currentTransform.verb) {
      history.push(currentTransform as UDTransformation);
    }
    
    return history;
  }

  // Helper: Parse content block
  private static parseContent(type: number, contentBlock: string): any {
    const trimmed = contentBlock.trim();
    
    switch (type) {
      case UniversalDocument.ItemType.VARIABLE:
        // Simple text content
        return { text: trimmed };
        
      case UniversalDocument.ItemType.TABELLE:
        // Parse markdown table
        if (trimmed.includes('|')) {
          const lines = trimmed.split('\n').filter(l => l.trim());
          if (lines.length >= 3) {
            const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
            const rows = lines.slice(2).map(row => 
              row.split('|').map(cell => cell.trim()).filter(cell => cell)
            );
            return { headers, rows };
          }
        }
        return { text: trimmed };
        
      case UniversalDocument.ItemType.KONSTRUKTOR:
        // Parse code blocks
        if (trimmed.startsWith('```') && trimmed.endsWith('```')) {
          const code = trimmed.substring(3, trimmed.length - 3);
          const firstNewline = code.indexOf('\n');
          return { code: firstNewline > 0 ? code.substring(firstNewline + 1) : code };
        }
        return { text: trimmed };
        
      default:
        try {
          return JSON.parse(trimmed);
        } catch {
          return { text: trimmed };
        }
    }
  }

  // Helper: Validate item completeness
  private static validateItem(item: Partial<UDItem>): void {
    if (!item.id) {
      throw new UDValidationError('Item missing required field: id', 'validation');
    }
    if (item.type === undefined) {
      throw new UDValidationError('Item missing required field: type', 'validation', item.id);
    }
    if (!item.position) {
      throw new UDValidationError('Item missing required field: position', 'validation', item.id);
    }
    if (!item.dimensions) {
      throw new UDValidationError('Item missing required field: dimensions', 'validation', item.id);
    }
  }


  // ====================================================================
  // BINÄRE SERIALISIERUNG (Die Blaupause)
  // ====================================================================

  /**
   * Compact workspace snapshot for database storage (PERFORMANCE OPTIMIZED)
   * 
   * Creates a lightweight representation suitable for frequent auto-saves.
   * Excludes heavy data like full transformation history and large content.
   * 
   * @returns ArrayBuffer containing the compact workspace snapshot
   */
  public toWorkspaceSnapshot(): ArrayBuffer {
    const compactData = {
      version: this.metadata.format_version,
      creator: this.metadata.creator,
      created_at: this.metadata.created_at,
      canvas_bounds: this.metadata.canvas_bounds,
      presets: this.metadata.presets,
      items: Array.from(this.items.values()).map(item => ({
        id: item.id,
        type: item.type,
        title: item.title || 'Untitled',
        position: item.position,
        dimensions: item.dimensions,
        content: typeof item.content === 'string' && item.content.length > 10000 
          ? item.content.substring(0, 10000) + '...[workspace-truncated]' 
          : item.content,
        is_contextual: item.is_contextual,
        created_at: item.created_at,
        updated_at: item.updated_at
        // Origin/transformation history excluded for performance
      }))
    };
    
    const jsonString = JSON.stringify(compactData);
    const encoder = new TextEncoder();
    const buffer = encoder.encode(jsonString).buffer;
    
    console.log(`🗜️ Workspace snapshot: ${Math.round(buffer.byteLength / 1024)}KB (${this.items.size} items)`);
    return buffer;
  }

  /**
   * Load document from compact workspace snapshot (JSON format)
   * 
   * @param buffer ArrayBuffer containing JSON workspace snapshot
   * @returns UniversalDocument instance
   */
  public static fromWorkspaceSnapshot(buffer: ArrayBuffer): UniversalDocument {
    try {
      const decoder = new TextDecoder();
      const jsonString = decoder.decode(buffer);
      const data = JSON.parse(jsonString);
      
      console.log(`🔄 Loading workspace snapshot: ${data.items?.length || 0} items`);
      
      const doc = new UniversalDocument();
      
      // Restore metadata
      if (data.version) doc.metadata.format_version = data.version;
      if (data.creator) doc.metadata.creator = data.creator;
      if (data.created_at) doc.metadata.created_at = data.created_at;
      if (data.canvas_bounds) doc.metadata.canvas_bounds = data.canvas_bounds;
      if (data.presets) doc.metadata.presets = data.presets;
      
      // Restore items
      if (data.items && Array.isArray(data.items)) {
        for (const itemData of data.items) {
          const item: UDItem = {
            id: itemData.id || crypto.randomUUID(),
            type: itemData.type || 0,
            title: itemData.title || 'Untitled',
            position: itemData.position || { x: 0, y: 0, z: 0 },
            dimensions: itemData.dimensions || { width: 300, height: 200 },
            content: itemData.content || '',
            is_contextual: itemData.is_contextual || false,
            created_at: itemData.created_at || new Date().toISOString(),
            updated_at: itemData.updated_at || new Date().toISOString(),
            origin: undefined, // Origins not stored in snapshots
            bagua_descriptor: doc.getDefaultBagua(itemData.type || 0),
            transformation_history: [] // Required by µ1_documentMetadata
          };
          
          doc.items.set(item.id, item);
        }
      }
      
      console.log(`✅ Workspace snapshot loaded: ${doc.items.size} items restored`);
      return doc;
    } catch (error) {
      console.error('💥 Failed to load workspace snapshot:', error);
      throw new Error(`Invalid workspace snapshot format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Serializes the document to binary format.
   * The header structure is directly inspired by the hand-drawn blueprint:
   * HEAD: #*$=*Filename|*Filesize|...*Model|...*#EOF
   * 
   * Binary Structure:
   * - HEADER: UD_MAGIC (4) | VERSION (2) | METADATA_OFFSET (4) | ITEMS_OFFSET (4)
   * - METADATA_BLOCK: JSON string of metadata (including TUI presets)
   * - ITEMS_BLOCK: ITEM_HEADER | BAGUA (2) | ORIGIN_DATA | TRANSFORMATION_COUNT (2) | TRANSFORMATIONS | CONTENT
   * 
   * @returns ArrayBuffer containing the serialized document
   * 
   * @example
   * ```typescript
   * const binary = doc.toBinary();
   * console.log(`Document serialized to ${binary.byteLength} bytes`);
   * 
   * // Save to file
   * fs.writeFileSync('document.ud', Buffer.from(binary));
   * ```
   */
  public toBinary(): ArrayBuffer {
    // HYBRID UD FORMAT - Bracket notation standard!
    let udContent = '';
    
    // Document header with bracket notation
    udContent += '---ud-document\n';
    udContent += '([{\n';
    udContent += `  version: ${this.metadata.format_version}\n`;
    udContent += `  creator: ${this.metadata.creator}\n`;
    udContent += `  created_at: ${this.metadata.created_at}\n`;
    udContent += `  canvas_bounds: {x: ${this.metadata.canvas_bounds.x}, y: ${this.metadata.canvas_bounds.y}, width: ${this.metadata.canvas_bounds.width}, height: ${this.metadata.canvas_bounds.height}}\n`;
    if (this.metadata.presets) {
      udContent += `  presets:\n`;
      udContent += `    tui_formats: ${JSON.stringify(this.metadata.presets.tui_formats)}\n`;
    }
    udContent += '}])\n';
    udContent += '---ud-document-end\n\n';
    
    // Items with proper bracket notation
    for (const item of Array.from(this.items.values())) {
      udContent += '([{ITEM\n';
      udContent += `  id: ${item.id}\n`;
      udContent += `  type: ${this.getTypeName(item.type)}\n`;
      udContent += `  title: ${item.title || 'Untitled'}\n`;
      udContent += `  position: {x: ${item.position.x}, y: ${item.position.y}, z: ${item.position.z}}\n`;
      udContent += `  dimensions: {width: ${item.dimensions.width}, height: ${item.dimensions.height}}\n`;
      udContent += `  bagua: ${this.getBaguaSymbols(item.bagua_descriptor)} (${item.bagua_descriptor})\n`;
      udContent += `  is_contextual: ${item.is_contextual}\n`;
      udContent += `  created_at: ${new Date(item.created_at).toISOString()}\n`;
      udContent += `  updated_at: ${new Date(item.updated_at).toISOString()}\n`;
      
      // Origin block (nested)
      if (item.origin) {
        udContent += '  ([{ORIGIN\n';
        udContent += `    host: ${item.origin.host}\n`;
        udContent += `    path: ${item.origin.path}\n`;
        udContent += `    tool: ${item.origin.tool}\n`;
        if (item.origin.device) {
          udContent += `    device: ${item.origin.device}\n`;
        }
        udContent += '  }])\n';
      }
      
      // Transformation history block (nested)
      if (item.transformation_history.length > 0) {
        udContent += '  ([{HISTORY\n';
        for (const trans of item.transformation_history) {
          udContent += `    - verb: ${trans.verb}\n`;
          udContent += `      agent: ${trans.agent}\n`;
          udContent += `      timestamp: ${new Date(trans.timestamp).toISOString()}\n`;
          udContent += `      description: ${trans.description}\n`;
          if (trans.previous_state_ref) {
            udContent += `      previous_state_ref: ${trans.previous_state_ref}\n`;
          }
        }
        udContent += '  }])\n';
      }
      
      udContent += '}])\n\n';
      
      // Content block
      udContent += '([{CONTENT\n';
      udContent += this.serializeContent(item.type, item.content);
      udContent += '\n}])\n\n';
    }
    
    // Convert to binary with UDAR header
    const contentBytes = new TextEncoder().encode(udContent);
    const headerSize = 16;
    const totalSize = headerSize + contentBytes.length;
    
    const buffer = new ArrayBuffer(totalSize);
    const view = new DataView(buffer);
    
    // Write binary header
    view.setUint32(0, UniversalDocument.MAGIC, true); // UDAR
    view.setUint16(4, 0x0210, true); // Version 2.1.0 Raimund
    view.setUint32(6, headerSize, true); // Content offset
    view.setUint32(10, contentBytes.length, true); // Content length
    view.setUint16(14, 0x5544, true); // "UD" signature
    
    // Write UD content
    const contentArray = new Uint8Array(buffer, headerSize);
    contentArray.set(contentBytes);
    
    return buffer;
  }
  
  /**
   * Deserializes a document from binary format
   * 
   * @param buffer - ArrayBuffer containing the binary document data
   * @returns New UniversalDocument instance
   * 
   * @example
   * ```typescript
   * const buffer = fs.readFileSync('document.ud');
   * const doc = UniversalDocument.fromBinary(buffer.buffer);
   * console.log(`Loaded document with ${doc.allItems.length} items`);
   * ```
   */
  public static fromBinary(buffer: ArrayBuffer): UniversalDocument {
    const view = new DataView(buffer);
    
    // Read binary header
    const magic = view.getUint32(0, true);
    if (magic !== UniversalDocument.MAGIC) {
      throw new Error('Invalid UniversalDocument magic number');
    }
    
    const version = view.getUint16(4, true);
    const contentOffset = view.getUint32(6, true);
    const contentLength = view.getUint32(10, true);
    const signature = view.getUint16(14, true); // Should be "UD"
    
    // Basic format validation (expandable for future versions)
    if (signature !== 0x5544) { // "UD" signature
      console.warn('⚠️ Binary signature mismatch - file may be corrupted');
    }
    
    // Version compatibility check (can be expanded later)
    if (version < 0x0210) { // Earlier than v2.1.0
      console.info(`📦 Loading older format version: ${version.toString(16)}`);
    }
    
    // Read UD content
    const contentArray = new Uint8Array(buffer, contentOffset, contentLength);
    const udContent = new TextDecoder().decode(contentArray);
    
    // Parse hybrid UD format
    const doc = new UniversalDocument();
    
    // Parse document metadata using new parser  
    const docMatch = udContent.match(/---ud-document\s*\(\[\{([\s\S]*?)\}\]\)\s*---ud-document-end/);
    if (docMatch) {
      const metadataBlock = docMatch[1];
      const fields = UniversalDocument.parseFields(metadataBlock);
      
      doc.metadata.format_version = fields.version || doc.metadata.format_version;
      doc.metadata.creator = fields.creator || doc.metadata.creator;
      doc.metadata.created_at = fields.created_at || doc.metadata.created_at;
      
      // Parse canvas bounds
      if (fields.canvas_bounds) {
        const match = fields.canvas_bounds.match(/\{x:\s*(-?\d+),\s*y:\s*(-?\d+),\s*width:\s*(\d+),\s*height:\s*(\d+)\}/);
        if (match) {
          doc.metadata.canvas_bounds = {
            x: parseInt(match[1]),
            y: parseInt(match[2]),
            width: parseInt(match[3]),
            height: parseInt(match[4])
          };
        }
      }
    }
    
    // Find all item blocks with their content using new parser
    const itemRegex = /\(\[\{ITEM([\s\S]*?)\}\]\)\s*\(\[\{CONTENT([\s\S]*?)\}\]\)/g;
    let match;
    
    while ((match = itemRegex.exec(udContent)) !== null) {
      const itemBlock = match[1];
      const contentBlock = match[2];
      
      try {
        const item = UniversalDocument.parseItemBlock(itemBlock, contentBlock);
        doc.items.set(item.id, item);
      } catch (error) {
        console.warn('Failed to parse item block:', error);
        // Continue parsing other items
      }
    }
    
    doc.metadata.item_count = doc.items.size;
    return doc;
  }
  
  /**
   * Parse item block with nested structures
   */
  private static parseItemBlock(itemBlock: string, contentBlock: string): UDItem {
    // Parse basic fields
    const fields = this.parseFields(itemBlock);
    
    const item: Partial<UDItem> = {
      id: fields.id || `ud_item_${Date.now()}_${Math.random()}`,
      type: this.parseType(fields.type || 'VORTEX'),
      title: fields.title || '',
      position: this.parsePosition(fields.position || '{x: 0, y: 0, z: 0}'),
      dimensions: this.parseDimensions(fields.dimensions || '{width: 100, height: 100}'),
      bagua_descriptor: this.parseBagua(fields.bagua || '(0)'),
      is_contextual: fields.is_contextual === 'true',
      created_at: fields.created_at ? new Date(fields.created_at).getTime() : Date.now(),
      updated_at: fields.updated_at ? new Date(fields.updated_at).getTime() : Date.now(),
      transformation_history: []
    };
    
    // Parse nested blocks
    const originMatch = itemBlock.match(/\(\[\{ORIGIN([\s\S]*?)\}\]\)/);
    if (originMatch) {
      item.origin = this.parseOriginBlock(originMatch[1]);
    }
    
    const historyMatch = itemBlock.match(/\(\[\{HISTORY([\s\S]*?)\}\]\)/);
    if (historyMatch) {
      item.transformation_history = this.parseHistoryBlock(historyMatch[1]);
    }
    
    // Parse content
    item.content = this.parseContent(item.type!, contentBlock.trim());
    
    // Validate the item
    this.validateItem(item);
    
    return item as UDItem;
  }

  /**
   * Query items by Bagua flags
   * 
   * @param flags - Object with Bagua flags to match
   * @returns Array of items matching the Bagua criteria
   * 
   * @example
   * ```typescript
   * const windItems = doc.queryByBagua({ WIND: true });
   * const taijiItems = doc.queryByBagua({ TAIJI: true });
   * ```
   */
  public queryByBagua(flags: Partial<Record<keyof typeof UniversalDocument.BAGUA, boolean>>): UDItem[] {
    const result: UDItem[] = [];
    const flagMask = Object.entries(flags).reduce((mask, [key, value]) => {
      if (value && key in UniversalDocument.BAGUA) {
        return mask | UniversalDocument.BAGUA[key as keyof typeof UniversalDocument.BAGUA];
      }
      return mask;
    }, 0);

    for (const item of Array.from(this.items.values())) {
      if ((item.bagua_descriptor & flagMask) === flagMask) {
        result.push(item);
      }
    }
    return result;
  }

  /**
   * Add an item to the document (compatibility method)
   * 
   * @param options - Item configuration
   * @returns The created UDItem
   * 
   * @example
   * ```typescript
   * const item = doc.addItem({
   *   type: UniversalDocument.ItemType.VARIABLE,
   *   position: { x: 0, y: 0, z: 0 },
   *   content: { text: "Hello World" }
   * });
   * ```
   */
  public addItem(options: Omit<UDItem, 'id' | 'created_at' | 'updated_at' | 'transformation_history' | 'origin' | 'bagua_descriptor'> & { bagua_descriptor?: number }): UDItem {
    const defaultOrigin: UDOrigin = {
      host: "localhost",
      path: "/workspace",
      tool: "UniversalDocument"
    };
    
    return this.createItem(options, defaultOrigin);
  }

  /**
   * KIRA's PROPOSAL: Text serialization for human collaboration
   * Serializes document to interactive markdown format with YAML frontmatter
   * 
   * @returns String containing markdown with UD metadata
   * 
   * @example
   * ```typescript
   * const markdown = doc.toText();
   * fs.writeFileSync('document.ud.md', markdown);
   * ```
   */
  public toText(): string {
    const lines: string[] = [];
    
    // Document frontmatter
    lines.push('---');
    lines.push(`ud-format: ${this.metadata.format_version}`);
    lines.push(`ud-creator: ${this.metadata.creator}`);
    lines.push(`ud-created: ${this.metadata.created_at}`);
    lines.push(`ud-items: ${this.metadata.item_count}`);
    lines.push(`ud-canvas: ${this.metadata.canvas_bounds.x},${this.metadata.canvas_bounds.y},${this.metadata.canvas_bounds.width},${this.metadata.canvas_bounds.height}`);
    lines.push('---');
    lines.push('');
    
    // Document title
    lines.push(`# 🌌 UniversalDocument`);
    lines.push('');
    lines.push(`*Generated from ${this.metadata.creator} at ${this.metadata.created_at}*`);
    lines.push('');
    
    // Items sections
    for (const item of Array.from(this.items.values())) {
      lines.push('---');
      lines.push(`ud-id: ${item.id}`);
      lines.push(`ud-type: ${Object.keys(UniversalDocument.ItemType)[item.type]}`);
      lines.push(`ud-position: ${item.position.x},${item.position.y},${item.position.z}`);
      lines.push(`ud-dimensions: ${item.dimensions.width}x${item.dimensions.height}`);
      lines.push(`ud-bagua: ${this.baguaToString(item.bagua_descriptor)}`);
      lines.push(`ud-contextual: ${item.is_contextual}`);
      if (item.origin) {
        lines.push(`ud-origin: ${item.origin.host}:${item.origin.path} (${item.origin.tool})`);
      }
      lines.push(`ud-created: ${this.safeISOString(item.created_at)}`);
      lines.push(`ud-updated: ${this.safeISOString(item.updated_at)}`);
      lines.push('---');
      lines.push('');
      
      // Item title and content
      lines.push(`## ${item.title || 'Untitled Item'}`);
      lines.push('');
      
      // Render content based on type
      lines.push(this.renderItemContent(item));
      lines.push('');
      
      // Transformation history
      if (item.transformation_history.length > 0) {
        lines.push('### 🔄 Transformation History');
        lines.push('');
        for (const transform of item.transformation_history) {
          lines.push(`- **${transform.verb}** by \`${transform.agent}\` at ${new Date(transform.timestamp).toISOString()}`);
          lines.push(`  > ${transform.description}`);
        }
        lines.push('');
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Universal text parser with format auto-detection
   * Supports both hybrid bracket format and markdown format
   * 
   * @param text - Text in either hybrid or markdown format
   * @returns New UniversalDocument instance
   */
  public static fromText(text: string): UniversalDocument {
    // Format detection
    if (text.includes('([{ITEM')) {
      return UniversalDocument.fromHybridText(text);
    } else if (text.includes('---\nud-format:')) {
      return UniversalDocument.fromMarkdownText(text);
    } else {
      throw new UDValidationError(
        'Unknown text format. Expected hybrid bracket format or markdown with YAML frontmatter.',
        'format'
      );
    }
  }

  /**
   * Parse hybrid bracket format (toBinary output format)
   * Uses existing parseItemBlock infrastructure
   */
  private static fromHybridText(text: string): UniversalDocument {
    try {
      // Validate brackets first
      UniversalDocument.validateBrackets(text);
    } catch (error) {
      if (error instanceof UDValidationError) {
        throw error;
      }
      throw new UDValidationError(
        `Bracket validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'brackets'
      );
    }
    
    const doc = new UniversalDocument();
    
    // Parse document metadata using existing parser  
    const docMatch = text.match(/---ud-document\s*\(\[\{([\s\S]*?)\}\]\)\s*---ud-document-end/);
    if (docMatch) {
      try {
        const metadataBlock = docMatch[1];
        const fields = UniversalDocument.parseFields(metadataBlock);
        
        doc.metadata.format_version = fields.version || doc.metadata.format_version;
        doc.metadata.creator = fields.creator || doc.metadata.creator;
        doc.metadata.created_at = fields.created_at || doc.metadata.created_at;
        
        // Parse canvas bounds
        if (fields.canvas_bounds) {
          const match = fields.canvas_bounds.match(/\{x:\s*(-?\d+),\s*y:\s*(-?\d+),\s*width:\s*(\d+),\s*height:\s*(\d+)\}/);
          if (match) {
            doc.metadata.canvas_bounds = {
              x: parseInt(match[1]),
              y: parseInt(match[2]),
              width: parseInt(match[3]),
              height: parseInt(match[4])
            };
          }
        }
      } catch (error) {
        throw new UDValidationError(
          `Failed to parse document metadata: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'metadata'
        );
      }
    } else {
      throw new UDValidationError(
        'Document metadata block not found. Expected ---ud-document ... ---ud-document-end',
        'format'
      );
    }
    
    // Find all item blocks with their content using existing parser
    const itemRegex = /\(\[\{ITEM([\s\S]*?)\}\]\)\s*\(\[\{CONTENT([\s\S]*?)\}\]\)/g;
    let match;
    let itemCount = 0;
    
    while ((match = itemRegex.exec(text)) !== null) {
      const itemBlock = match[1];
      const contentBlock = match[2];
      itemCount++;
      
      try {
        const item = UniversalDocument.parseItemBlock(itemBlock, contentBlock);
        doc.items.set(item.id, item);
      } catch (error) {
        const itemError = error instanceof UDValidationError ? error : 
          new UDValidationError(
            `Failed to parse item ${itemCount}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'item_parse',
            undefined,
            undefined
          );
        throw itemError;
      }
    }
    
    if (itemCount === 0) {
      throw new UDValidationError(
        'No items found in hybrid format. Expected at least one ([{ITEM ... }]) ([{CONTENT ... }]) block.',
        'format'
      );
    }
    
    doc.metadata.item_count = doc.items.size;
    return doc;
  }

  /**
   * Parse markdown format with YAML frontmatter
   * Updated for Raimund's Bagua system constants
   */
  private static fromMarkdownText(text: string): UniversalDocument {
    const doc = new UniversalDocument();
    
    // Split by --- to get sections
    const sections = text.split('---');
    
    if (sections.length < 3) {
      throw new UDValidationError(
        'Invalid markdown format. Expected YAML frontmatter delimited by ---',
        'format'
      );
    }
    
    // Parse document frontmatter (first section)
    try {
      const docMeta = sections[0];
      const metaLines = docMeta.split('\n').filter(l => l.includes(':'));
      
      for (const line of metaLines) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;
        
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        
        switch (key) {
          case 'ud-creator':
            doc.metadata.creator = value;
            break;
          case 'ud-created':
            doc.metadata.created_at = value;
            break;
          case 'ud-format':
            doc.metadata.format_version = value;
            break;
          case 'ud-canvas':
            const coords = value.split(',').map(Number);
            if (coords.length === 4 && coords.every(n => !isNaN(n))) {
              doc.metadata.canvas_bounds = {
                x: coords[0], y: coords[1], 
                width: coords[2], height: coords[3]
              };
            } else {
              throw new UDValidationError(
                `Invalid canvas bounds format: ${value}. Expected "x,y,width,height"`,
                'metadata'
              );
            }
            break;
        }
      }
    } catch (error) {
      if (error instanceof UDValidationError) {
        throw error;
      }
      throw new UDValidationError(
        `Failed to parse document frontmatter: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'metadata'
      );
    }
    
    let itemCount = 0;
    
    // Parse items from remaining sections (skip document content section)
    // Structure: [0: doc-frontmatter, 1: empty, 2: doc-content, 3: item1-meta, 4: item1-content, 5: item2-meta, 6: item2-content, ...]
    for (let i = 3; i < sections.length; i += 2) {
      const itemMeta = sections[i];
      const itemContent = sections[i + 1] || '';
      
      // Only process if we have metadata section
      if (itemMeta && itemMeta.trim() && itemMeta.includes('ud-id:')) {
        itemCount++;
        try {
          const item = doc.parseItemFromText(itemMeta, itemContent);
          if (item) {
            doc.items.set(item.id, item);
          }
        } catch (error) {
          throw new UDValidationError(
            `Failed to parse markdown item ${itemCount}: ${error instanceof Error ? error.message : 'Unknown error'}`,
            'item_parse',
            undefined,
            Math.floor(i / 2) + 1 // Approximate line number
          );
        }
      }
    }
    
    if (itemCount === 0) {
      throw new UDValidationError(
        'No items found in markdown format. Expected at least one item section with ud-id metadata.',
        'format'
      );
    }
    
    doc.metadata.item_count = doc.items.size;
    return doc;
  }

  private static parseTransformationHistory(lines: string[], startIndex: number): {
    transformations: UDTransformation[],
    nextIndex: number
  } {
    const transformations: UDTransformation[] = [];
    let currentTransform: Partial<UDTransformation> | null = null;
    let i = startIndex;
    
    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();
      
      // New transformation entry
      if (trimmed.startsWith('- verb:')) {
        // Save previous if exists
        if (currentTransform && currentTransform.verb) {
          transformations.push(currentTransform as UDTransformation);
        }
        
        currentTransform = {
          id: `ud_trans_${Date.now()}_${Math.random()}`,
          timestamp: Date.now(),
          verb: trimmed.substring('- verb:'.length).trim(),
          agent: '',
          description: ''
        };
      }
      // Agent line
      else if (trimmed.startsWith('agent:') && currentTransform) {
        currentTransform.agent = trimmed.substring('agent:'.length).trim();
      }
      // Description line (can be multiline)
      else if (trimmed.startsWith('description:') && currentTransform) {
        currentTransform.description = trimmed.substring('description:'.length).trim();
        
        // Check for multiline description
        let j = i + 1;
        while (j < lines.length && lines[j].startsWith('    ')) {
          currentTransform.description += '\n' + lines[j].trim();
          j++;
        }
        i = j - 1; // Adjust index
      }
      // End of transformation block
      else if (!line.startsWith(' ') || trimmed === '') {
        if (currentTransform && currentTransform.verb) {
          transformations.push(currentTransform as UDTransformation);
        }
        break;
      }
      
      i++;
    }
    
    // Don't forget the last one
    if (currentTransform && currentTransform.verb) {
      transformations.push(currentTransform as UDTransformation);
    }
    
    return { transformations, nextIndex: i };
  }

  private baguaToString(descriptor: number): string {
    const flags: string[] = [];
    if (descriptor & UniversalDocument.BAGUA.HIMMEL) flags.push('HIMMEL');
    if (descriptor & UniversalDocument.BAGUA.SEE) flags.push('SEE');
    if (descriptor & UniversalDocument.BAGUA.ERDE) flags.push('ERDE');
    if (descriptor & UniversalDocument.BAGUA.FEUER) flags.push('FEUER');
    if (descriptor & UniversalDocument.BAGUA.WIND) flags.push('WIND');
    if (descriptor & UniversalDocument.BAGUA.DONNER) flags.push('DONNER');
    if (descriptor & UniversalDocument.BAGUA.BERG) flags.push('BERG');
    if (descriptor & UniversalDocument.BAGUA.WASSER) flags.push('WASSER');
    if (descriptor & UniversalDocument.BAGUA.TAIJI) flags.push('TAIJI');
    return flags.join('|');
  }

  private safeISOString(timestamp: number): string {
    try {
      if (!timestamp || isNaN(timestamp)) {
        return new Date().toISOString();
      }
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        return new Date().toISOString();
      }
      return date.toISOString();
    } catch (error) {
      return new Date().toISOString();
    }
  }

  private renderItemContent(item: UDItem): string {
    switch (item.type) {
      case UniversalDocument.ItemType.VARIABLE:
        return typeof item.content === 'string' ? item.content : 
               item.content.text || JSON.stringify(item.content);
      
      case UniversalDocument.ItemType.TABELLE:
        if (item.content.headers && item.content.rows) {
          let table = '| ' + item.content.headers.join(' | ') + ' |\n';
          table += '| ' + item.content.headers.map(() => '---').join(' | ') + ' |\n';
          for (const row of item.content.rows) {
            table += '| ' + row.join(' | ') + ' |\n';
          }
          return table;
        }
        return JSON.stringify(item.content);
      
      case UniversalDocument.ItemType.KONSTRUKTOR:
        return '```\n' + (item.content.code || JSON.stringify(item.content)) + '\n```';
      
      default:
        return '```json\n' + JSON.stringify(item.content, null, 2) + '\n```';
    }
  }

  private parseItemFromText(meta: string, content: string): UDItem | null {
    try {
      // Parse item metadata
      const metaLines = meta.split('\n').filter(l => l.includes(':'));
      const itemData: any = {};
      
      for (const line of metaLines) {
        const [key, value] = line.split(':').map(s => s.trim());
        switch (key) {
          case 'ud-id':
            itemData.id = value;
            break;
          case 'ud-type':
            itemData.type = (UniversalDocument.ItemType as any)[value];
            break;
          case 'ud-position':
            const pos = value.split(',').map(Number);
            itemData.position = { x: pos[0], y: pos[1], z: pos[2] };
            break;
          case 'ud-dimensions':
            const dims = value.split('x').map(Number);
            itemData.dimensions = { width: dims[0], height: dims[1] };
            break;
          case 'ud-bagua':
            itemData.bagua_descriptor = UniversalDocument.parseBaguaFromString(value);
            break;
          case 'ud-contextual':
            itemData.is_contextual = value === 'true';
            break;
          case 'ud-origin':
            itemData.origin = UniversalDocument.parseOriginFromString(value);
            break;
          case 'ud-created':
            itemData.created_at = new Date(value).getTime();
            break;
          case 'ud-updated':
            itemData.updated_at = new Date(value).getTime();
            break;
        }
      }
      
      // Parse content section
      const contentLines = content.split('\n');
      let title = '';
      let itemContent: any = '';
      let transformations: UDTransformation[] = [];
      
      let i = 0;
      // Find title (first ## header)
      while (i < contentLines.length) {
        const line = contentLines[i].trim();
        if (line.startsWith('## ')) {
          title = line.substring(3).trim();
          i++;
          break;
        }
        i++;
      }
      
      // Parse content until transformation history
      const contentStart = i;
      while (i < contentLines.length) {
        const line = contentLines[i].trim();
        if (line.startsWith('### 🔄 Transformation History')) {
          break;
        }
        i++;
      }
      
      // Extract content
      const contentSection = contentLines.slice(contentStart, i).join('\n').trim();
      itemContent = this.parseContentByType(itemData.type, contentSection);
      
      // Parse transformation history
      if (i < contentLines.length) {
        i++; // Skip history header
        while (i < contentLines.length) {
          const line = contentLines[i].trim();
          if (line.startsWith('- **')) {
            const transform = this.parseTransformationFromLine(line, contentLines[i + 1]);
            if (transform) {
              transformations.push(transform);
            }
            i += 2; // Skip description line
          } else {
            i++;
          }
        }
      }
      
      // Create UDItem
      const item: UDItem = {
        id: itemData.id,
        type: itemData.type,
        title: title,
        position: itemData.position,
        dimensions: itemData.dimensions,
        bagua_descriptor: itemData.bagua_descriptor,
        content: itemContent,
        is_contextual: itemData.is_contextual,
        origin: itemData.origin,
        transformation_history: transformations,
        created_at: itemData.created_at,
        updated_at: itemData.updated_at
      };
      
      return item;
    } catch (error) {
      console.error('Failed to parse item from text:', error);
      return null;
    }
  }

  private static parseBaguaFromString(value: string): number {
    let descriptor = 0;
    const flags = value.split('|');
    for (const flag of flags) {
      if (flag in UniversalDocument.BAGUA) {
        descriptor |= (UniversalDocument.BAGUA as any)[flag];
      }
    }
    return descriptor;
  }

  private static parseOriginFromString(value: string): UDOrigin {
    // Format: "host:path (tool)"
    const match = value.match(/^([^:]+):([^(]+)\s*\(([^)]+)\)$/);
    if (match) {
      return {
        host: match[1].trim(),
        path: match[2].trim(),
        tool: match[3].trim()
      };
    }
    return { host: 'unknown', path: '/', tool: 'unknown' };
  }

  private parseContentByType(type: number, content: string): any {
    switch (type) {
      case UniversalDocument.ItemType.VARIABLE:
        return { text: content };
      
      case UniversalDocument.ItemType.TABELLE:
        return this.parseTableFromMarkdown(content);
      
      case UniversalDocument.ItemType.KONSTRUKTOR:
        // Remove code fences
        const codeMatch = content.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
        return { code: codeMatch ? codeMatch[1] : content };
      
      default:
        // Try to parse as JSON, fallback to text
        try {
          const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
          }
        } catch (e) {
          // Fallback to text
        }
        return { text: content };
    }
  }

  private parseTableFromMarkdown(content: string): any {
    const lines = content.split('\n').filter(l => l.trim().startsWith('|'));
    if (lines.length < 2) return { text: content };
    
    const headers = lines[0].split('|').map(h => h.trim()).filter(h => h);
    const rows = lines.slice(2).map(line => 
      line.split('|').map(cell => cell.trim()).filter(cell => cell)
    );
    
    return { headers, rows };
  }

  private parseTransformationFromLine(line: string, descLine: string): UDTransformation | null {
    // Format: - **verb** by `agent` at timestamp
    const match = line.match(/- \*\*([^*]+)\*\* by `([^`]+)` at (.+)$/);
    if (!match) {
      return null;
    }
    
    const description = descLine ? descLine.trim().replace(/^>\s*/, '') : '';
    
    return {
      id: `parsed_${Date.now()}_${Math.random()}`,
      verb: match[1],
      agent: match[2],
      timestamp: new Date(match[3]).getTime(),
      description
    };
  }

  /**
   * Removes an item from the document with algebraic approach
   * 
   * @param itemId - ID of the item to remove
   * @returns Boolean indicating success
   * 
   * @example
   * ```typescript
   * const success = doc.removeItem("ud_item_123_1");
   * if (success) {
   *   console.log("Item removed successfully");
   * }
   * ```
   */
  public removeItem(itemId: string): boolean {
    const item = this.items.get(itemId);
    
    // Algebraischer Transistor: Item existiert?
    const itemExists = item !== undefined;
    
    if (!itemExists) {
      console.warn(`⚠️ removeItem: Item ${itemId} not found`);
      return false;
    }

    // Create removal transformation
    const removal_transform: UDTransformation = {
      id: `ud_trans_${Date.now()}_${++UniversalDocument.idCounter}`,
      timestamp: Date.now(),
      verb: 'entfernen',
      agent: 'UniversalDesktop',
      description: `Element '${item!.title}' wurde entfernt`
    };

    // Add final transformation to item before removal
    item!.transformation_history.push(removal_transform);
    
    // Remove from Map
    const success = this.items.delete(itemId);
    
    // Update metadata
    if (success) {
      this.metadata.item_count = this.items.size;
      console.log(`🗑️ Item removed: ${itemId}`);
    }
    
    return success;
  }

  /**
   * A VISIONARY function inspired by the drawing:
   * "LLM model can paint interconnecting paths when activated"
   * This analyzes and visualizes relationships between items.
   * 
   * @returns Array of connection paths for visualization
   * 
   * @example
   * ```typescript
   * const connections = doc.analyzeAndVisualizeRelationships();
   * connections.forEach(path => {
   *   console.log(`Connection: ${path.from} -> ${path.to} (${path.type})`);
   * });
   * ```
   * 
   * @todo Implement full relationship analysis
   */
  public analyzeAndVisualizeRelationships(): any[] {
      // Future implementation:
      // 1. Go through all items
      // 2. Analyze content, origin and transformation_history
      // 3. Find connections (e.g., Item B was transformed from Item A)
      // 4. Return a list of "paths" that the UI can paint
      console.log("Relationship analysis will be implemented in a future version.");
      return [];
  }
}