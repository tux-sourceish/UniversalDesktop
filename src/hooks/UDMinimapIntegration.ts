// 🗺️ UniversalDocument Minimap Integration
// Hyperdimensional Vector Database Visualization
// Version: 1.0 | Created: 2025-07-17

import UDDocument from './UDDocument';
import { UDItem, UDItemType, BaguaUtils } from './UDFormat';

// ============================================================================
// MINIMAP INTEGRATION INTERFACES
// ============================================================================

export interface MinimapItem {
  id: string;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  type: UDItemType;
  bagua: number;
  color: string;
  opacity: number;
  isActive: boolean;
  isInteractive: boolean;
  hasActions: boolean;
  isLinked: boolean;
  connections: string[];
}

export interface MinimapBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
}

export interface MinimapLayer {
  z: number;
  items: MinimapItem[];
  visible: boolean;
  name: string;
}

// ============================================================================
// MINIMAP ADAPTER CLASS
// ============================================================================

export class UDMinimapAdapter {
  private document: UDDocument;
  private colorPalette: Record<UDItemType, string>;
  private dimensionScale: number = 1.0;

  constructor(document: UDDocument) {
    this.document = document;
    this.colorPalette = this.initializeColorPalette();
  }

  // ========================================================================
  // MINIMAP DATA GENERATION
  // ========================================================================

  generateMinimapData(): {
    items: MinimapItem[];
    bounds: MinimapBounds;
    layers: MinimapLayer[];
    connections: Array<{ from: string; to: string; type: string }>;
  } {
    const items = this.document.allItems;
    const minimapItems = items.map(item => this.convertToMinimapItem(item));
    
    return {
      items: minimapItems,
      bounds: this.calculateBounds(minimapItems),
      layers: this.organizeLayers(minimapItems),
      connections: this.generateConnections(items)
    };
  }

  // ========================================================================
  // ITEM CONVERSION
  // ========================================================================

  private convertToMinimapItem(item: UDItem): MinimapItem {
    const typeColor = this.getTypeColor(item.typeIndex as UDItemType);
    const baguaColor = this.getBaguaColor(item.bagua);
    const finalColor = this.blendColors(typeColor, baguaColor);
    
    return {
      id: item.id,
      x: item.position[0],
      y: item.position[1],
      z: item.position[2],
      width: item.dimensions[0],
      height: item.dimensions[1],
      type: item.typeIndex as UDItemType,
      bagua: item.bagua.raw,
      color: finalColor,
      opacity: item.bagua.taiji ? 1.0 : 0.6, // Active items are more opaque
      isActive: item.bagua.taiji,
      isInteractive: item.bagua.dui,
      hasActions: item.bagua.zhen,
      isLinked: item.bagua.kan,
      connections: this.findConnections(item.id)
    };
  }

  // ========================================================================
  // DIMENSIONAL SCALING
  // ========================================================================

  setDimensionScale(scale: number): void {
    this.dimensionScale = Math.max(0.1, Math.min(10.0, scale));
  }

  scalePosition(x: number, y: number): [number, number] {
    return [x * this.dimensionScale, y * this.dimensionScale];
  }

  scaleDimensions(width: number, height: number): [number, number] {
    return [width * this.dimensionScale, height * this.dimensionScale];
  }

  // ========================================================================
  // LAYER ORGANIZATION
  // ========================================================================

  private organizeLayers(items: MinimapItem[]): MinimapLayer[] {
    const layerMap = new Map<number, MinimapItem[]>();
    
    for (const item of items) {
      const z = item.z;
      if (!layerMap.has(z)) {
        layerMap.set(z, []);
      }
      layerMap.get(z)!.push(item);
    }
    
    const layers: MinimapLayer[] = [];
    const sortedZLevels = Array.from(layerMap.keys()).sort((a, b) => a - b);
    
    for (const z of sortedZLevels) {
      layers.push({
        z,
        items: layerMap.get(z)!,
        visible: true,
        name: this.getLayerName(z)
      });
    }
    
    return layers;
  }

  private getLayerName(z: number): string {
    if (z === 0) return "Base Layer";
    if (z > 0) return `Layer +${z}`;
    return `Layer ${z}`;
  }

  // ========================================================================
  // COLOR MANAGEMENT
  // ========================================================================

  private initializeColorPalette(): Record<UDItemType, string> {
    return {
      [UDItemType.NOTIZZETTEL]: "#FFE4B5",    // Moccasin - warm note color
      [UDItemType.TABELLE]: "#E0FFFF",        // Light cyan - structured data
      [UDItemType.CODE]: "#F0F8FF",           // Alice blue - clean code
      [UDItemType.TUI]: "#2F4F4F",            // Dark slate gray - terminal
      [UDItemType.BROWSER]: "#F0F8FF",        // Alice blue - web content
      [UDItemType.MEDIA]: "#FFB6C1",          // Light pink - media files
      [UDItemType.CHART]: "#98FB98",          // Pale green - data visualization
      [UDItemType.CALENDAR]: "#FFFFE0",       // Light yellow - time-based
      [UDItemType.AI_GENERATED]: "#DDA0DD",   // Plum - AI content
      [UDItemType.DATABASE]: "#FF6347"        // Tomato - vector databases
    };
  }

  private getTypeColor(type: UDItemType): string {
    return this.colorPalette[type] || "#CCCCCC";
  }

  private getBaguaColor(bagua: any): string {
    // Generate color based on Bagua properties
    let r = 128, g = 128, b = 128;
    
    // Active elements get more vibrant colors
    if (bagua.taiji) {
      r += 60; g += 60; b += 60;
    }
    
    // Interactive elements get blue tint
    if (bagua.dui) {
      b += 40;
    }
    
    // Actionable elements get red tint
    if (bagua.zhen) {
      r += 40;
    }
    
    // Linked elements get green tint
    if (bagua.kan) {
      g += 40;
    }
    
    // Searchable elements get yellow tint
    if (bagua.li) {
      r += 20; g += 20;
    }
    
    // Clamp values
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    
    return `rgb(${r},${g},${b})`;
  }

  private blendColors(color1: string, color2: string): string {
    // Simple color blending - in practice, you'd use a proper color library
    return color1; // For now, just return the type color
  }

  // ========================================================================
  // CONNECTION ANALYSIS
  // ========================================================================

  private generateConnections(items: UDItem[]): Array<{ from: string; to: string; type: string }> {
    const connections: Array<{ from: string; to: string; type: string }> = [];
    
    for (const item of items) {
      if (item.bagua.kan) { // Linked items
        const itemConnections = this.findConnections(item.id);
        for (const targetId of itemConnections) {
          connections.push({
            from: item.id,
            to: targetId,
            type: this.getConnectionType(item, targetId)
          });
        }
      }
    }
    
    return connections;
  }

  private findConnections(itemId: string): string[] {
    // TODO: Implement actual connection finding logic
    // This would analyze content for references, links, etc.
    return [];
  }

  private getConnectionType(item: UDItem, targetId: string): string {
    // Determine connection type based on item types and content
    if (item.typeIndex === UDItemType.DATABASE) {
      return "vector_similarity";
    }
    
    if (item.bagua.zhen) {
      return "action_trigger";
    }
    
    return "reference";
  }

  // ========================================================================
  // BOUNDS CALCULATION
  // ========================================================================

  private calculateBounds(items: MinimapItem[]): MinimapBounds {
    if (items.length === 0) {
      return {
        minX: 0, minY: 0, maxX: 1000, maxY: 1000,
        width: 1000, height: 1000
      };
    }
    
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;
    
    for (const item of items) {
      minX = Math.min(minX, item.x);
      minY = Math.min(minY, item.y);
      maxX = Math.max(maxX, item.x + item.width);
      maxY = Math.max(maxY, item.y + item.height);
    }
    
    // Add padding
    const padding = 50;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;
    
    return {
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX,
      height: maxY - minY
    };
  }

  // ========================================================================
  // HYPERDIMENSIONAL DATABASE QUERIES
  // ========================================================================

  getDatabaseItems(): MinimapItem[] {
    return this.generateMinimapData().items.filter(
      item => item.type === UDItemType.DATABASE
    );
  }

  getVectorSimilarityMap(itemId: string): Array<{ id: string; similarity: number }> {
    // TODO: Implement vector similarity calculation
    // This would use the embedded vectors from the DATABASE items
    return [];
  }

  getSemanticClusters(): Array<{ 
    center: [number, number]; 
    radius: number; 
    items: string[];
    topic: string; 
  }> {
    // TODO: Implement semantic clustering
    // This would group related items based on content similarity
    return [];
  }

  // ========================================================================
  // MINIMAP INTERACTION
  // ========================================================================

  getItemsInViewport(viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): MinimapItem[] {
    const items = this.generateMinimapData().items;
    
    return items.filter(item => {
      return (
        item.x < viewport.x + viewport.width &&
        item.x + item.width > viewport.x &&
        item.y < viewport.y + viewport.height &&
        item.y + item.height > viewport.y
      );
    });
  }

  getItemAt(x: number, y: number): MinimapItem | null {
    const items = this.generateMinimapData().items;
    
    // Check from top layer to bottom
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (
        x >= item.x && x <= item.x + item.width &&
        y >= item.y && y <= item.y + item.height
      ) {
        return item;
      }
    }
    
    return null;
  }

  // ========================================================================
  // EXPORT FOR MINIMAP COMPONENTS
  // ========================================================================

  exportForReactComponent(): any {
    const data = this.generateMinimapData();
    
    return {
      ...data,
      config: {
        scale: this.dimensionScale,
        colorPalette: this.colorPalette,
        showConnections: true,
        showBaguaMatrix: true,
        enableVectorVisualization: true
      }
    };
  }

  exportForCanvasRenderer(): any {
    const data = this.generateMinimapData();
    
    return {
      items: data.items.map(item => ({
        ...item,
        scaledX: item.x * this.dimensionScale,
        scaledY: item.y * this.dimensionScale,
        scaledWidth: item.width * this.dimensionScale,
        scaledHeight: item.height * this.dimensionScale
      })),
      bounds: data.bounds,
      layers: data.layers,
      connections: data.connections
    };
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const MinimapUtils = {
  // Convert screen coordinates to world coordinates
  screenToWorld(screenX: number, screenY: number, viewport: any): [number, number] {
    return [
      (screenX - viewport.offsetX) / viewport.scale,
      (screenY - viewport.offsetY) / viewport.scale
    ];
  },

  // Convert world coordinates to screen coordinates
  worldToScreen(worldX: number, worldY: number, viewport: any): [number, number] {
    return [
      worldX * viewport.scale + viewport.offsetX,
      worldY * viewport.scale + viewport.offsetY
    ];
  },

  // Calculate optimal zoom level for given bounds
  calculateOptimalZoom(bounds: MinimapBounds, containerSize: { width: number; height: number }): number {
    const scaleX = containerSize.width / bounds.width;
    const scaleY = containerSize.height / bounds.height;
    return Math.min(scaleX, scaleY) * 0.9; // 90% to leave some padding
  }
};

export default UDMinimapAdapter;