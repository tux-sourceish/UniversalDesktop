# UniversalDesktop Prototype 🌌

Ein intelligenter, unendlicher Desktop-Arbeitsbereich mit proaktiver KI-Unterstützung und modularen Elementen.

## 🚀 Quick Start

```bash
# In das UniversalDesktop-Verzeichnis wechseln
cd /home/tux/SingularUniverse/UniversalDesktop

# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Build für Production
npm run build

# Preview Production Build
npm run preview
```

## 🎯 Features

### 🏗️ 4-Bereich-Layout
- **Header**: Logo, Canvas-Controls, AI-Toggle
- **Infinite Canvas**: Unendliche Arbeitsfläche mit Momentum-Physik
- **AI-Panel**: Multi-Agent-System mit Reasoner, Coder, Refiner
- **Sidebar**: Werkzeugkasten mit Desktop-Elementen

### 🌊 Infinite Canvas System
- **Momentum-Navigation**: Natürliche Scroll-Physik mit Damping
- **Zoom-Funktionalität**: Mausrad-Zoom von 10% bis 300%
- **Drag & Drop**: Intuitive Canvas-Bewegung
- **Performance**: Optimierte Animationen mit requestAnimationFrame

### 🤖 Multi-Agent AI Integration
- **Reasoner Agent**: Analysiert Benutzer-Intent
- **Coder Agent**: Generiert Code und Inhalte
- **Refiner Agent**: Verbessert und finalisiert Elemente
- **Visueller Status**: Echtzeit-Anzeige der Agent-Aktivität

### ✨ Enhanced UI Components
- **Glass Morphism**: Moderne transparente Oberflächen
- **Responsive Design**: Optimiert für alle Bildschirmgrößen
- **Accessibility**: WCAG-konforme Bedienung
- **Smooth Animations**: Natürliche Bewegungen und Übergänge

### 💾 Debounced Save System
- **Supabase Integration**: Automatische Synchronisation
- **localStorage Fallback**: Offline-Unterstützung
- **500ms Debounce**: Performance-optimierte Speicherung
- **Optimistic Updates**: Sofortige UI-Reaktionen

## 🔧 Desktop-Elemente

- **📝 Notizzettel**: Textnotizen und Markdown
- **📊 Tabelle**: Datenstrukturen und Listen
- **💻 Code**: Syntax-Highlighting und Ausführung
- **🌐 Browser**: Eingebettete Webseiten
- **⚫ Terminal**: Kommandozeilen-Interface
- **📅 Kalender**: Terminverwaltung
- **🎬 Media**: Bilder, Videos, Audio
- **📈 Chart**: Diagramme und Visualisierungen

## 🎨 Design System

### Glass Morphism
```css
--glass-bg: hsla(0, 0%, 100%, 0.15);
--glass-blur: blur(0.75em);
--glass-border: hsla(0, 0%, 100%, 0.3);
--glass-shadow: 0 0.5em 1.5em hsla(223, 10%, 10%, 0.15);
```

### Farbpalette
```css
--accent-blue: #4a90e2;    /* Primärfarbe */
--accent-green: #50e3c2;   /* Erfolg */
--accent-red: #e35050;     /* Fehler */
--accent-yellow: #f5d76e;  /* Warnung */
```

### Animationen
```css
--ease-natural: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## 📱 Responsive Breakpoints

- **Desktop**: > 1200px - Vollständige Sidebar und AI-Panel
- **Tablet**: 768px - 1200px - Kompakte Sidebar
- **Mobile**: < 768px - Overlay-Panels

## 🔐 Supabase Setup (Optional)

1. Erstelle ein Supabase-Projekt: https://supabase.com
2. Erstelle eine `.env` Datei:
```env
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🏗️ Dateistruktur

```
ai/
├── package.json          # Dependencies
├── vite.config.ts        # Vite Configuration
├── tsconfig.json         # TypeScript Config
├── index.html            # HTML Template
├── src/
│   ├── main.tsx          # Entry Point
│   ├── index.css         # Global Styles
│   ├── UniversalDesktop.tsx  # Main Component
│   └── UniversalDesktop.css  # Component Styles
└── README-prototype.md   # Diese Datei
```

## 🎮 Bedienung

### Maus
- **Linke Maustaste**: Canvas bewegen
- **Mausrad**: Zoom in/out
- **Werkzeuge-Klick**: Neue Elemente erstellen

### AI-Panel
- **🤖 AI Button**: Panel öffnen/schließen
- **Enter**: Prompt ausführen
- **🚀 Execute**: Beispiel-Aktion

### Werkzeugkasten
- **Klick auf Tool**: Neues Element erstellen
- **Verschiedene Typen**: Notizzettel, Tabelle, Code, etc.

## 🔮 Philosophisches Mapping

### infinitechess.org → Infinite Canvas
- **Feste Kamera**: Header/UI-Bereiche bleiben statisch
- **Beweglicher Inhalt**: Desktop-Elemente bewegen sich darunter
- **Momentum-Navigation**: Natürliche Scroll-Physik
- **Unendlicher Raum**: Keine Grenzen für Kreativität

### archon → Multi-Agent AI
- **Reasoner Agent**: Versteht Benutzer-Intent
- **Coder Agent**: Generiert Code-Blöcke
- **Refiner Agent**: Verbessert vorhandene Elemente
- **Workflow-Orchestration**: Koordiniert komplexe Aufgaben

### vue-bits → Enhanced UI
- **Glass Morphism**: Natürliche Fenster-Ästhetik
- **Spotlight Effects**: Aufmerksamkeits-Lenkung
- **Magnetic Elements**: Intuitive Interaktionen
- **Theme System**: Kontextuelle Arbeitsräume

## 🐛 Debugging

### Development Tools
```bash
# Type-Check ohne Build
npm run type-check

# Vite mit Debug-Infos
npm run dev -- --debug

# Build mit Source Maps
npm run build
```

---

**Erstellt mit ❤️ und 🤖 von Claude Code**