import { useState } from "react";
import { ImageUploader } from "@/components/ImageUploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function ImageUploadExample() {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [bannerImageUrl, setBannerImageUrl] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);

  const handleProfileImageUploaded = (url: string) => {
    setProfileImageUrl(url);
    toast.success("Profile image updated");
  };

  const handleBannerImageUploaded = (url: string) => {
    setBannerImageUrl(url);
    toast.success("Banner image updated");
  };

  const handleGalleryImageUploaded = (url: string) => {
    setGalleryImages(prev => [...prev, url]);
    toast.success("Image added to gallery");
  };

  const saveChanges = () => {
    // Here you would typically save these URLs to your user profile in Firestore
    toast.success("Changes saved successfully");
    console.log({
      profileImageUrl,
      bannerImageUrl,
      galleryImages
    });
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Image Upload Examples</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Image Example */}
        <Card>
          <CardHeader>
            <CardTitle>Profile Image</CardTitle>
            <CardDescription>Upload a profile picture</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploader 
              imageType="avatars"
              label="Profile Picture"
              onImageUploaded={handleProfileImageUploaded}
            />
            
            {profileImageUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="flex items-center space-x-4">
                  <img 
                    src={profileImageUrl} 
                    alt="Profile" 
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-sm font-medium">John Doe</p>
                    <p className="text-xs text-gray-500">Student</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Banner Image Example */}
        <Card>
          <CardHeader>
            <CardTitle>Banner Image</CardTitle>
            <CardDescription>Upload a banner for your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUploader 
              imageType="banners"
              label="Banner Image"
              onImageUploaded={handleBannerImageUploaded}
            />
            
            {bannerImageUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Preview:</p>
                <div className="relative h-32 w-full rounded-md overflow-hidden">
                  <img 
                    src={bannerImageUrl} 
                    alt="Banner" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white font-medium">John Doe's Profile</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Gallery Example */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Image Gallery</CardTitle>
            <CardDescription>Upload multiple images to create a gallery</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <ImageUploader 
                imageType="gallery"
                label="Add Gallery Image"
                onImageUploaded={handleGalleryImageUploaded}
              />
            </div>
            
            {galleryImages.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Gallery Preview:</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {galleryImages.map((url, index) => (
                    <img 
                      key={index}
                      src={url} 
                      alt={`Gallery image ${index + 1}`} 
                      className="h-24 w-full rounded-md object-cover"
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={saveChanges}>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 