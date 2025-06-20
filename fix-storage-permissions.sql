-- First, enable RLS on storage.buckets if not already enabled
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow authenticated users to create buckets
CREATE POLICY "Allow authenticated users to create buckets"
ON storage.buckets
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create a policy to allow everyone to see buckets
CREATE POLICY "Allow public access to buckets"
ON storage.buckets
FOR SELECT
TO public
USING (true);

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- These are the storage policies for objects in buckets
-- Run this in the Supabase SQL Editor

-- Policy for authenticated users to upload files to any bucket
CREATE POLICY "Allow authenticated users to upload files to any bucket"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy for authenticated users to view files in any bucket
CREATE POLICY "Allow authenticated users to view files in any bucket"
ON storage.objects
FOR SELECT
TO authenticated
USING (true);

-- Policy for users to delete their own files in any bucket
CREATE POLICY "Allow users to delete own files in any bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (auth.uid() = owner);

-- Policy for public access to files
CREATE POLICY "Allow public to view files in any bucket"
ON storage.objects
FOR SELECT
TO anon
USING (true);

-- Policy to allow updating files
CREATE POLICY "Allow authenticated users to update files in any bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (auth.uid() = owner)
WITH CHECK (true);

-- Fix storage permissions for PDF viewing

-- Update storage.buckets to allow CORS
UPDATE storage.buckets
SET public = true,
    file_size_limit = 10485760,  -- 10MB
    allowed_mime_types = ARRAY['application/pdf', 'text/plain', 'image/png', 'image/jpeg']
WHERE name = 'notes';

-- Add policy for public reading of PDFs
INSERT INTO storage.policies (name, definition, bucket_id)
SELECT 
  'Public PDF Access Policy', 
  '{"name":"Public PDF Access Policy","match":{"bucket":"notes"},"statements":[{"effect":"allow","action":["select"],"role":"anon"}],"conditions":{}}',
  id
FROM storage.buckets
WHERE name = 'notes'
ON CONFLICT (name, bucket_id) DO NOTHING;

-- List current storage settings
SELECT 
  name, 
  public, 
  file_size_limit, 
  allowed_mime_types
FROM storage.buckets 
WHERE name = 'notes';

-- List policies for the notes bucket
SELECT p.name, p.definition
FROM storage.policies p
JOIN storage.buckets b ON p.bucket_id = b.id
WHERE b.name = 'notes'; 