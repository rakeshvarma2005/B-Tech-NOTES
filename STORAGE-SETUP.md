# Supabase Storage Setup Guide

This guide will help you fix the file upload issues in your B-TECH NOTES application by properly configuring Supabase storage.

## Issue Diagnosis

The error `new row violates row-level security policy` indicates that your application doesn't have proper permissions to create storage buckets or upload files. This is a common issue when:

1. The Supabase project is not properly configured
2. The API key doesn't have the necessary permissions
3. Row-Level Security (RLS) policies are too restrictive

## Solution Steps

### 1. Check Supabase Project Configuration

First, make sure storage is enabled in your Supabase project:

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to "Storage" in the left sidebar
4. If you don't see the storage interface, you may need to enable storage for your project

### 2. Create Required Buckets Manually

Instead of trying to create buckets programmatically, create them manually:

1. In the Supabase Dashboard, go to "Storage"
2. Click "Create Bucket"
3. Name the bucket `notes`
4. Make sure to check "Public bucket" if you want files to be publicly accessible
5. Set an appropriate file size limit (e.g., 10MB)
6. Click "Create bucket"

### 3. Configure RLS Policies for Storage

You need to set up proper Row-Level Security policies for your storage:

1. In the Supabase Dashboard, go to "Storage" → "Policies"
2. For the `notes` bucket, add the following policies:

#### For Authenticated Users:

**Policy for uploads:**
```sql
CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'notes');
```

**Policy for viewing files:**
```sql
CREATE POLICY "Allow authenticated users to view files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'notes');
```

**Policy for deleting own files:**
```sql
CREATE POLICY "Allow users to delete own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'notes' AND auth.uid() = owner);
```

#### For Public Access (if needed):

```sql
CREATE POLICY "Allow public to view files"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'notes');
```

### 4. Update Your Environment Variables

Make sure your `.env` file contains the correct Supabase credentials:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Test Storage Functionality

Run the `test-storage.js` script again to verify that storage is working correctly:

```
node test-storage.js
```

### 6. Update File Upload Code

If you're still having issues, make sure your file upload code includes proper authentication:

```typescript
// Make sure the user is authenticated before uploading
const { data: session } = await supabase.auth.getSession();
if (!session.session) {
  toast.error("You must be logged in to upload files");
  return;
}

// Then proceed with upload
const { data, error } = await supabase.storage
  .from('notes')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: true
  });
```

## Common Errors and Solutions

### "new row violates row-level security policy"

This means your RLS policies are preventing the operation. Make sure you:
- Have created appropriate RLS policies for the storage bucket
- Are authenticated when making the request
- Are using the correct bucket name

### "Invalid API key"

This means your Supabase API key is incorrect or has expired. Generate a new anon key from the Supabase dashboard.

### "Bucket not found"

This means the bucket doesn't exist. Create it manually in the Supabase dashboard as described above.

### "File size exceeds limit"

Check the file size limit set for your bucket in the Supabase dashboard and make sure your files are within that limit.

## Need More Help?

If you're still experiencing issues:

1. Check the browser console for detailed error messages
2. Look at the Supabase logs in the dashboard under "Database" → "Logs"
3. Verify that your Supabase project has not reached its quota limits
4. Make sure your project's subscription is active

For more information, refer to the [Supabase Storage Documentation](https://supabase.com/docs/guides/storage). 