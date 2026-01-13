-- RLS Policy Fix for Admin Permissions on Sessions Table
-- This allows admins to edit and delete sessions created by other users

-- First, ensure the sessions table has RLS enabled
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Allow admins to UPDATE any session (regardless of gm_id)
CREATE POLICY "Admins can update any session" ON public.sessions
  FOR UPDATE
  USING (
    (SELECT role FROM auth.users WHERE auth.uid() = id) = 'admin'
    OR
    (auth.uid() = gm_id)
  )
  WITH CHECK (
    (SELECT role FROM auth.users WHERE auth.uid() = id) = 'admin'
    OR
    (auth.uid() = gm_id)
  );

-- Allow admins to DELETE any session (regardless of gm_id)
CREATE POLICY "Admins can delete any session" ON public.sessions
  FOR DELETE
  USING (
    (SELECT role FROM public.profiles WHERE id = auth.uid())::TEXT = 'admin'
    OR
    (auth.uid() = gm_id)
  );

-- Note: This assumes:
-- 1. The profiles table has a 'role' column with 'admin' as a valid value
-- 2. The sessions table has a 'gm_id' column that matches the user's id
-- 3. RLS is already enabled on the sessions table

-- If the above policies already exist, you may need to DROP them first:
-- DROP POLICY "Admins can update any session" ON public.sessions;
-- DROP POLICY "Admins can delete any session" ON public.sessions;
