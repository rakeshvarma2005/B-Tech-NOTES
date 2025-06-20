import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fadeIn, slideInFromBottom } from "@/lib/animations";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Search, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Filter, 
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Loader2
} from "lucide-react";
import { curriculum } from "@/data/curriculum";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";

// Define types
interface Note {
  id: string;
  title: string;
  description: string;
  file_url: string;
  thumbnail_url: string | null;
  file_type: string;
  created_at: string;
  updated_at: string;
  year_id: string;
  semester_id: string;
  subject_id: string;
  unit_number: string;
  is_important_questions: boolean;
  notes_type: string;
  status: string;
}

// Extract regulations and departments from curriculum
const REGULATIONS = ["R22", "R23", "R24", "R25"];
const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function NotesBrowser() {
  const [selectedRegulation, setSelectedRegulation] = useState("R22");
  const [selectedDepartment, setSelectedDepartment] = useState("CSE");
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Notes viewer state
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [selectedUnit, setSelectedUnit] = useState(1);

  // Fetch notes from Supabase
  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        // Query for approved notes only
        const { data, error } = await supabase
          .from('notes')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching notes:', error);
          throw error;
        }
        
        // Log data for debugging
        console.log('Fetched approved notes:', data);
        
        if (!data || data.length === 0) {
          console.log('No approved notes found');
        } else {
          // Check if notes have the required fields
          const sampleNote = data[0];
          console.log('Sample note structure:', {
            id: sampleNote.id,
            title: sampleNote.title,
            year_id: sampleNote.year_id,
            semester_id: sampleNote.semester_id,
            subject_id: sampleNote.subject_id,
            unit_number: sampleNote.unit_number,
            status: sampleNote.status
          });

          // Log ALL notes to help with debugging
          console.log("All approved notes details:");
          data.forEach(note => {
            console.log(`Note ID: ${note.id}, Title: ${note.title}`);
            console.log({
              year_id: note.year_id || "MISSING",
              semester_id: note.semester_id || "MISSING",
              subject_id: note.subject_id || "MISSING",
              unit_number: note.unit_number || "MISSING",
            });
          });
        }
        
        setAllNotes(data || []);
      } catch (error) {
        console.error('Failed to fetch notes:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotes();
  }, []);

  // Filter notes based on selections
  useEffect(() => {
    if (!allNotes.length) return;
    
    console.log("Filtering notes with selections:", {
      regulation: selectedRegulation,
      department: selectedDepartment, 
      semester: selectedSemester,
      allNotes: allNotes
    });
    
    // Find the year by name (for mapping regulation to year_id)
    const year = curriculum.find(y => {
      // This is a simple mapping, you might need to adjust based on your naming
      if (selectedRegulation === "R22" && y.name === "I Year") return true;
      if (selectedRegulation === "R23" && y.name === "II Year") return true;
      if (selectedRegulation === "R24" && y.name === "III Year") return true;
      if (selectedRegulation === "R25" && y.name === "IV Year") return true;
      return false;
    });
    
    // Find the semester in that year
    const semester = year?.semesters.find(s => {
      return s.name.includes(`Semester ${selectedSemester}`) || 
             s.name.includes(`Semester ${getRomanNumeral(selectedSemester)}`);
    });
    
    console.log("Found year and semester:", { 
      year: year?.name, 
      yearId: year?.id,
      semester: semester?.name,
      semesterId: semester?.id 
    });

    // Log curriculum structure for debugging
    console.log("Curriculum structure - selected year:", selectedRegulation);
    if (year) {
      console.log(`Year ${year.name} has ID ${year.id} and semesters:`, 
        year.semesters.map(s => ({ name: s.name, id: s.id }))
      );
      
      if (semester) {
        console.log(`Semester ${semester.name} has ID ${semester.id} and subjects:`,
          semester.subjects.map(s => ({ name: s.name, id: s.id, code: s.code }))
        );
      }
    }

    // Get all subject names for the current semester for title-based filtering
    const currentSemesterSubjects = semester?.subjects || [];
    
    // Filter notes based on year_id and semester_id
    let filtered = allNotes;
    
    if (year) {
      // First try with direct ID matching
      const directMatches = filtered.filter(note => note.year_id === year.id);
      console.log(`After year filter (${year.id}): ${directMatches.length} notes remain`);
      
      // If no direct matches, try title-based matching
      if (directMatches.length === 0) {
        console.log("No direct year_id matches, trying title-based matching");
        const titleMatches = filtered.filter(note => {
          // Check if the note title contains the year name
          return note.title && note.title.includes(year.name);
        });
        
        if (titleMatches.length > 0) {
          console.log(`Found ${titleMatches.length} notes matching year name in title`);
          filtered = titleMatches;
        } else {
          filtered = directMatches; // Keep empty if no matches
        }
      } else {
        filtered = directMatches;
      }
    }
    
    if (semester) {
      // First try with direct ID matching
      const directMatches = filtered.filter(note => note.semester_id === semester.id);
      console.log(`After semester filter (${semester.id}): ${directMatches.length} notes remain`);
      
      // If no direct matches, try title-based matching
      if (directMatches.length === 0) {
        console.log("No direct semester_id matches, trying title-based matching");
        const titleMatches = filtered.filter(note => {
          // Check if the note title contains the semester name
          return note.title && note.title.includes(semester.name);
        });
        
        if (titleMatches.length > 0) {
          console.log(`Found ${titleMatches.length} notes matching semester name in title`);
          filtered = titleMatches;
        } else {
          filtered = directMatches; // Keep empty if no matches
        }
      } else {
        filtered = directMatches;
      }
      
      // If no notes left after filtering, log details of the notes that didn't match
      if (filtered.length === 0 && allNotes.length > 0) {
        console.log("Notes that didn't match semester filter:", 
          allNotes.filter(note => note.year_id === year?.id).map(note => ({
            id: note.id,
            title: note.title,
            semester_id: note.semester_id
          }))
        );
      }
    }
    
    // If department is selected, filter by subject's department
    if (selectedDepartment !== "ALL") {
      // We need to find subjects from the selected department
      // This is a placeholder - you'll need to adapt based on your data structure
      const departmentSubjects = getSubjectsForDepartment(selectedDepartment);
      const subjectIds = departmentSubjects.map(subject => subject.id);
      
      // First try with direct ID matching
      const directMatches = filtered.filter(note => subjectIds.includes(note.subject_id));
      console.log(`After department filter (${selectedDepartment}): ${directMatches.length} notes remain`);
      
      // If no direct matches, try title-based matching
      if (directMatches.length === 0 && currentSemesterSubjects.length > 0) {
        console.log("No direct subject_id matches, trying title-based matching");
        const titleMatches = filtered.filter(note => {
          // Check if the note title contains any subject name from the current semester
          return note.title && currentSemesterSubjects.some(subject => 
            note.title.includes(subject.name) || note.title.includes(subject.code)
          );
        });
        
        if (titleMatches.length > 0) {
          console.log(`Found ${titleMatches.length} notes matching subject name/code in title`);
          filtered = titleMatches;
        } else {
          filtered = directMatches; // Keep empty if no matches
        }
      } else {
        filtered = directMatches;
      }
      
      // If no notes left after filtering, log details of the notes that didn't match
      if (filtered.length === 0 && semester) {
        console.log("Notes that didn't match department filter:", 
          allNotes.filter(note => 
            note.year_id === year?.id && 
            note.semester_id === semester.id
          ).map(note => ({
            id: note.id,
            title: note.title,
            subject_id: note.subject_id,
            availableSubjects: subjectIds
          }))
        );
      }
    }
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(note => 
        note.title?.toLowerCase().includes(query)
      );
    }
    
    // Apply additional filters
    if (showNewOnly) {
      // Filter notes created in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filtered = filtered.filter(note => new Date(note.created_at) >= thirtyDaysAgo);
    }
    
    if (showPopularOnly) {
      // This is a placeholder - you would need to implement a proper popularity metric
      // For now, we'll just take the first few notes as "popular"
      filtered = filtered.slice(0, Math.min(filtered.length, 5));
    }
    
    console.log("Final filtered notes count:", filtered.length);
    if (filtered.length > 0) {
      console.log("Sample filtered note:", {
        id: filtered[0].id,
        title: filtered[0].title
      });
    } else {
      console.log("No notes found after filtering");
    }
    
    setFilteredNotes(filtered);
  }, [allNotes, selectedRegulation, selectedDepartment, selectedSemester, searchQuery, showNewOnly, showPopularOnly]);

  // Helper function to get subject info from curriculum data
  const getSubjectInfo = (subjectId: string) => {
    for (const year of curriculum) {
      for (const semester of year.semesters) {
        const subject = semester.subjects.find(s => s.id === subjectId);
        if (subject) {
          return subject;
        }
      }
    }
    return null;
  };
  
  // Helper function to get subjects for a department
  const getSubjectsForDepartment = (department: string) => {
    const subjects: any[] = [];
    
    for (const year of curriculum) {
      for (const semester of year.semesters) {
        // This is a simplification - you'll need to adapt based on your actual data structure
        // Assuming subject codes contain department code
        const departmentSubjects = semester.subjects.filter(s => 
          s.code.includes(department) || department === "ALL"
        );
        subjects.push(...departmentSubjects);
      }
    }
    
    return subjects;
  };
  
  // Helper function to convert number to Roman numeral (for semester matching)
  const getRomanNumeral = (num: number): string => {
    const romanNumerals: Record<number, string> = {
      1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII'
    };
    return romanNumerals[num] || num.toString();
  };

  const openNotesViewer = (note: Note) => {
    console.log("Opening note viewer with:", {
      id: note.id,
      title: note.title,
      file_url: note.file_url,
      file_type: note.file_type
    });
    
    setSelectedNote(note);
    setSelectedUnit(1); // Default to first unit
    setIsViewerOpen(true);
  };

  const closeNotesViewer = () => {
    setIsViewerOpen(false);
    setSelectedNote(null);
  };

  const changeUnit = (direction: 'prev' | 'next') => {
    if (!selectedNote) return;
    
    // For simplicity, we're assuming unit_number is a string like "Unit 1"
    const currentUnitMatch = selectedNote.unit_number?.match(/Unit (\d+)/);
    const currentUnit = currentUnitMatch ? parseInt(currentUnitMatch[1]) : 1;
    const maxUnits = 5; // Assuming max 5 units per subject, adjust as needed
    
    if (direction === 'next' && selectedUnit < maxUnits) {
      setSelectedUnit(selectedUnit + 1);
    } else if (direction === 'prev' && selectedUnit > 1) {
      setSelectedUnit(selectedUnit - 1);
    }
  };

  return (
    <motion.div
      className="py-16 bg-background"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeIn}
    >
      <div className="container mx-auto px-4">
        <motion.div variants={slideInFromBottom} className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">B.Tech Notes</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access comprehensive study materials organized by regulation, department, and semester.
          </p>
        </motion.div>

        {/* Regulation Selector */}
        <motion.div variants={slideInFromBottom} className="mb-8">
          <h3 className="text-lg font-medium mb-4">Select your regulation:</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {REGULATIONS.map((reg) => (
              <Button
                key={reg}
                variant={selectedRegulation === reg ? "default" : "outline"}
                onClick={() => setSelectedRegulation(reg)}
                className="min-w-[80px]"
              >
                {reg}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Department Filter */}
        <motion.div variants={slideInFromBottom} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="w-full md:w-1/3">
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Departments</SelectLabel>
                    <SelectItem value="ALL">All Departments</SelectItem>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            {/* Search Bar */}
            <div className="w-full md:w-2/3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by subject name or code..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </motion.div>

        {/* Filters and Highlights */}
        <motion.div variants={slideInFromBottom} className="mb-6 flex flex-wrap gap-2 justify-end">
          <Button 
            variant={showNewOnly ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowNewOnly(!showNewOnly)}
            className="flex items-center gap-1"
          >
            <Clock className="h-4 w-4" />
            Recently Added
          </Button>
          <Button 
            variant={showPopularOnly ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowPopularOnly(!showPopularOnly)}
            className="flex items-center gap-1"
          >
            <TrendingUp className="h-4 w-4" />
            Most Viewed
          </Button>
        </motion.div>

        {/* Semester Tabs */}
        <motion.div variants={slideInFromBottom} className="mb-8">
          <Tabs defaultValue={selectedSemester.toString()} onValueChange={(val) => setSelectedSemester(parseInt(val))}>
            <TabsList className="flex w-full overflow-x-auto">
              {SEMESTERS.map((sem) => (
                <TabsTrigger key={sem} value={sem.toString()} className="flex-1">
                  Semester {sem}
                </TabsTrigger>
              ))}
            </TabsList>

            {SEMESTERS.map((sem) => (
              <TabsContent key={sem} value={sem.toString()}>
                {/* Subject Cards */}
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="flex flex-col items-center">
                      <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                      <p className="text-muted-foreground">Loading notes...</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                    {filteredNotes.length > 0 ? (
                      filteredNotes.map((note) => {
                        const subject = getSubjectInfo(note.subject_id);
                        return (
                          <Card key={note.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <CardTitle className="text-lg">{note.title}</CardTitle>
                                  <CardDescription>{subject?.name || "Unknown Subject"} {subject?.code && `(${subject.code})`}</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                  {isRecent(note.created_at) && (
                                    <Badge variant="default" className="bg-green-500">New</Badge>
                                  )}
                                  {note.is_important_questions && (
                                    <Badge variant="outline" className="border-amber-500 text-amber-500">Important</Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-2">
                                {note.unit_number} • {note.notes_type && formatNotesType(note.notes_type)}
                              </p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Filter className="h-3 w-3 mr-1" />
                                <span>Last updated: {formatDate(note.updated_at || note.created_at)}</span>
                              </div>
                            </CardContent>
                            <CardFooter className="pt-3 border-t">
                              <Button 
                                variant="default" 
                                className="w-full"
                                onClick={() => openNotesViewer(note)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Notes
                              </Button>
                            </CardFooter>
                          </Card>
                        );
                      })
                    ) : (
                      <div className="col-span-full text-center py-12">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No notes found</h3>
                        <p className="text-muted-foreground">
                          Try adjusting your filters or search query
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>

      {/* Notes Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl">
                {selectedNote?.title}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={closeNotesViewer}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              {getSubjectInfo(selectedNote?.subject_id || '')?.name} • {selectedNote?.unit_number || 'All Units'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedNote && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Content Viewer - PDF Viewer */}
              <div className="flex-1 overflow-hidden">
                {selectedNote.file_type === "application/pdf" ? (
                  <Tabs defaultValue="browser" className="w-full h-full flex flex-col">
                    <TabsList className="mx-auto mb-2">
                      <TabsTrigger value="browser">Browser Viewer</TabsTrigger>
                      <TabsTrigger value="google">Google Viewer</TabsTrigger>
                      <TabsTrigger value="direct">Direct Link</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="browser" className="flex-1 h-[calc(100%-40px)] mt-0">
                      <object 
                        data={selectedNote.file_url} 
                        type="application/pdf" 
                        className="w-full h-full"
                      >
                        <div className="w-full h-full flex items-center justify-center bg-muted">
                          <p className="text-center text-muted-foreground">
                            Your browser does not support PDF viewing.<br/>
                            Please try another viewing option.
                          </p>
                        </div>
                      </object>
                    </TabsContent>
                    
                    <TabsContent value="google" className="flex-1 h-[calc(100%-40px)] mt-0">
                      <iframe 
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(selectedNote.file_url)}&embedded=true`}
                        className="w-full h-full border-0"
                        title={selectedNote.title}
                        allowFullScreen
                      />
                    </TabsContent>
                    
                    <TabsContent value="direct" className="flex-1 h-[calc(100%-40px)] mt-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <p className="mb-4 text-muted-foreground">Download the PDF directly:</p>
                        <Button asChild>
                          <a 
                            href={selectedNote.file_url} 
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open PDF in New Tab
                          </a>
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="w-full h-full p-4 overflow-auto bg-white">
                    <p className="text-muted-foreground text-center">
                      This file format ({selectedNote.file_type}) cannot be previewed directly.
                      <br />
                      <a 
                        href={selectedNote.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline mt-2 inline-block"
                      >
                        Open in new tab
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// Helper functions
function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM d, yyyy');
  } catch (e) {
    return 'Unknown date';
  }
}

function isRecent(dateString: string): boolean {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(dateString) >= thirtyDaysAgo;
  } catch (e) {
    return false;
  }
}

function formatNotesType(type: string): string {
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
} 