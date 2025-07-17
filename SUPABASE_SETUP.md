# Supabase Setup für UniversalDesktop

## 1. Supabase-Projekt erstellen

1. Gehe zu [https://supabase.com](https://supabase.com)
2. Erstelle ein neues Projekt
3. Wähle eine Region (z.B. "West EU (Ireland)")
4. Warte bis das Projekt bereit ist

## 2. Umgebungsvariablen konfigurieren

### Schritt 1: Supabase-Credentials finden
1. Gehe zu deinem Supabase-Dashboard
2. Klicke auf "Settings" → "API"
3. Kopiere folgende Werte:
   - **Project URL** (z.B. `https://xyzcompany.supabase.co`)
   - **anon/public key** (langer JWT-Token)

### Schritt 2: .env-Datei bearbeiten
```bash
# Öffne die .env-Datei
nano /home/tux/SingularUniverse/UniversalDesktop/.env
```

Ersetze die Placeholder-Werte:
```env
VITE_SUPABASE_URL=https://deinprojekt.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBtaXJmcGN0Y2ZrbGVueWtvYWFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI5MTkzNTMsImV4cCI6MjAxODQ5NTM1M30.abc123...
```

## 3. Datenbank-Schema erstellen

### Schritt 1: SQL-Editor öffnen
1. Gehe zu deinem Supabase-Dashboard
2. Klicke auf "SQL Editor"
3. Klicke auf "New query"

### Schritt 2: Tabelle erstellen
```sql
-- Desktop Items Table (Erweitert für Fenstergröße)
CREATE TABLE desktop_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('notizzettel', 'tabelle', 'code', 'browser', 'terminal', 'media', 'chart', 'calendar')),
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

-- Falls die Tabelle bereits existiert, erweitere sie:
-- ALTER TABLE desktop_items ADD COLUMN width INTEGER DEFAULT 250;
-- ALTER TABLE desktop_items ADD COLUMN height INTEGER DEFAULT 200;

-- Indizes für Performance
CREATE INDEX idx_desktop_items_user_id ON desktop_items(user_id);
CREATE INDEX idx_desktop_items_created_at ON desktop_items(created_at);
CREATE INDEX idx_desktop_items_type ON desktop_items(type);

-- Row Level Security aktivieren
ALTER TABLE desktop_items ENABLE ROW LEVEL SECURITY;
```

### Schritt 3: RLS-Policies erstellen
```sql
-- Policy: Benutzer können nur ihre eigenen Items sehen
CREATE POLICY "Users can view their own items" ON desktop_items
  FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Benutzer können nur ihre eigenen Items erstellen
CREATE POLICY "Users can create their own items" ON desktop_items
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Benutzer können nur ihre eigenen Items aktualisieren
CREATE POLICY "Users can update their own items" ON desktop_items
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy: Benutzer können nur ihre eigenen Items löschen
CREATE POLICY "Users can delete their own items" ON desktop_items
  FOR DELETE USING (auth.uid()::text = user_id);
```

### Schritt 4: Ausführen
1. Klicke auf "Run" für das Schema
2. Klicke auf "Run" für die Policies

## 4. Authentication konfigurieren (Optional)

### Schritt 1: Auth-Einstellungen
1. Gehe zu "Authentication" → "Settings"
2. Konfiguriere gewünschte Provider:
   - **Email/Password**: Standardmäßig aktiviert
   - **Google**: OAuth-Credentials hinzufügen
   - **GitHub**: OAuth-App erstellen

### Schritt 2: Email-Templates (Optional)
1. Gehe zu "Authentication" → "Email Templates"
2. Passe Bestätigungs-/Reset-Emails an

## 5. Testen der Verbindung

### Schritt 1: Development Server starten
```bash
cd /home/tux/SingularUniverse/UniversalDesktop
npm run dev
```

### Schritt 2: Browser-Konsole prüfen
1. Öffne Developer Tools (F12)
2. Gehe zu "Console"
3. Suche nach Fehlern oder Erfolgs-Meldungen

### Schritt 3: Funktionalität testen
- Erstelle ein neues Element im Werkzeugkasten
- Prüfe ob es in der Supabase-Tabelle erscheint
- Lade die Seite neu → Elemente sollten persistiert bleiben

## 6. Ohne Supabase verwenden

Falls du Supabase nicht konfigurieren möchtest:

### Option 1: Lokale Entwicklung
```env
# .env-Datei leer lassen oder auskommentieren
# VITE_SUPABASE_URL=
# VITE_SUPABASE_ANON_KEY=
```

### Option 2: Mock-Werte verwenden
```env
VITE_SUPABASE_URL=mock-url
VITE_SUPABASE_ANON_KEY=mock-key
```

**Hinweis**: Ohne Supabase werden alle Daten nur in localStorage gespeichert und gehen beim Löschen der Browser-Daten verloren.

## 7. Troubleshooting

### Fehler: "Invalid API key"
- Prüfe ob die VITE_SUPABASE_ANON_KEY korrekt kopiert wurde
- Stelle sicher, dass keine zusätzlichen Leerzeichen vorhanden sind

### Fehler: "relation 'desktop_items' does not exist"
- Führe das SQL-Schema aus (Schritt 3)
- Prüfe ob die Tabelle in "Table Editor" sichtbar ist

### Fehler: "Row Level Security policy violation"
- Führe die RLS-Policies aus (Schritt 3)
- Stelle sicher, dass Authentication aktiviert ist

### Fehler: "process is not defined"
- Verwende `import.meta.env` statt `process.env` in Vite
- Prefix für Umgebungsvariablen muss `VITE_` sein

### Entwicklung ohne Authentication
```javascript
// Temporärer Fix für Development (nicht für Production!)
const mockUser = { id: 'dev-user-123', email: 'dev@test.com' };
```

## 8. Production-Deployment

### Umgebungsvariablen für Hosting
```bash
# Vercel
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Netlify
netlify env:set VITE_SUPABASE_URL "https://deinprojekt.supabase.co"
netlify env:set VITE_SUPABASE_ANON_KEY "dein-anon-key"
```

### Build-Test
```bash
npm run build
npm run preview
```

## 9. Nützliche Supabase-Features

### Echtzeit-Subscriptions
```javascript
// Echtzeit-Updates für kollaborative Features
const subscription = supabase
  .channel('desktop_items')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'desktop_items' }, 
    (payload) => {
      console.log('Change received!', payload);
    })
  .subscribe();
```

### Storage für Dateien
```javascript
// Datei-Upload für Media-Elemente
const { data, error } = await supabase.storage
  .from('desktop-files')
  .upload(`${userId}/${filename}`, file);
```

### Edge Functions
```javascript
// Serverless Functions für AI-Integration
const { data, error } = await supabase.functions
  .invoke('process-ai-request', { body: { prompt } });
```

---

**Support**: Bei Problemen prüfe die [Supabase-Dokumentation](https://supabase.com/docs) oder die Browser-Konsole für detaillierte Fehlermeldungen.