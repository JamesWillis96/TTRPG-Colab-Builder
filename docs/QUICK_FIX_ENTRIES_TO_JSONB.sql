-- QUICK FIX: Convert entries column to JSONB format
-- Run this FIRST, before loading the seed data

-- Step 1: Add the new JSONB column temporarily
ALTER TABLE random_tables ADD COLUMN entries_jsonb JSONB;

-- Step 2: Convert any existing TEXT[] entries to JSONB format
UPDATE random_tables 
SET entries_jsonb = (
  SELECT jsonb_agg(jsonb_build_object('text', entry, 'weight', 1))
  FROM (SELECT unnest(entries) as entry) sub
)
WHERE entries IS NOT NULL;

-- Step 3: Drop the old TEXT[] column
ALTER TABLE random_tables DROP COLUMN entries CASCADE;

-- Step 4: Rename the new JSONB column to 'entries'
ALTER TABLE random_tables RENAME COLUMN entries_jsonb TO entries;

-- Step 5: Make sure entries is NOT NULL and has a default
ALTER TABLE random_tables ALTER COLUMN entries SET NOT NULL;

-- Step 6: Recreate any missing indexes
CREATE INDEX IF NOT EXISTS idx_random_tables_category ON random_tables(category);
CREATE INDEX IF NOT EXISTS idx_random_tables_is_official ON random_tables(is_official);
CREATE INDEX IF NOT EXISTS idx_random_tables_tags ON random_tables USING GIN(tags);

-- Step 7: Verify the schema
SELECT column_name, data_type FROM information_schema.columns 
WHERE table_name = 'random_tables' AND column_name = 'entries';

-- You should see: entries | jsonb

-- Now you can safely run OFFICIAL_RANDOM_TABLES_SEED_DATA.sql
