-- Bug Reports Table Migration
-- Run this in Supabase SQL Editor to create the bug_reports table

-- Create bug_reports table
CREATE TABLE IF NOT EXISTS bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('critical', 'bug', 'feedback', 'design_idea', 'feature_idea')),
  description TEXT NOT NULL,
  page_url TEXT,
  screenshot_url TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS bug_reports_created_at_idx ON bug_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS bug_reports_category_idx ON bug_reports(category);
CREATE INDEX IF NOT EXISTS bug_reports_user_id_idx ON bug_reports(user_id);

-- Enable Row Level Security
ALTER TABLE bug_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert bug reports (even anonymous users)
CREATE POLICY "Anyone can submit bug reports"
  ON bug_reports
  FOR INSERT
  WITH CHECK (true);

-- Policy: Only admins can view bug reports
CREATE POLICY "Admins can view all bug reports"
  ON bug_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Users can view their own bug reports
CREATE POLICY "Users can view their own bug reports"
  ON bug_reports
  FOR SELECT
  USING (user_id = auth.uid());

-- Optional: Add comment for documentation
COMMENT ON TABLE bug_reports IS 'User-submitted bug reports, feedback, and feature requests';
