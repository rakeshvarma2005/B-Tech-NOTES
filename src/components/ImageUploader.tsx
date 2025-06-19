import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { uploadPublicImage } from "@/lib/utils";

interface ImageUploaderProps {
  onImageUploaded?: (url: string) => void;
  imageType?: string;
  label?: string;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
}

export function ImageUploader({
  onImageUploaded,
  imageType = "general",
  label = "Upload Image",
  maxWidth = 1920,
  maxHeight = 1080,
  className = "",
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Clear previous errors
      setUploadError(null);
      
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("Please select an image file (JPEG, PNG, GIF, etc.)");
        toast.error("Please select an image file");
        return;
      }
      
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        setUploadError(`File size (${sizeMB}MB) exceeds the 5MB limit`);
        toast.error(`Image is too large (${sizeMB}MB). Maximum size is 5MB`);
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Start upload
      try {
        setIsUploading(true);
        setUploadProgress(10); // Show initial progress
        
        // Simulate progress (actual progress not available from Supabase)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const next = prev + Math.random() * 15;
            return next < 90 ? next : 90;
          });
        }, 500);
        
        toast.info("Uploading image...");
        console.log(`Uploading ${imageType} image:`, file.name, file.type);
        
        const imageUrl = await uploadPublicImage(file, imageType);
        
        // Upload complete
        clearInterval(progressInterval);
        setUploadProgress(100);
        toast.success("Image uploaded successfully");
        
        if (onImageUploaded) {
          onImageUploaded(imageUrl);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to upload image";
        setUploadError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setUploadError(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="image-upload">{label}</Label>
      
      {previewUrl ? (
        <div className="relative">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="max-h-[200px] rounded-md object-contain"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 rounded-full"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          className={`flex flex-col items-center justify-center border-2 border-dashed 
            ${uploadError ? 'border-red-500' : 'border-gray-300'} 
            rounded-md p-6 bg-gray-50 dark:bg-gray-900`}
        >
          <Upload className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">Click to select or drag and drop</p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 5MB</p>
          {uploadError && (
            <p className="text-sm text-red-500 mt-2">{uploadError}</p>
          )}
        </div>
      )}
      
      <Input
        id="image-upload"
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className={`cursor-pointer ${previewUrl ? 'hidden' : ''}`}
        disabled={isUploading}
      />
      
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Uploading... {Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
} 