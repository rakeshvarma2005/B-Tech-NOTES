// Simple script to verify Supabase API key
const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFiZXloeXZ3YnNwZmlia3pxbGxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTk5MjM0NjgsImV4cCI6MjAzNTQ5OTQ2OH0.Hs-7-wqYhHQGDxXSbXH-yxJxVzRBxYm-Oy7Nt9Fy6Yw';

console.log('API Key length:', apiKey.length);
console.log('API Key:', apiKey);

// Parse the JWT to check its contents
try {
  const parts = apiKey.split('.');
  if (parts.length !== 3) {
    console.error('Invalid JWT format: Expected 3 parts separated by dots');
  } else {
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));
    
    console.log('JWT Header:', header);
    console.log('JWT Payload:', payload);
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.error('JWT is expired!');
    } else if (payload.exp) {
      console.log('JWT is valid until:', new Date(payload.exp * 1000).toISOString());
    }
  }
} catch (error) {
  console.error('Error parsing JWT:', error);
}

// Function to decode base64
function atob(str) {
  return Buffer.from(str, 'base64').toString('binary');
} 