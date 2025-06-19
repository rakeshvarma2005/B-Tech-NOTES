import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
// Get the URL and API key from environment variables or use default values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-new-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-new-anon-key';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key Length:', supabaseAnonKey.length);

// Create the Supabase client with default options
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test function to verify Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    console.log('URL:', supabaseUrl);
    console.log('Key length:', supabaseAnonKey.length);
    
    // Try to get the current session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
    } else {
      console.log('Session:', sessionData);
    }
    
    return true;
  } catch (err) {
    console.error('Supabase connection test error:', err);
    return false;
  }
}; 