# 🌌 UniversalFile (.UD) Format

**Revolutionary Binary-Text Hybrid Document Format with Bagua-Based Metadata**

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/tux-sourceish/UniversalFile)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

## 🚀 Overview

The UniversalFile (.UD) format is a revolutionary approach to document storage that combines:

- **Binary Performance**: Hardware-optimized binary sections for ultra-fast access
- **Human Readability**: JSON-compatible metadata for easy debugging and tools
- **Bagua Metadata**: Ancient Chinese philosophy meets modern computing
- **Hyperdimensional Vectors**: Support for AI embeddings and semantic search
- **Spatial Computing**: Native support for 3D positioning and minimap integration
- **Real-time Sync**: Git-style merging and distributed collaboration

## 📦 Installation

```bash
npm install @universaldesktop/universalfile
```

## 🔧 Quick Start

```typescript
import { UniversalFile } from '@universaldesktop/universalfile';

// Create a new document
const doc = UniversalFile.createDocument();

// Add a note
doc.addItem({
  position: [100, 200, 0],
  dimensions: [300, 200],
  type: UniversalFile.ItemType.NOTIZZETTEL,
  content: "Hello UniversalFile!"
});

// Add a database
doc.addItem({
  position: [500, 200, 0],
  dimensions: [400, 300],
  type: UniversalFile.ItemType.DATABASE,
  content: JSON.stringify({vectors: [1, 2, 3]})
});

// Create minimap adapter
const minimap = UniversalFile.createMinimapAdapter(doc);
const minimapData = minimap.generateMinimapData();
```

## 🧭 Bagua Metadata System

The heart of the UniversalFile format is the Bagua-based metadata system, which encodes 9 fundamental properties into a single 16-bit value:

```
      🌌 Bagua Matrix (3x3)
    ┌─────┬─────┬─────┐
    │ ☴   │ ☲   │ ☷   │
    │ Xun │ Li  │ Kun │  
    ├─────┼─────┼─────┤
    │ ☳   │ ☯   │ ☱   │
    │ Zhen│Taiji│ Dui │
    ├─────┼─────┼─────┤
    │ ☶   │ ☵   │ ☰   │
    │ Gen │ Kan │Qian │
    └─────┴─────┴─────┘
```

### Trigram Properties

- **☰ Qian** (Heaven): Template/Structure - Element can be cloned
- **☱ Dui** (Lake): Interactive - Accepts user input
- **☷ Kun** (Earth): Data Container - Holds primary content
- **☲ Li** (Fire): Searchable - Indexed for semantic search
- **☴ Xun** (Wind): Dynamic - Adaptive formatting
- **☳ Zhen** (Thunder): Actionable - Has associated scripts
- **☶ Gen** (Mountain): Fixed - Immutable position/size
- **☵ Kan** (Water): Linked - Connected to other elements
- **☯ Taiji** (Center): Active - Currently in focus

## 🗂️ Item Types

```typescript
enum UDItemType {
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
```

## 🎯 Core Features

### 1. Document Management

```typescript
import { UDDocument } from '@universaldesktop/universalfile';

const doc = new UDDocument();

// Add items
const noteId = doc.addItem({
  position: [0, 0, 0],
  dimensions: [300, 200],
  type: UDItemType.NOTIZZETTEL,
  content: "My note content"
});

// Query by Bagua properties
const interactiveItems = doc.queryByBagua({ dui: true });
const searchableItems = doc.queryByBagua({ li: true });
const activeItems = doc.queryByBagua({ taiji: true });

// Spatial queries
const itemsInArea = doc.findByPosition({
  x: 0, y: 0, width: 1000, height: 1000
});
```

### 2. Minimap Integration

```typescript
import { UDMinimapAdapter } from '@universaldesktop/universalfile';

const minimap = new UDMinimapAdapter(document);

// Generate minimap data
const data = minimap.generateMinimapData();

// Set scaling
minimap.setDimensionScale(0.5);

// Export for React components
const reactData = minimap.exportForReactComponent();

// Export for Canvas rendering
const canvasData = minimap.exportForCanvasRenderer();
```

### 3. Format Conversion

```typescript
// Export to various formats
const markdown = fileManager.exportToMarkdown();
const html = fileManager.exportToHTML();
const csv = fileManager.exportToCSV();
const xml = fileManager.exportToXML();

// Specialized exports
const baguaAnalysis = fileManager.exportBaguaAnalysis();
const spatialMap = fileManager.exportSpatialMap();
```

## 🔬 Advanced Features

### Hyperdimensional Vector Support

```typescript
// Create vector database item
const vectorDB = doc.addItem({
  position: [0, 0, 0],
  dimensions: [400, 300],
  type: UDItemType.DATABASE,
  bagua: BaguaUtils.createDescriptor({
    kun: true,   // Data container
    li: true,    // Searchable
    kan: true,   // Linked
    xun: true,   // Dynamic
    taiji: true  // Active
  }),
  content: JSON.stringify({
    vectors: [[1, 2, 3], [4, 5, 6]],
    embeddings: "text-embedding-3-large",
    dimensions: 3072
  })
});
```

### Spatial Computing

```typescript
// 3D positioning and layering
const item3D = doc.addItem({
  position: [100, 200, 5], // x, y, z
  dimensions: [300, 200],
  type: UDItemType.NOTIZZETTEL,
  content: "3D positioned note"
});

// Layer organization
const minimapData = minimap.generateMinimapData();
const layers = minimapData.layers; // Organized by Z-level
```

### Real-time Collaboration

```typescript
// Git-style conflict resolution
const syncLayer = {
  diff_chunks: true,
  conflict_resolution: "3way",
  real_time_updates: true,
  distributed_storage: true
};
```

## 🎨 Visualization

The UniversalFile format includes built-in visualization capabilities:

### Bagua Matrix Rendering

```typescript
import { BaguaUtils } from '@universaldesktop/universalfile';

const descriptor = BaguaUtils.createDescriptor({
  dui: true,    // Interactive
  kun: true,    // Data container
  li: true,     // Searchable
  taiji: true   // Active
});

console.log(BaguaUtils.renderMatrix(descriptor));
// Output:
// · ☲ ·
// · ☯ ☱
// · · ·
```

### Minimap Color Coding

- **Notes**: Warm moccasin (#FFE4B5)
- **Tables**: Light cyan (#E0FFFF)
- **Code**: Alice blue (#F0F8FF)
- **TUI**: Dark slate gray (#2F4F4F)
- **Databases**: Tomato (#FF6347)
- **Active Items**: Enhanced brightness
- **Interactive Items**: Blue tint
- **Actionable Items**: Red tint

## 🚄 Performance Characteristics

### Target Benchmarks

- **File Loading**: < 1ms for 1000 items
- **Search Query**: < 10ms for 1M items
- **Sync Delta**: < 100ms for 10MB changes
- **Memory Usage**: < 50% of JSON equivalent
- **Compression**: > 80% size reduction

### Efficiency Metrics

- **CPU Usage**: < 5% during idle
- **Battery Impact**: < 1% per hour
- **Network Traffic**: > 90% reduction vs full sync
- **Storage Overhead**: < 10% metadata ratio

## 🌐 Integration Examples

### React Component

```typescript
import { UniversalFile } from '@universaldesktop/universalfile';

function DocumentViewer() {
  const [doc] = useState(() => UniversalFile.createDocument());
  const [minimap] = useState(() => UniversalFile.createMinimapAdapter(doc));
  
  const minimapData = minimap.exportForReactComponent();
  
  return (
    <div>
      <Minimap data={minimapData} />
      <DocumentCanvas document={doc} />
    </div>
  );
}
```

### Node.js Backend

```typescript
import { UniversalFile } from '@universaldesktop/universalfile';

// Create document from file system
const doc = UniversalFile.createDocument();
doc.addItem({
  position: [0, 0, 0],
  dimensions: [400, 300],
  type: UniversalFile.ItemType.CODE,
  content: await fs.readFile('example.js', 'utf8')
});

// Export to various formats
const exports = {
  markdown: await fileManager.exportToMarkdown(),
  html: await fileManager.exportToHTML(),
  analysis: await fileManager.exportBaguaAnalysis()
};
```

## 🔒 Security Features

- **ChaCha20-Poly1305**: Modern authenticated encryption
- **Argon2id**: Password-based key derivation
- **Ed25519**: Digital signature verification
- **Zero-knowledge**: Privacy-preserving synchronization

## 🔮 Future Roadmap

### Phase 1: Core Implementation
- ✅ Bagua metadata system
- ✅ Basic document operations
- ✅ Minimap integration
- ✅ Format conversion

### Phase 2: Advanced Features
- 🔄 Binary serialization
- 🔄 Compression algorithms
- 🔄 Encryption layer
- 🔄 Real-time sync

### Phase 3: Ecosystem
- 📋 IDE plugins
- 📋 Mobile apps
- 📋 Web viewers
- 📋 Cloud services

### Phase 4: Standards
- 📋 Open specification
- 📋 Industry adoption
- 📋 OS integration
- 📋 Hardware acceleration

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🌟 Vision

**"Make .UD the universal spatial document format of the future!"**

The UniversalFile format aims to become the standard for spatial computing, combining the best of:
- Eastern philosophy (Bagua wisdom)
- Modern computing (binary performance)
- AI enhancement (semantic understanding)
- Collaborative workflows (git-style merging)

---

*Created with ❤️ by [tux-sourceish](https://github.com/tux-sourceish)*