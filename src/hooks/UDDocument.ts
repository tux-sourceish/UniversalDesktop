// 🌌 UniversalDocument Core Implementation
// Binary-Text Hybrid with Bagua-Based Metadata Processing
// Version: 1.0 | Created: 2025-07-17

import { 
  UDHeader, 
  UDItem, 
  UDContentBlock, 
  UDMetadata, 
  BaguaDescriptor, 
  BaguaUtils, 
  BaguaPresets,
  UDItemType,
  TYPE_REGISTRY,
  UD_CONSTANTS 
} from './UDFormat';

// ============================================================================
// CORE DOCUMENT CLASS
// ============================================================================

export class UDDocument {
  private header: UDHeader;
  private items: Map<string, UDItem>;
  private contentBlocks: Map<string, UDContentBlock>;
  private metadata: UDMetadata;
  private modified: boolean = false;

  constructor() {
    this.header = this.createDefaultHeader();
    this.items = new Map();
    this.contentBlocks = new Map();
    this.metadata = this.createDefaultMetadata();
  }

  // ========================================================================
  // CREATION AND INITIALIZATION
  // ========================================================================

  private createDefaultHeader(): UDHeader {
    const now = Date.now();
    return {
      magic: UD_CONSTANTS.MAGIC_NUMBER,
      version: UD_CONSTANTS.VERSION,
      flags: 0x0001, // Compressed flag
      itemCount: 0,
      fileSize: 0,
      checksum: 0,
      created: now,
      modified: now
    };
  }

  private createDefaultMetadata(): UDMetadata {
    return {
      formatVersion: "1.0",
      creator: "UniversalDesktop",
      createdAt: new Date().toISOString(),
      canvasBounds: { x: -2000, y: -2000, width: 4000, height: 4000 },
      itemCount: 0,
      compression: "lz4",
      encryption: "none",
      capabilities: ["multi_layer", "ai_enhanced", "bagua_metadata"]
    };
  }

  // ========================================================================
  // ITEM MANAGEMENT
  // ========================================================================

  addItem(config: {
    id?: string;
    position: [number, number, number];
    dimensions: [number, number];
    type: UDItemType;
    bagua?: BaguaDescriptor;
    content: string | Uint8Array;
  }): string {
    const id = config.id || this.generateId();
    const bagua = config.bagua || this.getDefaultBaguaForType(config.type);
    
    const item: UDItem = {
      id,
      position: config.position,
      dimensions: config.dimensions,
      timestamp: Date.now(),
      typeIndex: config.type,
      bagua,
      contentOffset: 0, // Will be calculated during serialization
      contentSize: 0    // Will be calculated during serialization
    };

    const contentBlock = this.createContentBlock(config.content, config.type);
    
    this.items.set(id, item);
    this.contentBlocks.set(id, contentBlock);
    this.modified = true;
    
    this.updateMetadata();
    return id;
  }

  getItem(id: string): UDItem | undefined {
    return this.items.get(id);
  }

  removeItem(id: string): boolean {
    const deleted = this.items.delete(id) && this.contentBlocks.delete(id);
    if (deleted) {
      this.modified = true;
      this.updateMetadata();
    }
    return deleted;
  }

  updateItem(id: string, updates: Partial<{
    position: [number, number, number];
    dimensions: [number, number];
    bagua: BaguaDescriptor;
    content: string | Uint8Array;
  }>): boolean {
    const item = this.items.get(id);
    if (!item) return false;

    const updatedItem: UDItem = {
      ...item,
      ...updates,
      timestamp: Date.now()
    };

    this.items.set(id, updatedItem);

    if (updates.content !== undefined) {
      const contentBlock = this.createContentBlock(
        updates.content, 
        item.typeIndex as UDItemType
      );
      this.contentBlocks.set(id, contentBlock);
    }

    this.modified = true;
    return true;
  }

  // ========================================================================
  // BAGUA-BASED QUERYING
  // ========================================================================

  // Find items by Bagua properties
  queryByBagua(selector: {
    qian?: boolean;
    dui?: boolean;
    kun?: boolean;
    li?: boolean;
    xun?: boolean;
    zhen?: boolean;
    gen?: boolean;
    kan?: boolean;
    taiji?: boolean;
  }): UDItem[] {
    const results: UDItem[] = [];
    
    for (const item of this.items.values()) {
      let matches = true;
      
      if (selector.qian !== undefined && item.bagua.qian !== selector.qian) matches = false;
      if (selector.dui !== undefined && item.bagua.dui !== selector.dui) matches = false;
      if (selector.kun !== undefined && item.bagua.kun !== selector.kun) matches = false;
      if (selector.li !== undefined && item.bagua.li !== selector.li) matches = false;
      if (selector.xun !== undefined && item.bagua.xun !== selector.xun) matches = false;
      if (selector.zhen !== undefined && item.bagua.zhen !== selector.zhen) matches = false;
      if (selector.gen !== undefined && item.bagua.gen !== selector.gen) matches = false;
      if (selector.kan !== undefined && item.bagua.kan !== selector.kan) matches = false;
      if (selector.taiji !== undefined && item.bagua.taiji !== selector.taiji) matches = false;
      
      if (matches) results.push(item);
    }
    
    return results;
  }

  // Find all interactive elements
  getInteractiveItems(): UDItem[] {
    return this.queryByBagua({ dui: true });
  }

  // Find all searchable elements
  getSearchableItems(): UDItem[] {
    return this.queryByBagua({ li: true });
  }

  // Find all active elements
  getActiveItems(): UDItem[] {
    return this.queryByBagua({ taiji: true });
  }

  // Find all actionable elements
  getActionableItems(): UDItem[] {
    return this.queryByBagua({ zhen: true });
  }

  // ========================================================================
  // SPATIAL QUERYING
  // ========================================================================

  findByPosition(bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): UDItem[] {
    const results: UDItem[] = [];
    
    for (const item of this.items.values()) {
      const [x, y] = item.position;
      const [width, height] = item.dimensions;
      
      // Check if item intersects with bounds
      if (
        x < bounds.x + bounds.width &&
        x + width > bounds.x &&
        y < bounds.y + bounds.height &&
        y + height > bounds.y
      ) {
        results.push(item);
      }
    }
    
    return results;
  }

  findByType(type: UDItemType): UDItem[] {
    return Array.from(this.items.values()).filter(item => item.typeIndex === type);
  }

  // ========================================================================
  // CONTENT OPERATIONS
  // ========================================================================

  getContent(id: string): string | Uint8Array | undefined {
    const contentBlock = this.contentBlocks.get(id);
    if (!contentBlock) return undefined;
    
    // TODO: Implement decompression based on contentBlock.compression
    return this.decodeContent(contentBlock);
  }

  setContent(id: string, content: string | Uint8Array): boolean {
    const item = this.items.get(id);
    if (!item) return false;
    
    const contentBlock = this.createContentBlock(content, item.typeIndex as UDItemType);
    this.contentBlocks.set(id, contentBlock);
    this.modified = true;
    
    return true;
  }

  // ========================================================================
  // SERIALIZATION SUPPORT
  // ========================================================================

  private createContentBlock(content: string | Uint8Array, type: UDItemType): UDContentBlock {
    const encoding = typeof content === 'string' ? 'utf8' : 'binary';
    const data = typeof content === 'string' 
      ? new TextEncoder().encode(content)
      : content;
    
    return {
      magic: this.getContentMagic(type),
      compression: UD_CONSTANTS.DEFAULT_COMPRESSION,
      encoding,
      data
    };
  }

  private getContentMagic(type: UDItemType): number {
    switch (type) {
      case UDItemType.TABELLE:
        return UD_CONSTANTS.CONTENT_MAGIC.TABLE;
      case UDItemType.MEDIA:
        return UD_CONSTANTS.CONTENT_MAGIC.MEDIA;
      case UDItemType.CODE:
      case UDItemType.TUI:
        return UD_CONSTANTS.CONTENT_MAGIC.BINARY;
      default:
        return UD_CONSTANTS.CONTENT_MAGIC.TEXT;
    }
  }

  private decodeContent(contentBlock: UDContentBlock): string | Uint8Array {
    // TODO: Implement proper decompression
    if (contentBlock.encoding === 'utf8') {
      return new TextDecoder().decode(contentBlock.data);
    }
    return contentBlock.data;
  }

  private getDefaultBaguaForType(type: UDItemType): BaguaDescriptor {
    switch (type) {
      case UDItemType.NOTIZZETTEL:
        return BaguaPresets.NOTE;
      case UDItemType.CODE:
        return BaguaUtils.createDescriptor({
          kun: true,   // Data container
          li: true,    // Searchable
          gen: true,   // Fixed formatting
          taiji: true  // Active
        });
      case UDItemType.TUI:
        return BaguaUtils.createDescriptor({
          dui: true,   // Interactive
          zhen: true,  // Has actions
          gen: true,   // Fixed size
          taiji: true  // Active
        });
      case UDItemType.BROWSER:
        return BaguaUtils.createDescriptor({
          dui: true,   // Interactive
          kan: true,   // Linked
          xun: true,   // Dynamic
          taiji: true  // Active
        });
      case UDItemType.MEDIA:
        return BaguaUtils.createDescriptor({
          kun: true,   // Data container
          gen: true,   // Fixed size
          taiji: true  // Active
        });
      case UDItemType.DATABASE:
        return BaguaUtils.createDescriptor({
          kun: true,   // Data container (vector storage)
          li: true,    // Searchable (semantic search)
          kan: true,   // Linked (hyperdimensional connections)
          xun: true,   // Dynamic (adaptive indexing)
          taiji: true  // Active
        });
      default:
        return BaguaPresets.NOTE;
    }
  }

  private generateId(): string {
    return `ud_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateMetadata(): void {
    this.metadata = {
      ...this.metadata,
      itemCount: this.items.size,
      createdAt: new Date().toISOString()
    };
  }

  // ========================================================================
  // EXPORT FUNCTIONS
  // ========================================================================

  // Export to JSON for debugging/interchange
  exportToJSON(): any {
    return {
      header: this.header,
      metadata: this.metadata,
      items: Array.from(this.items.entries()).map(([id, item]) => ({
        id,
        ...item,
        baguaDescription: BaguaUtils.describeDescriptor(item.bagua),
        baguaMatrix: BaguaUtils.renderMatrix(item.bagua),
        content: this.getContent(id)
      }))
    };
  }

  // Export to traditional file system structure
  exportToFileSystem(): { [path: string]: string } {
    const result: { [path: string]: string } = {};
    
    for (const [id, item] of this.items) {
      const content = this.getContent(id);
      const typeName = TYPE_REGISTRY[item.typeIndex as UDItemType];
      const fileName = `${id}.${typeName}`;
      
      if (typeof content === 'string') {
        result[fileName] = content;
      } else if (content instanceof Uint8Array) {
        result[fileName] = `[Binary data: ${content.length} bytes]`;
      }
    }
    
    return result;
  }

  // ========================================================================
  // DEBUG AND INSPECTION
  // ========================================================================

  inspect(): void {
    console.log("🌌 UniversalDocument Inspection");
    console.log("================================");
    console.log(`Items: ${this.items.size}`);
    console.log(`Modified: ${this.modified}`);
    console.log(`Canvas: ${this.metadata.canvasBounds.width}x${this.metadata.canvasBounds.height}`);
    
    for (const [id, item] of this.items) {
      console.log(`\n📄 Item: ${id}`);
      console.log(`  Type: ${TYPE_REGISTRY[item.typeIndex as UDItemType]}`);
      console.log(`  Position: [${item.position.join(', ')}]`);
      console.log(`  Dimensions: [${item.dimensions.join(', ')}]`);
      console.log(`  Bagua: ${BaguaUtils.describeDescriptor(item.bagua)}`);
      console.log(`  Matrix:\n${BaguaUtils.renderMatrix(item.bagua).split('\n').map(line => '    ' + line).join('\n')}`);
    }
  }

  // ========================================================================
  // GETTERS
  // ========================================================================

  get itemCount(): number {
    return this.items.size;
  }

  get isModified(): boolean {
    return this.modified;
  }

  get allItems(): UDItem[] {
    return Array.from(this.items.values());
  }

  get canvasBounds() {
    return this.metadata.canvasBounds;
  }
}

export default UDDocument;