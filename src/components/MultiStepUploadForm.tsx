import { useState, useRef, ChangeEvent } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, Info, AlertCircle } from "lucide-react";
import { curriculum } from "@/data/curriculum";

interface MultiStepUploadFormProps {
  onClose: () => void;
}

export function MultiStepUploadForm({ onClose }: MultiStepUploadFormProps) {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.email === "admin@example.com" || 
                  currentUser?.email === "rakeshvarma9704@gmail.com" || 
                  currentUser?.uid === "qadmin";
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
    const storageFilePath = `notes/${currentUser.uid}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, storageFilePath);
    let downloadURL = "";
    
    try {
      // 1. Upload file to Firebase Storage
      const uploadResult = await uploadBytes(storageRef, file);
      downloadURL = await getDownloadURL(uploadResult.ref);
      
      // 2. Create a request entry in the noteRequests collection
      const docRef = await addDoc(collection(db, "noteRequests"), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        title,
        yearId: selectedYearId,
        semesterId: selectedSemesterId,
        subjectId: selectedSubjectId,
        subject: selectedSubject?.code,
        unitNumber: unitNumber || "N/A",
        description,
        fileURL: downloadURL,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        createdAt: serverTimestamp(),
        status: "pending" // pending, approved, rejected
      });
      
      console.log("Document written with ID: ", docRef.id);
      toast.success("Note upload request submitted successfully");
      onClose();
    } catch (error) {
      console.error("Error uploading note:", error);
      
      // Clean up orphaned file if Firestore write failed
      if (downloadURL) {
        try {
          await deleteObject(storageRef);
        } catch (cleanupError) {
          console.error("Failed to clean up orphaned file:", cleanupError);
        }
      }
      
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
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="unitNumber" className="text-white">Unit</Label>
              <Select
                value={unitNumber}
                onValueChange={setUnitNumber}
                required
                disabled={!selectedSubjectId}
              >
                <SelectTrigger className="bg-black border-gray-700 text-white">
                  <SelectValue placeholder="Select a unit" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 text-white border-gray-700">
                  {selectedSubjectId && Array.from({ length: 5 }, (_, idx) => idx + 1).map((unit) => (
                    <SelectItem key={unit} value={unit.toString()}>
                      Unit {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide a brief description of your notes"
              rows={3}
              className="bg-black border-gray-700 text-white resize-none"
            />
          </div>
        </div>
      )}
      
      {/* Step 2: Upload */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Upload PDF</h2>
          
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            
            <p className="text-white mb-1">Click to upload or drag and drop</p>
            <p className="text-gray-500 text-sm mb-4">PDF (Max 10MB)</p>
            
            <Input
              id="file"
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              required
              className="hidden"
            />
            
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              className="border-gray-700 text-white hover:bg-gray-800"
            >
              Browse Files
            </Button>
            
            {file && (
              <div className="mt-4 text-green-400">
                Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg flex items-start gap-3">
            <Info className="h-5 w-5 text-gray-400 mt-0.5" />
            <p className="text-sm text-gray-400">
              Make sure your uploaded document is a PDF file and doesn't exceed 10MB in size. 
              The file will be reviewed by our team before being published.
            </p>
          </div>
        </div>
      )}
      
      {/* Step 3: Review */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Review Your Submission</h2>
          
          <div className="bg-gray-900 p-6 rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Title</p>
                <p className="text-white">{title}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Academic Year</p>
                <p className="text-white">{selectedYear?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Semester</p>
                <p className="text-white">{selectedSemester?.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Subject</p>
                <p className="text-white">{selectedSubject?.name} ({selectedSubject?.code})</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Unit Number</p>
                <p className="text-white">{unitNumber || "N/A"}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">File</p>
                <p className="text-white">{file?.name}</p>
              </div>
            </div>
            
            {description && (
              <div>
                <p className="text-gray-400 text-sm">Description</p>
                <p className="text-white">{description}</p>
              </div>
            )}
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5" />
            <p className="text-sm text-gray-400">
              Please review your submission carefully. Once submitted, your notes will be reviewed by our team before being published.
            </p>
          </div>
        </div>
      )}
      
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        {currentStep > 1 ? (
          <Button 
            type="button" 
            variant="outline"
            onClick={prevStep}
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            Back
          </Button>
        ) : (
          <Button 
            type="button" 
            variant="outline"
            onClick={onClose}
            className="border-gray-700 text-white hover:bg-gray-800"
          >
            Cancel
          </Button>
        )}
        
        {currentStep < 3 ? (
          <Button 
            type="button"
            onClick={nextStep}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {currentStep === 2 ? "Continue to Review" : "Continue"}
          </Button>
        ) : (
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
        )}
      </div>
    </div>
  );
}
