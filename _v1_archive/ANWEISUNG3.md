ZUNÄCHST LIES UND BEACHTE:
KONTEXT: UniversalDesktop nutzt Raimunds Bagua-System.

WICHTIGSTE DATEIEN:
1. src/core/UDFormat.ts - DAS GESETZBUCH (Bagua, Transistor, ItemTypes)
2. src/types/index.ts - Zentrale Typdefinitionen

REGELN:
- JEDE Funktion: µ1_ bis µ8_ Präfix nach Bagua
- Nutze algebraischen Transistor statt if-else
- Hooks machen NUR EINE Sache
- UniversalFile (.ud) für Speicherung

NIEMALS generischen React-Code schreiben!

WAS MICH AM MEISTEN STÖRT:
Es ist keine Header-Zeile vorhanden. Bitte lass eine anzeigen mit Buttons, welche die Sichtbarkeit aller anderen Steuerelemente toggeln (Sidebars, Status-Anzeigen, Minimap, etc.). Diese Buttons sind noch nicht vollständig und befinden sich aktuell noch oben rechts an der linken Sidebar. Bei Klick haben sie nur teilweise Funktion (Browser Konsole: "Panel Toggle: tools ->...", "Panel Toggle: ai ->...", "Panel Toggle: territory ->...")

DANN DER AUFTRAG:

## **AUFTRAG FÜR CLAUDE CODE: MINIMAP NAVIGATION EXCELLENCE**

```
KONTEXT: Die Minimap funktioniert und zeigt Items! Aber die Navigation ist noch basic.
In v1 hatten wir StarCraft-ähnliche Navigation mit Zoom und Drag.

MISSION: Erweitere die Minimap zur vollwertigen Navigations-Zentrale!

FEATURE 1: ZOOM über Mausrad auf Minimap
```typescript
// In µ2_Minimap.tsx

const handleMinimapWheel = (e: WheelEvent) => {
  e.preventDefault();

  // Zoom ändert die Coverage der Minimap
  const zoomDelta = e.deltaY > 0 ? 0.9 : 1.1;
  const newCoverage = Math.max(2, Math.min(8, coverage * zoomDelta));

  setCoverage(newCoverage);

  // Update Canvas zoom level entsprechend
  const zoomLevel = 1 / newCoverage;
  canvas.setZoomLevel(zoomLevel);
};
```

FEATURE 2: DRAG des Viewport-Rechtecks
```typescript
const handleMinimapMouseDown = (e: MouseEvent) => {
  const rect = minimapRef.current.getBoundingClientRect();
  const x = (e.clientX - rect.left) / minimapScale;
  const y = (e.clientY - rect.top) / minimapScale;

  // Prüfe ob im Viewport-Rechteck
  if (isInViewportRect(x, y)) {
    setIsDraggingViewport(true);
    setDragOffset({
      x: x - viewport.x,
      y: y - viewport.y
    });
  } else {
    // Direkter Jump zu dieser Position
    canvas.panTo(x - viewport.width/2, y - viewport.height/2);
  }
};

const handleMinimapMouseMove = (e: MouseEvent) => {
  if (!isDraggingViewport) return;

  const rect = minimapRef.current.getBoundingClientRect();
  const x = (e.clientX - rect.left) / minimapScale - dragOffset.x;
  const y = (e.clientY - rect.top) / minimapScale - dragOffset.y;

  canvas.panTo(x, y);
};
```

FEATURE 3: EDGE INDICATORS (Pfeile für Items außerhalb)
```typescript
const renderEdgeIndicators = () => {
  const indicators = [];

  items.forEach(item => {
    if (!isInMinimapBounds(item.position)) {
      const angle = Math.atan2(
        item.position.y - minimapCenter.y,
        item.position.x - minimapCenter.x
      );

      indicators.push({
        angle,
        position: getEdgePosition(angle),
        color: getBaguaColor(item.bagua_descriptor),
        title: item.title
      });
    }
  });

  return indicators.map(ind => (
    <div
      className="minimap-edge-indicator"
      style={{
        transform: `translate(${ind.position.x}px, ${ind.position.y}px)
                   rotate(${ind.angle}rad)`,
        color: ind.color
      }}
      title={ind.title}
    >
      ➤
    </div>
  ));
};
```

FEATURE 4: ZOOM-LEVEL INTEGRATION
```typescript
// Zoom-Levels wie in v1
const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4];

// Coverage basiert auf Zoom
const calculateCoverage = (zoomLevel: number) => {
  // Bei Zoom 1x → Coverage 4x
  // Bei Zoom 0.25x → Coverage 8x
  // Bei Zoom 4x → Coverage 2x
  return 4 / Math.sqrt(zoomLevel);
};
```

FEATURE 5: HEADER mit Zoom-Buttons (Quick Win)
```typescript
// Erstelle src/components/µ1_Header.tsx
export const µ1_Header = () => {
  const { zoomLevel, setZoomLevel } = useCanvasNavigation();

  return (
    <header className="universal-header">
      <div className="zoom-controls">
        <button onClick={() => changeZoom(0.9)}>➖</button>
        <span>{Math.round(zoomLevel * 100)}%</span>
        <button onClick={() => changeZoom(1.1)}>➕</button>
      </div>
    </header>
  );
};
```

CSS für smoothe Navigation:
```css
.minimap-viewport {
  cursor: move;
  transition: none; /* Wichtig für flüssiges Dragging */
}

.minimap-edge-indicator {
  position: absolute;
  font-size: 20px;
  text-shadow: 0 0 4px rgba(0,0,0,0.8);
  pointer-events: none;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
```

TESTING:
1. Mausrad über Minimap → Zoom ändert sich
2. Drag Viewport-Rechteck → Canvas folgt
3. Click außerhalb Viewport → Jump to position
4. Items außerhalb → Pfeile am Rand
5. Header Zoom-Buttons → Synchron mit Minimap

ERFOLG = StarCraft-würdige Navigation! 🎮
```

Die Minimap wird damit zum **zentralen Navigations-Hub** - genau wie in StarCraft! Alle Zoom- und Pan-Operationen laufen über sie. 🚀
