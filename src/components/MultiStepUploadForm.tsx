import { useState, useRef, ChangeEvent } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, Info, AlertCircle } from "lucide-react";
import { curriculum } from "@/data/curriculum";
import { Checkbox } from "@/components/ui/checkbox";

interface MultiStepUploadFormProps {
  onClose: () => void;
}

export function MultiStepUploadForm({ onClose }: MultiStepUploadFormProps) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.email === "admin@example.com" || 
                  currentUser?.email === "rakeshvarma9704@gmail.com";
  const [currentStep, setCurrentStep] = useState<number>(1);
  
  // Form fields
  const [title, setTitle] = useState<string>("");
  const [selectedYearId, setSelectedYearId] = useState<string>("");
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [unitNumber, setUnitNumber] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isImportantQuestions, setIsImportantQuestions] = useState<boolean>(false);
  const [notesType, setNotesType] = useState<string>("regular");
  const [labType, setLabType] = useState<string>("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Selected year, semester and subject objects
  const selectedYear = curriculum.find(y => y.id === selectedYearId);
  const selectedSemester = selectedYear?.semesters.find(s => s.id === selectedSemesterId);
  const selectedSubject = selectedSemester?.subjects.find(s => s.id === selectedSubjectId);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Check file type (PDF only)
      if (selectedFile.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
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

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to upload notes");
      return;
    }
    
    if (!title || !selectedYearId || !selectedSemesterId || !selectedSubjectId || !file) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // 1. Get course ID based on subject
      // For this example, we'll just use the first course in the database
      // In a real application, you would need to fetch or create the appropriate course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('id')
        .limit(1);
      
      if (courseError) throw courseError;
      
      if (!courseData || courseData.length === 0) {
        throw new Error("No courses found in the database");
      }
      
      const courseId = courseData[0].id;
      
      // 2. Upload file to Supabase Storage
      const filePath = `notes/${currentUser.id}/${Date.now()}_${file.name}`;
      const { data: fileData, error: fileError } = await supabase.storage
        .from('notes')
        .upload(filePath, file);
      
      if (fileError) throw fileError;
      
      // 3. Get the public URL for the uploaded file
      const { data: publicURLData } = supabase.storage
        .from('notes')
        .getPublicUrl(filePath);
      
      const fileUrl = publicURLData.publicUrl;
      
      // 4. Create a note entry in the notes table
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .insert({
          user_id: currentUser.id,
          course_id: courseId,
          title: isImportantQuestions ? `${title} - Important Questions` : title,
          description,
          file_url: fileUrl,
          file_type: file.type,
          page_count: 0, // You could use a PDF library to get the actual page count
          status: 'pending',
          year_id: selectedYearId,
          semester_id: selectedSemesterId,
          subject_id: selectedSubjectId,
          unit_number: unitNumber || null,
          is_important_questions: isImportantQuestions,
          notes_type: notesType,
          lab_type: labType || null
        })
        .select();
      
      if (noteError) throw noteError;
      
      toast.success("Note upload request submitted successfully");
      onClose();
    } catch (error) {
      console.error("Error uploading note:", error);
      toast.error("Failed to upload note. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const nextStep = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!title || !selectedYearId || !selectedSemesterId || !selectedSubjectId) {
        toast.error("Please fill in all required fields");
        return;
      }
    } else if (currentStep === 2) {
      if (!file) {
        toast.error("Please upload a PDF file");
        return;
      }
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  if (!isAdmin) {
    return (
      <div className="bg-black text-white p-6 rounded-lg w-full max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-4">Upload Notes</h1>
        <p className="text-lg text-red-400 font-semibold">Only admins can upload notes</p>
      </div>
    );
  }
  return (
    <div className="bg-black text-white p-6 rounded-lg w-full max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Upload Notes</h1>
      <p className="text-gray-400 mb-8">Share your class notes with other students</p>
      
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-1/2 h-px bg-gray-700 w-full -z-10"></div>
        
        {/* Step 1 */}
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep === 1 ? 'bg-purple-500' : currentStep > 1 ? 'bg-purple-500' : 'bg-gray-800'}`}>
            <span className="text-white font-medium">1</span>
          </div>
          <span className={`mt-2 text-sm ${currentStep === 1 ? 'text-purple-500' : currentStep > 1 ? 'text-purple-500' : 'text-gray-500'}`}>Details</span>
        </div>
        
        {/* Step 2 */}
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep === 2 ? 'bg-purple-500' : currentStep > 2 ? 'bg-purple-500' : 'bg-gray-800'}`}>
            <span className="text-white font-medium">2</span>
          </div>
          <span className={`mt-2 text-sm ${currentStep === 2 ? 'text-purple-500' : currentStep > 2 ? 'text-purple-500' : 'text-gray-500'}`}>Upload</span>
        </div>
        
        {/* Step 3 */}
        <div className="flex flex-col items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${currentStep === 3 ? 'bg-purple-500' : 'bg-gray-800'}`}>
            <span className="text-white font-medium">3</span>
          </div>
          <span className={`mt-2 text-sm ${currentStep === 3 ? 'text-purple-500' : 'text-gray-500'}`}>Review</span>
        </div>
      </div>
      
      {/* Step 1: Details */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for your notes"
              required
              className="bg-black border-gray-700 text-white"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear" className="text-white">Academic Year</Label>
              <Select value={selectedYearId} onValueChange={setSelectedYearId} required>
                <SelectTrigger className="bg-black border-gray-700 text-white">
                  <SelectValue placeholder="Year 1" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-gray-700">
                  {curriculum.map((year) => (
                    <SelectItem key={year.id} value={year.id}>
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="semester" className="text-white">Semester</Label>
              <Select 
                value={selectedSemesterId} 
                onValueChange={setSelectedSemesterId} 
                required
                disabled={!selectedYearId}
              >
                <SelectTrigger className="bg-black border-gray-700 text-white">
                  <SelectValue placeholder="Semester 1" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-gray-700">
                  {selectedYear?.semesters.map((semester) => (
                    <SelectItem key={semester.id} value={semester.id}>
                      {semester.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-white">Subject</Label>
              <Select 
                value={selectedSubjectId} 
                onValueChange={setSelectedSubjectId} 
                required
                disabled={!selectedSemesterId}
              >
                <SelectTrigger className="bg-black border-gray-700 text-white">
                  <SelectValue placeholder="Engineering Chemistry (Common)" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-gray-700">
                  {selectedSemester?.subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name} ({subject.code})
                      {subject.hasLab && (
                        <span className="ml-2 inline-block bg-blue-900 text-blue-200 text-xs px-2 py-0.5 rounded-full">Lab</span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitNumber" className="text-white">Unit Number (Optional)</Label>
              <Select value={unitNumber} onValueChange={setUnitNumber}>
                <SelectTrigger className="bg-black border-gray-700 text-white">
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-gray-700">
                  <SelectItem value="Unit 1">Unit 1</SelectItem>
                  <SelectItem value="Unit 2">Unit 2</SelectItem>
                  <SelectItem value="Unit 3">Unit 3</SelectItem>
                  <SelectItem value="Unit 4">Unit 4</SelectItem>
                  <SelectItem value="Unit 5">Unit 5</SelectItem>
                  <SelectItem value="All Units">All Units</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notesType" className="text-white">Notes Type</Label>
            <Select value={notesType} onValueChange={setNotesType}>
              <SelectTrigger className="bg-black border-gray-700 text-white">
                <SelectValue placeholder="Select notes type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 text-white border-gray-700">
                <SelectItem value="regular">Regular Notes</SelectItem>
                <SelectItem value="important_questions">Important Questions</SelectItem>
                <SelectItem value="previous_papers">Previous Papers</SelectItem>
                <SelectItem value="reference_material">Reference Material</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="importantQuestions" 
              checked={isImportantQuestions}
              onCheckedChange={(checked) => setIsImportantQuestions(checked === true)}
              className="border-gray-500 data-[state=checked]:bg-purple-600"
            />
            <Label 
              htmlFor="importantQuestions" 
              className="text-sm font-medium leading-none text-white"
            >
              Mark as Important Questions
            </Label>
          </div>
          
          {selectedSubject?.hasLab && (
            <div className="space-y-2">
              <Label htmlFor="labType" className="text-white">Lab Type (Optional)</Label>
              <Select value={labType} onValueChange={setLabType}>
                <SelectTrigger className="bg-black border-gray-700 text-white">
                  <SelectValue placeholder="Select lab type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-gray-700">
                  <SelectItem value="Lab Manual">Lab Manual</SelectItem>
                  <SelectItem value="Lab Records">Lab Records</SelectItem>
                  <SelectItem value="Lab Viva Questions">Lab Viva Questions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a brief description of your notes"
              className="bg-black border-gray-700 text-white min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              onClick={nextStep}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 2: Upload */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
            <input
              type="file"
              id="file-upload"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              className="hidden"
            />
            
            {file ? (
              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="font-medium text-white">{file.name}</p>
                  <p className="text-sm text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  Change File
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="h-12 w-12 text-gray-500 mb-2" />
                  <p className="text-lg font-medium text-white">Upload PDF File</p>
                  <p className="text-sm text-gray-400">PDF files only, max 10MB</p>
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-gray-700 text-white hover:bg-gray-800"
                >
                  Select File
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center p-4 bg-blue-900/20 rounded-lg">
            <Info className="h-5 w-5 text-blue-400 mr-3 flex-shrink-0" />
            <p className="text-sm text-blue-300">
              Your notes will be reviewed before being published. This typically takes 1-2 business days.
            </p>
          </div>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Back
            </Button>
            <Button 
              type="button" 
              onClick={nextStep}
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!file}
            >
              Next
            </Button>
          </div>
        </div>
      )}
      
      {/* Step 3: Review */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div className="bg-gray-900 p-6 rounded-lg space-y-4">
            <div>
              <h3 className="text-lg font-medium text-white">{isImportantQuestions ? `${title} - Important Questions` : title}</h3>
              <p className="text-sm text-gray-400">
                {selectedSubject?.name} ({selectedSubject?.code})
                {unitNumber && ` - ${unitNumber}`}
                {labType && ` - ${labType}`}
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-300">Type:</h4>
              <p className="text-sm text-gray-400">
                {notesType === "regular" && "Regular Notes"}
                {notesType === "important_questions" && "Important Questions"}
                {notesType === "previous_papers" && "Previous Papers"}
                {notesType === "reference_material" && "Reference Material"}
                {isImportantQuestions && " (Marked as Important Questions)"}
              </p>
            </div>
            
            {description && (
              <div>
                <h4 className="text-sm font-medium text-gray-300">Description:</h4>
                <p className="text-sm text-gray-400">{description}</p>
              </div>
            )}
            
            {file && (
              <div>
                <h4 className="text-sm font-medium text-gray-300">File:</h4>
                <p className="text-sm text-gray-400">
                  {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center p-4 bg-amber-900/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-amber-400 mr-3 flex-shrink-0" />
            <p className="text-sm text-amber-300">
              Please review your submission carefully. You won't be able to edit it after submission.
            </p>
          </div>
          
          <div className="flex justify-between">
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Back
            </Button>
            <Button 
              type="button" 
              onClick={handleSubmit}
              disabled={isUploading}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
