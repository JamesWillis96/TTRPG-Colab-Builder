-- Add Markdown Theme Support to Wiki Pages
-- Run this in Supabase SQL Editor to add markdown_theme column to wiki_pages table

-- Add markdown_theme column to wiki_pages
ALTER TABLE wiki_pages
ADD COLUMN markdown_theme TEXT DEFAULT 'github';

-- Add constraint to ensure only valid themes
ALTER TABLE wiki_pages
ADD CONSTRAINT valid_markdown_theme
CHECK (markdown_theme IN ('air', 'modest', 'retro', 'splendor', 'github'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS wiki_pages_markdown_theme_idx ON wiki_pages(markdown_theme);

-- Update comment for documentation
COMMENT ON COLUMN wiki_pages.markdown_theme IS 'Markdown CSS theme: air, modest, retro, splendor, or github (default)';
