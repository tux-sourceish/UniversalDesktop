### **UniversalDesktop - Masterplan v8.0: "The Living Architecture"**

**Präambel: Die Vision**
*"Ein algebraisches Betriebssystem, das nur noch mit Zahlen läuft. So dass der Mensch seine eigenen Natur gegebenen Fähigkeiten reaktivieren kann."* - Raimund Welsch

**Status Quo:**
- **Build & Stabilität:** GRÜN ✅. Die Anwendung ist stabil, performant und frei von kritischen Fehlern. Die Abhärtung (Security, Performance-Splitting) ist abgeschlossen.
- **Philosophie & Architektur:** Das μX-Bagua-System und das Campus-Modell sind zu 100% implementiert und in `PHILOSOPHY.md` und `ARCHITECTURE.md` dokumentiert.
- **KI-Seele:** Die `AGENT_PERSONAS` sind definiert und in `GEMINI.md` verewigt, ihre technische Integration ist abgeschlossen.
- **Kern-Features:** File-Manager, Universal Context Menu und alle grundlegenden Fenster-Typen sind implementiert und funktional.
- **`UniversalFile`:** Existiert als eigenständige, philosophisch fundierte Bibliothek, bereit für die nächste Evolutionsstufe.

**Übergeordnete Direktive:**
Transformiere die stabile v2.1-Anwendung in eine **lebendige, unendlich skalierbare und erweiterbare Plattform (v2.2+).** Implementiere die architektonischen Muster, die notwendig sind, um die "10.000-Item-Challenge" zu meistern und den Weg für das Ökosystem der Zukunft zu ebnen.

---

#### **Phase 1: Performance für die Ewigkeit – Die 10.000-Item-Challenge**
*(Ziel: Die Architektur so optimieren, dass sie mühelos mit riesigen, komplexen Workspaces umgehen kann.)*

*   **☐ Task 1.1 (Canvas-Virtualisierung / Viewport Culling):**
    *   **Aktion:** Implementiere die wichtigste Performance-Optimierung. Rendere im `μ8_CanvasModule` nur die `μ8_DesktopItem`-Komponenten, die sich tatsächlich im sichtbaren Bereich des Bildschirms befinden.
    *   **Warum:** Dies ist der Schlüssel, um tausende von Fenstern zu verwalten, ohne die UI zu blockieren.

*   **☐ Task 1.2 (File-Manager-Virtualisierung):**
    *   **Aktion:** Integriere eine Virtualisierungs-Bibliothek (z.B. `TanStack Virtual`) in den `μ2_FileManager`, um Verzeichnisse mit tausenden von Dateien ohne Performance-Verlust darzustellen.
    *   **Warum:** Macht den File-Manager bereit für den professionellen Einsatz mit großen Datenmengen.

*   **☐ Task 1.3 (Web-Worker für Hintergrundprozesse):**
    *   **Aktion:** Lagere die rechenintensive Workspace-Serialisierung (`toWorkspaceSnapshot`) aus dem `μ1_useWorkspace`-Hook in einen Web-Worker aus.
    *   **Warum:** Verhindert, dass die UI einfriert, während große Workspaces im Hintergrund gespeichert werden.

---
#### **Phase 2: Vertiefung der Philosophie – Lebendige Interaktion**
*(Ziel: Die abstrakten philosophischen Konzepte in greifbare, intuitive User-Experience-Features verwandeln.)*

*   **☐ Task 2.1 (Algebraische State Machines):**
    *   **Aktion:** Refaktoriere den `μ3_useFileSystem`-Hook. Implementiere eine explizite, algebraische State Machine (wie in `μX_StateManagement.ts` entworfen), um die Dateizugriffs-Logik robuster und vorhersagbarer zu machen.
    *   **Warum:** Verhindert ungültige Zustandsübergänge und macht die komplexe Logik wartbarer.

*   **☐ Task 2.2 (Universelle Kommando-Palette - Prototyp):**
    *   **Aktion:** Erstelle einen neuen Hook `μ7_useCommandPalette`. Registriere Aktionen aus `μ8_usePanelLayout` (z.B. "Toggle AI Panel") und `μ1_useWorkspace` (z.B. "Save Workspace").
    *   **Aktion:** Erstelle eine UI-Komponente, die mit `Strg+P` geöffnet wird und es dem Benutzer ermöglicht, jede registrierte Aktion über die Tastatur zu suchen und auszuführen.
    *   **Warum:** Dies ist der erste Schritt zu einer hyper-effizienten, tastaturgesteuerten Bedienung, die Power-User lieben werden.

*   **☐ Task 2.3 (Fraktale Navigation & Ästhetik):**
    *   **Aktion:** Implementiere die prozedurale, fraktale Hintergrundtextur für den Canvas, die auf die Zoomstufe reagiert und das Gefühl unendlicher Tiefe vermittelt.
    *   **Warum:** Macht die Vision des unendlichen Raums visuell und emotional erlebbar.

---
#### **Phase 3: Das Ökosystem der Zukunft (Vorbereitung für v3.0)**
*(Ziel: Die Architektur für externe Erweiterungen öffnen und die Grundlagen für die nächste Generation schaffen.)*

*   **☐ Task 3.1 (Globaler Event Bus - μ7 DONNER ☳):**
    *   **Aktion:** Beginne mit dem Refactoring der Callback-basierten Kommunikation. Ersetze die `onCreateUDItem`-Prop, die durch mehrere Komponenten gereicht wird, durch ein globales Event `μ7_event.item.created`.
    *   **Warum:** Entkoppelt die Komponenten vollständig und macht die `UniversalDesktopv2.tsx` noch schlanker. Dies ist die Grundlage für eine Plugin-Architektur.

*   **☐ Task 3.2 (Visueller AI-Workflow-Editor - Konzept):**
    *   **Aktion:** Erstelle einen Schwarm-Auftrag zur Konzeption eines `μ2_WorkflowEditor`-Fensters.
    *   **Ziel:** Der Schwarm soll einen detaillierten Plan liefern, wie ein Node-basierter Editor zur visuellen Verkettung der KI-Agenten implementiert werden kann.

*   **☐ Task 3.3 (Zentrales Einstellungs-Panel - Konzept):**
    *   **Aktion:** Erstelle einen Schwarm-Auftrag zur Konzeption eines `μ4_SettingsPanel`.
    *   **Ziel:** Der Plan soll beschreiben, wie die Konfigurationen aller Hooks (max. Tokens, Debounce-Zeiten etc.) in einem zentralen Panel verwaltet und im `.ud`-Workspace gespeichert werden können.
