# 🌟 UniversalFile Examples & Use Cases

## 📚 Table of Contents

1. [Basic Usage](#basic-usage)
2. [Bagua Metadata Examples](#bagua-metadata-examples)
3. [Spatial Computing](#spatial-computing)
4. [Minimap Integration](#minimap-integration)
5. [Database & Vectors](#database--vectors)
6. [Format Conversion](#format-conversion)
7. [Real-World Applications](#real-world-applications)

## 🚀 Basic Usage

### Creating Your First Document

```typescript
import { UniversalFile } from '@universaldesktop/universalfile';

// Create a new document
const doc = UniversalFile.createDocument();

// Add a simple note
const noteId = doc.addItem({
  position: [100, 200, 0],
  dimensions: [300, 200],
  type: UniversalFile.ItemType.NOTIZZETTEL,
  content: "Hello UniversalFile! 🌌"
});

// Add a code snippet
const codeId = doc.addItem({
  position: [500, 200, 0],
  dimensions: [400, 300],
  type: UniversalFile.ItemType.CODE,
  content: `function hello() {
  console.log("UniversalFile rocks!");
}`
});

console.log(`Document has ${doc.itemCount} items`);
```

### Quick Start Functions

```typescript
// Quick note creation
const noteDoc = UniversalFile.quickNote(
  "This is a quick note!",
  [0, 0, 0]
);

// Quick database creation
const dbDoc = UniversalFile.quickDatabase(
  { vectors: [[1, 2, 3], [4, 5, 6]] },
  [100, 100, 0]
);
```

## 🧭 Bagua Metadata Examples

### Understanding Bagua Descriptors

```typescript
import { BaguaUtils, BaguaPresets } from '@universaldesktop/universalfile';

// Create a custom Bagua descriptor
const interactiveNote = BaguaUtils.createDescriptor({
  dui: true,    // Interactive (user can edit)
  kun: true,    // Data container (holds text)
  li: true,     // Searchable (indexed)
  xun: true,    // Dynamic formatting (word wrap)
  taiji: true   // Active (currently focused)
});

// Visualize the Bagua matrix
console.log(BaguaUtils.renderMatrix(interactiveNote));
// Output:
// · ☲ ·
// · ☯ ☱
// · · ·

// Get human-readable description
console.log(BaguaUtils.describeDescriptor(interactiveNote));
// Output: "Interactive, Data Container, Searchable, Dynamic, Active"
```

### Predefined Bagua Presets

```typescript
// Use predefined presets
const standardNote = BaguaPresets.NOTE;
const actionButton = BaguaPresets.BUTTON;
const templateElement = BaguaPresets.TEMPLATE;
const searchResult = BaguaPresets.SEARCH_RESULT;

// Create items with presets
doc.addItem({
  position: [0, 0, 0],
  dimensions: [300, 200],
  type: UniversalFile.ItemType.NOTIZZETTEL,
  bagua: BaguaPresets.NOTE,
  content: "Standard note with preset"
});
```

### Querying by Bagua Properties

```typescript
// Find all interactive elements
const interactiveItems = doc.queryByBagua({ dui: true });

// Find all searchable content
const searchableItems = doc.queryByBagua({ li: true });

// Find all active elements
const activeItems = doc.queryByBagua({ taiji: true });

// Complex queries
const editableSearchableItems = doc.queryByBagua({
  dui: true,   // Interactive
  li: true,    // Searchable
  taiji: true  // Active
});

console.log(`Found ${editableSearchableItems.length} items matching criteria`);
```

## 🌍 Spatial Computing

### 3D Positioning and Layering

```typescript
// Create a multi-layer document
const backgroundLayer = doc.addItem({
  position: [0, 0, -1],      // Background layer (z = -1)
  dimensions: [1000, 800],
  type: UniversalFile.ItemType.MEDIA,
  content: "background-image.jpg"
});

const contentLayer = doc.addItem({
  position: [100, 100, 0],   // Content layer (z = 0)
  dimensions: [300, 200],
  type: UniversalFile.ItemType.NOTIZZETTEL,
  content: "Main content"
});

const overlayLayer = doc.addItem({
  position: [150, 150, 1],   // Overlay layer (z = 1)
  dimensions: [200, 100],
  type: UniversalFile.ItemType.TUI,
  content: "Overlay terminal"
});
```

### Spatial Queries

```typescript
// Find items in a specific area
const itemsInViewport = doc.findByPosition({
  x: 0,
  y: 0,
  width: 500,
  height: 400
});

// Find items by type
const allTables = doc.findByType(UniversalFile.ItemType.TABELLE);
const allDatabases = doc.findByType(UniversalFile.ItemType.DATABASE);
```

### Canvas Bounds Management

```typescript
// Get canvas bounds
const bounds = doc.canvasBounds;
console.log(`Canvas: ${bounds.width}x${bounds.height} at (${bounds.x}, ${bounds.y})`);

// Check if item is within bounds
function isInBounds(item: any, bounds: any): boolean {
  return (
    item.position[0] >= bounds.x &&
    item.position[1] >= bounds.y &&
    item.position[0] + item.dimensions[0] <= bounds.x + bounds.width &&
    item.position[1] + item.dimensions[1] <= bounds.y + bounds.height
  );
}
```

## 🗺️ Minimap Integration

### Basic Minimap Setup

```typescript
import { UDMinimapAdapter } from '@universaldesktop/universalfile';

// Create minimap adapter
const minimap = new UDMinimapAdapter(doc);

// Generate minimap data
const minimapData = minimap.generateMinimapData();

console.log(`Minimap has ${minimapData.items.length} items`);
console.log(`Bounds: ${minimapData.bounds.width}x${minimapData.bounds.height}`);
console.log(`Layers: ${minimapData.layers.length}`);
```

### Advanced Minimap Features

```typescript
// Set scaling for zoom levels
minimap.setDimensionScale(0.5);  // 50% scale

// Get items in viewport
const viewportItems = minimap.getItemsInViewport({
  x: 0,
  y: 0,
  width: 800,
  height: 600
});

// Find item at specific position
const itemAtPosition = minimap.getItemAt(250, 300);
if (itemAtPosition) {
  console.log(`Found item: ${itemAtPosition.id}`);
}

// Export for React component
const reactData = minimap.exportForReactComponent();

// Export for Canvas rendering
const canvasData = minimap.exportForCanvasRenderer();
```

### Minimap Color Coding

```typescript
// Items are automatically color-coded based on type and Bagua properties
const coloredItems = minimapData.items.map(item => ({
  ...item,
  // Color is automatically assigned based on:
  // - Type (note=moccasin, table=cyan, code=blue, etc.)
  // - Bagua properties (active=brighter, interactive=blue tint)
  visualInfo: {
    color: item.color,
    opacity: item.opacity,
    isActive: item.isActive,
    isInteractive: item.isInteractive
  }
}));
```

## 🔍 Database & Vectors

### Creating Vector Databases

```typescript
// Create a hyperdimensional vector database
const vectorDB = doc.addItem({
  position: [0, 0, 0],
  dimensions: [400, 300],
  type: UniversalFile.ItemType.DATABASE,
  bagua: BaguaUtils.createDescriptor({
    kun: true,   // Data container (stores vectors)
    li: true,    // Searchable (semantic search)
    kan: true,   // Linked (connected to other items)
    xun: true,   // Dynamic (adaptive indexing)
    taiji: true  // Active
  }),
  content: JSON.stringify({
    type: "vector_database",
    model: "text-embedding-3-large",
    dimensions: 3072,
    vectors: [
      { id: "doc1", embedding: [0.1, 0.2, 0.3], text: "Hello world" },
      { id: "doc2", embedding: [0.4, 0.5, 0.6], text: "UniversalFile" }
    ],
    index: {
      algorithm: "hierarchical_nsw",
      ef_construction: 200,
      m_connections: 16
    }
  })
});
```

### Semantic Search Integration

```typescript
// Create searchable content with embeddings
const searchableNote = doc.addItem({
  position: [100, 100, 0],
  dimensions: [300, 200],
  type: UniversalFile.ItemType.NOTIZZETTEL,
  bagua: BaguaUtils.createDescriptor({
    kun: true,   // Data container
    li: true,    // Searchable
    kan: true,   // Linked to vector DB
    taiji: true  // Active
  }),
  content: JSON.stringify({
    text: "This is a searchable note about AI and machine learning.",
    embedding: [0.1, 0.2, 0.3, /* ... 3072 dimensions */],
    metadata: {
      language: "en",
      topics: ["AI", "ML", "technology"],
      sentiment: "positive"
    }
  })
});
```

### Database Queries

```typescript
// Find all database items
const databases = doc.findByType(UniversalFile.ItemType.DATABASE);

// Query database items specifically
const databaseItems = doc.queryByBagua({
  kun: true,   // Data container
  li: true,    // Searchable
  kan: true    // Linked
});

// Get vector similarity (would be implemented with actual vector math)
const similarities = minimap.getVectorSimilarityMap("vectorDB_id");
```

## 📊 Format Conversion

### Exporting to Different Formats

```typescript
import { UDFileManager } from '@universaldesktop/universalfile';

const fileManager = new UDFileManager();
const docId = fileManager.createDocument();
const currentDoc = fileManager.getCurrentDocument();

// Add some sample content
currentDoc?.addItem({
  position: [0, 0, 0],
  dimensions: [300, 200],
  type: UniversalFile.ItemType.NOTIZZETTEL,
  content: "Sample note for export"
});

// Export to various formats
const exports = {
  markdown: fileManager.exportToMarkdown(),
  html: fileManager.exportToHTML(),
  csv: fileManager.exportToCSV(),
  xml: fileManager.exportToXML()
};

// Specialized exports
const analysis = fileManager.exportBaguaAnalysis();
const spatialMap = fileManager.exportSpatialMap();
```

### Batch Import Operations

```typescript
// Import multiple files at once
const files = [
  { name: "note1.txt", content: "First note", type: "text/plain" },
  { name: "data.json", content: '{"key": "value"}', type: "application/json" },
  { name: "readme.md", content: "# Title\nContent", type: "text/markdown" }
];

const importedIds = fileManager.batchImport(files);
console.log(`Imported ${importedIds.length} items`);
```

## 🏢 Real-World Applications

### 1. Note-Taking System

```typescript
// Create a comprehensive note-taking system
const noteSystem = UniversalFile.createDocument();

// Main note
const mainNote = noteSystem.addItem({
  position: [100, 100, 0],
  dimensions: [400, 300],
  type: UniversalFile.ItemType.NOTIZZETTEL,
  bagua: BaguaUtils.createDescriptor({
    dui: true,   // Editable
    kun: true,   // Content container
    li: true,    // Searchable
    xun: true,   // Dynamic formatting
    taiji: true  // Active
  }),
  content: "# Meeting Notes\n\nDiscussion about UniversalFile format..."
});

// Related table
const dataTable = noteSystem.addItem({
  position: [600, 100, 0],
  dimensions: [300, 200],
  type: UniversalFile.ItemType.TABELLE,
  bagua: BaguaUtils.createDescriptor({
    kun: true,   // Data container
    li: true,    // Searchable
    kan: true,   // Linked to main note
    taiji: true  // Active
  }),
  content: JSON.stringify({
    headers: ["Feature", "Status", "Priority"],
    rows: [
      ["Bagua Metadata", "Complete", "High"],
      ["Vector DB", "In Progress", "Medium"]
    ]
  })
});

// Action items
const actionButton = noteSystem.addItem({
  position: [100, 450, 0],
  dimensions: [200, 50],
  type: UniversalFile.ItemType.TUI,
  bagua: BaguaUtils.createDescriptor({
    dui: true,   // Interactive
    zhen: true,  // Has action
    taiji: true  // Active
  }),
  content: "TODO: Implement binary serialization"
});
```

### 2. Code Documentation System

```typescript
// Create a code documentation system
const codeDoc = UniversalFile.createDocument();

// Main code file
const sourceCode = codeDoc.addItem({
  position: [0, 0, 0],
  dimensions: [600, 400],
  type: UniversalFile.ItemType.CODE,
  bagua: BaguaUtils.createDescriptor({
    kun: true,   // Code container
    li: true,    // Searchable
    gen: true,   // Fixed formatting
    taiji: true  // Active
  }),
  content: `
class UniversalFile {
  constructor() {
    // Initialize document
  }
  
  addItem(config) {
    // Add item implementation
  }
}
`
});

// Documentation
const docs = codeDoc.addItem({
  position: [650, 0, 0],
  dimensions: [400, 300],
  type: UniversalFile.ItemType.NOTIZZETTEL,
  bagua: BaguaUtils.createDescriptor({
    kun: true,   // Content container
    li: true,    // Searchable
    kan: true,   // Linked to code
    xun: true,   // Dynamic formatting
    taiji: true  // Active
  }),
  content: `
# UniversalFile Class

This class manages UniversalFile documents with Bagua metadata.

## Methods

- \`addItem(config)\`: Adds new item to document
- \`queryByBagua(selector)\`: Queries items by Bagua properties
`
});
```

### 3. AI Research Dashboard

```typescript
// Create an AI research dashboard
const aiDashboard = UniversalFile.createDocument();

// Research paper
const paper = aiDashboard.addItem({
  position: [0, 0, 0],
  dimensions: [500, 400],
  type: UniversalFile.ItemType.NOTIZZETTEL,
  content: "# AI Research Paper\n\nAbstract: This paper explores..."
});

// Data visualization
const chart = aiDashboard.addItem({
  position: [550, 0, 0],
  dimensions: [400, 300],
  type: UniversalFile.ItemType.CHART,
  bagua: BaguaUtils.createDescriptor({
    kun: true,   // Data container
    li: true,    // Searchable
    kan: true,   // Linked to research
    taiji: true  // Active
  }),
  content: JSON.stringify({
    type: "line_chart",
    data: [
      { x: "2020", y: 85 },
      { x: "2021", y: 92 },
      { x: "2022", y: 88 }
    ],
    title: "Model Performance Over Time"
  })
});

// Vector database for embeddings
const vectorDB = aiDashboard.addItem({
  position: [0, 450, 0],
  dimensions: [950, 200],
  type: UniversalFile.ItemType.DATABASE,
  content: JSON.stringify({
    embeddings: [
      { id: "paper1", vector: [0.1, 0.2, 0.3], title: "Attention Is All You Need" },
      { id: "paper2", vector: [0.4, 0.5, 0.6], title: "BERT: Pre-training of Deep Bidirectional Transformers" }
    ],
    similarity_threshold: 0.8
  })
});
```

### 4. Interactive Tutorial System

```typescript
// Create an interactive tutorial
const tutorial = UniversalFile.createDocument();

// Tutorial steps
const steps = [
  "Welcome to UniversalFile!",
  "Create your first document",
  "Add items with Bagua metadata",
  "Use the minimap for navigation",
  "Export to different formats"
];

steps.forEach((step, index) => {
  tutorial.addItem({
    position: [100, 100 + index * 150, 0],
    dimensions: [400, 120],
    type: UniversalFile.ItemType.NOTIZZETTEL,
    bagua: BaguaUtils.createDescriptor({
      dui: true,   // Interactive
      kun: true,   // Content container
      li: true,    // Searchable
      taiji: index === 0 // Only first step is active initially
    }),
    content: `## Step ${index + 1}\n\n${step}`
  });
});

// Interactive elements
const nextButton = tutorial.addItem({
  position: [550, 100, 0],
  dimensions: [150, 50],
  type: UniversalFile.ItemType.TUI,
  bagua: BaguaUtils.createDescriptor({
    dui: true,   // Interactive
    zhen: true,  // Has action
    taiji: true  // Active
  }),
  content: "Next Step →"
});
```

### 5. Debugging and Inspection

```typescript
// Debug and inspect your documents
function debugDocument(doc: any) {
  console.log("🔍 Document Inspection");
  console.log("======================");
  
  // Basic stats
  console.log(`Items: ${doc.itemCount}`);
  console.log(`Modified: ${doc.isModified}`);
  
  // Bagua statistics
  const interactiveCount = doc.queryByBagua({ dui: true }).length;
  const searchableCount = doc.queryByBagua({ li: true }).length;
  const activeCount = doc.queryByBagua({ taiji: true }).length;
  
  console.log(`\nBagua Statistics:`);
  console.log(`- Interactive: ${interactiveCount}`);
  console.log(`- Searchable: ${searchableCount}`);
  console.log(`- Active: ${activeCount}`);
  
  // Type distribution
  const typeDistribution = {};
  doc.allItems.forEach(item => {
    const typeName = UniversalFile.Constants.TYPE_REGISTRY[item.typeIndex];
    typeDistribution[typeName] = (typeDistribution[typeName] || 0) + 1;
  });
  
  console.log(`\nType Distribution:`);
  Object.entries(typeDistribution).forEach(([type, count]) => {
    console.log(`- ${type}: ${count}`);
  });
  
  // Full inspection
  doc.inspect();
}

// Use the debug function
debugDocument(noteSystem);
```

## 🎯 Performance Tips

### 1. Efficient Queries

```typescript
// Use specific queries instead of iterating all items
const activeItems = doc.queryByBagua({ taiji: true });

// Combine queries for better performance
const editableActiveItems = doc.queryByBagua({
  dui: true,    // Interactive
  taiji: true   // Active
});

// Use spatial queries for area-based searches
const nearbyItems = doc.findByPosition({
  x: mouseX - 50,
  y: mouseY - 50,
  width: 100,
  height: 100
});
```

### 2. Minimap Optimization

```typescript
// Set appropriate scaling for your use case
minimap.setDimensionScale(0.1);  // For large canvases

// Use viewport queries to limit rendering
const visibleItems = minimap.getItemsInViewport(currentViewport);

// Cache minimap data for better performance
let cachedMinimapData = null;
function getMinimapData() {
  if (!cachedMinimapData || doc.isModified) {
    cachedMinimapData = minimap.generateMinimapData();
  }
  return cachedMinimapData;
}
```

### 3. Memory Management

```typescript
// Remove unused items
const unusedItems = doc.allItems.filter(item => 
  !item.bagua.taiji && // Not active
  Date.now() - item.timestamp > 24 * 60 * 60 * 1000 // Older than 24 hours
);

unusedItems.forEach(item => doc.removeItem(item.id));
```

---

These examples show the power and flexibility of the UniversalFile format. From simple notes to complex AI research dashboards, the Bagua-based metadata system provides a unified way to organize and interact with spatial documents! 🌌