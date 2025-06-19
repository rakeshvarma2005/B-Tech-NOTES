import { useState, useRef, ChangeEvent, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, X } from "lucide-react";
import { curriculum } from "@/data/curriculum";
import { ImageUploader } from "@/components/ImageUploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

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
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [unitNumber, setUnitNumber] = useState("");
  const [isImportantQuestions, setIsImportantQuestions] = useState(false);
  const [notesType, setNotesType] = useState<string>("regular");
  
  // Selected year, semester and subject objects
  const selectedYear = curriculum.find(y => y.id === selectedYearId);
  const selectedSemester = selectedYear?.semesters.find(s => s.id === selectedSemesterId);
  const selectedSubject = selectedSemester?.subjects.find(s => s.id === selectedSubjectId);
  const isLabSubject = selectedSubject?.hasLab || false;
  
  // Reset semester when year changes
  useEffect(() => {
    setSelectedSemesterId("");
    setSelectedSubjectId("");
  }, [selectedYearId]);
  
  // Reset subject when semester changes
  useEffect(() => {
    setSelectedSubjectId("");
  }, [selectedSemesterId]);
  
  // Reset unit and notes type when subject changes
  useEffect(() => {
    setUnitNumber("");
    setNotesType("regular");
    setIsImportantQuestions(false);
  }, [selectedSubjectId]);
  
  // Update isImportantQuestions when notesType changes
  useEffect(() => {
    if (notesType === "important_questions") {
      setIsImportantQuestions(true);
    } else {
      setIsImportantQuestions(false);
    }
  }, [notesType]);

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
    setThumbnailUrl(null);
    setUnitNumber("");
    setIsImportantQuestions(false);
    setNotesType("regular");
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
    
    if (!selectedYearId || !selectedSemesterId || !selectedSubjectId || !unitNumber || !file) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!selectedSubject) {
      toast.error("Invalid subject selection");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Generate a title from the selections
      let title = `${selectedYear?.name} - ${selectedSemester?.name} - ${selectedSubject.name}`;
      
      if (notesType === "important_questions") {
        title += " - Important Questions";
      } else if (notesType === "lab_manual" || notesType === "lab_records" || notesType === "lab_viva") {
        title += ` - ${unitNumber} - ${notesType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
      } else if (unitNumber !== "All Units" && unitNumber !== "Important Questions") {
        title += ` - ${unitNumber}`;
      } else if (unitNumber === "Important Questions") {
        title += " - Important Questions";
      }
      
      toast.info("Preparing to upload...");
      
      // Verify Supabase connection first
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          toast.error("Authentication error. Please log in again.");
          setIsUploading(false);
          return;
        }
        
        console.log("Authentication verified:", session.session.user.id);
      } catch (authError) {
        console.error("Authentication error:", authError);
        toast.error("Failed to verify authentication. Please log in again.");
        setIsUploading(false);
        return;
      }
      
      // Step 1: Get or create a course
      let courseId;
      
      try {
        const { data: courseData, error: courseError } = await supabase
          .from('courses')
          .select('id')
          .limit(1);
        
        if (courseError) {
          console.error('Error fetching courses:', courseError);
          toast.error(`Database error: ${courseError.message || "Failed to access courses"}`);
          setIsUploading(false);
          return;
        }
        
        if (!courseData || courseData.length === 0) {
          // Create a default course
          const { data: newCourse, error: createError } = await supabase
            .from('courses')
            .insert({
              name: selectedSubject?.name || 'Default Course',
              code: selectedSubject?.code || 'DEFAULT',
              year: 1,
              semester: 1
            })
            .select();
          
          if (createError) {
            console.error('Error creating course:', createError);
            toast.error(`Failed to create course: ${createError.message}`);
            setIsUploading(false);
            return;
          }
          
          if (!newCourse || newCourse.length === 0) {
            toast.error("Failed to create course. No data returned.");
            setIsUploading(false);
            return;
          }
          
          courseId = newCourse[0].id;
          console.log("Created new course with ID:", courseId);
        } else {
          courseId = courseData[0].id;
          console.log("Using existing course with ID:", courseId);
        }
      } catch (courseError) {
        console.error('Error with course:', courseError);
        toast.error(`Course error: ${courseError instanceof Error ? courseError.message : "Unknown error"}`);
        setIsUploading(false);
        return;
      }
      
      // Step 2: Upload file
      let fileUrl;
      
      try {
        toast.info("Uploading file...");
        
        // Check if storage is accessible - we'll try to use it directly instead of checking first
        try {
          console.log("Attempting to access notes storage bucket...");
          
          // Instead of checking or creating the bucket, we'll try to list files to test access
          const { data: fileList, error: listError } = await supabase.storage.from('notes').list();
              
          if (listError) {
            console.warn('Could not list files in notes bucket:', listError);
            // We'll still proceed with the upload and let that operation handle any errors
          } else {
            console.log("Notes bucket access confirmed, contains", fileList.length, "files");
          }
        } catch (storageSetupError) {
          console.warn('Storage access check failed:', storageSetupError);
          // We'll still attempt the upload rather than blocking the operation here
          toast.info("Storage access check failed. We'll still try to upload your file.");
        }
        
        // Upload the file
        const filePath = `notes/${currentUser.id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        console.log("Uploading file to path:", filePath);
        
        // Log file details for debugging
        console.log("File details:", {
          name: file.name,
          type: file.type,
          size: file.size,
          lastModified: new Date(file.lastModified).toISOString()
        });
        
        const { error: uploadError } = await supabase.storage
          .from('notes')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true // Use upsert to overwrite if file exists
          });
        
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error(`Upload error: ${uploadError.message}`);
          throw new Error(`Failed to upload file: ${uploadError.message}`);
        }
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('notes')
          .getPublicUrl(filePath);
        
        if (!urlData || !urlData.publicUrl) {
          toast.error("Failed to get public URL for file");
          throw new Error('Failed to get public URL for file');
        }
        
        fileUrl = urlData.publicUrl;
        console.log("File uploaded successfully. URL:", fileUrl);
        toast.success("File uploaded successfully");
        
      } catch (fileError) {
        console.error('Error with file upload:', fileError);
        toast.error(`File upload error: ${fileError instanceof Error ? fileError.message : "Unknown error"}`);
        setIsUploading(false);
        return;
      }
      
      // Step 3: Create note record
      try {
        toast.info("Creating note record...");
        
        const noteData = {
          user_id: currentUser.id,
          course_id: courseId,
          title,
          description: `Year: ${selectedYear?.name}, Semester: ${selectedSemester?.name}, Subject: ${selectedSubject.name}, Unit: ${unitNumber}, Type: ${notesType}`,
          file_url: fileUrl,
          thumbnail_url: thumbnailUrl || null,
          file_type: file.type,
          page_count: 0,
          status: 'pending',
          year_id: selectedYearId,
          semester_id: selectedSemesterId,
          subject_id: selectedSubjectId,
          unit_number: unitNumber || null,
          is_important_questions: isImportantQuestions,
          notes_type: notesType
        };
        
        console.log("Creating note record with data:", noteData);
        
        const { data: createdNote, error: noteError } = await supabase
          .from('notes')
          .insert(noteData)
          .select();
        
        if (noteError) {
          console.error('Error creating note:', noteError);
          toast.error(`Database error: ${noteError.message}`);
          throw new Error(`Failed to create note record: ${noteError.message}`);
        }
        
        console.log("Note record created successfully:", createdNote);
        toast.success("Note upload completed successfully!");
        onClose();
        resetForm();
        
      } catch (noteError) {
        console.error('Error creating note record:', noteError);
        toast.error(`Note record error: ${noteError instanceof Error ? noteError.message : "Unknown error"}`);
        setIsUploading(false);
        return;
      }
      
    } catch (error) {
      console.error("Error in upload process:", error);
      let errorMessage = "Failed to upload note";
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setIsUploading(false);
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="bg-[#0a0a14] text-white p-4 rounded-lg w-full max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Upload Notes</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <Label htmlFor="year" className="text-sm font-medium text-white">Year *</Label>
        <Select value={selectedYearId} onValueChange={setSelectedYearId} required>
            <SelectTrigger className="bg-[#0f0f1a] border-[#2a2a3a] text-white">
            <SelectValue placeholder="Select a year" />
          </SelectTrigger>
            <SelectContent className="bg-[#1a1a2a] text-white border-[#2a2a3a]">
            {curriculum.map((year) => (
              <SelectItem key={year.id} value={year.id}>
                {year.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
        <div className="space-y-1">
          <Label htmlFor="semester" className="text-sm font-medium text-white">Semester *</Label>
        <Select 
          value={selectedSemesterId} 
          onValueChange={setSelectedSemesterId} 
          required
          disabled={!selectedYearId}
        >
            <SelectTrigger className="bg-[#0f0f1a] border-[#2a2a3a] text-white">
            <SelectValue placeholder="Select a semester" />
          </SelectTrigger>
            <SelectContent className="bg-[#1a1a2a] text-white border-[#2a2a3a]">
            {selectedYear?.semesters.map((semester) => (
              <SelectItem key={semester.id} value={semester.id}>
                {semester.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
        <div className="space-y-1">
          <Label htmlFor="subject" className="text-sm font-medium text-white">Subject *</Label>
        <Select 
          value={selectedSubjectId} 
          onValueChange={setSelectedSubjectId} 
          required
          disabled={!selectedSemesterId}
        >
            <SelectTrigger className="bg-[#0f0f1a] border-[#2a2a3a] text-white">
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
            <SelectContent className="bg-[#1a1a2a] text-white border-[#2a2a3a]">
            {selectedSemester?.subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                {subject.name} ({subject.code})
                {subject.hasLab && (
                    <span className="ml-2 inline-block bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded-full">Lab</span>
                )}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
        <div className="space-y-1">
          <Label htmlFor="notesType" className="text-sm font-medium text-white">Notes Type *</Label>
        <Select 
            value={notesType} 
            onValueChange={setNotesType} 
          required
        >
            <SelectTrigger className="bg-[#0f0f1a] border-[#2a2a3a] text-white">
              <SelectValue placeholder="Select notes type" />
          </SelectTrigger>
            <SelectContent className="bg-[#1a1a2a] text-white border-[#2a2a3a]">
              <SelectItem value="regular">Regular Notes</SelectItem>
              <SelectItem value="important_questions">Important Questions</SelectItem>
              {isLabSubject && (
                <>
                  <SelectItem value="lab_manual">Lab Manual</SelectItem>
                  <SelectItem value="lab_records">Lab Records</SelectItem>
                  <SelectItem value="lab_viva">Lab Viva Questions</SelectItem>
                </>
              )}
          </SelectContent>
        </Select>
      </div>
      
        <div className="space-y-1">
          <Label htmlFor="unit" className="text-sm font-medium text-white">Unit *</Label>
          <Select value={unitNumber} onValueChange={setUnitNumber} required>
            <SelectTrigger className="bg-[#0f0f1a] border-[#2a2a3a] text-white">
              <SelectValue placeholder="Select a unit" />
          </SelectTrigger>
            <SelectContent className="bg-[#1a1a2a] text-white border-[#2a2a3a]">
              {notesType !== "important_questions" && (
                <>
                  <SelectItem value="Unit 1">Unit 1</SelectItem>
                  <SelectItem value="Unit 2">Unit 2</SelectItem>
                  <SelectItem value="Unit 3">Unit 3</SelectItem>
                  <SelectItem value="Unit 4">Unit 4</SelectItem>
                  <SelectItem value="Unit 5">Unit 5</SelectItem>
                  <SelectItem value="All Units">All Units</SelectItem>
                </>
              )}
              {notesType === "important_questions" && (
                <SelectItem value="Important Questions">Important Questions</SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-[#1a1a2a]">
            <TabsTrigger value="file" className="data-[state=active]:bg-blue-600">File Upload</TabsTrigger>
            <TabsTrigger value="thumbnail" className="data-[state=active]:bg-blue-600">Thumbnail (Optional)</TabsTrigger>
        </TabsList>
        
          <TabsContent value="file" className="pt-4">
            <div className="space-y-2">
              <Label htmlFor="file" className="text-sm font-medium text-white">Upload File (PDF or Text) *</Label>
              <div className="border border-[#2a2a3a] rounded-md p-4">
                <input
                  type="file"
            id="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.txt"
                  className="hidden"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-[#0f0f1a] border-[#2a2a3a] text-white hover:bg-[#1a1a2a]"
                >
                  Choose file
                </Button>
                
                {file ? (
                  <div className="mt-2 text-sm text-gray-300">
                    {file.name}
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-gray-400">
                    No file chosen
                  </div>
                )}
                
                <div className="mt-1 text-xs text-gray-400">
            Max file size: 10MB. Allowed formats: PDF, TXT
                </div>
              </div>
            </div>
        </TabsContent>
        
          <TabsContent value="thumbnail" className="pt-4">
            <div className="space-y-2">
              <Label htmlFor="thumbnail" className="text-sm font-medium text-white">Thumbnail Image</Label>
              <ImageUploader onImageUploaded={handleThumbnailUploaded} />
              {thumbnailUrl && (
                <div className="mt-2">
                  <img 
                    src={thumbnailUrl} 
                    alt="Thumbnail" 
                    className="w-32 h-32 object-cover rounded-md border border-[#2a2a3a]" 
                  />
                </div>
              )}
            </div>
        </TabsContent>
      </Tabs>
      
        <div className="flex justify-between pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="bg-transparent border-[#2a2a3a] text-white hover:bg-[#1a1a2a]"
          >
          Cancel
        </Button>
          
          <Button 
            type="submit" 
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
              "Submit Request"
          )}
        </Button>
      </div>
    </form>
    </div>
  );
} 