-- Soft-delete columns and supporting indexes
-- Tables covered: sessions, map_pois, wiki_pages, random_tables
-- Run in Supabase SQL editor or your migration pipeline.

alter table if exists public.sessions
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid;

alter table if exists public.map_pois
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid;

alter table if exists public.wiki_pages
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid;

alter table if exists public.random_tables
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid;

-- Helpful index for filtering active rows
create index if not exists idx_sessions_deleted_at on public.sessions(deleted_at);
create index if not exists idx_map_pois_deleted_at on public.map_pois(deleted_at);
create index if not exists idx_wiki_pages_deleted_at on public.wiki_pages(deleted_at);
create index if not exists idx_random_tables_deleted_at on public.random_tables(deleted_at);

-- RLS reminders (adjust per your policy set):
--   * Add deleted_at is null to SELECT policies for normal readers.
--   * Allow authors/admins to UPDATE deleted_at/deleted_by for soft-delete and restore.
--   * Optional: separate policy or view for listing deleted rows (recycle bin).
