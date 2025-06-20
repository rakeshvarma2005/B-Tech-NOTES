import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, FileQuestion, Beaker } from "lucide-react";
import { curriculum, Subject as CurriculumSubject, Year } from "@/data/curriculum";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { fetchNotesBySubject } from "@/lib/dbFunctions";
import { supabase } from "@/lib/supabase";

interface SubjectSelectionProps {
  yearId: string;
  onBack: () => void;
  onSubjectSelect: (subject: CurriculumSubject, selectedUnit: number) => void;
}

interface NotesCount {
  [subjectId: string]: number;
}

const SubjectSelection = ({ yearId, onBack, onSubjectSelect }: SubjectSelectionProps) => {
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [unitCount, setUnitCount] = useState(5);
  const [unitSubject, setUnitSubject] = useState<CurriculumSubject | null>(null);
  const [notesCount, setNotesCount] = useState<NotesCount>({});
  const [loading, setLoading] = useState(true);

  // Find the selected year from curriculum
  useEffect(() => {
    const year = curriculum.find(y => y.id === yearId);
    if (year) {
      setSelectedYear(year);
      // Default to first semester
      if (year.semesters.length > 0) {
        setSelectedSemesterId(year.semesters[0].id);
      }
    }
  }, [yearId]);

  // Fetch notes count for subjects when semester changes
  useEffect(() => {
    const fetchNotesCount = async () => {
      if (!selectedYear || !selectedSemesterId) return;
      
      setLoading(true);
      const semester = selectedYear.semesters.find(sem => sem.id === selectedSemesterId);
      
      if (!semester) {
        setLoading(false);
        return;
      }
      
      try {
        // Get all subject IDs for this semester
        const subjectIds = semester.subjects.map(subject => subject.id);
        
        // Query for approved notes for these subjects
        const countsPromises = subjectIds.map(async (subjectId) => {
          const { data, error } = await supabase
            .from('notes')
            .select('id')
            .eq('status', 'approved')
            .eq('semester_id', selectedSemesterId)
            .eq('year_id', yearId)
            .eq('subject_id', subjectId);
          
          if (error) {
            console.error(`Error fetching notes count for subject ${subjectId}:`, error);
            return { subjectId, count: 0 };
          }
          
          return { subjectId, count: data?.length || 0 };
        });
        
        // Wait for all queries to complete
        const results = await Promise.all(countsPromises);
        
        // Build the counts object
        const counts: NotesCount = {};
        results.forEach(result => {
          counts[result.subjectId] = result.count;
        });
        
        setNotesCount(counts);
      } catch (error) {
        console.error('Failed to fetch notes count:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNotesCount();
  }, [selectedYear, selectedSemesterId, yearId]);

  // Get the selected semester
  const selectedSemester = selectedYear?.semesters.find(
    sem => sem.id === selectedSemesterId
  );

  // When a subject is clicked, open the unit dialog
  const handleSubjectClick = (subject: CurriculumSubject) => {
    setUnitSubject(subject);
    setUnitDialogOpen(true);
    // Default to 5 units, but you can customize per subject if needed
    setUnitCount(5);
  };

  // When a unit is selected, call onSubjectSelect with extra info
  const handleUnitSelect = (unitNumber: number) => {
    if (unitSubject) {
      onSubjectSelect(unitSubject, unitNumber);
      setUnitDialogOpen(false);
    }
  };

  if (!selectedYear) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-foreground mb-2">{selectedYear.name}</h1>
          <h2 className="text-2xl font-semibold text-primary">SUBJECTS</h2>
        </div>

        {/* Semester Selection */}
        <div className="flex flex-wrap gap-4 mb-8">
          {selectedYear.semesters.map((semester) => (
            <Button
              key={semester.id}
              variant={selectedSemesterId === semester.id ? "default" : "outline"}
              onClick={() => setSelectedSemesterId(semester.id)}
            >
              {semester.name}
            </Button>
          ))}
        </div>

        {/* Subjects Grid */}
        {selectedSemester && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {selectedSemester.subjects.map((subject) => (
              <Card 
                key={subject.id} 
                className={`hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer ${
                  notesCount[subject.id] > 0 
                    ? 'border-primary border-2' 
                    : subject.isImportantQuestions 
                      ? 'border-amber-500 border-2' 
                      : subject.hasLab
                        ? 'border-orange-500 border-2'
                        : ''
                }`}
              >
                <CardContent className="p-6">
                  <Button
                    onClick={() => handleSubjectClick(subject)}
                    className={`w-full h-16 text-lg font-semibold transition-colors ${
                      notesCount[subject.id] > 0
                        ? 'bg-primary/10 hover:bg-primary/20 text-primary'
                        : subject.isImportantQuestions 
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-500' 
                          : subject.hasLab
                            ? 'bg-orange-50 hover:bg-orange-100 text-orange-700'
                            : 'hover:bg-secondary'
                    }`}
                    variant="outline"
                  >
                    {subject.isImportantQuestions ? (
                      <FileQuestion className="h-5 w-5 mr-2 text-amber-600" />
                    ) : subject.hasLab ? (
                      <Beaker className="h-5 w-5 mr-2 text-orange-600" />
                    ) : (
                      <BookOpen className="h-5 w-5 mr-2" />
                    )}
                    {subject.code}
                    {notesCount[subject.id] > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                        {notesCount[subject.id]} Notes
                      </Badge>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2 text-center">{subject.name}</p>
                  <div className="flex justify-center mt-2 gap-2">
                    {subject.hasLab && (
                      <span className="inline-block bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
                        Lab
                      </span>
                    )}
                    {loading && (
                      <span className="inline-block text-muted-foreground text-xs">
                        Loading notes...
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Unit Selection Dialog */}
        <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Select Unit</DialogTitle>
              <div className="mt-2 text-muted-foreground">
                {unitSubject?.name} ({unitSubject?.code})
                {notesCount[unitSubject?.id || ""] > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {notesCount[unitSubject?.id || ""]} available notes
                  </Badge>
                )}
              </div>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {Array.from({ length: unitCount }, (_, idx) => idx + 1)
                .sort((a, b) => a - b)
                .map((unitNum) => (
                  <Button key={unitNum} onClick={() => handleUnitSelect(unitNum)} className="w-full">
                    Unit {unitNum}
                  </Button>
                ))}
              {/* Important Questions Button */}
              <Button
                key="important-questions"
                onClick={() => { handleUnitSelect(0); }}
                className="w-full col-span-2 font-bold flex items-center justify-center gap-2 mt-2"
                variant="default"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Important Questions
              </Button>
              {/* Previous Year Question Papers Button */}
              <Button
                key="previous-year-papers"
                onClick={() => { alert('Previous Year Question Papers clicked!'); }}
                className="w-full col-span-2 font-bold flex items-center justify-center gap-2 mt-2"
                variant="default"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m7-7v14" /></svg>
                Previous Year Question Papers
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Quick Access Section */}
        <div className="text-center space-y-4">
          <div className="text-sm text-muted-foreground space-y-1">
            <p>R22 Previous Question Papers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectSelection;
