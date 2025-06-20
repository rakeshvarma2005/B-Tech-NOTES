import { createClient, RealtimeChannelOptions } from '@supabase/supabase-js';

// Initialize Supabase client
// Get the URL and API key from environment variables or use default values
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-new-project-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-new-anon-key';

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key Length:', supabaseAnonKey.length);

// Create the Supabase client with default options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Global channel registry to track active subscriptions
const channelRegistry = new Map();

/**
 * Creates a uniquely named channel and registers it for tracking
 * @param channelName Base name for the channel
 * @param options Channel configuration options
 * @returns The created and subscribed channel
 */
export const createTrackedChannel = (channelName: string, options?: {
  config?: RealtimeChannelOptions['config'];
  filter?: Record<string, any>;
}) => {
  // Create a unique ID for this channel instance
  const uniqueId = `${channelName}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  // Unsubscribe from existing channel with the same base name if it exists
  if (channelRegistry.has(channelName)) {
    console.log(`Removing existing channel: ${channelName}`);
    const existingChannel = channelRegistry.get(channelName);
    existingChannel.unsubscribe();
    channelRegistry.delete(channelName);
  }
  
  // Create new channel with properly typed options
  const channel = supabase.channel(uniqueId, {
    config: options?.config || {},
  });
  
  // Register this channel
  channelRegistry.set(channelName, channel);
  
  return channel;
};

/**
 * Unsubscribe from a tracked channel by its base name
 * @param channelName The base name of the channel to unsubscribe
 */
export const unsubscribeChannel = (channelName: string) => {
  if (channelRegistry.has(channelName)) {
    const channel = channelRegistry.get(channelName);
    channel.unsubscribe();
    channelRegistry.delete(channelName);
    console.log(`Unsubscribed and removed channel: ${channelName}`);
    return true;
  }
  return false;
};

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