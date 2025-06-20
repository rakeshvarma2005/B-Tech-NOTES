-- Check the courses table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'courses'
);

-- Check the notes table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'notes';

-- Fix notes table issues
ALTER TABLE notes ADD COLUMN IF NOT EXISTS year_id UUID;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS semester_id UUID;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS subject_id UUID;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS unit_number INTEGER;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS is_important_questions BOOLEAN DEFAULT false;
ALTER TABLE notes ADD COLUMN IF NOT EXISTS notes_type TEXT;

-- Enable RLS for notes table if needed
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy for notes
CREATE POLICY "Allow authenticated users to select notes"
ON notes
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Allow authenticated users to insert notes"
ON notes
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow users to update their own notes"
ON notes
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own notes"
ON notes
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);

-- Check the courses table
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'departments'
);

-- Enable RLS for courses table
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Create policy for courses
CREATE POLICY "Allow everyone to view courses"
ON courses
FOR SELECT 
TO public
USING (true);

-- Create policy for courses
CREATE POLICY "Allow authenticated users to insert courses"
ON courses
FOR INSERT 
TO authenticated
WITH CHECK (true);

-- Enable RLS for departments table
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

-- Create policy for departments
CREATE POLICY "Allow everyone to view departments"
ON departments
FOR SELECT 
TO public
USING (true);

-- Fix notes table to ensure PDF viewing works properly

-- Update any NULL unit_number values to 'All Units' for better display
UPDATE notes 
SET unit_number = 'All Units' 
WHERE unit_number IS NULL AND status = 'approved';

-- Update any NULL notes_type values to 'regular'
UPDATE notes 
SET notes_type = 'regular' 
WHERE notes_type IS NULL AND status = 'approved';

-- Ensure is_important_questions is properly set
UPDATE notes 
SET is_important_questions = TRUE 
WHERE notes_type = 'important_questions' AND is_important_questions IS NULL;

-- SPECIFIC FIX FOR DISCRETE MATHEMATICS NOTES
-- Update any Discrete Mathematics notes with correct IDs from curriculum.ts
UPDATE notes
SET year_id = 'year-2',          -- II Year ID from curriculum.ts
    semester_id = 'year-2-sem-2', -- II Year, Semester II ID from curriculum.ts
    subject_id = 'discrete-mathematics'  -- Discrete Mathematics ID from curriculum.ts
WHERE 
  (title LIKE '%Discrete Mathematics%' OR title LIKE '%DM%')
  AND (year_id IS NULL OR semester_id IS NULL OR subject_id IS NULL OR subject_id != 'discrete-mathematics');

-- Check for notes with missing file_url and log them
SELECT id, title, status
FROM notes
WHERE file_url IS NULL;

-- Find notes with missing year_id, semester_id, or subject_id
SELECT 
  id,
  title,
  status,
  year_id,
  semester_id,
  subject_id
FROM notes
WHERE status = 'approved' 
AND (year_id IS NULL OR semester_id IS NULL OR subject_id IS NULL)
ORDER BY created_at DESC;

-- MANUAL FIXES FOR SPECIFIC NOTES
-- Below are examples of how to fix specific notes
-- You should modify these based on your actual notes data

-- Example: Fix a note with "I Year - Semester I - Discrete Mathematics" in the title
-- UPDATE notes
-- SET year_id = '1', -- Replace with actual year_id from curriculum
--     semester_id = '1-1', -- Replace with actual semester_id from curriculum
--     subject_id = 'dm101' -- Replace with actual subject_id from curriculum
-- WHERE title LIKE '%I Year - Semester I - Discrete Mathematics%'
--   AND status = 'approved';

-- For example, if a note has missing semester_id but has year_id and subject_id
-- Copy the year_id and subject_id values below, and fill in the correct semester_id
/*
UPDATE notes
SET semester_id = 'CORRECT_SEMESTER_ID' -- Replace with the actual ID
WHERE id = 'NOTE_ID_HERE' -- Replace with the actual note ID
  AND status = 'approved';
*/

-- If you need to update notes based on their title patterns:
/*
UPDATE notes
SET year_id = 'CORRECT_YEAR_ID', 
    semester_id = 'CORRECT_SEMESTER_ID',
    subject_id = 'CORRECT_SUBJECT_ID'
WHERE title LIKE '%Year - Semester%' -- Modify this pattern to match your notes
  AND status = 'approved';
*/

-- List all approved notes to verify they have the required fields
SELECT 
  id,
  title, 
  status,
  year_id,
  semester_id, 
  subject_id,
  unit_number,
  notes_type,
  is_important_questions,
  file_url,
  file_type
FROM notes
WHERE status = 'approved'
ORDER BY created_at DESC; 