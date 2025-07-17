# 🤝 Beiträge zu SingularUniverse UniversalDesktop

Vielen Dank für Ihr Interesse an der Verbesserung des UniversalDesktop! Diese Richtlinien helfen Ihnen dabei, effektiv beizutragen.

## 📋 Inhaltsverzeichnis

- [🚀 Erste Schritte](#-erste-schritte)
- [🔧 Entwicklungsumgebung](#-entwicklungsumgebung)
- [📝 Beitragsarten](#-beitragsarten)
- [🎯 Entwicklungsworkflow](#-entwicklungsworkflow)
- [📏 Code-Standards](#-code-standards)
- [🧪 Testing](#-testing)
- [📚 Dokumentation](#-dokumentation)
- [🐛 Bug-Reports](#-bug-reports)
- [💡 Feature-Requests](#-feature-requests)

## 🚀 Erste Schritte

### Voraussetzungen
- Node.js 18+ 
- npm oder yarn
- Git
- Grundkenntnisse in React/TypeScript

### Repository setup
```bash
# Repository forken und klonen
git clone https://github.com/your-username/SingularUniverse.git
cd SingularUniverse/UniversalDesktop

# Abhängigkeiten installieren
npm install

# Entwicklungsumgebung starten
npm run dev
```

### Erste Orientierung
1. **README.md lesen** - Überblick über das Projekt
2. **ARCHITECTURE.md studieren** - Technische Architektur verstehen
3. **Existierende Issues durchgehen** - Offene Aufgaben finden
4. **Diskussionen verfolgen** - Community-Austausch verstehen

## 🔧 Entwicklungsumgebung

### Empfohlene IDE-Konfiguration
```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.suggest.autoImports": true
}
```

### Empfohlene Extensions
- **ES7+ React/Redux/React-Native snippets**
- **TypeScript Importer**
- **Prettier - Code formatter**
- **ESLint**
- **GitLens**

### Umgebungsvariablen
```bash
# .env.development
VITE_SUPABASE_URL=your-dev-supabase-url
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
VITE_DEBUG=true
```

## 📝 Beitragsarten

### 🐛 Bug-Fixes
- **Kleine Fixes**: Direkt Pull Request erstellen
- **Größere Fixes**: Issue erstellen, dann Pull Request
- **Kritische Bugs**: Sofortige Behebung mit Dokumentation

### ✨ Features
- **Neue Features**: Issue mit Proposal erstellen
- **Feature-Erweiterungen**: Diskussion in bestehenden Issues
- **Experimentelle Features**: Feature-Branch mit RFC

### 📚 Dokumentation
- **Typos/Verbesserungen**: Direkte Pull Requests
- **Neue Dokumentation**: Issue für Diskussion erstellen
- **API-Änderungen**: Dokumentation synchron aktualisieren

### 🎨 UI/UX
- **Design-Verbesserungen**: Screenshots/Mockups in Issue
- **Accessibility**: WCAG-Compliance sicherstellen
- **Responsive Design**: Mobile-First-Prinzip befolgen

## 🎯 Entwicklungsworkflow

### 1. Issue-Setup
```bash
# Neuen Branch erstellen
git checkout -b feature/issue-123-new-feature
# oder
git checkout -b bugfix/issue-456-fix-drag-drop
```

### 2. Entwicklung
```bash
# Regelmäßige Commits mit aussagekräftigen Messages
git commit -m "feat: add infinite canvas zoom limits

- Implement min/max zoom constraints (10%-300%)
- Add zoom level indicator in header
- Prevent zoom beyond usable range
- Fix canvas position reset on extreme zoom

Closes #123"
```

### 3. Testing
```bash
# Alle Tests ausführen
npm test

# Linting prüfen
npm run lint

# Build testen
npm run build
```

### 4. Pull Request
```bash
# Branch pushen
git push origin feature/issue-123-new-feature

# Pull Request über GitHub UI erstellen
```

## 📏 Code-Standards

### TypeScript-Konventionen
```typescript
// ✅ Gut: Vollständige Typisierung
interface DesktopItemProps {
  item: DesktopItemData;
  onUpdate: (id: string, updates: Partial<DesktopItemData>) => void;
  onDelete: (id: string) => void;
}

// ❌ Schlecht: any verwenden
interface BadProps {
  item: any;
  onUpdate: any;
}

// ✅ Gut: Funktionale Komponenten mit Hooks
const DesktopItem: React.FC<DesktopItemProps> = ({ item, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleUpdate = useCallback((updates: Partial<DesktopItemData>) => {
    onUpdate(item.id, updates);
  }, [item.id, onUpdate]);
  
  return <div>{/* Component JSX */}</div>;
};

// ❌ Schlecht: Class-Components für neue Features
class BadDesktopItem extends React.Component {
  // Vermeiden für neue Entwicklung
}
```

### CSS-Konventionen
```css
/* ✅ Gut: CSS-Variablen verwenden */
.desktop-item {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--border-radius);
}

/* ✅ Gut: Modulare Selektoren */
.desktop-content .desktop-item {
  z-index: 10;
}

/* ❌ Schlecht: Hardcoded Werte */
.bad-item {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* ❌ Schlecht: Überspezifische Selektoren */
.universal-desktop .desktop-content .infinite-canvas .desktop-item .item-header {
  /* Zu spezifisch */
}
```

### Commit-Message-Format
```
type(scope): description

body

footer
```

**Typen:**
- `feat`: Neue Funktionalität
- `fix`: Bug-Fix
- `docs`: Dokumentation
- `style`: Formatierung, Styling
- `refactor`: Code-Umstrukturierung
- `test`: Tests hinzufügen/ändern
- `chore`: Build-Prozess, Dependencies

**Beispiele:**
```bash
feat(canvas): implement infinite zoom with momentum physics

- Add requestAnimationFrame-based smooth zooming
- Implement momentum decay for natural feel
- Add zoom limits (10%-300%) with elastic feedback
- Fix coordinate transformation for zoom levels

Closes #123
Refs #456

fix(drag): resolve window positioning at high zoom levels

The drag offset calculation was not accounting for canvas scale,
causing windows to jump when dragged at zoom levels != 1.0.

- Fix coordinate transformation in useDraggable hook
- Add zoom-aware position calculation
- Update drag offset to use canvas coordinates
- Add regression tests for zoom-drag interaction

Fixes #789
```

## 🧪 Testing

### Unit Tests
```typescript
// Komponenten-Tests
import { render, screen, fireEvent } from '@testing-library/react';
import DesktopItem from './DesktopItem';

describe('DesktopItem', () => {
  const mockItem: DesktopItemData = {
    id: 'test-item',
    type: 'notizzettel',
    title: 'Test Note',
    position: { x: 100, y: 200, z: 1 },
    content: 'Test content',
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    user_id: 'test-user'
  };

  it('renders item title correctly', () => {
    render(<DesktopItem item={mockItem} onUpdate={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Test Note')).toBeInTheDocument();
  });

  it('handles drag interaction', () => {
    const onUpdate = jest.fn();
    render(<DesktopItem item={mockItem} onUpdate={onUpdate} onDelete={jest.fn()} />);
    
    const item = screen.getByTestId('desktop-item');
    fireEvent.mouseDown(item);
    fireEvent.mouseMove(item, { clientX: 50, clientY: 50 });
    fireEvent.mouseUp(item);
    
    expect(onUpdate).toHaveBeenCalledWith('test-item', {
      position: expect.objectContaining({ x: 150, y: 250 })
    });
  });
});
```

### Integration Tests
```typescript
// Canvas-Interaktion Tests
describe('Canvas Integration', () => {
  it('maintains item positions during zoom', () => {
    render(<UniversalDesktop />);
    
    // Item erstellen
    const toolButton = screen.getByText('notizzettel');
    fireEvent.click(toolButton);
    
    // Zoom ändern
    const canvas = screen.getByTestId('infinite-canvas');
    fireEvent.wheel(canvas, { deltaY: -100 });
    
    // Item-Position prüfen
    const item = screen.getByTestId('desktop-item');
    expect(item).toHaveStyle({ transform: expect.stringContaining('translate') });
  });
});
```

### E2E Tests (Geplant)
```typescript
// Playwright/Cypress Tests
describe('Full User Workflow', () => {
  it('creates, edits, and deletes items', () => {
    // Vollständiger Benutzer-Workflow
  });
});
```

## 📚 Dokumentation

### Code-Dokumentation
```typescript
/**
 * Hook für Drag-und-Drop-Funktionalität mit Canvas-Zoom-Unterstützung
 * 
 * @param ref - Referenz auf das draggable Element
 * @param options - Konfigurationsoptionen
 * @returns Drag-Status und Utility-Funktionen
 * 
 * @example
 * ```typescript
 * const dragRef = useRef<HTMLDivElement>(null);
 * const { isDragging } = useDraggable(dragRef, {
 *   onDragEnd: (position) => updateItemPosition(position)
 * });
 * ```
 */
const useDraggable = (
  ref: React.RefObject<HTMLElement>,
  options: DragOptions
): DragResult => {
  // Implementation
};
```

### README-Updates
- **Neue Features**: Feature-Liste aktualisieren
- **Breaking Changes**: Migration-Guide hinzufügen
- **API-Änderungen**: Beispiele aktualisieren

### Changelog
```markdown
## [1.1.0] - 2025-07-15

### Added
- Infinite canvas zoom with momentum physics
- Keyboard shortcuts for common operations
- Export functionality for desktop layouts

### Changed
- Improved drag performance at high zoom levels
- Enhanced glass morphism visual effects
- Updated TypeScript to 5.1

### Fixed
- Window positioning bug at zoom levels > 200%
- Memory leak in canvas animation loop
- Context menu positioning on mobile devices

### Security
- Updated dependencies to address security vulnerabilities
```

## 🐛 Bug-Reports

### Bug-Report-Template
```markdown
## Bug-Beschreibung
Kurze, klare Beschreibung des Problems.

## Reproduzierung
Schritte zur Reproduktion:
1. Gehe zu '...'
2. Klicke auf '...'
3. Scrolle nach unten zu '...'
4. Siehe Fehler

## Erwartetes Verhalten
Beschreibung des erwarteten Verhaltens.

## Tatsächliches Verhalten
Beschreibung des tatsächlichen Verhaltens.

## Screenshots
Falls zutreffend, füge Screenshots hinzu.

## Umgebung
- OS: [z.B. Windows 11, macOS 12.6]
- Browser: [z.B. Chrome 118, Firefox 119]
- Version: [z.B. 1.0.0-beta]
- Supabase: [Ja/Nein, welche Version]

## Zusätzlicher Kontext
Weitere Informationen zum Problem.

## Mögliche Lösung
Falls Sie eine Idee für eine Lösung haben.
```

### Debugging-Informationen
```typescript
// Debug-Utilities bereitstellen
console.log('Canvas State:', {
  position: canvasState.position,
  scale: canvasState.scale,
  items: items.length
});

// Browser-Informationen
navigator.userAgent;
window.innerWidth + 'x' + window.innerHeight;
```

## 💡 Feature-Requests

### Feature-Request-Template
```markdown
## Feature-Beschreibung
Klare Beschreibung der gewünschten Funktionalität.

## Motivation
Warum ist dieses Feature nützlich? Welches Problem löst es?

## Detaillierte Beschreibung
Ausführliche Beschreibung der Implementierung.

## Mockups/Wireframes
Visuelle Darstellung des Features (falls zutreffend).

## Akzeptanzkriterien
- [ ] Kriterium 1
- [ ] Kriterium 2
- [ ] Kriterium 3

## Technische Überlegungen
- Kompatibilität mit bestehenden Features
- Performance-Auswirkungen
- Sicherheitsaspekte

## Alternativen
Andere Ansätze, die erwogen wurden.
```

## 🎯 Spezielle Bereiche

### Canvas-Entwicklung
- **Koordinaten-Systeme**: Viewport vs. Canvas-Koordinaten
- **Performance**: requestAnimationFrame verwenden
- **Zoom-Handling**: Transform-Matrix korrekt anwenden
- **Event-Handling**: Bubble-Verhalten beachten

### KI-Integration
- **Agent-System**: Modulare Agent-Implementierung
- **Prompt-Engineering**: Effektive KI-Anweisungen
- **Error-Handling**: Robuste Fehlerbehandlung
- **Rate-Limiting**: API-Limits beachten

### Supabase-Integration
- **RLS-Policies**: Sichere Datentrennung
- **Real-time**: Optimistic Updates implementieren
- **Migrations**: Datenbankschema-Änderungen
- **Performance**: Query-Optimierung

## 🔄 Review-Prozess

### Pull Request Reviews
1. **Automatische Checks**: CI/CD muss grün sein
2. **Code-Review**: Mindestens 1 Maintainer-Approval
3. **Testing**: Manuelle Tests für UI-Änderungen
4. **Dokumentation**: Prüfung auf Vollständigkeit

### Review-Checkliste
- [ ] Code folgt Projektstandards
- [ ] Tests sind vorhanden und passieren
- [ ] Dokumentation ist aktualisiert
- [ ] Keine Breaking Changes ohne Migration
- [ ] Performance-Auswirkungen bewertet
- [ ] Sicherheitsaspekte berücksichtigt

## 🏆 Anerkennung

### Contributor-Anerkennung
- **GitHub Contributors**: Automatische Anerkennung
- **Changelog**: Erwähnung bei größeren Beiträgen
- **Special Thanks**: Für außergewöhnliche Beiträge

### Maintainer-Prozess
- **Regelmäßige Beiträge**: Über 3 Monate
- **Code-Quality**: Hohe Standards einhalten
- **Community-Engagement**: Hilfe für andere Entwickler
- **Projektverständnis**: Tiefes Verständnis der Architektur

## 📞 Kontakt

- **GitHub Issues**: Bug-Reports und Feature-Requests
- **GitHub Discussions**: Allgemeine Fragen und Diskussionen
- **Email**: singular-universe@example.com (für private Anliegen)

## 📜 Code of Conduct

Wir sind einem offenen und einladenden Umfeld verpflichtet. Bitte lesen Sie unseren [Code of Conduct](CODE_OF_CONDUCT.md) für Details.

---

**Vielen Dank für Ihre Beiträge zum SingularUniverse UniversalDesktop!** 🚀

**Letzte Aktualisierung**: 14. Juli 2025
**Version**: 1.0.0-beta