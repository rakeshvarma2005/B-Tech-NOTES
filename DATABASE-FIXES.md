# Database Fixes for B-TECH NOTES Application

This document outlines the fixes needed to resolve database issues in the B-TECH NOTES application.

## Common Issues and Solutions

### 1. Storage Bucket Issues

The application may show errors like:
```
Failed to create 'notes' bucket: StorageApiError: new row violates row-level security policy
```

**Solution**: Run the SQL commands in `fix-storage-permissions.sql` to enable proper permissions for storage buckets.

### 2. Foreign Key Relationship Errors

The application may show errors like:
```
Could not find a relationship between 'notes' and 'profiles' in the schema cache
```

**Solution**: Run the SQL commands in `fix-foreign-key-relationships.sql` to fix the relationships between tables.

### 3. Missing Admin User

If you can't access the admin panel, you may need to create an admin user.

**Solution**: Run the SQL commands in `create-admin-user.sql` to set up admin users.

### 4. Table Schema Issues

The application may have missing columns in the tables.

**Solution**: Run the SQL commands in `fix-notes-table-queries.sql` to add any missing columns.

## How to Apply the Fixes

1. Log in to your Supabase Dashboard
2. Go to "SQL Editor"
3. Open and run each SQL file in the following order:
   - `fix-storage-permissions.sql`
   - `fix-foreign-key-relationships.sql`
   - `fix-notes-table-queries.sql`
   - `create-admin-user.sql`

## Verifying the Fixes

After applying the fixes:

1. Restart your application
2. The storage buckets should be accessible
3. The admin panel should load correctly
4. You should be able to upload and manage notes

## Troubleshooting

If issues persist:

1. Check the browser console for specific error messages
2. Verify that all SQL scripts executed without errors
3. Make sure your Supabase connection details are correct in your `.env` file
4. Ensure your user has the correct role (admin) in the profiles table