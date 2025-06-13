import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, FileQuestion } from "lucide-react";
import { curriculum, Subject as CurriculumSubject, Year } from "@/data/curriculum";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SubjectSelectionProps {
  yearId: string;
  onBack: () => void;
  onSubjectSelect: (subject: CurriculumSubject, selectedUnit: number) => void;
}

const SubjectSelection = ({ yearId, onBack, onSubjectSelect }: SubjectSelectionProps) => {
  const [selectedYear, setSelectedYear] = useState<Year | null>(null);
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [unitCount, setUnitCount] = useState(5);
  const [unitSubject, setUnitSubject] = useState<CurriculumSubject | null>(null);

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
                className={`hover:shadow-lg transition-shadow cursor-pointer ${
                  subject.isImportantQuestions 
                    ? 'border-amber-500 border-2' 
                    : ''
                }`}
              >
                <CardContent className="p-6">
                  <Button
                    onClick={() => handleSubjectClick(subject)}
                    className={`w-full h-16 text-lg font-semibold ${
                      subject.isImportantQuestions 
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-500' 
                        : ''
                    }`}
                    variant="outline"
                  >
                    {subject.isImportantQuestions ? (
                      <FileQuestion className="h-5 w-5 mr-2 text-amber-600" />
                    ) : (
                      <BookOpen className="h-5 w-5 mr-2" />
                    )}
                    {subject.code}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2 text-center">{subject.name}</p>
                  <div className="flex justify-center mt-2 gap-2">
                    {subject.hasLab && (
                      <span className="inline-block bg-primary/20 text-primary text-xs px-2 py-1 rounded-full">
                        Lab
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
                onClick={() => handleUnitSelect(0)}
                className="w-full col-span-2 bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-2 mt-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Important Questions
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
