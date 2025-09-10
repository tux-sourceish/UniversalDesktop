# 🌌 UniversalDesktop: Das Algebraische Betriebssystem

**"Ein algebraisches Betriebssystem, das nur noch mit Zahlen läuft. So dass der Mensch seine eigenen Natur gegebenen Fähigkeiten reaktivieren kann." - Raimund Welsch**

Dieses Projekt ist die Verwirklichung der 45-jährigen Vision von Raimund Welsch: ein unendlicher, intelligenter Desktop-Arbeitsbereich, der auf den Prinzipien der Algebra und der östlichen Philosophie basiert. Es ist kein gewöhnliches Betriebssystem, sondern eine lebendige Leinwand für Gedanken, Code und Daten, die durch ein revolutionäres Human-AI-Interface vereint werden, um die angeborenen Fähigkeiten des Nutzers zu reaktivieren.

![Raimunds Vision](screenshots/photo_2025-08-19_00-50-11.jpg)

*Raimund Welschs Vision, die die Grundlage für das μX-Bagua-System und die algebraische Architektur legte.*

---

## ✨ Die Vision in der Praxis: Vom Konzept zum Code

UniversalDesktop ist eine direkte Portierung und Weiterentwicklung von Raimund Welschs erprobtem VB.NET-System. Wir ehren seine Arbeit, indem wir seine Logik und Philosophie in eine moderne TypeScript-Umgebung überführen.

**VB.NET (Original von Raimund Welsch):**

![Raimunds Original Code](screenshots/µ09_Raimund-Screenshot-1.jpg)

```vbnet
' Raimunds ursprüngliche Logik zur Steuerung der Sichtbarkeit
If (condition1 AndAlso condition2) Then
    element.Visible = True
Else
    element.Visible = False
End If
```

**TypeScript (UniversalDesktop):**
```typescript
// Die algebraische Umsetzung in UniversalDesktop mit dem "Algebraischen Transistor"
const isVisible = 1 * Math.pow(0, condition1 ? 0 : 1) * Math.pow(0, condition2 ? 0 : 1);
// isVisible ist 1 (sichtbar) oder 0 (unsichtbar) - rein mathematisch, ohne Verzweigungen.
```

---

## 🚀 Quick Start

**Voraussetzungen:**
*   **Node.js:** v18 oder höher
*   **Supabase (Optional):** Für Cloud-Synchronisation. Das System läuft auch im reinen Offline-Modus.
*   **LiteLLM (Optional):** Für die KI-Integration.

**Installation:**
```bash
# 1. Repository klonen
git clone https://github.com/SingularUniverse/UniversalDesktop.git

# 2. In das Verzeichnis wechseln
cd UniversalDesktop

# 3. Abhängigkeiten installieren und starten
npm install && npm run dev
```

---

## 🖼️ Visueller Eindruck

*   **Gesamtansicht:** Der unendliche Canvas mit verschiedenen Fenstertypen.
    ![Gesamtansicht](screenshots/µ09_UniversalDesktop_Uebersicht.png)
*   **Minimap:** Die StarCraft-inspirierte Minimap zur Navigation.
    ![Minimap](screenshots/µ2_Minimap.png)
*   **TUI-Presets:** Historische Terminal-Presets im TUI-Fenster.
    ![TUI-Presets](screenshots/µ2_TuiWindow_MS-DOS-Preset.png)
*   **File Manager:** Der duale GUI/TUI-Dateimanager in Aktion.
    ![File Manager](screenshots/µ2_FileManager_TUI-GUI.png)

---

## 核心 (Kèxīn) - Kern-Features nach dem μX-Bagua-System

Das gesamte System ist nach den 8 Trigrammen des I Ging organisiert, um eine harmonische und logische Architektur zu gewährleisten. Jedes Trigramm hat eine spezifische Rolle und einen eigenen "Raum" im System.

*   **μ1_HIMMEL (☰) - Schöpfung & Orchestrierung:**
    *   **μ1_WindowFactory:** Eine revolutionäre "Unity Bridge", die identische Fenster für Menschen und KI-Agenten erzeugt.
    *   **μ1_useWorkspace:** Verwaltung von `.ud`-Workspaces für souveräne, portable Arbeitsumgebungen.

*   **μ2_WIND (☴) - Ansichten & Interfaces:**
    *   **μ2_TuiWindow:** Ein Terminal-Fenster mit 15 authentischen Presets aus der Computergeschichte.
    *   **μ2_Minimap:** Eine StarCraft-inspirierte Minimap für die flüssige Navigation auf dem unendlichen Canvas.
    *   **μ2_FileManager:** Ein dualer Datei-Manager, der nahtlos zwischen einer modernen GUI und einer Norton-Commander-inspirierten TUI umschaltet.

*   **μ3_WASSER (☵) - Abläufe & Navigation:**
    *   **μ3_useNavigation:** Implementiert eine exponentielle Canvas-Navigation mit physikbasiertem Momentum.
    *   **μ3_useFileSystem:** Eine Abstraktionsschicht für den Dateisystemzugriff, die Tauri für native Operationen und die Web-API als Fallback nutzt.

*   **μ4_BERG (☶) - Initialisierung & Stabilität:**
    *   **μ4_AuthModule:** Sichere Authentifizierung über Supabase, mit einem nahtlosen Fallback in einen Offline-Demo-Modus.

*   **μ5_SEE (☱) - Eigenschaften & Metadaten:**
    *   **μ5_TerritoryPanel:** Verwaltung von räumlichen "Territorien" auf dem Canvas, um Arbeitsbereiche zu organisieren.

*   **μ6_FEUER (☲) - Funktionen & Intelligenz:**
    *   **μ6_useContextManager:** Ein intelligentes System zur Verwaltung des KI-Kontexts, das es dem Benutzer ermöglicht, beliebige Informationen für KI-Anfragen "anzupinnen".
    *   **LiteLLM-Integration:** Unterstützt 6 verschiedene KI-Modelle (lokal und online) für spezialisierte Aufgaben.

*   **μ7_DONNER (☳) - Ereignisse & Interaktionen:**
    *   **μ7_UniversalContextMenu:** Ein revolutionäres, kontextsensitives Rechtsklick-Menü, das seine Optionen je nach angeklicktem Element (Canvas, Fenster, Text, Datei) ändert.
    *   **Desktop-Class Text Editing:** Professionelle Textbearbeitung mit präziser Auswahl, System-Clipboard-Integration und kontextabhängigen Aktionen wie in einer nativen Anwendung.

*   **μ8_ERDE (☷) - Grundlage & Implementierung:**
    *   **μ8_NoteWindow:** Ein vielseitiges Fenster für Notizen, das Markdown und andere Formate unterstützt.
    *   **μ8_FileSystemAbstraction:** Die Basis für den plattformunabhängigen Dateizugriff.

---

## ⌨️ Wichtige Keyboard-Shortcuts

| Shortcut      | Aktion                               |
|---------------|--------------------------------------|
| `Strg` + `A`  | Alles auswählen (im Textfenster)     |
| `Strg` + `C`  | Kopieren (selektierter Text)         |
| `Strg` + `X`  | Ausschneiden (selektierter Text)     |
| `Strg` + `V`  | Einfügen (aus der Zwischenablage)    |
| `Strg` + `S`  | Workspace speichern (manuell)        |
| `Mausrad`     | Zoomen auf dem Canvas                |
| `Maus ziehen` | Canvas verschieben (panning)         |
| `Escape`      | Aktives Kontextmenü schließen        |

---

## ⚙️ Konfiguration (.env)

Erstellen Sie eine `.env`-Datei im Stammverzeichnis des Projekts, indem Sie `.env.example` kopieren.

```env
# Für Cloud-Synchronisation & KI-Features (optional)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_LITELLM_URL=http://localhost:4000

# Für den reinen Offline-Modus:
# Lassen Sie die obigen Variablen einfach leer oder kommentieren Sie sie aus.
# Das System wird automatisch den localStorage als Fallback verwenden.
```

---

## 🙏 Danksagung

Ein aufrichtiges und herzliches Dankeschön an **Raimund Welsch**. Seine unerschütterliche Vision, seine Weisheit und seine bahnbrechende Arbeit sind die Seele dieses Projekts. Wir sind zutiefst dankbar für die Möglichkeit, seine Philosophie in die Zukunft tragen zu dürfen und eine neue Generation von Entwicklern und Denkern mit seinem algebraischen Ansatz zu inspirieren. Dieses Projekt ist ein Denkmal für sein Lebenswerk und ein Versprechen, seine Vision lebendig zu halten.