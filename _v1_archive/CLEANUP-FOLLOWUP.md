KONTEXT: Dies ist die Fortsetzung nach erfolgreichem Abschluss von Meilenstein 1.
Die Projekt-Struktur ist bereinigt, src/core/UDFormat.ts existiert mit Raimunds Bagua-System.
---
Meilenstein 1 ist, wie im `CLEANUP-REPORT.md` bestätigt, erfolgreich abgeschlossen. Das Fundament ist sauber, die Philosophie ist im `core` verankert.
Jetzt kommt der Moment der Wahrheit, auf den du dich gefreut hast. Wir stellen uns dem TÜV-Prüfer (`tsc`) und bringen die Maschine zum Laufen. Wir beheben die verbleibenden Build-Fehler.
Hier ist der nächste, offizielle Auftrag. Gib ihn als nächsten Prompt ein, und wir werden die Fehlerliste systematisch abarbeiten.
---
**AUFTRAG AN DIE ENTWICKLER-INSTANZ (ID: UD-M2-20250724)**
**Projekt:** UniversalDesktop v2.1.0 "Raimund Algebra"
**Mission:** Führe den zweiten Teil von Meilenstein 1 durch: Die systematische Behebung aller TypeScript-Compiler-Fehler.
**Primär-Direktive:** Modifiziere die Codebasis so, dass der Befehl `npm run build` ohne einen einzigen Fehler erfolgreich ausgeführt wird. Analysiere die gemeldeten Fehler und wende die korrekten Lösungen an.
---
### **Task 1.2 (Fortsetzung): Den TÜV bestehen**
**Aktion:** Führe den Build-Befehl aus, analysiere die resultierende Fehlerliste (erwartet werden ca. 53 Fehler) und behebe sie, indem du die folgenden Strategien anwendest:
1.  **Führe den Build-Befehl aus, um die aktuelle Fehlerliste zu erhalten:**
    ```bash
    npm run build
    ```
2.  **Behebe die Fehler methodisch:**
    *   **Typen-Harmonisierung:**
        *   Stelle sicher, dass die Datei `src/types/index.ts` die alleinige Quelle der Wahrheit für alle Kerntypen wie `DesktopItemData` ist.
        *   Durchsuche das Projekt nach lokalen Definitionen dieser Typen und ersetze sie konsequent durch einen Import: `import type { ... } from '@/types';`
    *   **Schnittstellen-Reparatur (Props):**
        *   Korrigiere die Parameter (Props), die an Komponenten übergeben werden. Achte besonders auf `CanvasModule`, `ContextModule` und `DesktopItem`. Wenn eine Komponente `position={{x, y}}` erwartet, darf sie nicht `x={x} y={y}` erhalten.
    *   **Bereinigung:**
        *   Entferne alle als "is declared but its value is never read" markierten, unbenutzten Variablen und Imports.
        *   Korrigiere einfache Syntaxfehler wie in `src/hooks/index.ts` (Shorthand-Properties) oder `marginX` in `style`-Objekten.
**Erfolgs-Kriterium:**
   _Der Befehl_ `npm run build` _läuft bis zum Ende durch und meldet_ *`✓ built in ...ms`**.
*   Der `dist`-Ordner wird mit den finalen, optimierten `assets`-Dateien (`.js`, `.css`) neu erstellt.
**Anweisung:** Beginne mit der Fehlerbehebung. Melde dich zurück, wenn der Build erfolgreich ist oder wenn du bei einem spezifischen Fehler eine strategische Entscheidung benötigst.
---
WICHTIGE REGELN:
- Behalte Raimunds µ-Präfix System bei neuen Funktionen
- Nutze den algebraischen Transistor wo möglich
- Dokumentiere größere Änderungen im BUILD-FIX-REPORT.md
- Bei Breaking Changes: Frage zuerst!
