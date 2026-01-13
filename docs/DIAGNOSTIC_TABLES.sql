-- DIAGNOSTIC: Check if random_tables table exists and has data

-- 1. List all tables in the public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Check if random_tables exists and show its structure
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'random_tables'
ORDER BY ordinal_position;

-- 3. Count rows in random_tables
SELECT COUNT(*) as total_rows FROM random_tables;

-- 4. Show first few rows (all columns)
SELECT * FROM random_tables LIMIT 5;

-- 5. Check RLS status on random_tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'random_tables';

    -- 6. List all RLS policies on random_tables
    SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    qual,
    with_check
    FROM pg_policies 
    WHERE tablename = 'random_tables';

-- 7. Check if you can SELECT as a regular user (replace YOUR_USER_ID)
-- First, get your user ID:
SELECT id, email FROM auth.users LIMIT 1;

-- Then check what this query returns (might be empty if RLS blocks it):
-- SELECT id, title, category FROM random_tables LIMIT 10;
