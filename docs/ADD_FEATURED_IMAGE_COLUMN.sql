-- Add featured_image column to wiki_pages table
ALTER TABLE wiki_pages ADD COLUMN featured_image TEXT;

-- Add comment
COMMENT ON COLUMN wiki_pages.featured_image IS 'URL to featured image displayed in sidebar of wiki page';
