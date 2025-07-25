KONTEXT: Die Minimap funktioniert! Aber der Canvas ist leer.
Die Toolbar-Buttons existieren, erstellen aber noch keine Items.

MISSION: Bringe die Buttons zum Leben!

1. FINDE die Button-Handler:
   ```bash
   grep -r "notizzettel\|tabelle\|code\|browser" src/ -i -A5 -B5
   grep -r "createItem\|handleCreate\|onAdd" src/ -A5 -B5
   ```

2. IMPLEMENTIERE µ1_createItem für jeden Button:
   ```typescript
   // src/hooks/useWindowManager.ts oder ähnlich

   const µ1_createNotizzettel = () => {
     const newItem: DesktopItemData = {
       id: generateId(),
       type: UDFormat.ItemType.NOTIZZETTEL,  // War früher NOTIZZETTEL
       title: "Neue Notiz",
       position: {
         x: Math.random() * 800 + 100,  // Zufällige Position
         y: Math.random() * 600 + 100,
         z: Date.now()  // Z-Index als Timestamp
       },
       size: { width: 300, height: 200 },
       content: { text: "Deine Gedanken hier..." },
       bagua_descriptor: UDFormat.BAGUA.ERDE | UDFormat.BAGUA.WIND,
       isMinimized: false,
       isMaximized: false
     };

     // Füge zum globalen State hinzu
     addItem(newItem);
   };
   ```

3. VERKNÜPFE Buttons mit Handlers:
   ```typescript
   // Finde wo die Buttons definiert sind und verbinde sie:

   const toolbarButtons = [
     {
       icon: "📝",
       label: "Notizzettel",
       onClick: µ1_createNotizzettel,
       bagua: UDFormat.BAGUA.ERDE
     },
     {
       icon: "📊",
       label: "Tabelle",
       onClick: µ1_createTabelle,
       bagua: UDFormat.BAGUA.WIND | UDFormat.BAGUA.SEE
     },
     // ... etc für alle Buttons
   ];
   ```

4. ITEM-TYPE MAPPING (WICHTIG!):
   ```typescript
   // Die alten Button-Namen zu neuen ItemTypes:
   const buttonTypeMapping = {
     'notizzettel': UDFormat.ItemType.NOTIZZETTEL,  // bleibt
     'tabelle': UDFormat.ItemType.TABELLE,          // bleibt
     'code': UDFormat.ItemType.KONSTRUKTOR,         // NEU!
     'browser': UDFormat.ItemType.FLUSS,            // NEU!
     'terminal': UDFormat.ItemType.FUNKTION,        // NEU!
     'calendar': UDFormat.ItemType.EREIGNIS,        // NEU!
     'media': UDFormat.ItemType.FLUSS,              // NEU!
     'chart': UDFormat.ItemType.TABELLE             // Tabellen-Variante
   };
   ```

5. DEFAULT CONTENT für jeden Typ:
   ```typescript
   const getDefaultContent = (type: number) => {
     switch(type) {
       case UDFormat.ItemType.NOTIZZETTEL:
         return { text: "Neue Notiz..." };
       case UDFormat.ItemType.TABELLE:
         return {
           headers: ["Spalte 1", "Spalte 2"],
           rows: [["Daten", "Hier"]]
         };
       case UDFormat.ItemType.KONSTRUKTOR:
         return {
           code: "// Neuer Code\nfunction µ1_create() {\n  \n}",
           language: "typescript"
         };
       // ... etc
     }
   };
   ```

6. TESTE jeden Button:
   - Click auf "Notizzettel" → Neues Fenster erscheint
   - Fenster ist bewegbar/resize-bar
   - Erscheint in der Minimap mit richtiger Farbe
   - Bagua-Descriptor ist korrekt gesetzt

ERFOLG = Alle 8 Buttons erstellen sichtbare Items auf dem Canvas!

BONUS: Nutze Raimunds Transistor für Button-States:
```typescript
const buttonEnabled = UDFormat.transistor(canCreateItems);
opacity: 0.5 + 0.5 * buttonEnabled;  // Disabled = 0.5, Enabled = 1.0
```
```

## **Zusatz-Hinweis für Claude:**

"Die Item-Creation hat in v1 funktioniert. Finde die alte Logik und adaptiere sie für das neue UDFormat.ItemType System. Die Fenster-Komponenten (DesktopItem) existieren bereits - sie müssen nur mit Daten gefüttert werden!"

Das sollte die Buttons zum Leben erwecken! 🚀
