// 🌌 UniversalDocument V2.0 - NEXUS Enhanced Implementation
// Revolutionary .UD Format with Advanced Bagua Integration and Binary Support
// Enhanced with comprehensive error handling and documentation

export class UniversalDocumentV2 {
  private static readonly UD_MAGIC = 0x55440001; // "UD" + Version 1
  private static readonly BAGUA_BITS = 9;
  private static readonly VERSION = 0x0100; // Version 1.0
  private static readonly MAX_ITEMS = 1000000; // Safety limit
  
  // ========================================================================
  // BAGUA BIT DEFINITIONS - The Sacred Geometry of Data
  // ========================================================================
  
  static readonly BAGUA = {
    QIAN:  0b000000001, // Bit 0: ☰ Heaven/Template/Master
    DUI:   0b000000010, // Bit 1: ☱ Lake/Interactive
    KUN:   0b000000100, // Bit 2: ☷ Earth/Data Container
    LI:    0b000001000, // Bit 3: ☲ Fire/Searchable
    XUN:   0b000010000, // Bit 4: ☴ Wind/Dynamic/Flowing
    ZHEN:  0b000100000, // Bit 5: ☳ Thunder/Actionable
    GEN:   0b001000000, // Bit 6: ☶ Mountain/Fixed/Immutable
    KAN:   0b010000000, // Bit 7: ☵ Water/Linked/Connected
    TAIJI: 0b100000000  // Bit 8: ☯ Center/Active/Focus
  } as const;
  
  // ========================================================================
  // BAGUA SEMANTIC METADATA - Human-Readable Wisdom
  // ========================================================================
  
  static readonly BAGUA_NAMES = {
    [this.BAGUA.QIAN]:  { symbol: '☰', name: 'Qian',  meaning: 'Heaven/Template', description: 'Master element that can be cloned' },
    [this.BAGUA.DUI]:   { symbol: '☱', name: 'Dui',   meaning: 'Lake/Interactive', description: 'Accepts user input and interaction' },
    [this.BAGUA.KUN]:   { symbol: '☷', name: 'Kun',   meaning: 'Earth/Container', description: 'Primary data container' },
    [this.BAGUA.LI]:    { symbol: '☲', name: 'Li',    meaning: 'Fire/Searchable', description: 'Indexed for semantic search' },
    [this.BAGUA.XUN]:   { symbol: '☴', name: 'Xun',   meaning: 'Wind/Dynamic', description: 'Adaptive formatting and flow' },
    [this.BAGUA.ZHEN]:  { symbol: '☳', name: 'Zhen',  meaning: 'Thunder/Action', description: 'Has associated scripts or actions' },
    [this.BAGUA.GEN]:   { symbol: '☶', name: 'Gen',   meaning: 'Mountain/Fixed', description: 'Immutable position and size' },
    [this.BAGUA.KAN]:   { symbol: '☵', name: 'Kan',   meaning: 'Water/Linked', description: 'Connected to other elements' },
    [this.BAGUA.TAIJI]: { symbol: '☯', name: 'Taiji', meaning: 'Center/Active', description: 'Currently in focus' }
  } as const;

  // ========================================================================
  // ITEM TYPE DEFINITIONS - Enhanced for Hyperdimensional Computing
  // ========================================================================
  
  static readonly ItemType = {
    NOTIZZETTEL: 0,   // Text notes
    TABELLE: 1,       // Tables/spreadsheets
    CODE: 2,          // Source code
    TUI: 3,           // Terminal interfaces
    BROWSER: 4,       // Web content
    MEDIA: 5,         // Images/videos
    CHART: 6,         // Data visualizations
    CALENDAR: 7,      // Time-based data
    AI_GENERATED: 8,  // AI-created content
    DATABASE: 9       // Hyperdimensional vector databases
  } as const;

  static readonly ITEM_TYPE_NAMES = {
    [this.ItemType.NOTIZZETTEL]: 'Note',
    [this.ItemType.TABELLE]: 'Table',
    [this.ItemType.CODE]: 'Code',
    [this.ItemType.TUI]: 'Terminal',
    [this.ItemType.BROWSER]: 'Browser',
    [this.ItemType.MEDIA]: 'Media',
    [this.ItemType.CHART]: 'Chart',
    [this.ItemType.CALENDAR]: 'Calendar',
    [this.ItemType.AI_GENERATED]: 'AI Generated',
    [this.ItemType.DATABASE]: 'Vector Database'
  } as const;

  // ========================================================================
  // DOCUMENT STATE
  // ========================================================================
  
  private items: UDItem[] = [];
  private metadata: UDMetadata;
  private itemIndex: Map<string, UDItem> = new Map();
  private baguaIndex: Map<number, UDItem[]> = new Map();
  private isModified: boolean = false;
  private lastError: Error | null = null;

  constructor(options: UDDocumentOptions = {}) {
    this.metadata = {
      format_version: "2.0",
      creator: options.creator || "UniversalDesktop",
      created_at: new Date().toISOString(),
      canvas_bounds: options.canvasBounds || { x: -2000, y: -2000, width: 4000, height: 4000 },
      item_count: 0,
      compression: options.compression || "lz4",
      encryption: options.encryption || "none",
      capabilities: [
        "multi_layer",
        "ai_enhanced", 
        "real_time_sync",
        "bagua_metadata",
        "hyperdimensional_vectors",
        "binary_performance"
      ]
    };

    this.rebuildIndices();
  }

  // ========================================================================
  // BAGUA UTILITIES - The Core Wisdom System
  // ========================================================================

  /**
   * Get default Bagua descriptor for item type
   * @param type - Item type constant
   * @returns Bagua descriptor bits
   * @throws {UDError} If invalid type
   */
  static getDefaultBagua(type: number): number {
    if (!this.isValidItemType(type)) {
      throw new UDError(`Invalid item type: ${type}`, 'INVALID_ITEM_TYPE');
    }

    switch (type) {
      case this.ItemType.NOTIZZETTEL:
        return this.BAGUA.DUI | this.BAGUA.KUN | this.BAGUA.LI | this.BAGUA.XUN;
      
      case this.ItemType.TABELLE:
        return this.BAGUA.DUI | this.BAGUA.KUN | this.BAGUA.LI;
      
      case this.ItemType.CODE:
        return this.BAGUA.DUI | this.BAGUA.KUN | this.BAGUA.LI | this.BAGUA.ZHEN;
      
      case this.ItemType.TUI:
        return this.BAGUA.DUI | this.BAGUA.GEN | this.BAGUA.QIAN;
      
      case this.ItemType.DATABASE:
        return this.BAGUA.KUN | this.BAGUA.LI | this.BAGUA.KAN | this.BAGUA.XUN;
      
      case this.ItemType.BROWSER:
        return this.BAGUA.DUI | this.BAGUA.KAN | this.BAGUA.XUN;
      
      case this.ItemType.MEDIA:
        return this.BAGUA.KUN | this.BAGUA.GEN;
      
      case this.ItemType.CHART:
        return this.BAGUA.KUN | this.BAGUA.LI | this.BAGUA.XUN;
      
      case this.ItemType.CALENDAR:
        return this.BAGUA.KUN | this.BAGUA.LI | this.BAGUA.XUN;
      
      case this.ItemType.AI_GENERATED:
        return this.BAGUA.KUN | this.BAGUA.LI | this.BAGUA.KAN;
      
      default:
        return this.BAGUA.KUN; // Minimal: only container
    }
  }

  /**
   * Render Bagua matrix for visualization
   * @param descriptor - Bagua descriptor bits
   * @returns ASCII art representation
   */
  static renderBaguaMatrix(descriptor: number): string {
    const matrix = [
      [this.BAGUA.XUN,   this.BAGUA.LI,    this.BAGUA.KUN],
      [this.BAGUA.ZHEN,  this.BAGUA.TAIJI, this.BAGUA.DUI],
      [this.BAGUA.GEN,   this.BAGUA.KAN,   this.BAGUA.QIAN]
    ];
    
    let result = '';
    for (let row of matrix) {
      for (let bit of row) {
        const isSet = (descriptor & bit) !== 0;
        const info = this.BAGUA_NAMES[bit];
        result += isSet ? info.symbol : '·';
        result += ' ';
      }
      result += '\n';
    }
    return result.trim();
  }

  /**
   * Get human-readable Bagua description
   * @param descriptor - Bagua descriptor bits
   * @returns Array of active trait descriptions
   */
  static describeBagua(descriptor: number): string[] {
    const traits: string[] = [];
    
    for (const [bit, info] of Object.entries(this.BAGUA_NAMES)) {
      if (descriptor & parseInt(bit)) {
        traits.push(info.description);
      }
    }
    
    return traits;
  }

  /**
   * Validate Bagua descriptor
   * @param descriptor - Bagua descriptor to validate
   * @returns True if valid
   */
  static isValidBagua(descriptor: number): boolean {
    return (descriptor >= 0) && (descriptor <= 0b111111111) && Number.isInteger(descriptor);
  }

  /**
   * Check if item type is valid
   * @param type - Item type to validate
   * @returns True if valid
   */
  static isValidItemType(type: number): boolean {
    return Object.values(this.ItemType).includes(type);
  }

  // ========================================================================
  // ITEM MANAGEMENT - Enhanced with Error Handling
  // ========================================================================

  /**
   * Add item to document
   * @param options - Item configuration
   * @returns Item ID
   * @throws {UDError} If validation fails
   */
  addItem(options: AddItemOptions): string {
    try {
      // Validate inputs
      this.validateAddItemOptions(options);
      
      // Check limits
      if (this.items.length >= UniversalDocumentV2.MAX_ITEMS) {
        throw new UDError(`Maximum items limit reached: ${UniversalDocumentV2.MAX_ITEMS}`, 'MAX_ITEMS_EXCEEDED');
      }

      const id = this.generateId();
      const bagua = options.bagua ?? UniversalDocumentV2.getDefaultBagua(options.type);
      
      // Validate Bagua descriptor
      if (!UniversalDocumentV2.isValidBagua(bagua)) {
        throw new UDError(`Invalid Bagua descriptor: ${bagua}`, 'INVALID_BAGUA');
      }

      const item: UDItem = {
        id,
        type: options.type,
        position: [...options.position] as [number, number, number],
        dimensions: [...options.dimensions] as [number, number],
        bagua_descriptor: bagua,
        content: options.content,
        created_at: Date.now(),
        updated_at: Date.now()
      };
      
      this.items.push(item);
      this.itemIndex.set(id, item);
      this.updateBaguaIndex(item);
      this.metadata.item_count++;
      this.isModified = true;
      
      return id;
    } catch (error) {
      this.lastError = error instanceof Error ? error : new Error(String(error));
      throw error;
    }
  }

  /**
   * Get item by ID
   * @param id - Item ID
   * @returns Item or null if not found
   */
  getItem(id: string): UDItem | null {
    return this.itemIndex.get(id) || null;
  }

  /**
   * Remove item by ID
   * @param id - Item ID
   * @returns True if removed
   */
  removeItem(id: string): boolean {
    const item = this.itemIndex.get(id);
    if (!item) return false;

    const index = this.items.indexOf(item);
    if (index > -1) {
      this.items.splice(index, 1);
      this.itemIndex.delete(id);
      this.removeBaguaIndex(item);
      this.metadata.item_count--;
      this.isModified = true;
      return true;
    }
    return false;
  }

  /**
   * Update item
   * @param id - Item ID
   * @param updates - Partial updates
   * @returns True if updated
   */
  updateItem(id: string, updates: Partial<UDItem>): boolean {
    const item = this.itemIndex.get(id);
    if (!item) return false;

    // Validate updates
    if (updates.type !== undefined && !UniversalDocumentV2.isValidItemType(updates.type)) {
      throw new UDError(`Invalid item type: ${updates.type}`, 'INVALID_ITEM_TYPE');
    }

    if (updates.bagua_descriptor !== undefined && !UniversalDocumentV2.isValidBagua(updates.bagua_descriptor)) {
      throw new UDError(`Invalid Bagua descriptor: ${updates.bagua_descriptor}`, 'INVALID_BAGUA');
    }

    // Remove from old Bagua index
    this.removeBaguaIndex(item);

    // Apply updates
    Object.assign(item, updates, { updated_at: Date.now() });

    // Update Bagua index
    this.updateBaguaIndex(item);
    
    this.isModified = true;
    return true;
  }

  // ========================================================================
  // BAGUA QUERYING - The Power of Semantic Search
  // ========================================================================

  /**
   * Query items by Bagua properties
   * @param flags - Bagua flags to match
   * @returns Matching items
   */
  queryByBagua(flags: Partial<Record<keyof typeof UniversalDocumentV2.BAGUA, boolean>>): UDItem[] {
    let mask = 0;
    let required = 0;
    
    for (const [key, value] of Object.entries(flags)) {
      const bit = UniversalDocumentV2.BAGUA[key as keyof typeof UniversalDocumentV2.BAGUA];
      if (bit !== undefined) {
        mask |= bit;
        if (value) required |= bit;
      }
    }
    
    return this.items.filter(item => 
      (item.bagua_descriptor & mask) === required
    );
  }

  /**
   * Find interactive and searchable items
   * @returns Matching items
   */
  findInteractiveSearchable(): UDItem[] {
    return this.queryByBagua({
      DUI: true,  // Interactive
      LI: true    // Searchable
    });
  }

  /**
   * Find all active items
   * @returns Active items
   */
  findActive(): UDItem[] {
    return this.queryByBagua({ TAIJI: true });
  }

  /**
   * Find all actionable items
   * @returns Actionable items
   */
  findActionable(): UDItem[] {
    return this.queryByBagua({ ZHEN: true });
  }

  /**
   * Find all linked items
   * @returns Linked items
   */
  findLinked(): UDItem[] {
    return this.queryByBagua({ KAN: true });
  }

  /**
   * Find database items
   * @returns Database items
   */
  findDatabases(): UDItem[] {
    return this.items.filter(item => item.type === UniversalDocumentV2.ItemType.DATABASE);
  }

  // ========================================================================
  // BINARY SERIALIZATION - Hardware-Optimized Performance
  // ========================================================================

  /**
   * Export document to binary format
   * @returns Binary data
   * @throws {UDError} If serialization fails
   */
  toBinary(): ArrayBuffer {
    try {
      const size = this.calculateBinarySize();
      const buffer = new ArrayBuffer(size);
      const view = new DataView(buffer);
      let offset = 0;
      
      // Header
      view.setUint32(offset, UniversalDocumentV2.UD_MAGIC, true); offset += 4;
      view.setUint16(offset, UniversalDocumentV2.VERSION, true); offset += 2;
      view.setUint16(offset, 0, true); // Flags; offset += 2;
      
      // Metadata length and data
      const metadataJson = JSON.stringify(this.metadata);
      const metadataBytes = new TextEncoder().encode(metadataJson);
      view.setUint32(offset, metadataBytes.length, true); offset += 4;
      
      // Copy metadata
      new Uint8Array(buffer, offset, metadataBytes.length).set(metadataBytes);
      offset += metadataBytes.length;
      
      // Items
      view.setUint32(offset, this.items.length, true); offset += 4;
      
      for (const item of this.items) {
        // ID (32 bytes, null-terminated)
        const idBytes = new TextEncoder().encode(item.id);
        new Uint8Array(buffer, offset, Math.min(32, idBytes.length)).set(idBytes);
        offset += 32;
        
        // Position (3 * float64)
        view.setFloat64(offset, item.position[0], true); offset += 8;
        view.setFloat64(offset, item.position[1], true); offset += 8;
        view.setFloat64(offset, item.position[2], true); offset += 8;
        
        // Dimensions (2 * uint32)
        view.setUint32(offset, item.dimensions[0], true); offset += 4;
        view.setUint32(offset, item.dimensions[1], true); offset += 4;
        
        // Type (uint16)
        view.setUint16(offset, item.type, true); offset += 2;
        
        // BAGUA DESCRIPTOR (uint16) - The Sacred Geometry!
        view.setUint16(offset, item.bagua_descriptor, true); offset += 2;
        
        // Timestamps
        view.setFloat64(offset, item.created_at, true); offset += 8;
        view.setFloat64(offset, item.updated_at, true); offset += 8;
        
        // Content (serialized JSON)
        const contentJson = JSON.stringify(item.content);
        const contentBytes = new TextEncoder().encode(contentJson);
        view.setUint32(offset, contentBytes.length, true); offset += 4;
        new Uint8Array(buffer, offset, contentBytes.length).set(contentBytes);
        offset += contentBytes.length;
      }
      
      return buffer;
    } catch (error) {
      throw new UDError(`Binary serialization failed: ${error}`, 'SERIALIZATION_ERROR');
    }
  }

  /**
   * Load document from binary format
   * @param buffer - Binary data
   * @returns New document instance
   * @throws {UDError} If deserialization fails
   */
  static fromBinary(buffer: ArrayBuffer): UniversalDocumentV2 {
    try {
      const view = new DataView(buffer);
      let offset = 0;
      
      // Verify magic number
      const magic = view.getUint32(offset, true); offset += 4;
      if (magic !== this.UD_MAGIC) {
        throw new UDError(`Invalid magic number: 0x${magic.toString(16)}`, 'INVALID_FORMAT');
      }
      
      // Version
      const version = view.getUint16(offset, true); offset += 2;
      if (version !== this.VERSION) {
        throw new UDError(`Unsupported version: 0x${version.toString(16)}`, 'UNSUPPORTED_VERSION');
      }
      
      // Flags
      const flags = view.getUint16(offset, true); offset += 2;
      
      // Metadata
      const metadataLength = view.getUint32(offset, true); offset += 4;
      const metadataBytes = new Uint8Array(buffer, offset, metadataLength);
      const metadataJson = new TextDecoder().decode(metadataBytes);
      const metadata = JSON.parse(metadataJson);
      offset += metadataLength;
      
      // Create document
      const doc = new UniversalDocumentV2();
      doc.metadata = metadata;
      
      // Items
      const itemCount = view.getUint32(offset, true); offset += 4;
      
      for (let i = 0; i < itemCount; i++) {
        // ID
        const idBytes = new Uint8Array(buffer, offset, 32);
        const idEnd = idBytes.indexOf(0);
        const id = new TextDecoder().decode(idBytes.slice(0, idEnd > -1 ? idEnd : 32));
        offset += 32;
        
        // Position
        const position: [number, number, number] = [
          view.getFloat64(offset, true), 
          view.getFloat64(offset + 8, true), 
          view.getFloat64(offset + 16, true)
        ];
        offset += 24;
        
        // Dimensions
        const dimensions: [number, number] = [
          view.getUint32(offset, true),
          view.getUint32(offset + 4, true)
        ];
        offset += 8;
        
        // Type and Bagua
        const type = view.getUint16(offset, true); offset += 2;
        const bagua_descriptor = view.getUint16(offset, true); offset += 2;
        
        // Timestamps
        const created_at = view.getFloat64(offset, true); offset += 8;
        const updated_at = view.getFloat64(offset, true); offset += 8;
        
        // Content
        const contentLength = view.getUint32(offset, true); offset += 4;
        const contentBytes = new Uint8Array(buffer, offset, contentLength);
        const contentJson = new TextDecoder().decode(contentBytes);
        const content = JSON.parse(contentJson);
        offset += contentLength;
        
        // Add item
        const item: UDItem = {
          id, type, position, dimensions, bagua_descriptor,
          content, created_at, updated_at
        };
        
        doc.items.push(item);
        doc.itemIndex.set(id, item);
        doc.updateBaguaIndex(item);
      }
      
      doc.metadata.item_count = doc.items.length;
      return doc;
    } catch (error) {
      throw new UDError(`Binary deserialization failed: ${error}`, 'DESERIALIZATION_ERROR');
    }
  }

  // ========================================================================
  // PRIVATE UTILITIES
  // ========================================================================

  private validateAddItemOptions(options: AddItemOptions): void {
    if (!options.position || options.position.length !== 3) {
      throw new UDError('Position must be [x, y, z]', 'INVALID_POSITION');
    }
    
    if (!options.dimensions || options.dimensions.length !== 2) {
      throw new UDError('Dimensions must be [width, height]', 'INVALID_DIMENSIONS');
    }
    
    if (!UniversalDocumentV2.isValidItemType(options.type)) {
      throw new UDError(`Invalid item type: ${options.type}`, 'INVALID_ITEM_TYPE');
    }
    
    if (!options.position.every(n => Number.isFinite(n))) {
      throw new UDError('Position values must be finite numbers', 'INVALID_POSITION');
    }
    
    if (!options.dimensions.every(n => Number.isFinite(n) && n > 0)) {
      throw new UDError('Dimensions must be positive finite numbers', 'INVALID_DIMENSIONS');
    }
  }

  private generateId(): string {
    return `ud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateBinarySize(): number {
    let size = 16; // Header
    size += 4 + new TextEncoder().encode(JSON.stringify(this.metadata)).length; // Metadata
    size += 4; // Item count
    
    for (const item of this.items) {
      size += 32; // ID
      size += 24; // Position
      size += 8;  // Dimensions
      size += 4;  // Type + Bagua
      size += 16; // Timestamps
      size += 4 + new TextEncoder().encode(JSON.stringify(item.content)).length; // Content
    }
    
    return size;
  }

  private rebuildIndices(): void {
    this.itemIndex.clear();
    this.baguaIndex.clear();
    
    for (const item of this.items) {
      this.itemIndex.set(item.id, item);
      this.updateBaguaIndex(item);
    }
  }

  private updateBaguaIndex(item: UDItem): void {
    const descriptor = item.bagua_descriptor;
    if (!this.baguaIndex.has(descriptor)) {
      this.baguaIndex.set(descriptor, []);
    }
    this.baguaIndex.get(descriptor)!.push(item);
  }

  private removeBaguaIndex(item: UDItem): void {
    const descriptor = item.bagua_descriptor;
    const items = this.baguaIndex.get(descriptor);
    if (items) {
      const index = items.indexOf(item);
      if (index > -1) {
        items.splice(index, 1);
        if (items.length === 0) {
          this.baguaIndex.delete(descriptor);
        }
      }
    }
  }

  // ========================================================================
  // GETTERS AND STATUS
  // ========================================================================

  get itemCount(): number {
    return this.items.length;
  }

  get modified(): boolean {
    return this.isModified;
  }

  get allItems(): readonly UDItem[] {
    return this.items;
  }

  get canvasBounds() {
    return this.metadata.canvas_bounds;
  }

  get lastErrorMessage(): string | null {
    return this.lastError?.message || null;
  }

  /**
   * Get document statistics
   * @returns Statistics object
   */
  getStatistics(): UDDocumentStatistics {
    const typeStats = new Map<number, number>();
    const baguaStats = new Map<number, number>();
    
    for (const item of this.items) {
      typeStats.set(item.type, (typeStats.get(item.type) || 0) + 1);
      baguaStats.set(item.bagua_descriptor, (baguaStats.get(item.bagua_descriptor) || 0) + 1);
    }
    
    return {
      totalItems: this.items.length,
      typeDistribution: Object.fromEntries(typeStats),
      baguaDistribution: Object.fromEntries(baguaStats),
      interactiveItems: this.queryByBagua({ DUI: true }).length,
      searchableItems: this.queryByBagua({ LI: true }).length,
      activeItems: this.queryByBagua({ TAIJI: true }).length,
      actionableItems: this.queryByBagua({ ZHEN: true }).length,
      linkedItems: this.queryByBagua({ KAN: true }).length,
      databaseItems: this.findDatabases().length,
      isModified: this.isModified,
      createdAt: this.metadata.created_at,
      formatVersion: this.metadata.format_version
    };
  }

  /**
   * Debug information
   * @returns Debug object
   */
  debug(): UDDebugInfo {
    return {
      magic: UniversalDocumentV2.UD_MAGIC.toString(16),
      version: UniversalDocumentV2.VERSION.toString(16),
      itemCount: this.items.length,
      indexSize: this.itemIndex.size,
      baguaIndexSize: this.baguaIndex.size,
      isModified: this.isModified,
      lastError: this.lastError?.message || null,
      memoryUsage: {
        items: this.items.length * 200, // Rough estimate
        indices: this.itemIndex.size * 50,
        metadata: JSON.stringify(this.metadata).length
      }
    };
  }
}

// ========================================================================
// ENHANCED MINIMAP ADAPTER - With Advanced Bagua Visualization
// ========================================================================

export class UDMinimapAdapterV2 {
  constructor(private document: UniversalDocumentV2) {}
  
  /**
   * Generate minimap data with enhanced Bagua visualization
   * @returns Minimap data
   */
  generateMinimapData(): UDMinimapData {
    const items = (this.document as any).items as UDItem[]; // Access private member
    
    const minimapItems = items.map(item => ({
      id: item.id,
      x: item.position[0],
      y: item.position[1],
      z: item.position[2],
      width: item.dimensions[0],
      height: item.dimensions[1],
      type: item.type,
      typeName: UniversalDocumentV2.ITEM_TYPE_NAMES[item.type] || 'Unknown',
      color: this.getBaguaColor(item.bagua_descriptor),
      bagua: {
        descriptor: item.bagua_descriptor,
        matrix: UniversalDocumentV2.renderBaguaMatrix(item.bagua_descriptor),
        traits: UniversalDocumentV2.describeBagua(item.bagua_descriptor),
        isInteractive: !!(item.bagua_descriptor & UniversalDocumentV2.BAGUA.DUI),
        isSearchable: !!(item.bagua_descriptor & UniversalDocumentV2.BAGUA.LI),
        isActive: !!(item.bagua_descriptor & UniversalDocumentV2.BAGUA.TAIJI),
        isActionable: !!(item.bagua_descriptor & UniversalDocumentV2.BAGUA.ZHEN),
        isLinked: !!(item.bagua_descriptor & UniversalDocumentV2.BAGUA.KAN)
      }
    }));
    
    return {
      items: minimapItems,
      bounds: this.calculateBounds(minimapItems),
      statistics: this.document.getStatistics(),
      layers: this.organizeLayers(minimapItems)
    };
  }
  
  private getBaguaColor(descriptor: number): string {
    // Enhanced color coding based on Bagua properties
    if (descriptor & UniversalDocumentV2.BAGUA.TAIJI) return '#FFD700'; // Gold for Active
    if (descriptor & UniversalDocumentV2.BAGUA.ZHEN) return '#FF6347';  // Tomato for Action
    if (descriptor & UniversalDocumentV2.BAGUA.DUI) return '#4682B4';   // Steel Blue for Interactive
    if (descriptor & UniversalDocumentV2.BAGUA.LI) return '#90EE90';    // Light Green for Searchable
    if (descriptor & UniversalDocumentV2.BAGUA.KAN) return '#20B2AA';   // Light Sea Green for Linked
    if (descriptor & UniversalDocumentV2.BAGUA.GEN) return '#8B4513';   // Saddle Brown for Fixed
    if (descriptor & UniversalDocumentV2.BAGUA.XUN) return '#98FB98';   // Pale Green for Dynamic
    if (descriptor & UniversalDocumentV2.BAGUA.KUN) return '#DDA0DD';   // Plum for Container
    if (descriptor & UniversalDocumentV2.BAGUA.QIAN) return '#F0E68C';  // Khaki for Template
    return '#D3D3D3'; // Light Gray for default
  }
  
  private calculateBounds(items: any[]): { minX: number; minY: number; maxX: number; maxY: number } {
    if (items.length === 0) {
      return { minX: 0, minY: 0, maxX: 1000, maxY: 1000 };
    }
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (const item of items) {
      minX = Math.min(minX, item.x);
      minY = Math.min(minY, item.y);
      maxX = Math.max(maxX, item.x + item.width);
      maxY = Math.max(maxY, item.y + item.height);
    }
    
    return { minX, minY, maxX, maxY };
  }
  
  private organizeLayers(items: any[]): any[] {
    const layers = new Map<number, any[]>();
    
    for (const item of items) {
      const z = item.z;
      if (!layers.has(z)) {
        layers.set(z, []);
      }
      layers.get(z)!.push(item);
    }
    
    return Array.from(layers.entries())
      .sort(([a], [b]) => a - b)
      .map(([z, items]) => ({
        z,
        items,
        name: z === 0 ? 'Base Layer' : z > 0 ? `Layer +${z}` : `Layer ${z}`
      }));
  }
}

// ========================================================================
// ERROR HANDLING
// ========================================================================

export class UDError extends Error {
  constructor(message: string, public code: string) {
    super(message);
    this.name = 'UDError';
  }
}

// ========================================================================
// TYPE DEFINITIONS
// ========================================================================

export interface UDItem {
  id: string;
  type: number;
  position: [number, number, number];
  dimensions: [number, number];
  bagua_descriptor: number;
  content: any;
  created_at: number;
  updated_at: number;
}

export interface UDMetadata {
  format_version: string;
  creator: string;
  created_at: string;
  canvas_bounds: { x: number; y: number; width: number; height: number };
  item_count: number;
  compression: string;
  encryption: string;
  capabilities: string[];
}

export interface UDDocumentOptions {
  creator?: string;
  canvasBounds?: { x: number; y: number; width: number; height: number };
  compression?: string;
  encryption?: string;
}

export interface AddItemOptions {
  position: [number, number, number];
  dimensions: [number, number];
  type: number;
  content: any;
  bagua?: number;
}

export interface UDDocumentStatistics {
  totalItems: number;
  typeDistribution: Record<number, number>;
  baguaDistribution: Record<number, number>;
  interactiveItems: number;
  searchableItems: number;
  activeItems: number;
  actionableItems: number;
  linkedItems: number;
  databaseItems: number;
  isModified: boolean;
  createdAt: string;
  formatVersion: string;
}

export interface UDDebugInfo {
  magic: string;
  version: string;
  itemCount: number;
  indexSize: number;
  baguaIndexSize: number;
  isModified: boolean;
  lastError: string | null;
  memoryUsage: {
    items: number;
    indices: number;
    metadata: number;
  };
}

export interface UDMinimapData {
  items: any[];
  bounds: any;
  statistics: UDDocumentStatistics;
  layers: any[];
}

// ========================================================================
// EXPORTS FOR EASY USAGE
// ========================================================================

export const UDDocument = UniversalDocumentV2;
export const UDMinimap = UDMinimapAdapterV2;

export const BaguaUtilsV2 = {
  renderMatrix: UniversalDocumentV2.renderBaguaMatrix,
  getDefault: UniversalDocumentV2.getDefaultBagua,
  describe: UniversalDocumentV2.describeBagua,
  validate: UniversalDocumentV2.isValidBagua,
  names: UniversalDocumentV2.BAGUA_NAMES,
  flags: UniversalDocumentV2.BAGUA,
  itemTypes: UniversalDocumentV2.ItemType,
  itemTypeNames: UniversalDocumentV2.ITEM_TYPE_NAMES
};

export default UniversalDocumentV2;