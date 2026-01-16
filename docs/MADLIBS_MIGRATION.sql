-- Mad Libs Feature - Database Migration
-- Creates tables for Mad Lib templates, fills, and related data
-- Date: January 16, 2026

-- ============================================================================
-- CREATE EXTENSION (if not exists)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MADLIB_TEMPLATES TABLE
-- ============================================================================
-- Stores Mad Lib template definitions with blanks, metadata, and examples

CREATE TABLE IF NOT EXISTS madlib_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('simple', 'moderate', 'complex')),
  tone TEXT[] DEFAULT '{}',
  stakes VARCHAR(20) NOT NULL CHECK (stakes IN ('low', 'medium', 'high')),
  template_text TEXT NOT NULL,
  -- Blanks stored as JSONB array of MadLibBlank objects
  -- Structure: [{ id: string, name: string, type: string, description: string, constraints?: string[], examples?: string[], allowRoll?: boolean, reuseCount?: number }, ...]
  blanks JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  -- Example fill for validation and display
  -- Structure: { BLANK_ID: "example value", ... }
  example_fill JSONB,
  is_official BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_madlib_templates_category ON madlib_templates(category) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_madlib_templates_difficulty ON madlib_templates(difficulty) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_madlib_templates_is_official ON madlib_templates(is_official) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_madlib_templates_created_by ON madlib_templates(created_by) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_madlib_templates_created_at ON madlib_templates(created_at) WHERE deleted_at IS NULL;
    -- GIN index for array search on tone
    CREATE INDEX IF NOT EXISTS idx_madlib_templates_tone ON madlib_templates USING GIN(tone) WHERE deleted_at IS NULL;

-- ============================================================================
-- MADLIB_FILLS TABLE
-- ============================================================================
-- Stores user's answers to Mad Lib templates (fills and drafts)

CREATE TABLE IF NOT EXISTS madlib_fills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES madlib_templates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  -- User's answers: { BLANK_ID: { value: string, rolled: boolean }, ... }
  -- rolled indicates if the answer came from Random Tables roll or manual entry
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Final rendered template text (generated from template_text with answers filled in)
  output TEXT,
  -- Draft or completed fill
  is_draft BOOLEAN DEFAULT true,
  -- If exported to wiki, reference the wiki page
  saved_to_wiki_id UUID REFERENCES wiki_pages(id) ON DELETE SET NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Soft delete support
  deleted_at TIMESTAMP WITH TIME ZONE,
  deleted_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_madlib_fills_user_id ON madlib_fills(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_madlib_fills_template_id ON madlib_fills(template_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_madlib_fills_is_draft ON madlib_fills(is_draft) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_madlib_fills_saved_at ON madlib_fills(saved_at) WHERE deleted_at IS NULL;
-- Compound index for user's draft fills
CREATE INDEX IF NOT EXISTS idx_madlib_fills_user_draft ON madlib_fills(user_id, is_draft) WHERE deleted_at IS NULL;

-- ============================================================================
-- HELPER FUNCTIONS (must exist before RLS policies reference them)
-- ============================================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT role = 'admin' FROM profiles WHERE id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Function to soft-delete a template
CREATE OR REPLACE FUNCTION soft_delete_madlib_template(template_id UUID, deleting_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE madlib_templates
  SET deleted_at = NOW(), deleted_by = deleting_user_id
  WHERE id = template_id AND (created_by = deleting_user_id OR is_admin(deleting_user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to soft-delete a fill
CREATE OR REPLACE FUNCTION soft_delete_madlib_fill(fill_id UUID, deleting_user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE madlib_fills
  SET deleted_at = NOW(), deleted_by = deleting_user_id
  WHERE id = fill_id AND (user_id = deleting_user_id OR is_admin(deleting_user_id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on madlib_templates
ALTER TABLE madlib_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read official templates
CREATE POLICY "Anyone can read official madlib templates"
  ON madlib_templates FOR SELECT
  USING (is_official = true OR deleted_at IS NULL);

-- Policy: Authenticated users can read non-deleted templates
CREATE POLICY "Authenticated users can read non-deleted madlib templates"
  ON madlib_templates FOR SELECT
  TO authenticated
  USING (deleted_at IS NULL);

-- Policy: Only creator can update/delete their own templates
CREATE POLICY "Users can update own madlib templates"
  ON madlib_templates FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by OR is_admin(auth.uid()))
  WITH CHECK (auth.uid() = created_by OR is_admin(auth.uid()));

CREATE POLICY "Users can delete own madlib templates"
  ON madlib_templates FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR is_admin(auth.uid()));

-- Policy: Authenticated users can create templates
CREATE POLICY "Authenticated users can create madlib templates"
  ON madlib_templates FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Enable RLS on madlib_fills
ALTER TABLE madlib_fills ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own fills
CREATE POLICY "Users can read own madlib fills"
  ON madlib_fills FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can create fills (for their own user_id)
CREATE POLICY "Users can create madlib fills"
  ON madlib_fills FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own fills
CREATE POLICY "Users can update own madlib fills"
  ON madlib_fills FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own fills
CREATE POLICY "Users can delete own madlib fills"
  ON madlib_fills FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE madlib_templates IS 'Mad Lib template definitions with blanks, metadata, and examples';
COMMENT ON COLUMN madlib_templates.title IS 'Template name (e.g., "The Conflicted Quest-Giver")';
COMMENT ON COLUMN madlib_templates.category IS 'Template category: NPCs, Encounters, Items, Locations, Session Hooks';
COMMENT ON COLUMN madlib_templates.difficulty IS 'Template complexity: simple, moderate, complex';
COMMENT ON COLUMN madlib_templates.tone IS 'Array of tone descriptors (e.g., ["dramatic", "personal"])';
COMMENT ON COLUMN madlib_templates.stakes IS 'Story stakes level: low, medium, high';
COMMENT ON COLUMN madlib_templates.template_text IS 'Raw template text with [BLANK_ID] placeholders';
COMMENT ON COLUMN madlib_templates.blanks IS 'JSONB array of blank field definitions including constraints and examples';
COMMENT ON COLUMN madlib_templates.example_fill IS 'Example completed fill showing what good output looks like';
COMMENT ON COLUMN madlib_templates.is_official IS 'True for curated/official templates, false for user-created';
COMMENT ON COLUMN madlib_templates.deleted_at IS 'Soft delete timestamp (NULL if not deleted)';

COMMENT ON TABLE madlib_fills IS 'User fills of Mad Lib templates (both drafts and completed)';
COMMENT ON COLUMN madlib_fills.answers IS 'JSONB map of blank answers: { BLANK_ID: { value: string, rolled: boolean }, ... }';
COMMENT ON COLUMN madlib_fills.output IS 'Rendered template with all blanks filled in';
COMMENT ON COLUMN madlib_fills.is_draft IS 'True for unsaved/incomplete fills, false for completed/saved fills';
COMMENT ON COLUMN madlib_fills.saved_to_wiki_id IS 'Foreign key to wiki_pages if this fill was exported to Wiki';

-- ============================================================================
-- SEED DATA (OPTIONAL - uncomment to populate)
-- ============================================================================

-- NOTE: Seed data will be added in MADLIBS_SEED_DATA.sql to keep migrations clean

COMMENT ON TABLE madlib_templates IS 'Seeding official templates in separate migration file';

-- ============================================================================
-- MIGRATION NOTES
-- ============================================================================

/*
USAGE:

1. Run this migration to create the tables and RLS policies
2. Run MADLIBS_SEED_DATA.sql to populate official templates
3. Client code will insert/update fills when users complete Mad Libs

DATA STRUCTURE EXAMPLES:

-- madlib_templates.blanks
[
  {
    "id": "CHARACTER_NAME",
    "name": "Character Name",
    "type": "creative",
    "description": "An interesting, memorable name...",
    "examples": ["Thorn Blackwood", "Sister Margot"],
    "reuseCount": 2
  },
  ...
]

-- madlib_fills.answers
{
  "CHARACTER_NAME": { "value": "Cassian Voss", "rolled": false },
  "ROLE": { "value": "Spicemaster", "rolled": true },
  ...
}

FUTURE ENHANCEMENTS:

1. Multi-template combinations (e.g., encounter = NPC + Location + Complication)
2. Template sharing between users
3. Public/private template visibility
4. Template version history
5. Community ratings/comments on templates
6. AI-suggested fills for blanks
7. Template import/export for other campaigns
*/
