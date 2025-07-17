// 🌌 UniversalDocument (.UD) Format Implementation
// Revolutionary Binary-Text Hybrid with Bagua-Based Metadata
// Version: 1.0 | Created: 2025-07-17

// ============================================================================
// BAGUA TRIGRAM CONSTANTS - The Heart of the .UD Format
// ============================================================================

export enum BaguaTrigram {
  QIAN = 0,  // ☰ Heaven - Creativity/Structure (Template)
  DUI = 1,   // ☱ Lake - Openness/Interaction (Interactive)
  KUN = 2,   // ☷ Earth - Receptivity/Data Container (Pure Data)
  LI = 3,    // ☲ Fire - Clarity/Visibility (Searchable)
  XUN = 4,   // ☴ Wind - Flow/Formatting (Dynamic)
  ZHEN = 5,  // ☳ Thunder - Movement/Action (Has Script)
  GEN = 6,   // ☶ Mountain - Stillness/Limitation (Fixed)
  KAN = 7,   // ☵ Water - Depth/Connection (Linked)
  TAIJI = 8  // ☯ Center - Essence/State (Active)
}

export interface BaguaDescriptor {
  readonly raw: number;           // 16-bit value (9 bits active + 7 reserved)
  readonly qian: boolean;         // Bit 0: Template/Structure
  readonly dui: boolean;          // Bit 1: Interactive
  readonly kun: boolean;          // Bit 2: Data Container
  readonly li: boolean;           // Bit 3: Searchable
  readonly xun: boolean;          // Bit 4: Dynamic Formatting
  readonly zhen: boolean;         // Bit 5: Has Action
  readonly gen: boolean;          // Bit 6: Fixed Position
  readonly kan: boolean;          // Bit 7: Linked
  readonly taiji: boolean;        // Bit 8: Active State
}

// ============================================================================
// CORE UD FORMAT STRUCTURES
// ============================================================================

export interface UDHeader {
  readonly magic: number;         // 0x5544_0001 ("UD" + Version 1)
  readonly version: number;       // Format version
  readonly flags: number;         // Global flags
  readonly itemCount: number;     // Number of items
  readonly fileSize: number;      // Total file size
  readonly checksum: number;      // CRC32 checksum
  readonly created: number;       // Unix timestamp
  readonly modified: number;      // Unix timestamp
}

export interface UDItem {
  readonly id: string;            // Unique identifier
  readonly position: [number, number, number]; // x, y, z coordinates
  readonly dimensions: [number, number];       // width, height
  readonly timestamp: number;     // Creation/modification time
  readonly typeIndex: number;     // Type lookup index
  readonly bagua: BaguaDescriptor; // Bagua-based metadata
  readonly contentOffset: number; // Offset to content block
  readonly contentSize: number;   // Size of content block
}

export interface UDContentBlock {
  readonly magic: number;         // Content type magic number
  readonly compression: string;   // Compression algorithm
  readonly encoding: string;      // Text encoding
  readonly data: Uint8Array;      // Raw content data
}

export interface UDMetadata {
  readonly formatVersion: string;
  readonly creator: string;
  readonly createdAt: string;
  readonly canvasBounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  readonly itemCount: number;
  readonly compression: string;
  readonly encryption: string;
  readonly capabilities: string[];
}

// ============================================================================
// BAGUA UTILITY FUNCTIONS
// ============================================================================

export class BaguaUtils {
  // Create Bagua descriptor from individual flags
  static createDescriptor(flags: {
    qian?: boolean;
    dui?: boolean;
    kun?: boolean;
    li?: boolean;
    xun?: boolean;
    zhen?: boolean;
    gen?: boolean;
    kan?: boolean;
    taiji?: boolean;
  }): BaguaDescriptor {
    let raw = 0;
    if (flags.qian) raw |= (1 << 0);
    if (flags.dui) raw |= (1 << 1);
    if (flags.kun) raw |= (1 << 2);
    if (flags.li) raw |= (1 << 3);
    if (flags.xun) raw |= (1 << 4);
    if (flags.zhen) raw |= (1 << 5);
    if (flags.gen) raw |= (1 << 6);
    if (flags.kan) raw |= (1 << 7);
    if (flags.taiji) raw |= (1 << 8);

    return {
      raw,
      qian: Boolean(raw & (1 << 0)),
      dui: Boolean(raw & (1 << 1)),
      kun: Boolean(raw & (1 << 2)),
      li: Boolean(raw & (1 << 3)),
      xun: Boolean(raw & (1 << 4)),
      zhen: Boolean(raw & (1 << 5)),
      gen: Boolean(raw & (1 << 6)),
      kan: Boolean(raw & (1 << 7)),
      taiji: Boolean(raw & (1 << 8))
    };
  }

  // Parse Bagua descriptor from raw value
  static parseDescriptor(raw: number): BaguaDescriptor {
    return {
      raw,
      qian: Boolean(raw & (1 << 0)),
      dui: Boolean(raw & (1 << 1)),
      kun: Boolean(raw & (1 << 2)),
      li: Boolean(raw & (1 << 3)),
      xun: Boolean(raw & (1 << 4)),
      zhen: Boolean(raw & (1 << 5)),
      gen: Boolean(raw & (1 << 6)),
      kan: Boolean(raw & (1 << 7)),
      taiji: Boolean(raw & (1 << 8))
    };
  }

  // Get human-readable description of Bagua descriptor
  static describeDescriptor(descriptor: BaguaDescriptor): string {
    const traits: string[] = [];
    if (descriptor.qian) traits.push("Template");
    if (descriptor.dui) traits.push("Interactive");
    if (descriptor.kun) traits.push("Data Container");
    if (descriptor.li) traits.push("Searchable");
    if (descriptor.xun) traits.push("Dynamic");
    if (descriptor.zhen) traits.push("Actionable");
    if (descriptor.gen) traits.push("Fixed");
    if (descriptor.kan) traits.push("Linked");
    if (descriptor.taiji) traits.push("Active");
    
    return traits.join(", ");
  }

  // Render Bagua matrix visualization
  static renderMatrix(descriptor: BaguaDescriptor): string {
    const symbols = ["☰", "☱", "☷", "☲", "☴", "☳", "☶", "☵", "☯"];
    const bits = [
      descriptor.qian,   // Bit 0
      descriptor.dui,    // Bit 1
      descriptor.kun,    // Bit 2
      descriptor.li,     // Bit 3
      descriptor.xun,    // Bit 4
      descriptor.zhen,   // Bit 5
      descriptor.gen,    // Bit 6
      descriptor.kan,    // Bit 7
      descriptor.taiji   // Bit 8
    ];

    // 3x3 matrix layout (matching the patch specification)
    const matrix = [
      [bits[4] ? symbols[4] : "·", bits[3] ? symbols[3] : "·", bits[2] ? symbols[2] : "·"],
      [bits[5] ? symbols[5] : "·", bits[8] ? symbols[8] : "·", bits[1] ? symbols[1] : "·"],
      [bits[6] ? symbols[6] : "·", bits[7] ? symbols[7] : "·", bits[0] ? symbols[0] : "·"]
    ];

    return matrix.map(row => row.join(" ")).join("\n");
  }
}

// ============================================================================
// PREDEFINED BAGUA TEMPLATES
// ============================================================================

export const BaguaPresets = {
  // Standard text note: Interactive + Data Container + Searchable + Dynamic + Active
  NOTE: BaguaUtils.createDescriptor({
    dui: true,    // Interactive
    kun: true,    // Data Container
    li: true,     // Searchable
    xun: true,    // Dynamic formatting
    taiji: true   // Active
  }),

  // Fixed UI element: Data Container + Fixed + Active
  FIXED_UI: BaguaUtils.createDescriptor({
    kun: true,    // Data Container
    gen: true,    // Fixed position
    taiji: true   // Active
  }),

  // Action button: Interactive + Has Action + Active
  BUTTON: BaguaUtils.createDescriptor({
    dui: true,    // Interactive
    zhen: true,   // Has action
    taiji: true   // Active
  }),

  // Search result: Searchable + Linked + Active
  SEARCH_RESULT: BaguaUtils.createDescriptor({
    li: true,     // Searchable
    kan: true,    // Linked
    taiji: true   // Active
  }),

  // Template element: Template + Data Container + Searchable
  TEMPLATE: BaguaUtils.createDescriptor({
    qian: true,   // Template
    kun: true,    // Data Container
    li: true      // Searchable
  })
};

// ============================================================================
// TYPE REGISTRY
// ============================================================================

export enum UDItemType {
  NOTIZZETTEL = 0,    // Text notes
  TABELLE = 1,        // Tables/spreadsheets
  CODE = 2,           // Source code
  TUI = 3,            // Terminal interfaces
  BROWSER = 4,        // Web content
  MEDIA = 5,          // Images/videos
  CHART = 6,          // Data visualizations
  CALENDAR = 7,       // Time-based data
  AI_GENERATED = 8,   // AI-created content
  DATABASE = 9        // Hyperdimensional vector databases
}

export const TYPE_REGISTRY: Record<UDItemType, string> = {
  [UDItemType.NOTIZZETTEL]: "notizzettel",
  [UDItemType.TABELLE]: "tabelle",
  [UDItemType.CODE]: "code",
  [UDItemType.TUI]: "tui",
  [UDItemType.BROWSER]: "browser",
  [UDItemType.MEDIA]: "media",
  [UDItemType.CHART]: "chart",
  [UDItemType.CALENDAR]: "calendar",
  [UDItemType.AI_GENERATED]: "ai_generated",
  [UDItemType.DATABASE]: "database"
};

// ============================================================================
// PERFORMANCE CONSTANTS
// ============================================================================

export const UD_CONSTANTS = {
  MAGIC_NUMBER: 0x5544_0001,    // "UD" + Version 1
  VERSION: 1.0,
  HEADER_SIZE: 32,              // Bytes
  ITEM_INDEX_SIZE: 48,          // Bytes per item
  CONTENT_BLOCK_HEADER_SIZE: 16, // Bytes
  DEFAULT_COMPRESSION: "lz4",
  DEFAULT_ENCODING: "utf8",
  
  // Content type magic numbers
  CONTENT_MAGIC: {
    TEXT: 0x434E5440,     // "CNT@"
    TABLE: 0x54424C40,    // "TBL@"
    BINARY: 0x42494E40,   // "BIN@"
    MEDIA: 0x4D454440     // "MED@"
  }
};

export default {
  BaguaTrigram,
  BaguaUtils,
  BaguaPresets,
  UDItemType,
  TYPE_REGISTRY,
  UD_CONSTANTS
};