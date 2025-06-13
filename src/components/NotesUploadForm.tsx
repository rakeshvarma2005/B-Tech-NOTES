import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, runTransaction, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { curriculum } from "@/data/curriculum";
import { ImageUploader } from "@/components/ImageUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NotesUploadFormProps {
  onClose: () => void;
}

export function NotesUploadForm({ onClose }: NotesUploadFormProps) {
  const { currentUser } = useAuth();
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [unitNumber, setUnitNumber] = useState("");
  const [labType, setLabType] = useState("");
  
  // Selected year, semester and subject objects
  const selectedYear = curriculum.find(y => y.id === selectedYearId);
  const selectedSemester = selectedYear?.semesters.find(s => s.id === selectedSemesterId);
  const selectedSubject = selectedSemester?.subjects.find(s => s.id === selectedSubjectId);
  
  // Reset semester when year changes
  useEffect(() => {
    setSelectedSemesterId("");
    setSelectedSubjectId("");
  }, [selectedYearId]);
  
  // Reset subject when semester changes
  useEffect(() => {
    setSelectedSubjectId("");
  }, [selectedSemesterId]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type (PDF or text)
      const validTypes = ["application/pdf", "text/plain"];
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Only PDF or text files are allowed");
        return;
      }
      
      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (selectedFile.size > maxSize) {
        toast.error("File size should not exceed 10MB");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleThumbnailUploaded = (url: string) => {
    setThumbnailUrl(url);
    toast.success("Thumbnail added successfully");
  };

  const resetForm = () => {
    setSelectedYearId("");
    setSelectedSemesterId("");
    setSelectedSubjectId("");
    setFile(null);
    setUploadProgress(0);
    setThumbnailUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("You must be logged in to upload notes");
      return;
    }
    
    if (!selectedYearId || !selectedSemesterId || !selectedSubjectId || !file) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!selectedSubject) {
      toast.error("Invalid subject selection");
      return;
    }
    
    setIsUploading(true);
    const storageFilePath = `notes/${currentUser.uid}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storageFilePath);
    let downloadURL = "";
    
    try {
      // Generate a title from the selections
      const title = `${selectedYear?.name} - ${selectedSemester?.name} - ${selectedSubject.name}`;
      
      toast.info("Uploading file to storage...");
      
      try {
        // 1. Upload file to Firebase Storage
        const uploadResult = await uploadBytes(storageRef, file);
        downloadURL = await getDownloadURL(uploadResult.ref);
        
        toast.success("File uploaded successfully");
        toast.info("Creating note request...");
        
        // 2. Create a request entry in the noteRequests collection
        const docRef = await addDoc(collection(db, "noteRequests"), {
          userId: currentUser.uid,
          userEmail: currentUser.email,
          title,
          yearId: selectedYearId,
          semesterId: selectedSemesterId,
          subjectId: selectedSubjectId,
          subject: selectedSubject.code,
          fileURL: downloadURL,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          thumbnailURL: thumbnailUrl, // Add thumbnail URL if available
          createdAt: serverTimestamp(),
          status: "pending", // pending, approved, rejected
          unitNumber: unitNumber,
          labType: labType
        });
        
        console.log("Document written with ID: ", docRef.id);
        toast.success("Note upload request submitted successfully");
        onClose();
        resetForm();
      } catch (uploadError) {
        console.error("Error during upload process:", uploadError);
        
        // If we have a download URL but the Firestore write failed,
        // we should clean up the uploaded file
        if (downloadURL) {
          try {
            await deleteObject(storageRef);
            console.log("Cleaned up orphaned file after failed Firestore write");
          } catch (cleanupError) {
            console.error("Failed to clean up orphaned file:", cleanupError);
          }
        }
        
        throw uploadError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error("Error uploading note:", error);
      let errorMessage = "Failed to upload note";
      
      if (error instanceof Error) {
        // Extract the specific Firebase error message if available
        if (error.message.includes("permission-denied")) {
          errorMessage = "Permission denied. Please check your account permissions.";
        } else if (error.message.includes("unauthorized")) {
          errorMessage = "Unauthorized. You may need to log in again.";
        } else if (error.message.includes("quota-exceeded")) {
          errorMessage = "Storage quota exceeded. Please contact support.";
        } else {
          errorMessage = `Error: ${error.message}`;
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="space-y-2">
        <Label htmlFor="year">Year *</Label>
        <Select value={selectedYearId} onValueChange={setSelectedYearId} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a year" />
          </SelectTrigger>
          <SelectContent>
            {curriculum.map((year) => (
              <SelectItem key={year.id} value={year.id}>
                {year.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="semester">Semester *</Label>
        <Select 
          value={selectedSemesterId} 
          onValueChange={setSelectedSemesterId} 
          required
          disabled={!selectedYearId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a semester" />
          </SelectTrigger>
          <SelectContent>
            {selectedYear?.semesters.map((semester) => (
              <SelectItem key={semester.id} value={semester.id}>
                {semester.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="subject">Subject *</Label>
        <Select 
          value={selectedSubjectId} 
          onValueChange={setSelectedSubjectId} 
          required
          disabled={!selectedSemesterId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {selectedSemester?.subjects.map((subject) => (
              <SelectItem 
                key={subject.id} 
                value={subject.id}
                className={subject.hasLab ? 'text-blue-600 font-semibold flex items-center' : ''}
              >
                {subject.name} ({subject.code})
                {subject.hasLab && (
                  <span className="ml-2 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full align-middle">Lab</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="unitNumber">Unit *</Label>
        <Select 
          value={unitNumber} 
          onValueChange={setUnitNumber} 
          required
          disabled={!selectedSubjectId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a unit" />
          </SelectTrigger>
          <SelectContent>
            {selectedSubjectId && Array.from({ length: 5 }, (_, idx) => idx + 1).map((unit) => (
              <SelectItem key={unit} value={unit.toString()}>
                Unit {unit}
              </SelectItem>
            ))}
            <SelectItem key="important" value="important">
              ⭐ Important Questions
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="labType">Lab</Label>
        <Select
          value={labType}
          onValueChange={setLabType}
          disabled={!selectedSubjectId}
        >
          <SelectTrigger>
            <SelectValue placeholder={selectedSubject?.hasLab ? "Select lab type" : "None"} />
          </SelectTrigger>
          <SelectContent>
            {selectedSubject?.hasLab ? (
              <SelectItem key="lab" value="lab" className="text-orange-600 font-semibold bg-orange-50">Lab PDF</SelectItem>
            ) : (
              <SelectItem key="none" value="none" disabled>None</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="file">File Upload</TabsTrigger>
          <TabsTrigger value="thumbnail">Thumbnail (Optional)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="file" className="space-y-2">
          <Label htmlFor="file">Upload File (PDF or Text) *</Label>
          <Input
            id="file"
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt"
            required
            className="cursor-pointer"
          />
          <p className="text-xs text-muted-foreground">
            Max file size: 10MB. Allowed formats: PDF, TXT
          </p>
        </TabsContent>
        
        <TabsContent value="thumbnail">
          <ImageUploader 
            imageType="thumbnails"
            label="Upload Thumbnail (Optional)"
            onImageUploaded={handleThumbnailUploaded}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Adding a thumbnail helps others identify your notes visually
          </p>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Submit Request
            </>
          )}
        </Button>
      </div>
    </form>
  );
} 