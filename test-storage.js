// Test script for Supabase storage functionality
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current file directory (ESM equivalent of __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: Missing Supabase credentials in .env file');
  console.error('Make sure you have VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey.substring(0, 5) + '...' + supabaseKey.substring(supabaseKey.length - 5));

const supabase = createClient(supabaseUrl, supabaseKey);

async function testStorage() {
  console.log('\n=== TESTING SUPABASE STORAGE ===\n');
  
  try {
    // Step 1: Check if we're authenticated
    console.log('1. Checking authentication status...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('Authentication error:', authError.message);
      console.log('WARNING: Running in unauthenticated mode. Some operations may fail.');
    } else if (!session) {
      console.log('No active session. Running in unauthenticated mode with anon key.');
    } else {
      console.log('Authenticated as:', session.user.email);
    }
    
    // Step 2: List buckets
    console.log('\n2. Listing storage buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Error listing buckets:', bucketsError.message);
      if (bucketsError.message.includes('Permission denied')) {
        console.log('HINT: Make sure your Supabase project has storage enabled and your API key has storage permissions');
      }
      throw new Error('Failed to list buckets');
    }
    
    console.log(`Found ${buckets.length} buckets:`);
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    // Step 3: Check for 'notes' bucket or create it
    console.log('\n3. Checking for "notes" bucket...');
    const notesBucket = buckets.find(b => b.name === 'notes');
    
    if (!notesBucket) {
      console.log('Notes bucket not found. Creating...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('notes', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.error('Error creating bucket:', createError.message);
        throw new Error('Failed to create notes bucket');
      }
      
      console.log('Notes bucket created successfully!');
    } else {
      console.log('Notes bucket exists:', notesBucket.name);
    }
    
    // Step 4: Create a test file
    console.log('\n4. Creating test file...');
    const testContent = 'This is a test file for Supabase storage - ' + new Date().toISOString();
    const testFilePath = path.join(__dirname, 'test-upload.txt');
    
    fs.writeFileSync(testFilePath, testContent);
    console.log(`Test file created at ${testFilePath}`);
    
    // Step 5: Upload test file
    console.log('\n5. Uploading test file to storage...');
    const uploadPath = `test/test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('notes')
      .upload(uploadPath, fs.readFileSync(testFilePath), {
        contentType: 'text/plain',
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('Error uploading file:', uploadError.message);
      throw new Error('Failed to upload test file');
    }
    
    console.log('File uploaded successfully!');
    console.log('Upload path:', uploadPath);
    
    // Step 6: Get public URL
    console.log('\n6. Getting public URL for uploaded file...');
    const { data: urlData } = supabase.storage
      .from('notes')
      .getPublicUrl(uploadPath);
    
    if (!urlData || !urlData.publicUrl) {
      throw new Error('Failed to get public URL');
    }
    
    console.log('Public URL:', urlData.publicUrl);
    console.log('You can try accessing this URL in your browser to verify it works');
    
    // Step 7: List files in the test directory
    console.log('\n7. Listing files in test directory...');
    const { data: files, error: listError } = await supabase.storage
      .from('notes')
      .list('test');
    
    if (listError) {
      console.error('Error listing files:', listError.message);
    } else {
      console.log(`Found ${files.length} files in test directory:`);
      files.forEach(file => {
        console.log(`  - ${file.name} (${file.metadata?.size || 'unknown'} bytes, created: ${file.created_at || 'unknown'})`);
      });
    }
    
    // Step 8: Clean up
    console.log('\n8. Cleaning up...');
    
    // Delete the uploaded file
    const { error: deleteError } = await supabase.storage
      .from('notes')
      .remove([uploadPath]);
    
    if (deleteError) {
      console.error('Error deleting test file:', deleteError.message);
    } else {
      console.log('Test file deleted from storage');
    }
    
    // Delete local test file
    fs.unlinkSync(testFilePath);
    console.log('Local test file deleted');
    
    console.log('\n=== STORAGE TEST COMPLETED SUCCESSFULLY ===');
    console.log('Your Supabase storage is working correctly!');
    
  } catch (error) {
    console.error('\n=== STORAGE TEST FAILED ===');
    console.error('Error:', error.message);
    console.log('\nTROUBLESHOOTING TIPS:');
    console.log('1. Check your Supabase URL and API key in the .env file');
    console.log('2. Make sure storage is enabled in your Supabase project');
    console.log('3. Verify that your API key has the necessary permissions');
    console.log('4. Check if you have reached your storage quota');
    console.log('5. Try creating a new bucket manually in the Supabase dashboard');
  }
}

// Run the test
testStorage(); 