-- Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
);

-- Check if notes table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'notes'
);

-- Check current foreign key relationships for notes table
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'notes';

-- Check current foreign key relationships for profiles table
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM 
  information_schema.table_constraints AS tc 
  JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
  JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = 'profiles';

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix foreign key relationship on notes table
-- First check if the foreign key exists and drop it if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'notes_user_id_fkey' 
    AND table_name = 'notes'
  ) THEN
    ALTER TABLE notes DROP CONSTRAINT notes_user_id_fkey;
  END IF;

  -- Add the constraint back
  ALTER TABLE notes 
  ADD CONSTRAINT notes_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

  -- Set up RLS policies for profiles
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

  -- Allow users to see all profiles
  CREATE POLICY IF NOT EXISTS "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

  -- Allow users to update their own profile
  CREATE POLICY IF NOT EXISTS "Users can update their own profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
END
$$; 