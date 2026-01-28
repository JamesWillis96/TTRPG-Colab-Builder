-- Migration: Add guest_profiles table and guest_profile_id to session_players

-- 1) Create guest_profiles table (no FK to auth.users)
create table if not exists public.guest_profiles (
  id uuid not null default gen_random_uuid(),
  username text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  aboutme text null,
  profile_image text null,
  image_zoom numeric null default 1.0,
  image_position_x integer null default 0,
  image_position_y integer null default 0,
  constraint guest_profiles_pkey primary key (id),
  constraint guest_profiles_username_key unique (username)
);

-- Remove unique constraint on username if you prefer allowing duplicate usernames
ALTER TABLE public.guest_profiles
  DROP CONSTRAINT IF EXISTS guest_profiles_username_key;

-- Add login_count column to track repeated logins
ALTER TABLE public.guest_profiles
  ADD COLUMN IF NOT EXISTS login_count integer NOT NULL DEFAULT 0;

-- Function to create or increment a guest profile by username
-- Returns UUID of existing or newly-created guest_profiles row
CREATE OR REPLACE FUNCTION public.create_or_increment_guest(_username text)
RETURNS uuid LANGUAGE plpgsql AS $$
DECLARE
  gid uuid;
BEGIN
  SELECT id INTO gid FROM public.guest_profiles WHERE username = _username ORDER BY updated_at DESC LIMIT 1;
  IF gid IS NOT NULL THEN
    UPDATE public.guest_profiles SET login_count = COALESCE(login_count, 0) + 1, updated_at = timezone('utc', now()) WHERE id = gid;
    RETURN gid;
  ELSE
    INSERT INTO public.guest_profiles (id, username, login_count) VALUES (gen_random_uuid(), _username, 1) RETURNING id INTO gid;
    RETURN gid;
  END IF;
END;
$$;

-- Allow public (anon) to execute the function so clients can call via RPC
GRANT EXECUTE ON FUNCTION public.create_or_increment_guest(text) TO public;

-- 2) Add guest_profile_id column to session_players and FK to guest_profiles
alter table if exists public.session_players
  add column if not exists guest_profile_id uuid null;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'session_players_guest_fk'
  ) THEN
    ALTER TABLE public.session_players
      ADD CONSTRAINT session_players_guest_fk FOREIGN KEY (guest_profile_id) REFERENCES public.guest_profiles (id) ON DELETE CASCADE;
  END IF;
END
$$;

-- Allow player_id to be nullable so guest_profile_id can be used instead
ALTER TABLE public.session_players
  ALTER COLUMN player_id DROP NOT NULL;

-- Add a check constraint to ensure at least one of player_id or guest_profile_id is present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'session_players_player_or_guest_check'
  ) THEN
    ALTER TABLE public.session_players
      ADD CONSTRAINT session_players_player_or_guest_check CHECK ((player_id IS NOT NULL) OR (guest_profile_id IS NOT NULL));
  END IF;
END
$$;

-- 5) If player_id is part of the primary key, make schema compatible with nullable player_id
-- This block will:
--  - add an `id` uuid PK column if missing (populate existing rows)
--  - drop the existing primary key constraint if present
--  - add a new primary key on `id`
--  - allow `player_id` to be nullable
DO $$
DECLARE
  pkname text;
BEGIN
  -- 1) Add id column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name = 'session_players' AND column_name = 'id'
  ) THEN
    ALTER TABLE public.session_players ADD COLUMN id uuid DEFAULT gen_random_uuid();
    UPDATE public.session_players SET id = gen_random_uuid() WHERE id IS NULL;
    ALTER TABLE public.session_players ALTER COLUMN id SET NOT NULL;
  END IF;

  -- 2) Find and drop existing primary key constraint (if any)
  SELECT conname INTO pkname FROM pg_constraint WHERE conrelid = 'public.session_players'::regclass AND contype = 'p' LIMIT 1;
  IF pkname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.session_players DROP CONSTRAINT %I', pkname);
  END IF;

  -- 3) Add new primary key on id if not present
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conrelid = 'public.session_players'::regclass AND contype = 'p'
  ) THEN
    ALTER TABLE public.session_players ADD CONSTRAINT session_players_pkey PRIMARY KEY (id);
  END IF;

  -- 4) Make player_id nullable now that it's no longer part of the PK
  IF EXISTS (
    SELECT 1 FROM information_schema.columns WHERE table_name='session_players' AND column_name='player_id' AND is_nullable='NO'
  ) THEN
    ALTER TABLE public.session_players ALTER COLUMN player_id DROP NOT NULL;
  END IF;
END
$$;

-- 3) (Optional) Enable RLS and add permissive policies for guest_profiles
-- Only run these if you want row-level security on guest_profiles.
-- Note: INSERT policies must use WITH CHECK (no USING clause for INSERT).

ALTER TABLE public.guest_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY allow_guest_insert ON public.guest_profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY allow_guest_select ON public.guest_profiles
  FOR SELECT
  USING (true);

Adjust policies according to your security model.

-- 3b) Enable RLS on session_players and add policies to allow guest inserts
-- Enable RLS on session_players (run once)
ALTER TABLE public.session_players ENABLE ROW LEVEL SECURITY;

-- Allow reads from session_players publicly so UI can display signups
CREATE POLICY "Allow select session_players public" ON public.session_players
  FOR SELECT
  USING (true);

-- Allow inserts when either a guest_profile_id is provided (guest join)
-- or when the authenticated user is inserting their own player_id
CREATE POLICY "Allow insert session_players guests_or_owner" ON public.session_players
  FOR INSERT
  WITH CHECK (guest_profile_id IS NOT NULL OR auth.uid() = player_id);

-- Allow authenticated users to delete their own signup (real users)
CREATE POLICY "Allow delete session_players owner" ON public.session_players
  FOR DELETE
  USING (auth.uid() = player_id);

-- Note: Deleting a guest signup by the guest (based on guest_profile_id) is not covered
-- because auth.uid() is not tied to guest_profile_id. To allow guests to remove their own
-- signup, implement a server-side endpoint that validates a guest token or allow admins to
-- remove guest signups.

-- 4) (Optional) If you want to prevent mixing old code, you may also add a migration
-- that backfills existing session_players.player_id values into guest_profiles and sets guest_profile_id,
-- or leave existing player_id rows as-is for real users.


-- End of migration
