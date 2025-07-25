-- scripts/create-workspaces-table.sql

/**
 * 🗄️ WORKSPACE TABLE CREATION - UniversalDesktop v2.1
 * 
 * Neue Datenbank-Struktur für .ud Document Storage
 * Basierend auf ANWEISUNG.md - Workspace-basierte Architektur
 * 
 * @version 2.1.0-raimund-algebra
 */

-- Drop existing workspaces table if exists (development only)
DROP TABLE IF EXISTS workspaces CASCADE;

-- Create workspaces table for .ud document storage
CREATE TABLE workspaces (
    -- Primary identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Workspace metadata
    name VARCHAR(255) NOT NULL DEFAULT 'Untitled Workspace',
    description TEXT,
    
    -- .ud Document Storage (Binary BLOB)
    ud_document BYTEA NOT NULL, -- Binary .ud document content
    ud_version VARCHAR(50) DEFAULT '2.1.0-raimund-algebra',
    
    -- Bagua System Metadata
    bagua_descriptor INTEGER DEFAULT 0, -- Workspace's primary Bagua category
    item_count INTEGER DEFAULT 0,      -- Cached count of items in document
    
    -- Spatial & Context Information  
    canvas_bounds JSONB DEFAULT '{"minX": 0, "maxX": 4000, "minY": 0, "maxY": 4000}',
    context_zones JSONB DEFAULT '[]',  -- Territory/context zone definitions
    
    -- Version Control & History
    document_hash VARCHAR(64),         -- SHA-256 hash of ud_document for change detection
    revision_number INTEGER DEFAULT 1,
    last_modified_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Workspace Settings
    settings JSONB DEFAULT '{
        "minimap": {"enabled": true, "position": "bottom-right"},
        "bagua_colors": true,
        "auto_save": true,
        "context_zones": true
    }',
    
    -- Performance & Caching
    is_active BOOLEAN DEFAULT TRUE,
    cache_expiry TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX idx_workspaces_updated_at ON workspaces(updated_at DESC);
CREATE INDEX idx_workspaces_active ON workspaces(user_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_workspaces_document_hash ON workspaces(document_hash);
CREATE INDEX idx_workspaces_bagua ON workspaces(bagua_descriptor);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_workspace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Update last_accessed_at if document was accessed
    IF TG_OP = 'SELECT' THEN
        NEW.last_accessed_at = NOW();
    END IF;
    
    -- Recalculate document hash if ud_document changed
    IF OLD.ud_document IS DISTINCT FROM NEW.ud_document THEN
        NEW.document_hash = encode(digest(NEW.ud_document, 'sha256'), 'hex');
        NEW.revision_number = OLD.revision_number + 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic updated_at
CREATE TRIGGER trigger_workspaces_updated_at
    BEFORE UPDATE ON workspaces
    FOR EACH ROW
    EXECUTE FUNCTION update_workspace_updated_at();

-- Row Level Security (RLS) policies
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Users can only access their own workspaces
CREATE POLICY "Users can access their own workspaces" ON workspaces
    FOR ALL USING (auth.uid() = user_id);

-- Allow users to create workspaces
CREATE POLICY "Users can create workspaces" ON workspaces
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create view for workspace metadata (without binary data)
CREATE VIEW workspace_metadata AS
SELECT 
    id,
    user_id,
    name,
    description,
    ud_version,
    bagua_descriptor,
    item_count,
    canvas_bounds,
    document_hash,
    revision_number,
    created_at,
    updated_at,
    last_accessed_at,
    settings,
    is_active,
    -- Bagua symbol for display
    CASE bagua_descriptor
        WHEN 1 THEN '☰'  -- HIMMEL
        WHEN 2 THEN '☴'  -- WIND  
        WHEN 4 THEN '☵'  -- WASSER
        WHEN 8 THEN '☶'  -- BERG
        WHEN 16 THEN '☱' -- SEE
        WHEN 32 THEN '☲' -- FEUER
        WHEN 64 THEN '☳' -- DONNER
        WHEN 128 THEN '☷' -- ERDE
        WHEN 256 THEN '☯' -- TAIJI
        ELSE '❓'
    END AS bagua_symbol
FROM workspaces;

-- Grant access to the view
GRANT SELECT ON workspace_metadata TO authenticated;

-- Create function to get workspace by user (most recent)
CREATE OR REPLACE FUNCTION get_current_workspace(user_uuid UUID)
RETURNS TABLE (
    workspace_id UUID,
    workspace_name VARCHAR(255),
    ud_document BYTEA,
    bagua_descriptor INTEGER,
    last_modified TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        w.id,
        w.name,
        w.ud_document,
        w.bagua_descriptor,
        w.updated_at
    FROM workspaces w
    WHERE w.user_id = user_uuid 
      AND w.is_active = TRUE
    ORDER BY w.last_accessed_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to save workspace with .ud document
CREATE OR REPLACE FUNCTION save_workspace_document(
    workspace_uuid UUID,
    user_uuid UUID,
    document_data BYTEA,
    workspace_name VARCHAR(255) DEFAULT NULL,
    item_count_param INTEGER DEFAULT 0
)
RETURNS BOOLEAN AS $$
DECLARE
    rows_affected INTEGER;
BEGIN
    UPDATE workspaces 
    SET 
        ud_document = document_data,
        name = COALESCE(workspace_name, name),
        item_count = item_count_param,
        last_modified_by = user_uuid,
        last_accessed_at = NOW()
    WHERE id = workspace_uuid 
      AND user_id = user_uuid;
    
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    
    RETURN rows_affected > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert welcome comment
INSERT INTO workspaces (user_id, name, description, ud_document, bagua_descriptor)
SELECT 
    auth.uid(),
    '🌌 Welcome Workspace',
    'Ihr erster Workspace mit Raimunds Bagua-Power!',
    E'\\x554e4956455253414c44544f43554d454e54', -- "UNIVERSALDOCUMENT" in hex
    256 -- TAIJI (☯) - Unity/Center
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;

-- Final status message
COMMENT ON TABLE workspaces IS 'UniversalDesktop v2.1 - Workspace storage with .ud documents and Bagua-System integration';

-- 🎮 Ready for Raimunds algebraische Transistor-Power! ⚡