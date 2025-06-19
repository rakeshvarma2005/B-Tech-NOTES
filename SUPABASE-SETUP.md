# Supabase Setup Guide

This guide will help you set up a new Supabase project for the B-TECH NOTES application.

## Creating a New Supabase Project

1. Sign up or log in to [Supabase](https://supabase.com/dashboard)
2. Click "New Project"
3. Enter a name for your project (e.g., "B-TECH-NOTES")
4. Set a secure database password
5. Choose a region closest to your users
6. Click "Create new project"

## Getting Your API Credentials

1. Once your project is created, go to the project dashboard
2. In the left sidebar, click on "Project Settings"
3. Click on "API"
4. Under "Project API keys", you'll find:
   - Project URL (e.g., `https://abcdefghijklm.supabase.co`)
   - `anon` public key (starts with `eyJ...`)

## Setting Up Environment Variables

1. Create a `.env` file in the root of your project
2. Add the following lines:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```
3. Replace `your_project_url` and `your_anon_key` with the values from your Supabase dashboard

## Setting Up Database Tables

The application will attempt to create necessary tables when you first run it. However, if you encounter issues, you can manually create the required tables:

1. Go to your Supabase project dashboard
2. Click on "Table Editor" in the left sidebar
3. Create the following tables:

### Courses Table
- Click "New Table"
- Name: `courses`
- Columns:
  - `id` (type: uuid, primary key, default: `uuid_generate_v4()`)
  - `name` (type: text)
  - `code` (type: text)
  - `year` (type: integer)
  - `semester` (type: integer)
  - `created_at` (type: timestamp with time zone, default: `now()`)

### Notes Table
- Click "New Table"
- Name: `notes`
- Columns:
  - `id` (type: uuid, primary key, default: `uuid_generate_v4()`)
  - `user_id` (type: uuid, references: auth.users.id)
  - `course_id` (type: uuid, references: courses.id)
  - `title` (type: text)
  - `description` (type: text)
  - `file_url` (type: text)
  - `thumbnail_url` (type: text, nullable: true)
  - `file_type` (type: text)
  - `page_count` (type: integer, default: 0)
  - `status` (type: text, default: 'pending')
  - `year_id` (type: text)
  - `semester_id` (type: text)
  - `subject_id` (type: text)
  - `unit_number` (type: text, nullable: true)
  - `is_important_questions` (type: boolean, default: false)
  - `notes_type` (type: text, default: 'regular')
  - `created_at` (type: timestamp with time zone, default: `now()`)

## Setting Up Storage Buckets

1. Go to your Supabase project dashboard
2. Click on "Storage" in the left sidebar
3. Click "New Bucket"
4. Create the following buckets:
   - `notes` (public)
   - `profiles` (public)

## Setting Up Storage Policies

For file uploads to work correctly, you need to configure Row-Level Security (RLS) policies for your storage buckets:

1. Go to your Supabase project dashboard
2. Click on "Storage" in the left sidebar
3. Click on "Policies"
4. For the `notes` bucket, add the following policies:

### For Authenticated Users

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

### For Public Access (if needed)

```sql
CREATE POLICY "Allow public to view files"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'notes');
```

You can run these policies in the SQL Editor in your Supabase dashboard. Alternatively, you can use the SQL file provided at `supabase/migrations/storage_policies.sql`.

## Setting Up Authentication

1. Go to your Supabase project dashboard
2. Click on "Authentication" in the left sidebar
3. Under "Providers", enable Email authentication
4. Optionally, enable other providers like Google, GitHub, etc.

## Testing Your Setup

After completing the setup, run the application and verify that:
1. You can sign up and log in
2. You can upload and view notes
3. The admin panel works correctly

If you encounter any issues, check the browser console for error messages and verify your API credentials. 