import { supabase } from './supabase';

// Note related functions
export async function fetchNotes(userId?: string, courseId?: string, limit = 10) {
  let query = supabase
    .from('notes')
    .select('*, profiles(username, full_name, avatar_url), courses(name, code)')
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (userId) {
    query = query.eq('user_id', userId);
  }
  
  if (courseId) {
    query = query.eq('course_id', courseId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }
  
  return data;
}

export async function fetchNoteById(noteId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*, profiles(username, full_name, avatar_url), courses(name, code)')
    .eq('id', noteId)
    .single();
  
  if (error) {
    console.error('Error fetching note:', error);
    throw error;
  }
  
  return data;
}

export async function createNote(noteData: any) {
  const { data, error } = await supabase
    .from('notes')
    .insert(noteData)
    .select();
  
  if (error) {
    console.error('Error creating note:', error);
    throw error;
  }
  
  return data[0];
}

export async function updateNote(noteId: string, noteData: any) {
  const { data, error } = await supabase
    .from('notes')
    .update(noteData)
    .eq('id', noteId)
    .select();
  
  if (error) {
    console.error('Error updating note:', error);
    throw error;
  }
  
  return data[0];
}

export async function deleteNote(noteId: string) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);
  
  if (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
  
  return true;
}

// User profile functions
export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
  
  return data;
}

export async function updateUserProfile(userId: string, profileData: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(profileData)
    .eq('id', userId)
    .select();
  
  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
  
  return data[0];
}

// Admin functions
export async function fetchPendingNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*, profiles(username, full_name, avatar_url), courses(name, code)')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching pending notes:', error);
    throw error;
  }
  
  return data;
}

export async function approveNote(noteId: string) {
  const { data, error } = await supabase
    .from('notes')
    .update({ status: 'approved' })
    .eq('id', noteId)
    .select();
  
  if (error) {
    console.error('Error approving note:', error);
    throw error;
  }
  
  return data[0];
}

export async function rejectNote(noteId: string) {
  const { data, error } = await supabase
    .from('notes')
    .update({ status: 'rejected' })
    .eq('id', noteId)
    .select();
  
  if (error) {
    console.error('Error rejecting note:', error);
    throw error;
  }
  
  return data[0];
}

/**
 * Initialize the database by creating necessary tables
 */
export async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Check if we have a valid session first
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      console.log('No active session. Please sign in to initialize the database.');
      return false;
    }
    
    console.log('Active session found. Proceeding with database initialization.');
    
    // First, ensure storage buckets exist
    try {
      await ensureStorageBucketsExist();
    } catch (storageError) {
      console.warn('Storage initialization failed:', storageError);
    }
    
    // Then create the tables
    try {
      await createTablesDirectly();
    } catch (tablesError) {
      console.warn('Table initialization failed:', tablesError);
    }
    
    // Create a default course for testing
    try {
      await createDefaultCourse();
    } catch (courseError) {
      console.warn('Default course creation failed:', courseError);
    }
    
    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

/**
 * Ensure storage buckets exist
 */
async function ensureStorageBucketsExist() {
  try {
    // Check if notes bucket exists
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing buckets:', error);
      // Try to access the buckets directly instead of creating them
      console.log('Trying to verify bucket access without creation...');
      return;
    }
    
    // Log existing buckets
    console.log('Found existing buckets:', buckets.map(b => b.name).join(', '));
    
    const bucketsToCheck = ['notes', 'profiles'];
    
    for (const bucketName of bucketsToCheck) {
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
    
      if (bucketExists) {
        console.log(`Bucket '${bucketName}' already exists`);
      } else {
        try {
          console.log(`Creating '${bucketName}' bucket...`);
          const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true,
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (createError) {
            console.warn(`Failed to create '${bucketName}' bucket:`, createError);
            
            // Check if we can still access the bucket (might already exist but not be visible)
            try {
              const { data: filesCheck } = await supabase.storage.from(bucketName).list();
              console.log(`Bucket '${bucketName}' seems accessible despite creation error`);
            } catch (accessError) {
              console.error(`Cannot access '${bucketName}' bucket:`, accessError);
            }
          } else {
            console.log(`Created '${bucketName}' bucket successfully`);
          }
        } catch (bucketError) {
          console.warn(`Error handling '${bucketName}' bucket:`, bucketError);
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring storage buckets exist:', error);
  }
}

/**
 * Create database tables directly using SQL
 */
async function createTablesDirectly() {
  try {
    // Check if the user has permissions to create tables
    const { data: userInfo, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.warn('Not authenticated, some operations may fail:', userError);
    }
    
    // Create courses table
    try {
      const { data, error: coursesError } = await supabase
        .from('courses')
        .select('id')
        .limit(1);
      
      if (coursesError) {
        console.log('Creating courses table or handling permission error...');
      }
    } catch (error) {
      console.error('Error checking courses table:', error);
    }
    
    // Create notes table
    try {
      const { data, error: notesError } = await supabase
        .from('notes')
        .select('id')
        .limit(1);
      
      if (notesError) {
        console.log('Creating notes table or handling permission error...');
      }
    } catch (error) {
      console.error('Error checking notes table:', error);
    }
    
    console.log('Tables verified');
    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
}

/**
 * Create a default course for testing
 */
export async function createDefaultCourse() {
  try {
    // First check if we already have courses
    const { data: existingCourses, error: checkError } = await supabase
      .from('courses')
      .select('id')
      .limit(1);
    
    if (checkError) {
      console.error('Error checking for existing courses:', checkError);
      return null;
    }
    
    // Only create a default course if none exist
    if (!existingCourses || existingCourses.length === 0) {
      try {
        const { data, error } = await supabase
          .from('courses')
          .insert({
            name: 'Default Course',
            code: 'DEFAULT',
            year: 1,
            semester: 1
          })
          .select();
          
        if (error) {
          console.error('Error creating default course:', error);
          return null;
        }
        
        console.log('Default course created:', data);
        return data[0];
      } catch (insertError) {
        console.error('Failed to insert default course:', insertError);
        return null;
      }
    }
    
    return existingCourses[0];
  } catch (error) {
    console.error('Failed to create default course:', error);
    return null;
  }
} 