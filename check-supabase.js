// Script to check Supabase project status
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://qbeyhyvwbspfibkzqllm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZXloeXZ3YnNwZmlia3pxbGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk5MjM0NjgsImV4cCI6MjAzNTQ5OTQ2OH0.Hs-7-wqYhHQGDxXSbXH-yxJxVzRBxYm-Oy7Nt9Fy6Yw';

// Create the Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to check Supabase connection
async function checkSupabaseConnection() {
  console.log('Checking Supabase connection...');
  console.log('URL:', supabaseUrl);
  console.log('API Key Length:', supabaseAnonKey.length);
  
  try {
    // Try to get the health status
    console.log('\nChecking health status...');
    const healthCheck = await fetch(`${supabaseUrl}/rest/v1/`);
    console.log('Health Status:', healthCheck.status, healthCheck.statusText);
    
    // Try to get the current session
    console.log('\nChecking auth session...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session Error:', sessionError);
    } else {
      console.log('Session:', sessionData);
    }
    
    // Try a simple query
    console.log('\nAttempting database query...');
    const { data, error } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error('Query Error:', error);
    } else {
      console.log('Query Result:', data);
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

// Run the check
checkSupabaseConnection(); 