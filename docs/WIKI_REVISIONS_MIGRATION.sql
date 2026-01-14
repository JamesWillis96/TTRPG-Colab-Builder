-- Wiki Revisions Table Migration
-- Run this in Supabase SQL Editor to create the wiki_revisions table for tracking edit history

-- Create wiki_revisions table
CREATE TABLE IF NOT EXISTS wiki_revisions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wiki_page_id UUID NOT NULL REFERENCES wiki_pages(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  change_summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS wiki_revisions_wiki_page_id_idx ON wiki_revisions(wiki_page_id);
CREATE INDEX IF NOT EXISTS wiki_revisions_created_at_idx ON wiki_revisions(created_at DESC);
CREATE INDEX IF NOT EXISTS wiki_revisions_author_id_idx ON wiki_revisions(author_id);

-- Enable Row Level Security
ALTER TABLE wiki_revisions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT revisions (view edit history)
CREATE POLICY "Users can view revisions"
  ON wiki_revisions
  FOR SELECT
  USING (true);

-- Policy: Users can INSERT revisions when editing their own pages
CREATE POLICY "Users can create revisions"
  ON wiki_revisions
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Prevent deletion of revisions (audit trail integrity)
CREATE POLICY "Prevent revision deletion"
  ON wiki_revisions
  FOR DELETE
  USING (false);

-- Add comment for documentation
COMMENT ON TABLE wiki_revisions IS 'Audit trail of all wiki page edits with full page snapshots for revision history';
