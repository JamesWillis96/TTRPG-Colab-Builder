-- CHECK CURRENT RLS POLICIES ON random_tables TABLE
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'random_tables'
ORDER BY policyname;

-- If the above returns nothing, RLS is blocking all access. Run this to fix:

-- Enable RLS
ALTER TABLE random_tables ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (safe if none exist)
DROP POLICY IF EXISTS "Enable read for all users" ON random_tables;
DROP POLICY IF EXISTS "Enable insert for authenticated" ON random_tables;
DROP POLICY IF EXISTS "Enable update for author" ON random_tables;
DROP POLICY IF EXISTS "Enable delete for author" ON random_tables;

-- Create new policies - allow all authenticated users to READ
CREATE POLICY "Enable read for all users"
  ON random_tables
  FOR SELECT
  USING (true);

-- Allow authenticated users to INSERT their own tables
CREATE POLICY "Enable insert for authenticated"
  ON random_tables
  FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Allow users to UPDATE their own tables
CREATE POLICY "Enable update for author"
  ON random_tables
  FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Allow users to DELETE their own tables
CREATE POLICY "Enable delete for author"
  ON random_tables
  FOR DELETE
  USING (auth.uid() = created_by);

-- VERIFY: Run this again to confirm policies are in place
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'random_tables'
ORDER BY policyname;
