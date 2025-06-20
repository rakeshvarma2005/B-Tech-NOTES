import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import YearSelection from "@/components/YearSelection";
import SubjectSelection from "@/components/SubjectSelection";
import PDFViewer from "@/components/PDFViewer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { fadeIn } from "@/lib/animations";
import { Subject } from "@/data/curriculum";
import { fetchNotesBySubject } from "@/lib/dbFunctions";
import { toast } from "@/components/ui/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Eye, BookOpen, FileText, Clock } from "lucide-react";

interface Note {
  id: string;
  title: string;
  file_url: string;
  unit_number: string | null;
  is_important_questions: boolean;
  subject_id: string;
  created_at: string;
  user_id: string;
}

const Index = () => {
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);
  const [subjectNotes, setSubjectNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showNotesListing, setShowNotesListing] = useState(false);
  const [viewingPDF, setViewingPDF] = useState(false);

  const handleYearSelect = (yearId: string) => {
    setSelectedYearId(yearId);
    setSubjectNotes([]);
    setSelectedNote(null);
    setShowNotesListing(false);
    setViewingPDF(false);
  };

  const handleSubjectSelect = (subject: Subject, unit: number) => {
    console.log(`Selected subject: ${subject.name} (${subject.id}), unit: ${unit}`);
    setSelectedSubject(subject);
    setSelectedUnit(unit);
    setSelectedNote(null);
    setViewingPDF(false);
    fetchNotesForSubject(subject.id, unit);
  };

  const fetchNotesForSubject = async (subjectId: string, unitNumber: number) => {
    setIsLoading(true);
    try {
      console.log(`Fetching notes for subject ID: ${subjectId}, unit: ${unitNumber}`);
      const notes = await fetchNotesBySubject(subjectId);
      
      console.log(`Fetched ${notes.length} notes for subject ${subjectId}`);
      
      // Filter notes by unit if a specific unit was selected
      const unitNotes = unitNumber === 0 
        ? notes.filter(note => note.is_important_questions) // Unit 0 is for important questions
        : notes.filter(note => {
            // Match the unit_number field correctly
            // It could be stored as "Unit 1", "1", or a number
            if (!note.unit_number) return false;
            
            // Try to extract unit number from the string
            const unitMatch = note.unit_number.toString().match(/(\d+)/);
            if (unitMatch) {
              return parseInt(unitMatch[1], 10) === unitNumber;
            }
            
            return note.unit_number === unitNumber.toString();
          });
      
      console.log(`Filtered to ${unitNotes.length} notes for unit ${unitNumber}`);
      if (unitNotes.length > 0) {
        console.log("Available notes:", unitNotes.map(note => ({
          id: note.id,
          title: note.title,
          unit: note.unit_number,
          is_important: note.is_important_questions
        })));
      }
      
      setSubjectNotes(unitNotes);

      if (unitNotes.length > 0) {
        // Show the notes listing view
        setShowNotesListing(true);
      } else {
        setShowNotesListing(false);
        toast({
          title: "No notes available",
          description: `No notes found for ${unitNumber === 0 ? 'Important Questions' : `Unit ${unitNumber}`}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error fetching notes for subject:', error);
      setSelectedNote(null);
      setSubjectNotes([]);
      setShowNotesListing(false);
      toast({
        title: "Error",
        description: "Failed to load notes for this subject",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToYears = () => {
    setSelectedYearId(null);
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSubjectNotes([]);
    setSelectedNote(null);
    setShowNotesListing(false);
    setViewingPDF(false);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedUnit(null);
    setSubjectNotes([]);
    setSelectedNote(null);
    setShowNotesListing(false);
    setViewingPDF(false);
  };

  const handleBackToNotesList = () => {
    setSelectedNote(null);
    setViewingPDF(false);
  };

  const handleViewNote = (note: Note) => {
    setSelectedNote(note);
    setViewingPDF(true);
  };

  // Extract year number from yearId (e.g., "year-1" => 1)
  const getYearNumber = (yearId: string): number => {
    const match = yearId.match(/year-(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  // Generate a file URL for the subject and unit if no notes are available
  const getFileUrl = (subject: Subject, unitNumber: number | null): string => {
    if (selectedNote) {
      console.log(`Using file URL from selected note: ${selectedNote.file_url}`);
      return selectedNote.file_url;
    }
    
    // Fallback to a placeholder/demo PDF if no notes are available
    const placeholderUrl = `/sample-pdfs/${subject.code}_unit_${unitNumber || 1}.pdf`;
    console.log(`No note selected, using placeholder URL: ${placeholderUrl}`);
    return placeholderUrl;
  };

  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Check if a note was created recently (within the last 14 days)
  const isRecent = (dateString?: string) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const differenceInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));
    return differenceInDays <= 14;
  };

  // Format unit number for display
  const formatUnitNumber = (unitNumber: string | null) => {
    if (!unitNumber) return "Unknown Unit";
    
    // If it's already in "Unit X" format
    if (unitNumber.toLowerCase().includes('unit')) {
      return unitNumber;
    }
    
    // If it's just a number
    return `Unit ${unitNumber}`;
  };

  return (
    <ThemeProvider>
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <AnimatePresence mode="wait">
        {!selectedYearId && (
          <motion.div
            key="year-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <YearSelection onYearSelect={handleYearSelect} />
          </motion.div>
        )}
        
        {selectedYearId && !selectedSubject && (
          <motion.div
            key="subject-selection"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <SubjectSelection 
              yearId={selectedYearId}
              onBack={handleBackToYears}
              onSubjectSelect={handleSubjectSelect}
            />
          </motion.div>
        )}

        {selectedYearId && selectedSubject && showNotesListing && !viewingPDF && (
          <motion.div
            key="notes-listing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="container mx-auto px-4 py-8"
          >
            <Button 
              variant="ghost" 
              onClick={handleBackToSubjects} 
              className="mb-4 flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            <h1 className="text-3xl font-bold mb-2 text-foreground">
              {selectedSubject.name}
            </h1>
            <h2 className="text-xl text-primary mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {selectedSubject.code} • {selectedUnit === 0 ? 'Important Questions' : `Unit ${selectedUnit}`}
            </h2>

            <div className="mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5" />
                Available Notes
              </h3>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {subjectNotes.map(note => (
                  <Card key={note.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                        <div>
                          <CardTitle className="text-xl">{note.title}</CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(note.created_at)}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {isRecent(note.created_at) && (
                            <Badge className="bg-green-500">New</Badge>
                          )}
                          {note.is_important_questions && (
                            <Badge variant="outline" className="border-amber-500 text-amber-500">
                              Important
                            </Badge>
                          )}
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> 
                            {Math.floor(Math.random() * 50) + 1} {/* Placeholder for actual view count */}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        By SemNotes • {formatUnitNumber(note.unit_number)}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button 
                        onClick={() => handleViewNote(note)}
                        variant="secondary"
                        className="bg-purple-500 hover:bg-purple-600 text-white"
                      >
                        View Notes
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </motion.div>
        )}
        
        {selectedYearId && selectedSubject && viewingPDF && (
          <motion.div
            key="pdf-viewer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PDFViewer 
              fileUrl={getFileUrl(selectedSubject, selectedUnit)}
              title={selectedNote?.title || selectedSubject.name}
              subtitle={`Year ${getYearNumber(selectedYearId)} - ${selectedNote ? 'Uploaded Notes' : 'Sample Material'}`}
              unitNumber={selectedUnit ? `Unit ${selectedUnit}` : undefined}
              onBack={handleBackToNotesList}
              isImportantDocument={selectedUnit === 0 || (selectedNote?.is_important_questions || false)}
            />
          </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </ThemeProvider>
  );
};

export default Index;
