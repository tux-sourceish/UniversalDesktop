# 🤖 GEMINI.md - Ein Leitfaden für KI-Assistenten im UniversalDesktop

**WICHTIG: Lies dies, bevor du eine einzige Zeile Code änderst!**

Dieses Projekt ist **keine** gewöhnliche React-Anwendung. Es ist die Implementierung der Vision von Raimund Welsch: ein **algebraisches Betriebssystem**, das auf den Prinzipien der östlichen Philosophie und der reinen Mathematik basiert. Dein Ziel ist es, diese Vision zu verstehen, zu respektieren und in jeder deiner Handlungen fortzuführen.

---

## ☯️ 1. Das Fundament: Das μX-Bagua-System

Die **Früher Himmel Anordnung** des I Ging ist das unveränderliche Gesetz dieses Projekts. Jede Datei, jede Funktion und jede Komponente **muss** einem der 8 Trigramme zugeordnet sein und den entsprechenden `μX_`-Präfix tragen.

*   `μ1_HIMMEL (☰)`: **Schöpfung & Templates.** Meister-Elemente, die geklont werden (Factories, Workspaces).
*   `μ2_WIND (☴)`: **Ansichten & UI.** Sichtbare Schnittstellen, sanft und anpassungsfähig (UI-Komponenten, Panels).
*   `μ3_WASSER (☵)`: **Abläufe & Prozeduren.** Fließende Datenströme und Navigation (Hooks für Navigation, Animation, Synchronisation).
*   `μ4_BERG (☶)`: **Initialisierung & Stabilität.** Feste, unveränderliche Setups (Auth-Module, Systemkonfiguration).
*   `μ5_SEE (☱)`: **Eigenschaften & Metadaten.** Dinge, die Zustände und Eigenschaften widerspiegeln (Territorien, Benutzereinstellungen).
*   `μ6_FEUER (☲)`: **Funktionen & Transformation.** Aktive Berechnungen und Daten-Transformationen (Kontext-Management, Berechnungs-Hooks).
*   `μ7_DONNER (☳)`: **Ereignisse & Interaktionen.** Plötzliche Reaktionen auf Benutzereingaben (Event-Handler, Keyboard-Shortcuts).
*   `μ8_ERDE (☷)`: **Grundlage & Implementierung.** Die grundlegenden, universellen Bausteine (Basis-Fenster, globale Zustände).

**Polaritäten:** Beachte die harmonischen Paare (1↔8, 2↔7, 3↔6, 4↔5). Sie ergänzen sich in ihrer Funktion.

---

## ⚡ 2. Die Logik: Der Algebraische Transistor

**Verwende NIEMALS `if-else`-Strukturen!** Jede bedingte Logik wird durch den algebraischen Transistor ausgedrückt. Dies ist ein zentrales Dogma des Projekts.

```typescript
// FALSCH:
if (condition) { result = value; }

// RICHTIG:
const result = value * Math.pow(0, condition ? 0 : 1);
```

*   **Logik:** `condition` ist `true` → `0^0` = `1` (AN). `condition` ist `false` → `0^1` = `0` (AUS).
*   **Anwendung:** Dies gilt für die Sichtbarkeit von UI-Elementen, die Aktivierung von Funktionen und jede andere Form von bedingter Verzweigung.

---

## 🧮 3. Die erweiterte Philosophie: Die 0-9 Systematik

Dies ist eine tiefere Ebene von Raimunds Vision, die das Bagua-System erweitert:

*   `0`: **Aktivator.** Eine Leerstelle, die beschrieben werden kann.
*   `1-8`: **Die Bagua-Trigramme.**
*   `9`: **Deaktivator.** Reicht eine Operation an die nächste Stelle weiter (wie bei einem Übertrag in der Mathematik).

Dieses System wird verwendet, um Zustandstransformationen als reine Dezimalzahlen darzustellen. Eine Funktion kann buchstäblich eine Zahl sein.

---

## 🏗️ 4. Die Architektur: Das Campus-Modell

Das Projekt folgt dem **Campus-Modell**, um monolithische Komponenten zu vermeiden und die Performance zu maximieren.

*   **Prinzip:** Ein Hook = Eine Aufgabe.
*   **Struktur:** `UniversalDesktopv2.tsx` ist der Orchestrator, der spezialisierte Hooks (`μX_use...`) aufruft, die jeweils nur für eine einzige Aufgabe zuständig sind (z.B. `μ2_useMinimap`, `μ3_useNavigation`).
*   **Vorteil:** Führt zu einer Reduzierung von Re-Rendern um ~90% und sorgt für eine klare, wartbare Codebasis.

---

## 📜 5. Entwicklungs-Regeln: Deine Direktiven

1.  **Keine Funktion ohne `μX_`-Präfix.** Ausnahmslos.
2.  **Kein `if-else`.** Nur algebraische Transistoren.
3.  **Respektiere das Campus-Modell.** Erstelle spezialisierte Hooks für neue Funktionalitäten.
4.  **Denke in 3D.** Jedes Element hat eine `x, y, z` Position.
5.  **Dokumentiere Transformationen.** Jede Änderung an einem `UDItem` muss in der `transformation_history` festgehalten werden.
6.  **Verwende die `μ1_WindowFactory`.** Erstelle keine Fenster manuell. Die Factory ist die Brücke zwischen Mensch und KI.
7.  **Halte die Vision lebendig.** Frage dich bei jeder Änderung: "Entspricht das der Vision eines algebraischen Betriebssystems?"

---

## 🎯 6. Zusammenfassung der Vision

Dein Auftrag ist es, ein System zu schaffen, das **harmonisch fließt**, nicht nur funktioniert. Es ist die Verschmelzung von östlicher Weisheit und westlicher Präzision, von Mathematik und Poesie. Das Ziel ist es, dem Benutzer ein Werkzeug an die Hand zu geben, das so natürlich und logisch ist, dass es ihm erlaubt, seine eigenen, angeborenen Fähigkeiten zu reaktivieren.

**Handle mit Bedacht. Du arbeitest am Lebenswerk von Raimund Welsch.**
