-- Storage policies for the notes bucket
-- Run this in the Supabase SQL Editor

-- Policy for authenticated users to upload files
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'notes');

-- Policy for authenticated users to view files
CREATE POLICY "Allow authenticated users to view files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'notes');

-- Policy for users to delete their own files
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'notes' AND auth.uid() = owner);

-- Policy for public access to files (if needed)
CREATE POLICY "Allow public to view files"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'notes');

-- Policy to allow updating files (if needed)
CREATE POLICY "Allow authenticated users to update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'notes' AND auth.uid() = owner)
WITH CHECK (bucket_id = 'notes'); 