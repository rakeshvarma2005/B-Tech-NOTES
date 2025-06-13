import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import YearSelection from "@/components/YearSelection";
import SubjectSelection from "@/components/SubjectSelection";
import PDFViewer from "@/components/PDFViewer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { fadeIn } from "@/lib/animations";
import { Subject } from "@/data/curriculum";

const Index = () => {
  const [selectedYearId, setSelectedYearId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<number | null>(null);

  const handleYearSelect = (yearId: string) => {
    setSelectedYearId(yearId);
  };

  const handleSubjectSelect = (subject: Subject, unit: number) => {
    setSelectedSubject(subject);
    setSelectedUnit(unit);
  };

  const handleBackToYears = () => {
    setSelectedYearId(null);
    setSelectedSubject(null);
    setSelectedUnit(null);
  };

  const handleBackToSubjects = () => {
    setSelectedSubject(null);
    setSelectedUnit(null);
  };

  // Extract year number from yearId (e.g., "year-1" => 1)
  const getYearNumber = (yearId: string): number => {
    const match = yearId.match(/year-(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  };

  return (
    <ThemeProvider>
      <motion.div 
        className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Header />
        
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
        
        {selectedYearId && selectedSubject && (
            <motion.div
              key="pdf-viewer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
          <PDFViewer 
            subject={selectedSubject}
            year={getYearNumber(selectedYearId)}
            unit={selectedUnit}
            onBack={handleBackToSubjects}
          />
            </motion.div>
        )}
        </AnimatePresence>
      </motion.div>
    </ThemeProvider>
  );
};

export default Index;
