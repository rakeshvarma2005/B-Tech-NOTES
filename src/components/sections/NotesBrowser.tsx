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
  Bookmark
} from "lucide-react";

// Mock data for demonstration
const REGULATIONS = ["R22", "R23", "R24", "R25"];
const DEPARTMENTS = ["CSE", "ECE", "EEE", "MECH", "CIVIL"];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

// Mock subject data
const SUBJECTS = [
  // R22 CSE Subjects
  { 
    id: "r22-cse-101", 
    name: "Programming in C", 
    code: "CS101", 
    regulation: "R22", 
    department: "CSE", 
    semester: 1,
    units: 5,
    isNew: true,
    isPopular: false,
    lastUpdated: "2023-12-15",
    content: [
      {
        unit: 1,
        title: "Introduction to C Programming",
        pages: 15,
        content: "This is the content for Unit 1 of Programming in C..."
      },
      {
        unit: 2,
        title: "Control Structures",
        pages: 20,
        content: "This is the content for Unit 2 of Programming in C..."
      },
      {
        unit: 3,
        title: "Functions and Arrays",
        pages: 18,
        content: "This is the content for Unit 3 of Programming in C..."
      },
      {
        unit: 4,
        title: "Pointers and Structures",
        pages: 22,
        content: "This is the content for Unit 4 of Programming in C..."
      },
      {
        unit: 5,
        title: "File Handling",
        pages: 17,
        content: "This is the content for Unit 5 of Programming in C..."
      }
    ]
  },
  { 
    id: "r22-cse-102", 
    name: "Digital Logic Design", 
    code: "CS102", 
    regulation: "R22", 
    department: "CSE", 
    semester: 1,
    units: 5,
    isNew: false,
    isPopular: true,
    lastUpdated: "2023-10-05",
    content: [
      {
        unit: 1,
        title: "Boolean Algebra",
        pages: 12,
        content: "This is the content for Unit 1 of Digital Logic Design..."
      },
      {
        unit: 2,
        title: "Logic Gates",
        pages: 18,
        content: "This is the content for Unit 2 of Digital Logic Design..."
      }
    ]
  },
  { 
    id: "r22-cse-201", 
    name: "Data Structures", 
    code: "CS201", 
    regulation: "R22", 
    department: "CSE", 
    semester: 2,
    units: 5,
    isNew: false,
    isPopular: true,
    lastUpdated: "2023-09-20",
    content: [
      {
        unit: 1,
        title: "Arrays and Linked Lists",
        pages: 20,
        content: "This is the content for Unit 1 of Data Structures..."
      }
    ]
  },
  
  // R23 ECE Subjects
  { 
    id: "r23-ece-101", 
    name: "Basic Electronics", 
    code: "EC101", 
    regulation: "R23", 
    department: "ECE", 
    semester: 1,
    units: 5,
    isNew: true,
    isPopular: false,
    lastUpdated: "2024-01-10",
    content: [
      {
        unit: 1,
        title: "Semiconductor Devices",
        pages: 16,
        content: "This is the content for Unit 1 of Basic Electronics..."
      }
    ]
  },
  { 
    id: "r23-ece-201", 
    name: "Signals and Systems", 
    code: "EC201", 
    regulation: "R23", 
    department: "ECE", 
    semester: 2,
    units: 5,
    isNew: false,
    isPopular: true,
    lastUpdated: "2023-11-15",
    content: [
      {
        unit: 1,
        title: "Continuous-Time Signals",
        pages: 14,
        content: "This is the content for Unit 1 of Signals and Systems..."
      }
    ]
  },
  
  // R24 MECH Subjects
  { 
    id: "r24-mech-101", 
    name: "Engineering Mechanics", 
    code: "ME101", 
    regulation: "R24", 
    department: "MECH", 
    semester: 1,
    units: 5,
    isNew: true,
    isPopular: false,
    lastUpdated: "2024-02-05",
    content: [
      {
        unit: 1,
        title: "Force Systems",
        pages: 18,
        content: "This is the content for Unit 1 of Engineering Mechanics..."
      }
    ]
  },
  
  // R25 CIVIL Subjects
  { 
    id: "r25-civil-101", 
    name: "Structural Engineering", 
    code: "CE101", 
    regulation: "R25", 
    department: "CIVIL", 
    semester: 1,
    units: 5,
    isNew: true,
    isPopular: false,
    lastUpdated: "2024-03-01",
    content: [
      {
        unit: 1,
        title: "Introduction to Structures",
        pages: 15,
        content: "This is the content for Unit 1 of Structural Engineering..."
      }
    ]
  },
];

export default function NotesBrowser() {
  const [selectedRegulation, setSelectedRegulation] = useState("R22");
  const [selectedDepartment, setSelectedDepartment] = useState("CSE");
  const [selectedSemester, setSelectedSemester] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [showNewOnly, setShowNewOnly] = useState(false);
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  
  // Notes viewer state
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(1);

  // Initialize filtered subjects on component mount
  useEffect(() => {
    const initialFiltered = SUBJECTS.filter(subject => 
      subject.regulation === selectedRegulation &&
      subject.department === selectedDepartment &&
      subject.semester === selectedSemester
    );
    setFilteredSubjects(initialFiltered);
  }, [selectedRegulation, selectedDepartment, selectedSemester]);

  // Filter subjects based on selections
  useEffect(() => {
    let filtered = SUBJECTS.filter(subject => 
      subject.regulation === selectedRegulation &&
      (selectedDepartment === "ALL" || subject.department === selectedDepartment) &&
      subject.semester === selectedSemester
    );

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(subject => 
        subject.name.toLowerCase().includes(query) || 
        subject.code.toLowerCase().includes(query)
      );
    }

    // Apply additional filters
    if (showNewOnly) {
      filtered = filtered.filter(subject => subject.isNew);
    }

    if (showPopularOnly) {
      filtered = filtered.filter(subject => subject.isPopular);
    }

    setFilteredSubjects(filtered);
  }, [selectedRegulation, selectedDepartment, selectedSemester, searchQuery, showNewOnly, showPopularOnly]);

  const openNotesViewer = (subject) => {
    setSelectedSubject(subject);
    setSelectedUnit(1); // Default to first unit
    setIsViewerOpen(true);
  };

  const closeNotesViewer = () => {
    setIsViewerOpen(false);
    setSelectedSubject(null);
  };

  const changeUnit = (direction) => {
    if (!selectedSubject) return;
    
    const maxUnits = selectedSubject.content.length;
    if (direction === 'next' && selectedUnit < maxUnits) {
      setSelectedUnit(selectedUnit + 1);
    } else if (direction === 'prev' && selectedUnit > 1) {
      setSelectedUnit(selectedUnit - 1);
    }
  };

  const getCurrentUnitContent = () => {
    if (!selectedSubject) return null;
    return selectedSubject.content.find(unit => unit.unit === selectedUnit);
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => (
                      <Card key={subject.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{subject.name}</CardTitle>
                              <CardDescription>{subject.code}</CardDescription>
                            </div>
                            <div className="flex gap-2">
                              {subject.isNew && (
                                <Badge variant="default" className="bg-green-500">New</Badge>
                              )}
                              {subject.isPopular && (
                                <Badge variant="outline" className="border-amber-500 text-amber-500">Popular</Badge>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground mb-2">
                            {subject.units} Units • Last updated: {subject.lastUpdated}
                          </p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Filter className="h-3 w-3 mr-1" />
                            <span>{subject.regulation} • {subject.department}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="pt-3 border-t">
                          <Button 
                            variant="default" 
                            className="w-full"
                            onClick={() => openNotesViewer(subject)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Notes
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
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
                {selectedSubject?.name} - {selectedSubject?.code}
              </DialogTitle>
              <Button variant="ghost" size="icon" onClick={closeNotesViewer}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription>
              {selectedSubject?.regulation} • {selectedSubject?.department} • Semester {selectedSubject?.semester}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubject && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Unit Navigation */}
              <div className="flex items-center justify-between mb-4 px-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => changeUnit('prev')}
                  disabled={selectedUnit === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous Unit
                </Button>
                
                <div className="text-center">
                  <span className="font-medium">Unit {selectedUnit} of {selectedSubject.content.length}</span>
                  <h3 className="text-lg font-semibold">{getCurrentUnitContent()?.title}</h3>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => changeUnit('next')}
                  disabled={selectedUnit === selectedSubject.content.length}
                >
                  Next Unit <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              {/* Content Viewer */}
              <div className="flex-1 overflow-y-auto bg-muted/20 rounded-md p-6">
                <div className="bg-background p-6 rounded-md shadow-sm min-h-full">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">
                      {getCurrentUnitContent()?.pages} pages
                    </span>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Bookmark className="h-4 w-4" />
                      Bookmark
                    </Button>
                  </div>
                  
                  <div className="prose max-w-none">
                    <p>{getCurrentUnitContent()?.content}</p>
                    {/* This would be replaced with actual content rendering */}
                    <p className="text-muted-foreground text-center mt-8">
                      [Notes content would be displayed here in a view-only format]
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 