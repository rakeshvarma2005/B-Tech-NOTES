import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "./supabase"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Uploads an image to the public storage bucket
 * @param file The image file to upload
 * @param imageType Category of image (e.g., 'avatars', 'banners', 'thumbnails')
 * @returns Promise with the download URL
 */
export async function uploadPublicImage(file: File, imageType: string = 'general'): Promise<string> {
  console.log(`Uploading ${imageType} image:`, file.name, file.type, `${(file.size / 1024).toFixed(2)}KB`);
  
  // Validate file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }
  
  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error(`Image size should not exceed 5MB (current size: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  }
  
  // Generate a unique filename with sanitized name
  const fileExtension = file.name.split('.').pop() || 'jpg';
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
  
  // Create a reference to the file location
  const filePath = `public/${imageType}/${fileName}`;
  
  try {
    // Check if bucket exists first
    try {
      const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket('notes');
      
      if (bucketError) {
        if (bucketError.message.includes('not found')) {
          console.log("Bucket 'notes' not found. Creating...");
          const { error: createError } = await supabase.storage.createBucket('notes', {
            public: true,
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (createError) {
            console.error("Error creating bucket:", createError);
            throw new Error(`Failed to create storage bucket: ${createError.message}`);
          }
          
          console.log("Bucket 'notes' created successfully");
        } else {
          throw new Error(`Failed to access storage bucket: ${bucketError.message}`);
        }
      }
    } catch (bucketSetupError) {
      console.error("Bucket setup error:", bucketSetupError);
      throw bucketSetupError;
    }
    
    // Upload the file
    console.log(`Uploading to path: ${filePath}`);
    const { data, error } = await supabase.storage
      .from('notes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Use upsert to handle potential duplicates
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }
    
    // Get the download URL
    const { data: { publicUrl } } = supabase.storage
      .from('notes')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded image');
    }

    console.log(`Image uploaded successfully. URL: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error("Image upload error:", error);
    throw error instanceof Error 
      ? error 
      : new Error('Unknown error during image upload');
  }
}

export async function uploadFile(file: File, path: string): Promise<string> {
  console.log(`Uploading file to ${path}:`, file.name, file.type, `${(file.size / 1024).toFixed(2)}KB`);
  
  try {
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error(`File size should not exceed 10MB (current size: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }
    
    // Generate a unique filename with sanitized name
    const fileExt = file.name.split('.').pop() || 'file';
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}_${sanitizedName}`;
    const filePath = `${path}/${fileName}`;

    // Check if bucket exists first
    try {
      const { data: bucketInfo, error: bucketError } = await supabase.storage.getBucket('notes');
      
      if (bucketError) {
        if (bucketError.message.includes('not found')) {
          console.log("Bucket 'notes' not found. Creating...");
          const { error: createError } = await supabase.storage.createBucket('notes', {
            public: true,
            fileSizeLimit: 10485760 // 10MB
          });
          
          if (createError) {
            console.error("Error creating bucket:", createError);
            throw new Error(`Failed to create storage bucket: ${createError.message}`);
          }
          
          console.log("Bucket 'notes' created successfully");
        } else {
          throw new Error(`Failed to access storage bucket: ${bucketError.message}`);
        }
      }
    } catch (bucketSetupError) {
      console.error("Bucket setup error:", bucketSetupError);
      throw bucketSetupError;
    }

    // Upload file to Supabase Storage
    console.log(`Uploading to path: ${filePath}`);
    const { data, error } = await supabase.storage
      .from('notes')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Use upsert to handle potential duplicates
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from('notes')
      .getPublicUrl(filePath);

    if (!publicUrl) {
      throw new Error('Failed to get public URL for uploaded file');
    }

    console.log(`File uploaded successfully. URL: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Unknown error during file upload');
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    // Extract the path from the public URL if needed
    const path = filePath.includes('notes/') 
      ? filePath.split('notes/')[1] 
      : filePath;
    
    const { error } = await supabase.storage
      .from('notes')
      .remove([path]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}
