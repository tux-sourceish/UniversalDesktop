// Intelligent Window Sizing Service
// Calculates optimal window dimensions based on content type and data

interface Position {
  x: number;
  y: number;
  z: number;
}

interface WindowDimensions {
  width: number;
  height: number;
  position: Position;
  reason: string; // Debug info why these dimensions were chosen
}

interface ViewportInfo {
  width: number;
  height: number;
  canvasPosition: Position;
  canvasScale: number;
}

class WindowSizingService {
  private static instance: WindowSizingService;
  private minWidth = 200;
  private minHeight = 150;
  private maxWidth = 1200;
  private maxHeight = 800;
  private padding = 20;

  private constructor() {}

  static getInstance(): WindowSizingService {
    if (!WindowSizingService.instance) {
      WindowSizingService.instance = new WindowSizingService();
    }
    return WindowSizingService.instance;
  }

  /**
   * Calculate optimal window dimensions based on content type and data
   */
  calculateOptimalSize(
    type: string,
    content: any,
    requestPosition: Position,
    viewport: ViewportInfo,
    existingWindows: Array<{ position: Position; width: number; height: number; id: string }>
  ): WindowDimensions {
    let dimensions: WindowDimensions;

    switch (type) {
      case 'notizzettel':
        dimensions = this.calculateTextSize(content, requestPosition);
        break;
      case 'tabelle':
        dimensions = this.calculateTableSize(content, requestPosition);
        break;
      case 'code':
        dimensions = this.calculateCodeSize(content, requestPosition);
        break;
      case 'tui':
        dimensions = this.calculateTUISize(content, requestPosition);
        break;
      case 'terminal':
        dimensions = this.calculateTerminalSize(content, requestPosition);
        break;
      case 'browser':
        dimensions = this.calculateBrowserSize(content, requestPosition);
        break;
      case 'media':
        dimensions = this.calculateMediaSize(content, requestPosition);
        break;
      case 'chart':
        dimensions = this.calculateChartSize(content, requestPosition);
        break;
      case 'calendar':
        dimensions = this.calculateCalendarSize(content, requestPosition);
        break;
      default:
        dimensions = this.calculateDefaultSize(content, requestPosition);
    }

    // Apply size constraints
    dimensions.width = Math.max(this.minWidth, Math.min(this.maxWidth, dimensions.width));
    dimensions.height = Math.max(this.minHeight, Math.min(this.maxHeight, dimensions.height));

    // Apply viewport constraints
    dimensions = this.applyViewportConstraints(dimensions, viewport);

    // Avoid collisions with existing windows
    dimensions = this.avoidCollisions(dimensions, existingWindows);

    return dimensions;
  }

  /**
   * Calculate size for text content (Notizzettel)
   */
  private calculateTextSize(content: any, requestPosition: Position): WindowDimensions {
    const text = typeof content === 'string' ? content : '';
    const isEmpty = !text || text.trim().length === 0;
    
    if (isEmpty) {
      return {
        width: 350,
        height: 200,
        position: requestPosition,
        reason: 'Empty text - default note size'
      };
    }

    // Analyze text properties
    const lines = text.split('\n');
    const totalLines = lines.length;
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / totalLines;
    const maxLineLength = Math.max(...lines.map(line => line.length));
    const wordCount = text.trim().split(/\s+/).length;

    // Calculate dimensions based on content
    const charWidth = 8; // Average character width in pixels
    const lineHeight = 20; // Line height in pixels
    const headerHeight = 60; // Header + toolbar height
    const footerHeight = 40; // Status bar height

    // Width calculation
    let optimalWidth = Math.max(
      300, // Minimum readable width
      Math.min(maxLineLength * charWidth + 60, 800), // Based on longest line
      avgLineLength * charWidth + 40 // Based on average line length
    );

    // Height calculation
    let optimalHeight = Math.max(
      150, // Minimum height
      Math.min(totalLines * lineHeight + headerHeight + footerHeight, 600) // Based on line count
    );

    // Adjust for content density
    if (wordCount > 500) {
      optimalWidth = Math.min(optimalWidth * 1.2, 900);
      optimalHeight = Math.min(optimalHeight * 1.1, 700);
    }

    return {
      width: Math.round(optimalWidth),
      height: Math.round(optimalHeight),
      position: requestPosition,
      reason: `Text: ${totalLines} lines, ${wordCount} words, max line: ${maxLineLength} chars`
    };
  }

  /**
   * Calculate size for table content
   */
  private calculateTableSize(content: any, requestPosition: Position): WindowDimensions {
    if (!Array.isArray(content) || content.length === 0) {
      return {
        width: 400,
        height: 300,
        position: requestPosition,
        reason: 'Empty table - default size'
      };
    }

    const rows = content.length;
    const cols = content[0]?.length || 0;
    
    // Calculate cell dimensions
    const minCellWidth = 80;
    const maxCellWidth = 150;
    const cellHeight = 35;
    const headerHeight = 100; // Toolbar + header
    const footerHeight = 40; // Status bar

    // Analyze cell content to determine optimal width
    let maxContentWidth = minCellWidth;
    for (const row of content) {
      for (const cell of row) {
        const cellContent = String(cell || '');
        const contentWidth = Math.min(cellContent.length * 8 + 20, maxCellWidth);
        maxContentWidth = Math.max(maxContentWidth, contentWidth);
      }
    }

    const optimalWidth = Math.max(
      400, // Minimum table width
      Math.min(cols * maxContentWidth + 100, 1000) // Based on columns
    );

    const optimalHeight = Math.max(
      250, // Minimum table height
      Math.min(rows * cellHeight + headerHeight + footerHeight, 600) // Based on rows
    );

    return {
      width: Math.round(optimalWidth),
      height: Math.round(optimalHeight),
      position: requestPosition,
      reason: `Table: ${rows} rows × ${cols} columns, cell width: ${maxContentWidth}px`
    };
  }

  /**
   * Calculate size for code content
   */
  private calculateCodeSize(content: any, requestPosition: Position): WindowDimensions {
    const code = typeof content === 'string' ? content : '';
    const isEmpty = !code || code.trim().length === 0;
    
    if (isEmpty) {
      return {
        width: 600,
        height: 400,
        position: requestPosition,
        reason: 'Empty code - default code editor size'
      };
    }

    const lines = code.split('\n');
    const totalLines = lines.length;
    const maxLineLength = Math.max(...lines.map(line => line.length));
    
    // Code editor specific calculations
    const charWidth = 7; // Monospace character width
    const lineHeight = 18; // Code line height
    const headerHeight = 60;
    const footerHeight = 30;

    const optimalWidth = Math.max(
      500, // Minimum code editor width
      Math.min(maxLineLength * charWidth + 100, 1000) // Based on longest line + scrollbar
    );

    const optimalHeight = Math.max(
      300, // Minimum code editor height
      Math.min(totalLines * lineHeight + headerHeight + footerHeight, 700) // Based on line count
    );

    return {
      width: Math.round(optimalWidth),
      height: Math.round(optimalHeight),
      position: requestPosition,
      reason: `Code: ${totalLines} lines, max line: ${maxLineLength} chars`
    };
  }

  /**
   * Calculate size for TUI content
   */
  private calculateTUISize(content: any, requestPosition: Position): WindowDimensions {
    const tuiContent = typeof content === 'string' ? content : '';
    
    if (!tuiContent || tuiContent.trim().length === 0) {
      return {
        width: 650,
        height: 400,
        position: requestPosition,
        reason: 'Empty TUI - default terminal size'
      };
    }

    // TUI has fixed character dimensions
    const defaultWidth = 80;
    const defaultHeight = 25;
    const charWidth = 8;
    const lineHeight = 16;
    const headerHeight = 80; // TUI header with controls
    const footerHeight = 40; // Status bar

    // Try to detect TUI dimensions from content
    const lines = tuiContent.split('\n');
    const detectedWidth = Math.max(...lines.map(line => line.length));
    const detectedHeight = lines.length;

    const tuiWidth = Math.max(defaultWidth, Math.min(detectedWidth, 120));
    const tuiHeight = Math.max(defaultHeight, Math.min(detectedHeight, 50));

    const optimalWidth = tuiWidth * charWidth + 40;
    const optimalHeight = tuiHeight * lineHeight + headerHeight + footerHeight;

    return {
      width: Math.round(optimalWidth),
      height: Math.round(optimalHeight),
      position: requestPosition,
      reason: `TUI: ${tuiWidth}×${tuiHeight} characters, ${lines.length} lines`
    };
  }

  /**
   * Calculate size for terminal content
   */
  private calculateTerminalSize(_content: any, requestPosition: Position): WindowDimensions {
    // Terminal has standard dimensions
    return {
      width: 800,
      height: 500,
      position: requestPosition,
      reason: 'Terminal - standard 80×25 terminal size'
    };
  }

  /**
   * Calculate size for browser content
   */
  private calculateBrowserSize(_content: any, requestPosition: Position): WindowDimensions {
    // Browser windows should be large enough for web content
    return {
      width: 900,
      height: 600,
      position: requestPosition,
      reason: 'Browser - standard web content size'
    };
  }

  /**
   * Calculate size for media content
   */
  private calculateMediaSize(_content: any, requestPosition: Position): WindowDimensions {
    // Media windows adapt to content or use standard video size
    return {
      width: 640,
      height: 480,
      position: requestPosition,
      reason: 'Media - standard video dimensions (4:3 ratio)'
    };
  }

  /**
   * Calculate size for chart content
   */
  private calculateChartSize(_content: any, requestPosition: Position): WindowDimensions {
    // Charts need enough space for proper visualization
    return {
      width: 600,
      height: 400,
      position: requestPosition,
      reason: 'Chart - optimal chart visualization size'
    };
  }

  /**
   * Calculate size for calendar content
   */
  private calculateCalendarSize(_content: any, requestPosition: Position): WindowDimensions {
    // Calendar has standard month view dimensions
    return {
      width: 500,
      height: 400,
      position: requestPosition,
      reason: 'Calendar - standard month view size'
    };
  }

  /**
   * Calculate default size for unknown content types
   */
  private calculateDefaultSize(_content: any, requestPosition: Position): WindowDimensions {
    return {
      width: 350,
      height: 250,
      position: requestPosition,
      reason: 'Default - unknown content type'
    };
  }

  /**
   * Apply viewport constraints to ensure window is visible
   */
  private applyViewportConstraints(dimensions: WindowDimensions, viewport: ViewportInfo): WindowDimensions {
    const { width, height, canvasPosition, canvasScale } = viewport;
    
    // Calculate visible area in canvas coordinates
    const visibleLeft = -canvasPosition.x / canvasScale;
    const visibleTop = -canvasPosition.y / canvasScale;
    const visibleRight = visibleLeft + width / canvasScale;
    const visibleBottom = visibleTop + height / canvasScale;

    // Constrain window dimensions to fit in viewport
    const constrainedWidth = Math.min(dimensions.width, (width * 0.9) / canvasScale);
    const constrainedHeight = Math.min(dimensions.height, (height * 0.9) / canvasScale);

    // Adjust position to keep window visible
    let adjustedX = dimensions.position.x;
    let adjustedY = dimensions.position.y;

    // Keep window within visible bounds
    if (adjustedX + constrainedWidth > visibleRight) {
      adjustedX = visibleRight - constrainedWidth - this.padding;
    }
    if (adjustedX < visibleLeft) {
      adjustedX = visibleLeft + this.padding;
    }
    if (adjustedY + constrainedHeight > visibleBottom) {
      adjustedY = visibleBottom - constrainedHeight - this.padding;
    }
    if (adjustedY < visibleTop) {
      adjustedY = visibleTop + this.padding;
    }

    return {
      width: Math.round(constrainedWidth),
      height: Math.round(constrainedHeight),
      position: {
        x: Math.round(adjustedX),
        y: Math.round(adjustedY),
        z: dimensions.position.z
      },
      reason: `${dimensions.reason} + viewport constraints`
    };
  }

  /**
   * Avoid collisions with existing windows
   */
  private avoidCollisions(
    dimensions: WindowDimensions,
    existingWindows: Array<{ position: Position; width: number; height: number; id: string }>
  ): WindowDimensions {
    if (existingWindows.length === 0) {
      return dimensions;
    }

    let { position } = dimensions;
    let attempts = 0;
    const maxAttempts = 10;
    const offsetStep = 30;

    while (attempts < maxAttempts) {
      let hasCollision = false;

      for (const window of existingWindows) {
        if (this.isColliding(position, dimensions, window)) {
          hasCollision = true;
          break;
        }
      }

      if (!hasCollision) {
        break;
      }

      // Try different positions
      const angle = (attempts * 45) % 360;
      const offsetX = Math.cos(angle * Math.PI / 180) * offsetStep * (attempts + 1);
      const offsetY = Math.sin(angle * Math.PI / 180) * offsetStep * (attempts + 1);

      position = {
        x: dimensions.position.x + offsetX,
        y: dimensions.position.y + offsetY,
        z: dimensions.position.z
      };

      attempts++;
    }

    return {
      ...dimensions,
      position,
      reason: `${dimensions.reason} + collision avoidance (${attempts} attempts)`
    };
  }

  /**
   * Check if two windows are colliding
   */
  private isColliding(
    pos1: Position,
    dim1: { width: number; height: number },
    window2: { position: Position; width: number; height: number }
  ): boolean {
    const overlap = !(
      pos1.x + dim1.width < window2.position.x ||
      window2.position.x + window2.width < pos1.x ||
      pos1.y + dim1.height < window2.position.y ||
      window2.position.y + window2.height < pos1.y
    );

    return overlap;
  }

  /**
   * Get smart positioning based on mouse position and context
   */
  getSmartPosition(
    mouseX: number,
    mouseY: number,
    canvasPosition: Position,
    canvasScale: number,
    preferredDirection: 'right' | 'left' | 'center' = 'right'
  ): Position {
    // Convert mouse position to canvas coordinates
    const canvasX = (mouseX - canvasPosition.x) / canvasScale;
    const canvasY = (mouseY - canvasPosition.y) / canvasScale;

    // Offset from mouse position based on preferred direction
    let offsetX = 0;
    let offsetY = -50; // Slightly above mouse

    switch (preferredDirection) {
      case 'right':
        offsetX = 20;
        break;
      case 'left':
        offsetX = -250;
        break;
      case 'center':
        offsetX = -125;
        break;
    }

    return {
      x: canvasX + offsetX,
      y: canvasY + offsetY,
      z: Date.now() // Use timestamp for unique z-index
    };
  }

  /**
   * Update window size when content changes
   */
  updateSizeForContent(
    currentDimensions: { width: number; height: number },
    type: string,
    newContent: any,
    maxGrowth: number = 1.5
  ): { width: number; height: number } | null {
    // Calculate new optimal size
    const newDimensions = this.calculateOptimalSize(
      type,
      newContent,
      { x: 0, y: 0, z: 0 },
      { width: 1920, height: 1080, canvasPosition: { x: 0, y: 0, z: 0 }, canvasScale: 1 },
      []
    );

    // Only grow, don't shrink (user might have manually resized)
    const newWidth = Math.max(currentDimensions.width, newDimensions.width);
    const newHeight = Math.max(currentDimensions.height, newDimensions.height);

    // Limit growth to prevent huge windows
    const maxWidth = currentDimensions.width * maxGrowth;
    const maxHeight = currentDimensions.height * maxGrowth;

    const finalWidth = Math.min(newWidth, maxWidth);
    const finalHeight = Math.min(newHeight, maxHeight);

    // Only return new dimensions if they're different
    if (finalWidth !== currentDimensions.width || finalHeight !== currentDimensions.height) {
      return {
        width: Math.round(finalWidth),
        height: Math.round(finalHeight)
      };
    }

    return null;
  }
}

export default WindowSizingService;