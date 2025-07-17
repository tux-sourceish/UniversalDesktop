# 📡 API-Referenz - UniversalDesktop

## 📋 Übersicht

Diese Dokumentation beschreibt die interne API-Struktur und externe Schnittstellen des UniversalDesktop-Systems.

## 🗃️ Datenstrukturen

### DesktopItemData
```typescript
interface DesktopItemData {
  id: string;                    // Eindeutige Item-ID
  type: ItemType;                // Typ des Elements
  title: string;                 // Anzeigename
  position: Position;            // Position im Canvas
  content: any;                  // Typ-spezifischer Inhalt
  created_at: string;            // Erstellungszeitpunkt (ISO)
  updated_at: string;            // Letzte Änderung (ISO)
  user_id: string;               // Benutzer-ID
  metadata?: Record<string, any>; // Zusätzliche Metadaten
  width?: number;                // Breite in Pixeln
  height?: number;               // Höhe in Pixeln
}
```

### Position
```typescript
interface Position {
  x: number;        // X-Koordinate im Canvas
  y: number;        // Y-Koordinate im Canvas
  z: number;        // Z-Index/Tiefe
}
```

### ItemType
```typescript
type ItemType = 
  | 'notizzettel'   // Einfache Textnotiz
  | 'tabelle'       // Tabellendarstellung
  | 'code'          // Code-Editor
  | 'browser'       // Web-Browser
  | 'terminal'      // Terminal-Emulator
  | 'media'         // Medien-Player
  | 'chart'         // Diagramm-Widget
  | 'calendar';     // Kalender-Widget
```

### Canvas-State
```typescript
interface CanvasState {
  position: Position;           // Canvas-Offset
  scale: number;               // Zoom-Level (0.1 - 3.0)
  velocity: Position;          // Momentum-Geschwindigkeit
  isDragging: boolean;         // Drag-Status
  momentum: { x: number; y: number }; // Momentum-Richtung
}
```

### Agent-System
```typescript
interface AgentState {
  isActive: boolean;           // System-Status
  currentTask: string;         // Aktuelle Aufgabe
  status: 'idle' | 'processing' | 'completed' | 'error';
  agents: {
    reasoner: AgentStatus;     // Analyse-Agent
    coder: AgentStatus;        // Code-Generator
    refiner: AgentStatus;      // Optimierungs-Agent
  };
}

interface AgentStatus {
  active: boolean;             // Agent aktiv
  status: string;              // Aktueller Status
}
```

## 🎯 React-Komponenten API

### UniversalDesktop
```typescript
const UniversalDesktop: React.FC = () => {
  // Haupt-Komponente ohne Props
  // Verwaltet Authentication und Session
}
```

### DesktopPage
```typescript
interface DesktopPageProps {
  session: any;                // Supabase-Session
}

const DesktopPage: React.FC<DesktopPageProps> = ({ session }) => {
  // Hauptdesktop nach Authentifizierung
}
```

### DesktopItem
```typescript
interface DesktopItemProps {
  item: DesktopItemData;
  onUpdate: (id: string, updates: Partial<DesktopItemData>) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, newTitle: string) => void;
  onContextMenu: (e: React.MouseEvent, itemId: string) => void;
}

const DesktopItem: React.FC<DesktopItemProps> = (props) => {
  // Einzelnes Desktop-Fenster
}
```

### ContextMenu
```typescript
interface ContextMenuProps {
  visible: boolean;
  x: number;
  y: number;
  onClose: () => void;
  onToggleAI: () => void;
  onRename?: (itemId: string) => void;
  onDelete?: (itemId: string) => void;
  itemId?: string;
}

const ContextMenu: React.FC<ContextMenuProps> = (props) => {
  // Rechtsklick-Kontextmenü
}
```

### LoginPage
```typescript
interface LoginPageProps {
  onLogin: (session: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  // Authentifizierungs-Interface
}
```

## 🪝 Custom Hooks API

### useDraggable
```typescript
interface UseDraggableProps {
  ref: React.RefObject<HTMLElement>;
  onDragStart?: (e: MouseEvent) => void;
  onDragMove?: (e: MouseEvent) => void;
  onDragEnd?: (e: MouseEvent) => void;
  canvasRef?: React.RefObject<HTMLElement>;
}

const useDraggable = (props: UseDraggableProps) => {
  return {
    isDragging: boolean;
    dragOffset: { x: number; y: number };
  };
}
```

### useResizable
```typescript
interface UseResizableProps {
  ref: React.RefObject<HTMLElement>;
  onResize?: (width: number, height: number) => void;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

const useResizable = (props: UseResizableProps) => {
  return {
    isResizing: boolean;
    resizeHandle: 'se' | 's' | 'e' | null;
  };
}
```

## 🔌 Supabase-Service API

### enhancedSupabase.auth
```typescript
// Authentifizierung
const signInWithPassword = async (credentials: {
  email: string;
  password: string;
}) => Promise<AuthResponse>;

const signUp = async (credentials: {
  email: string;
  password: string;
}) => Promise<AuthResponse>;

const signOut = async () => Promise<{ error: null }>;

const getSession = async () => Promise<SessionResponse>;

const getUser = async () => Promise<UserResponse>;
```

### enhancedSupabase.from()
```typescript
// Datenbankoperationen
const select = () => ({
  eq: (field: string, value: any) => Promise<QueryResponse>
});

const insert = (data: any) => Promise<InsertResponse>;

const upsert = (data: any) => Promise<UpsertResponse>;

const delete = () => ({
  eq: (field: string, value: any) => ({
    eq: (field2: string, value2: any) => Promise<DeleteResponse>
  })
});
```

## 🎮 Event-Handler API

### Canvas-Events
```typescript
// Canvas-Interaktion
const handleCanvasMouseDown = (e: React.MouseEvent) => void;
const handleCanvasMouseMove = (e: React.MouseEvent) => void;
const handleCanvasMouseUp = () => void;
const handleWheel = (e: React.WheelEvent) => void;

// Canvas-Steuerung
const handleCanvasContextMenu = (e: React.MouseEvent) => void;
const closeContextMenu = () => void;
```

### Item-Management
```typescript
// Item-Operationen
const createItem = (type: string, position: Position) => void;
const updateItem = (id: string, updates: Partial<DesktopItemData>) => void;
const deleteItem = (id: string) => Promise<void>;
const renameItem = (id: string, newTitle: string) => void;

// Context-Menü
const handleContextMenu = (e: React.MouseEvent, itemId?: string) => void;
```

### AI-Integration
```typescript
// KI-Verarbeitung
const processAIRequest = (prompt: string) => Promise<void>;

// Agent-Steuerung
const setAgentState = (state: Partial<AgentState>) => void;
```

## 🗄️ Database-Schema

### desktop_items Tabelle
```sql
CREATE TABLE desktop_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN (
    'notizzettel', 'tabelle', 'code', 'browser', 
    'terminal', 'media', 'chart', 'calendar'
  )),
  title TEXT NOT NULL,
  position JSONB NOT NULL,
  content JSONB,
  width INTEGER DEFAULT 250,
  height INTEGER DEFAULT 200,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb
);
```

### Indizes
```sql
CREATE INDEX idx_desktop_items_user_id ON desktop_items(user_id);
CREATE INDEX idx_desktop_items_created_at ON desktop_items(created_at);
CREATE INDEX idx_desktop_items_type ON desktop_items(type);
```

### RLS-Policies
```sql
-- Benutzer können nur ihre eigenen Items sehen
CREATE POLICY "Users can view their own items" ON desktop_items
  FOR SELECT USING (auth.uid()::text = user_id);

-- Benutzer können nur ihre eigenen Items erstellen
CREATE POLICY "Users can create their own items" ON desktop_items
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Benutzer können nur ihre eigenen Items aktualisieren
CREATE POLICY "Users can update their own items" ON desktop_items
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Benutzer können nur ihre eigenen Items löschen
CREATE POLICY "Users can delete their own items" ON desktop_items
  FOR DELETE USING (auth.uid()::text = user_id);
```

## 🌐 REST-API Endpoints

### Authentication
```http
POST /auth/v1/token?grant_type=password
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Desktop Items
```http
# Alle Items abrufen
GET /rest/v1/desktop_items?select=*&user_id=eq.{user_id}
Authorization: Bearer {access_token}

# Item erstellen
POST /rest/v1/desktop_items
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "id": "item_123",
  "type": "notizzettel",
  "title": "Neue Notiz",
  "position": {"x": 100, "y": 200, "z": 1},
  "content": "Text content",
  "user_id": "user_123"
}

# Item aktualisieren
PATCH /rest/v1/desktop_items?id=eq.{item_id}&user_id=eq.{user_id}
Content-Type: application/json
Authorization: Bearer {access_token}

{
  "title": "Aktualisierter Titel",
  "position": {"x": 150, "y": 250, "z": 1}
}

# Item löschen
DELETE /rest/v1/desktop_items?id=eq.{item_id}&user_id=eq.{user_id}
Authorization: Bearer {access_token}
```

## 🔧 Utility-Funktionen

### Koordinaten-Transformation
```typescript
// Canvas-Koordinaten → Viewport-Koordinaten
const canvasToViewport = (
  canvasX: number, 
  canvasY: number, 
  scale: number, 
  translateX: number, 
  translateY: number
) => ({
  x: canvasX * scale + translateX,
  y: canvasY * scale + translateY
});

// Viewport-Koordinaten → Canvas-Koordinaten
const viewportToCanvas = (
  viewportX: number, 
  viewportY: number, 
  scale: number, 
  translateX: number, 
  translateY: number
) => ({
  x: (viewportX - translateX) / scale,
  y: (viewportY - translateY) / scale
});
```

### Debounced Save
```typescript
const debouncedSave = useCallback((
  items: DesktopItemData[], 
  delay: number = 500
) => {
  // Speichert Items nach Verzögerung
}, []);
```

### Transform-Matrix Parsing
```typescript
const parseTransform = (transform: string) => {
  const match = transform.match(/translate\(([^)]+)\) scale\(([^)]+)\)/);
  if (!match) return { translateX: 0, translateY: 0, scale: 1 };
  
  const [, translate, scale] = match;
  const [translateX, translateY] = translate.split(',').map(Number);
  
  return { translateX, translateY, scale: Number(scale) };
};
```

## 🎨 CSS-API

### CSS-Variablen
```css
:root {
  /* Layout */
  --header-height: 60px;
  --sidebar-width: 280px;
  --ai-panel-width: 320px;
  
  /* Colors */
  --bg-dark: #1a1a1d;
  --bg-medium: #2c2f33;
  --text-light: #f4f4f4;
  --accent-blue: #4a90e2;
  
  /* Glass Morphism */
  --glass-bg: hsla(0, 0%, 100%, 0.15);
  --glass-border: hsla(0, 0%, 100%, 0.3);
  --glass-blur: blur(0.75em);
  
  /* Animations */
  --ease-natural: cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --transition-fast: 0.2s;
}
```

### Klassen-API
```css
/* Canvas-System */
.infinite-canvas          /* Haupt-Canvas */
.desktop-item             /* Einzelnes Fenster */
.desktop-content          /* Layout-Container */

/* Komponenten */
.desktop-sidebar          /* Werkzeugkasten */
.ai-panel                 /* KI-Interface */
.context-menu             /* Rechtsklick-Menü */

/* Interaktion */
.resize-handle            /* Größenänderungs-Handle */
.tool.selected            /* Ausgewähltes Werkzeug */
.agent.active             /* Aktiver KI-Agent */
```

## 🐛 Error-Handling

### Error-Typen
```typescript
interface APIError {
  message: string;
  code?: string;
  details?: any;
}

interface ValidationError {
  field: string;
  message: string;
  value: any;
}

interface AuthError {
  message: string;
  status: number;
}
```

### Error-Boundaries
```typescript
class ErrorBoundary extends React.Component {
  static getDerivedStateFromError(error: Error): ErrorState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error:', error, errorInfo);
  }
}
```

## 🧪 Testing-API

### Test-Utilities
```typescript
// Komponenten-Tests
import { render, screen, fireEvent } from '@testing-library/react';

// Canvas-Tests
const simulateCanvasDrag = (element: HTMLElement, deltaX: number, deltaY: number) => {
  fireEvent.mouseDown(element);
  fireEvent.mouseMove(element, { clientX: deltaX, clientY: deltaY });
  fireEvent.mouseUp(element);
};

// Hook-Tests
import { renderHook, act } from '@testing-library/react';
```

---

**Letzte Aktualisierung**: 14. Juli 2025
**Version**: 1.0.0-beta
**API-Version**: v1