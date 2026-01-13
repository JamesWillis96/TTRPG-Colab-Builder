-- Migration: Update random_tables schema for enhanced features
-- This adds new columns for description, category, tags, weighted entries, and official/curated tables

-- First, add new columns to the random_tables table
ALTER TABLE random_tables 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Other',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS is_official BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Update the entries column structure
-- Note: This assumes entries is currently a text[] or jsonb column
-- If it's text[], we need to migrate the data

-- Create a temporary migration function
CREATE OR REPLACE FUNCTION migrate_table_entries() RETURNS void AS $$
DECLARE
  table_record RECORD;
  new_entries JSONB;
  entry_text TEXT;
BEGIN
  -- Loop through all tables
  FOR table_record IN SELECT id, entries FROM random_tables LOOP
    -- Convert simple text array to weighted entry format
    new_entries := '[]'::jsonb;
    
    IF table_record.entries IS NOT NULL THEN
      FOREACH entry_text IN ARRAY table_record.entries LOOP
        new_entries := new_entries || jsonb_build_array(
          jsonb_build_object('text', entry_text, 'weight', 1)
        );
      END LOOP;
      
      -- Update the table with new format
      UPDATE random_tables 
      SET entries = new_entries 
      WHERE id = table_record.id;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Only run this if your entries column is currently TEXT[] type
-- If it's already JSONB with the right structure, skip this
-- SELECT migrate_table_entries();

-- Clean up the migration function
-- DROP FUNCTION IF EXISTS migrate_table_entries();

-- If entries is TEXT[], change it to JSONB
-- ALTER TABLE random_tables ALTER COLUMN entries TYPE JSONB USING entries::JSONB;

-- Create an index on category for faster filtering
CREATE INDEX IF NOT EXISTS idx_random_tables_category ON random_tables(category);

-- Create an index on is_official for faster sorting
CREATE INDEX IF NOT EXISTS idx_random_tables_is_official ON random_tables(is_official);

-- Create a GIN index on tags for faster tag searches
CREATE INDEX IF NOT EXISTS idx_random_tables_tags ON random_tables USING GIN(tags);

-- Add some sample official tables (optional - customize these for your game)
-- Uncomment and modify as needed

/*
INSERT INTO random_tables (title, description, category, tags, entries, is_official, created_by) VALUES
(
  'Fantasy Tavern Names',
  'Generate atmospheric names for taverns and inns',
  'Locations',
  ARRAY['fantasy', 'tavern', 'medieval'],
  '[
    {"text": "The Prancing Pony", "weight": 1},
    {"text": "The Dragon''s Breath", "weight": 1},
    {"text": "The Gilded Rose", "weight": 1},
    {"text": "The Silver Serpent", "weight": 1},
    {"text": "The Wandering Wyrm", "weight": 1},
    {"text": "The Rusty Blade", "weight": 1},
    {"text": "The Merry Minstrel", "weight": 1},
    {"text": "The Broken Crown", "weight": 1},
    {"text": "The Silent Knight", "weight": 1},
    {"text": "The Howling Wolf", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = ''admin'' LIMIT 1)
),
(
  'NPC Personality Traits',
  'Quick personality traits to bring NPCs to life',
  'NPCs',
  ARRAY['npc', 'personality', 'roleplay'],
  '[
    {"text": "Nervous and stuttering", "weight": 1},
    {"text": "Overly confident and boastful", "weight": 1},
    {"text": "Suspicious of strangers", "weight": 1},
    {"text": "Friendly and helpful", "weight": 2},
    {"text": "Gruff but has a heart of gold", "weight": 1},
    {"text": "Scheming and manipulative", "weight": 1},
    {"text": "Absent-minded professor type", "weight": 1},
    {"text": "Speaks in riddles", "weight": 1},
    {"text": "Always eating or drinking", "weight": 1},
    {"text": "Extremely superstitious", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = ''admin'' LIMIT 1)
),
(
  'Weather Events',
  'Random weather for outdoor scenes',
  'Weather',
  ARRAY['weather', 'environment', 'atmosphere'],
  '[
    {"text": "Clear skies, pleasant breeze", "weight": 3},
    {"text": "Light rain", "weight": 2},
    {"text": "Heavy downpour", "weight": 1},
    {"text": "Thick fog", "weight": 1},
    {"text": "Snowfall", "weight": 1},
    {"text": "Thunderstorm approaching", "weight": 1},
    {"text": "Howling winds", "weight": 1},
    {"text": "Oppressive heat", "weight": 1},
    {"text": "Bitter cold", "weight": 1},
    {"text": "Sudden weather change", "weight": 1}
  ]'::jsonb,
  TRUE,
  (SELECT id FROM profiles WHERE role = ''admin'' LIMIT 1)
);
*/

-- Update RLS policies if needed
-- Ensure users can read all tables
DROP POLICY IF EXISTS "Users can view all tables" ON random_tables;
CREATE POLICY "Users can view all tables" 
  ON random_tables FOR SELECT 
  USING (true);

-- Ensure users can only edit their own tables (or admins can edit all)
DROP POLICY IF EXISTS "Users can edit own tables" ON random_tables;
CREATE POLICY "Users can edit own tables" 
  ON random_tables FOR UPDATE 
  USING (
    auth.uid() = created_by 
    OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Ensure users can only delete their own tables (or admins can delete all)
DROP POLICY IF EXISTS "Users can delete own tables" ON random_tables;
CREATE POLICY "Users can delete own tables" 
  ON random_tables FOR DELETE 
  USING (
    auth.uid() = created_by 
    OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Ensure users can create tables
DROP POLICY IF EXISTS "Users can create tables" ON random_tables;
CREATE POLICY "Users can create tables" 
  ON random_tables FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

COMMENT ON TABLE random_tables IS 'Random generator tables for TTRPG content with weighted entries';
COMMENT ON COLUMN random_tables.description IS 'Optional description of what this table generates';
COMMENT ON COLUMN random_tables.category IS 'Category for filtering (Names, NPCs, Locations, Items, etc.)';
COMMENT ON COLUMN random_tables.tags IS 'Array of tags for searching and filtering';
COMMENT ON COLUMN random_tables.entries IS 'JSONB array of {text: string, weight: number} objects';
COMMENT ON COLUMN random_tables.is_official IS 'True for curated/official tables, false for community submissions';
