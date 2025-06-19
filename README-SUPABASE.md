# Supabase Integration Guide for B-TECH NOTES

This guide explains how to set up and integrate Supabase with the B-TECH NOTES application.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project and give it a name (e.g., "b-tech-notes")
3. Note your project URL and anon key (public API key)

### 2. Configure Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Database Schema

1. Navigate to the SQL Editor in your Supabase dashboard
2. Run the SQL scripts from the `supabase/migrations` directory in order:
   - `20250101000000_create_base_schema.sql`

### 4. Configure Storage

1. Go to the Storage section in your Supabase dashboard
2. Create a new bucket called `notes`
3. Set the bucket's privacy settings to public

### 5. Configure Authentication

1. Go to the Authentication section in your Supabase dashboard
2. Under "Providers", enable Google OAuth
3. Configure your Google OAuth credentials:
   - Create a project in [Google Cloud Console](https://console.cloud.google.com/)
   - Set up OAuth consent screen
   - Create OAuth client ID (Web application)
   - Add authorized redirect URIs:
     - `https://your-project-id.supabase.co/auth/v1/callback`
     - `http://localhost:5173/auth/callback` (for local development)
   - Copy Client ID and Client Secret to Supabase

### 6. Set Up Row Level Security (RLS)

For proper security, configure Row Level Security policies:

1. Go to the Table Editor in your Supabase dashboard
2. For each table, enable RLS
3. Create policies that allow appropriate access:

For the `notes` table:
```sql
-- Allow users to read all approved notes
CREATE POLICY "Anyone can view approved notes" ON notes
FOR SELECT USING (status = 'approved');

-- Allow users to read their own notes regardless of status
CREATE POLICY "Users can view their own notes" ON notes
FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own notes
CREATE POLICY "Users can create their own notes" ON notes
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own notes
CREATE POLICY "Users can update their own notes" ON notes
FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own notes
CREATE POLICY "Users can delete their own notes" ON notes
FOR DELETE USING (auth.uid() = user_id);

-- Allow admins to do everything
CREATE POLICY "Admins can do everything" ON notes
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);
```

## Usage in the Application

### Authentication

The application uses Supabase Auth for authentication. Google OAuth is configured as the primary authentication method.

### Database

The application uses Supabase Database for storing and retrieving data. The schema includes tables for users, universities, departments, courses, and notes.

### Storage

The application uses Supabase Storage for storing and retrieving files like PDFs and images. Files are stored in the `notes` bucket.

## Troubleshooting

### Authentication Issues

- Make sure your redirect URIs are correctly configured in both Google Cloud Console and Supabase
- Check browser console for CORS errors
- Verify that environment variables are correctly set

### Database Issues

- Check if RLS policies are correctly configured
- Verify that your queries are using the correct table names and columns
- Check if you have the necessary permissions

### Storage Issues

- Verify that the bucket exists and has the correct permissions
- Check if file paths are correctly formatted
- Ensure that file types are allowed by your storage rules 

Policy name: Allow public read access
Allowed operations: SELECT
Policy definition: true

Policy name: Allow authenticated uploads
Allowed operations: INSERT
Policy definition: auth.role() = 'authenticated' 