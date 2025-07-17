# 🏗️ System-Architektur - UniversalDesktop

## 📋 Übersicht

UniversalDesktop ist eine moderne React-Anwendung, die auf einem unendlichen Canvas-Konzept basiert und Multi-Agent-KI-Integration bietet.

## 🎯 Architektur-Prinzipien

### 1. Modularer Aufbau
- **Komponenten-basiert**: Jede Funktionalität als wiederverwendbare Komponente
- **Hook-basiert**: Geschäftslogik in Custom Hooks ausgelagert
- **Service-orientiert**: API-Calls und Datenverarbeitung in Services

### 2. Unendlicher Canvas
- **Transform-Matrix**: CSS-Transform für Zoom und Pan
- **Momentum-Physik**: RequestAnimationFrame für flüssige Bewegungen
- **Koordinaten-System**: Separate Canvas- und Viewport-Koordinaten

### 3. Reaktive Datenhaltung
- **React State**: Lokale Komponentenzustände
- **Debounced Persistence**: Optimierte Speicherung alle 500ms
- **Optimistic Updates**: Sofortige UI-Updates mit Fallback

## 🔧 Tech-Stack

### Frontend
- **React 18**: Moderne Hooks und Concurrent Features
- **TypeScript**: Vollständige Typisierung
- **Vite**: Schnelle Build-Tools
- **CSS Variables**: Konsistente Gestaltung

### Backend/Database
- **Supabase**: PostgreSQL + Authentication + Real-time
- **Row Level Security**: Sichere Datenabgrenzung
- **localStorage**: Fallback für Offline-Betrieb

### State Management
- **React useState**: Lokale Komponentenzustände
- **useCallback**: Optimierte Event-Handler
- **useEffect**: Lifecycle-Management

## 🧩 Komponenten-Architektur

### Core-Komponenten
```typescript
UniversalDesktop.tsx          // Main App Container
├── LoginPage.tsx             // Authentication
├── DesktopPage.tsx           // Main Desktop Interface
│   ├── Header                // Navigation & Controls
│   ├── DesktopContent        // Main Layout Container
│   │   ├── Sidebar           // Tools Panel
│   │   ├── InfiniteCanvas    // Main Canvas
│   │   └── AIPanel           // AI Assistant
│   └── ContextMenu           // Right-click Menu
└── DesktopItem.tsx           // Individual Windows
```

### Hook-Architektur
```typescript
useDraggable.ts               // Drag & Drop Logic
├── Canvas Coordinates        // Transform Matrix Handling
├── Mouse Event Handling      // Drag State Management
└── Position Updates          // Optimistic Updates

useResizable.ts               // Resize Logic
├── Resize Handles           // Visual Resize Controls
├── Constraint Handling      // Min/Max Size Validation
└── Live Resize Updates      // Real-time Size Changes
```

## 🗃️ Datenfluss

### 1. Persistenz-Layer
```
UI Action → State Update → Debounced Save → Database/localStorage
                     ↓
              Optimistic Update (immediate UI feedback)
```

### 2. KI-Integration
```
User Prompt → Multi-Agent System → Content Generation → UI Update
             ├── Reasoner Agent   (Analysis)
             ├── Coder Agent      (Generation)
             └── Refiner Agent    (Optimization)
```

### 3. Real-time Updates
```
Database Change → Supabase Real-time → State Update → UI Re-render
```

## 🎨 UI/UX-Architektur

### Glass-Morphism Design
- **Backdrop-filter**: Blur-Effekte für Tiefe
- **HSLA Colors**: Transparente Überlagerungen
- **CSS Variables**: Konsistente Farbpalette
- **Responsive Breakpoints**: Mobile-First-Ansatz

### Infinite Canvas System
```css
.infinite-canvas {
  transform: translate(x, y) scale(zoom);
  transform-origin: 0 0;
  overflow: visible;
}
```

### Z-Index-Hierarchie
```
Level 2000: Mobile Overlays
Level 1000: Sidebar & AI Panel
Level 100:  Header & Controls
Level 10:   Desktop Items
Level 1:    Canvas Background
```

## 🔄 Event-System

### Canvas-Events
```typescript
// Mouse Events
onMouseDown  → Start Drag/Pan
onMouseMove  → Update Position
onMouseUp    → End Drag, Apply Momentum

// Wheel Events
onWheel      → Zoom In/Out with Scale Limits

// Context Events
onContextMenu → Show Context Menu
```

### Fenster-Events
```typescript
// Drag Events
onDragStart  → Store Offset, Set Cursor
onDragMove   → Update Position with Zoom Compensation
onDragEnd    → Save Position, Clear State

// Resize Events
onResizeStart → Store Initial Size
onResizeMove  → Update Dimensions with Constraints
onResizeEnd   → Save Size, Validate Bounds
```

## 🔐 Sicherheits-Architektur

### Authentication Flow
```
1. User Input → Supabase Auth
2. JWT Token → Secure Storage
3. API Calls → Token Validation
4. Row Level Security → Data Access Control
```

### Data Protection
- **RLS Policies**: Benutzer-spezifische Datenisolierung
- **Input Validation**: Client- und Server-seitige Validierung
- **XSS Prevention**: Sanitized Content Rendering

## 📊 Performance-Optimierungen

### Rendering-Optimierungen
- **React.memo**: Vermeidung unnötiger Re-renders
- **useCallback**: Stabile Referenzen für Event-Handler
- **useMemo**: Teure Berechnungen cachen

### Canvas-Optimierungen
- **Transform statt Position**: Hardware-beschleunigte Transformationen
- **requestAnimationFrame**: Flüssige Animationen
- **Debounced Saves**: Reduzierte API-Calls

### Netzwerk-Optimierungen
- **Optimistic Updates**: Sofortige UI-Reaktion
- **Batch Operations**: Mehrere Changes zusammenfassen
- **Connection Pooling**: Supabase-Verbindungsmanagement

## 🔧 Konfiguration & Deployment

### Build-Konfiguration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': process.env
  },
  build: {
    target: 'esnext',
    sourcemap: true
  }
})
```

### Umgebungs-Management
```typescript
// Environment Variables
VITE_SUPABASE_URL    // Database Connection
VITE_SUPABASE_ANON_KEY // Public API Key
VITE_DEBUG           // Debug Mode
```

## 🧪 Test-Architektur

### Unit Tests
- **Komponenten**: React Testing Library
- **Hooks**: Custom Hook Testing
- **Services**: API Mock Testing

### Integration Tests
- **Canvas-Interaktion**: Drag & Drop Scenarios
- **Persistence**: Database Operations
- **Authentication**: Login/Logout Flows

### E2E Tests
- **User Workflows**: Complete User Journeys
- **Cross-browser**: Multi-browser Compatibility
- **Performance**: Load Time & Responsiveness

## 🚀 Skalierungsstrategien

### Frontend-Skalierung
- **Code-Splitting**: Lazy Loading von Komponenten
- **Bundle-Optimization**: Tree-shaking und Minification
- **CDN-Delivery**: Statische Assets über CDN

### Backend-Skalierung
- **Supabase Edge Functions**: Serverless Compute
- **Database Indexing**: Optimierte Queries
- **Real-time Scaling**: Horizontale Skalierung

## 🔄 Erweiterbarkeit

### Plugin-System (Geplant)
```typescript
interface DesktopPlugin {
  name: string;
  component: React.ComponentType;
  tools: ToolDefinition[];
  handlers: EventHandlers;
}
```

### API-Erweiterungen
- **GraphQL-Integration**: Flexible Datenabfragen
- **WebSocket-Events**: Real-time Kollaboration
- **Webhook-System**: External Integrations

## 📈 Monitoring & Observability

### Performance-Metriken
- **Rendering-Zeit**: Time to Interactive
- **Memory-Usage**: Canvas und Komponenten
- **Network-Latenz**: API-Response-Times

### Error-Tracking
- **Client-side Errors**: React Error Boundaries
- **API-Errors**: Supabase Error Handling
- **User-Experience**: Usability Metrics

---

**Letzte Aktualisierung**: 14. Juli 2025
**Version**: 1.0.0-beta
**Architekt**: SingularUniverse Team + Claude AI