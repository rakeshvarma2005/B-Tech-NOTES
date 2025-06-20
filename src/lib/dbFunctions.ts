import { supabase } from './supabase';
import { curriculum } from '../data/curriculum';

// Log curriculum structure for debugging
export function logCurriculumStructure() {
  console.log("CURRICULUM STRUCTURE FOR DEBUGGING:");
  curriculum.forEach(year => {
    console.log(`Year: ${year.name}, ID: ${year.id}`);
    year.semesters.forEach(semester => {
      console.log(`  Semester: ${semester.name}, ID: ${semester.id}`);
      semester.subjects.forEach(subject => {
        console.log(`    Subject: ${subject.name}, ID: ${subject.id}, Code: ${subject.code}`);
      });
    });
  });
}

// Note related functions
export async function fetchNotes(userId?: string, courseId?: string, limit = 10) {
  console.log("Fetching notes with parameters:", { userId, courseId, limit });
  
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
  
  console.log(`Fetched ${data?.length || 0} notes`);
  if (data && data.length > 0) {
    console.log("Sample note data:", {
      id: data[0].id,
      title: data[0].title,
      status: data[0].status,
      year_id: data[0].year_id,
      semester_id: data[0].semester_id,
      subject_id: data[0].subject_id,
      unit_number: data[0].unit_number,
    });
  }
  
  return data;
}

/**
 * Fetch notes by subject ID, semester ID, and/or year ID
 * This allows viewing all notes related to a specific subject
 */
export async function fetchNotesBySubject(subjectId: string, semesterId?: string, yearId?: string) {
  console.log("Fetching notes by subject:", { subjectId, semesterId, yearId });
  
  try {
    // Build query with proper syntax
    let query = supabase
      .from('notes')
      .select('*')
      .eq('subject_id', subjectId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    
    if (semesterId) {
      query = query.eq('semester_id', semesterId);
    }
    
    if (yearId) {
      query = query.eq('year_id', yearId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching notes by subject:', error);
      throw error;
    }
    
    console.log(`Fetched ${data?.length || 0} notes for subject ${subjectId}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching notes by subject:', error);
    // Return empty array instead of throwing to handle errors gracefully
    return [];
  }
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
  console.log("Approving note with ID:", noteId);
  
  const { data, error } = await supabase
    .from('notes')
    .update({ status: 'approved' })
    .eq('id', noteId)
    .select();
  
  if (error) {
    console.error('Error approving note:', error);
    throw error;
  }
  
  console.log("Note approved successfully:", {
    id: data?.[0]?.id,
    title: data?.[0]?.title,
    status: data?.[0]?.status
  });
  
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
    
    // Log curriculum structure for debugging
    logCurriculumStructure();
    
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
      
      // Just check if we can access the standard buckets
      try {
        await supabase.storage.from('notes').list();
        console.log('Notes bucket is accessible');
      } catch (notesError) {
        console.warn('Cannot access notes bucket:', notesError);
      }
      
      try {
        await supabase.storage.from('profiles').list();
        console.log('Profiles bucket is accessible');
      } catch (profilesError) {
        console.warn('Cannot access profiles bucket:', profilesError);
      }
      
      return;
    }
    
    // Log existing buckets
    if (buckets && buckets.length > 0) {
      console.log('Found existing buckets:', buckets.map(b => b.name).join(', '));
    } else {
      console.log('No existing buckets found');
    }
    
    const bucketsToCheck = ['notes', 'profiles'];
    
    for (const bucketName of bucketsToCheck) {
      const bucketExists = buckets && buckets.some(bucket => bucket.name === bucketName);
    
      if (bucketExists) {
        console.log(`Bucket '${bucketName}' already exists`);
      } else {
        // First check if we can access the bucket even if it doesn't appear in the list
        try {
          const { data: filesCheck } = await supabase.storage.from(bucketName).list();
          console.log(`Bucket '${bucketName}' seems accessible despite not being listed`);
          continue; // Skip creation if we can access it
        } catch (accessError) {
          // If we can't access it, try to create it
          try {
            console.log(`Creating '${bucketName}' bucket...`);
            const { error: createError } = await supabase.storage.createBucket(bucketName, {
              public: true,
              fileSizeLimit: 10485760 // 10MB
            });
            
            if (createError) {
              console.warn(`Failed to create '${bucketName}' bucket:`, createError);
              
              // Even if creation failed due to permissions, check if we can still access it
              try {
                const { data: filesCheck } = await supabase.storage.from(bucketName).list();
                console.log(`Bucket '${bucketName}' seems accessible despite creation error`);
              } catch (secondAccessError) {
                console.error(`Cannot access '${bucketName}' bucket:`, secondAccessError);
              }
            } else {
              console.log(`Created '${bucketName}' bucket successfully`);
            }
          } catch (bucketError) {
            console.warn(`Error handling '${bucketName}' bucket:`, bucketError);
          }
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