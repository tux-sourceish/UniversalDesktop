-- 🌌 UniversalDesktop v2.1 - Campus-Model Workspace Table
-- Raimunds Bagua-System für .ud Document Storage

-- Main workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  ud_document TEXT NOT NULL, -- Base64 encoded binary .ud document
  ud_version TEXT DEFAULT '2.1.0-raimund-algebra',
  bagua_descriptor INTEGER DEFAULT 256, -- UDFormat.BAGUA.TAIJI
  item_count INTEGER DEFAULT 0,
  canvas_bounds JSONB DEFAULT '{"minX": 0, "maxX": 4000, "minY": 0, "maxY": 4000}',
  document_hash TEXT NOT NULL,
  revision_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{
    "minimap": {"enabled": true, "position": "bottom-right"}, 
    "bagua_colors": true, 
    "auto_save": true, 
    "context_zones": true
  }',
  is_active BOOLEAN DEFAULT true
);

-- Metadata view without binary data (for performance)
CREATE OR REPLACE VIEW workspace_metadata AS
SELECT 
  id,
  user_id,
  name,
  item_count,
  bagua_descriptor,
  CASE bagua_descriptor
    WHEN 1 THEN '☰' -- HIMMEL
    WHEN 2 THEN '☴' -- WIND  
    WHEN 4 THEN '☵' -- WASSER
    WHEN 8 THEN '☶' -- BERG
    WHEN 16 THEN '☱' -- SEE
    WHEN 32 THEN '☲' -- FEUER
    WHEN 64 THEN '☳' -- DONNER
    WHEN 128 THEN '☷' -- ERDE
    ELSE '☯' -- TAIJI
  END as bagua_symbol,
  last_accessed_at,
  document_hash,
  is_active
FROM workspaces;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_active ON workspaces(user_id, is_active, last_accessed_at DESC);
CREATE INDEX IF NOT EXISTS idx_workspaces_hash ON workspaces(document_hash);

-- Row Level Security (RLS)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own workspaces
CREATE POLICY IF NOT EXISTS "Users can access own workspaces" ON workspaces
  FOR ALL USING (auth.uid()::text = user_id::text);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_workspaces_updated_at 
  BEFORE UPDATE ON workspaces 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 🌌 Campus-Model ist ready for Bagua-Power!