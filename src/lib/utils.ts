import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
  // Validate file is an image
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed');
  }
  
  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('Image size should not exceed 5MB');
  }
  
  // Generate a unique filename
  const fileExtension = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`;
  
  // Create a reference to the file location
  const storageRef = ref(storage, `public/${imageType}/${fileName}`);
  
  // Upload the file
  const snapshot = await uploadBytes(storageRef, file);
  
  // Get the download URL
  return await getDownloadURL(snapshot.ref);
}
