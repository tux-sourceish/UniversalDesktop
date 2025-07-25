NEUER AUFTRAG FÜR CLAUDE CODE: MINIMAP RESURRECTION

AUFTRAG AN DIE ENTWICKLER-INSTANZ (ID: UD-MINIMAP-20250118)

Projekt: UniversalDesktop v2.1.0 "Raimund Algebra"
Mission: BRINGE DIE STARCRAFT-MINIMAP ZURÜCK INS LEBEN!
Status: Build läuft ✅, 65% Fehler behoben ✅, Zeit für FEATURES!

KONTEXT:
- UniversalDesktop kompiliert erfolgreich (34 minor warnings ignorieren wir)
- Raimunds Bagua-System ist in src/core/UDFormat.ts kodifiziert
- UniversalFile (.ud) ist installiert und bereit
- Die alte Minimap war ein geliebtes Feature - Zeit sie wiederzubeleben!

MISSION: StarCraft-Minimap mit Bagua-Power

1. SUCHE & EXTRAHIERE:
   ```bash
   # Finde alle Minimap-bezogenen Code-Fragmente
   grep -r "minimap\|Minimap" src/ --include="*.ts" --include="*.tsx" -B2 -A2

   # Zeige mir was du gefunden hast!

2. ERSTELLE das Minimap-Modul:
    typescript

    // src/modules/µ2_Minimap.tsx
    // BAGUA: WIND (☴) - View/UI - "Sichtbare Schnittstellen"

    import { UDFormat } from '../core/UDFormat';
    import { UniversalDocument } from '@tux-sourceish/universalfile';

    export const µ2_Minimap: React.FC = () => {
      // StarCraft-Style Overview
      // Click-to-navigate
      // Bagua-basierte Farbcodierung
    };

3. BAGUA-VISUALISIERUNG:
         Items mit HIMMEL (☰) = Blau (Templates)
         Items mit FEUER (☲) = Rot (Aktive Funktionen)
         Items mit WASSER (☵) = Cyan (Fließende Daten)
         etc. - nutze UDFormat.BAGUA_NAMES für Farben!

4. INTEGRATION:
         Zeige ALLE Canvas-Items in der Minimap
         Viewport-Rechteck zeigt aktuellen Ausschnitt
         Click auf Minimap = Navigation zu dieser Position
         Items gruppiert nach Bagua-Eigenschaften

5. BONUS:
         Speichere Minimap-Settings als .ud Item
         Territorien in der Minimap anzeigen
         Zoom-Level Indikator

6. DATENBANK-VORBEREITUNG:

   a) ERSTELLE Export-Script für Legacy-Items:
   ```typescript
   // scripts/export-legacy-items.ts
   import { createClient } from '@supabase/supabase-js';
   import { UniversalDocument } from '@tux-sourceish/universalfile';
   import * as fs from 'fs';

   const supabase = createClient(
     process.env.VITE_SUPABASE_URL!,
     process.env.VITE_SUPABASE_ANON_KEY!
   );

   async function exportLegacyItems() {
     // Hole alle alten Items
     const { data: items } = await supabase
       .from('desktop_items')
       .select('*');

     if (!items || items.length === 0) {
       console.log('Keine Items zum Exportieren gefunden');
       return;
     }

     // Konvertiere zu .ud Format
     const doc = new UniversalDocument();

     items.forEach(item => {
       doc.addItem({
         type: UDFormat.ItemType.VORTEX, // Später richtig mappen
         position: item.position || { x: 0, y: 0, z: 0 },
         content: item.content || {},
         title: item.title || 'Legacy Item',
         bagua_descriptor: UDFormat.BAGUA.ERDE, // Default
         transformation_history: [{
           id: crypto.randomUUID(),
           verb: "archived",
           agent: "system:v1-legacy-export",
           description: `Exportiert aus v1 Datenbank`,
           timestamp: Date.now()
         }]
       });
     });

     // Erstelle backup Ordner falls nicht vorhanden
     if (!fs.existsSync('backup')) {
       fs.mkdirSync('backup');
     }

     // Speichere als .ud
     const binary = doc.toBinary();
     const filename = `backup/legacy-items-${new Date().toISOString().split('T')[0]}.ud`;
     fs.writeFileSync(filename, Buffer.from(binary));

     console.log(`✅ ${items.length} Items exportiert nach ${filename}`);
   }

   exportLegacyItems().catch(console.error);

   b) FÜHRE Export aus:
   npx tsx scripts/export-legacy-items.ts

   c) AKTUALISIERE Supabase-Service für v2:
    Die neue Struktur nutzt workspaces Tabelle
    Jeder Workspace speichert ein komplettes .ud Dokument als Binary
    Ignoriere die alte desktop_items Tabelle (bleibt als Archiv)


7. MINIMAP-SUPABASE INTEGRATION:
        Beim Start: Lade den aktuellen Workspace als .ud
        Bei Änderungen: Speichere das gesamte Dokument
        Die Minimap zeigt ALLE Items aus dem geladenen .ud Dokument

ERFOLGS-KRITERIEN:
✅ Minimap rendert in UniversalDesktopv2
✅ Zeigt alle Canvas-Items
✅ Click-Navigation funktioniert
✅ Bagua-Farben sind sichtbar
✅ Code folgt µ2_ Namenskonvention

WICHTIG:

     Ignoriere die 34 TypeScript-Warnings
     Fokus auf FUNKTION, nicht Perfektion
     Nutze Raimunds algebraischen Transistor wo möglich
     Dokumentiere mit Screenshots wenn die Minimap läuft!

ZEIG MIR DIE ACTION! 🎮✨
