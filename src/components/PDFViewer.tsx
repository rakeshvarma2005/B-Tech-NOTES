import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Maximize2, 
  Minimize2, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  RotateCw,
  Loader2,
  FileQuestion
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";

interface Subject {
  code: string;
  name: string;
  isImportantQuestions?: boolean;
}

interface PDFViewerProps {
  subject: Subject;
  year: number;
  onBack: () => void;
  unit?: number;
}

const PDFViewer = ({ subject, year, onBack, unit }: PDFViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270 degrees
  const containerRef = useRef<HTMLDivElement>(null);
  const pdfUrl = `/pdfs/${year}/${subject.code}.pdf`;

  // Simulate PDF loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      setTotalPages(Math.floor(Math.random() * 20) + 5); // Random number of pages between 5-25
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [subject, year]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        toast({
          title: "Fullscreen Error",
          description: `Error attempting to enable fullscreen: ${err.message}`,
          variant: "destructive"
        });
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  return (
    <motion.div 
      className={`min-h-screen ${subject.isImportantQuestions ? 'bg-amber-50/30 dark:bg-amber-950/10' : 'bg-background'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-8">
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Subjects
          </Button>
        </motion.div>

        <motion.h1 
          className={`text-3xl font-bold mb-2 ${subject.isImportantQuestions ? 'text-amber-700 flex items-center gap-2' : ''}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {subject.isImportantQuestions && <FileQuestion className="h-6 w-6 text-amber-600" />}
          {subject.name}
          {unit && (
            <span className="ml-3 text-base bg-primary/10 text-primary px-2 py-1 rounded-full">
              Unit {unit}
            </span>
          )}
          {subject.isImportantQuestions && (
            <span className="ml-3 text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              IMP QUES
            </span>
          )}
        </motion.h1>
        
        <motion.div 
          className="text-muted-foreground mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {year} • {subject.code}
        </motion.div>

        <motion.div 
          className={`rounded-lg shadow-lg overflow-hidden mb-6 ${
            subject.isImportantQuestions ? 'bg-amber-50 border-2 border-amber-200' : 'bg-card'
          }`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          ref={containerRef}
        >
          {/* PDF Toolbar */}
          <div className={`p-2 flex items-center justify-between ${
            subject.isImportantQuestions ? 'bg-amber-100/50' : 'bg-muted'
          } ${isFullscreen ? 'sticky top-0 z-10' : ''}`}>
            
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handlePrevPage}
                      disabled={currentPage === 1 || loading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Previous Page</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <span className="text-sm">
                {loading ? "Loading..." : `Page ${currentPage} of ${totalPages}`}
              </span>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || loading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Next Page</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 50 || loading}
                    >
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <span className="text-sm w-16 text-center">
                {loading ? "..." : `${zoomLevel}%`}
              </span>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 200 || loading}
                    >
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom In</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleRotate}
                      disabled={loading}
                    >
                      <RotateCw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Rotate Page</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={toggleFullscreen}
                      disabled={loading}
                    >
                      {isFullscreen ? 
                        <Minimize2 className="h-4 w-4" /> : 
                        <Maximize2 className="h-4 w-4" />
                      }
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          
          {/* PDF Content */}
          <div 
            className="bg-white p-4 min-h-[600px] flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center top' }}
          >
            {loading ? (
              <motion.div 
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                <p className="text-muted-foreground">Loading PDF...</p>
              </motion.div>
            ) : (
              <motion.div 
                className="w-full max-w-3xl bg-white shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease',
                  maxHeight: rotation === 90 || rotation === 270 ? '100vh' : 'auto'
                }}
              >
                <div className={`bg-gray-100 border relative ${rotation === 90 || rotation === 270 ? 'aspect-[4/3]' : 'aspect-[3/4]'}`}>
                  {/* Simulated PDF page */}
                  <div className="absolute inset-0 p-8">
                    <div className="h-6 w-3/4 bg-gray-300 rounded mb-4"></div>
                    <div className="h-4 w-full bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 w-full bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 w-2/3 bg-gray-300 rounded mb-6"></div>
                    
                    <div className="h-5 w-1/2 bg-gray-400 rounded mb-4"></div>
                    <div className="h-4 w-full bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 w-full bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 w-5/6 bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 w-full bg-gray-300 rounded mb-6"></div>
                    
                    <div className="h-20 w-full bg-gray-200 rounded mb-4 flex items-center justify-center">
                      <div className="h-10 w-10 rounded-full bg-gray-400"></div>
                    </div>
                    
                    <div className="h-4 w-full bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 w-full bg-gray-300 rounded mb-3"></div>
                    <div className="h-4 w-4/5 bg-gray-300 rounded"></div>
                  </div>
                  
                  <div className="absolute bottom-4 right-4 text-sm text-gray-400">
                    {currentPage}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div 
          className="flex justify-between items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button 
            variant="outline"
            onClick={handlePrevPage}
            disabled={currentPage === 1 || loading}
            className="flex items-center gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `Page ${currentPage} of ${totalPages}`}
            </div>
            {!loading && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRotate}
                className="flex items-center gap-1"
              >
                <RotateCw className="h-4 w-4" />
                Rotate
              </Button>
            )}
          </div>
          
          <Button 
            variant="outline"
            onClick={handleNextPage}
            disabled={currentPage === totalPages || loading}
            className="flex items-center gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PDFViewer;
