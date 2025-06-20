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
  FileQuestion,
  AlertTriangle,
  Expand
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "@/components/ui/use-toast";

interface PDFViewerProps {
  fileUrl: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
  isImportantDocument?: boolean;
  unitNumber?: string;
  documentType?: string;
}

const PDFViewer = ({ 
  fileUrl,
  title,
  subtitle,
  onBack,
  isImportantDocument = false,
  unitNumber,
  documentType
}: PDFViewerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270 degrees
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load PDF document
  useEffect(() => {
    if (!fileUrl) {
      setError("No file URL provided");
      setLoading(false);
      return;
    }

    // Set loading while PDF is being prepared
    setLoading(true);
    setError(null);
    
    // For better UX, we'll add a minimum loading time
    const timer = setTimeout(() => {
      setLoading(false);
      // We don't know total pages without PDF.js, but we can set a placeholder
      setTotalPages(1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [fileUrl]);

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

  // Handle iframe fullscreen
  const toggleIframeFullscreen = () => {
    if (iframeRef.current) {
      // Using the Fullscreen API for the iframe content
      if (!document.fullscreenElement) {
        iframeRef.current.requestFullscreen().catch(err => {
          toast({
            title: "Fullscreen Error",
            description: `Error attempting to enable fullscreen: ${err.message}`,
            variant: "destructive"
          });
        });
      } else {
        document.exitFullscreen();
      }
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

  // Transform the fileUrl to prevent downloads
  const getSecureFileUrl = () => {
    // If using Google Docs viewer to prevent downloads
    return `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
  };

  return (
    <motion.div 
      className={`min-h-screen ${isImportantDocument ? 'bg-amber-50/30 dark:bg-amber-950/10' : 'bg-background'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-8">
        {onBack && (
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
              Back
            </Button>
          </motion.div>
        )}

        <motion.h1 
          className={`text-3xl font-bold mb-2 ${isImportantDocument ? 'text-amber-700 flex items-center gap-2' : ''}`}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isImportantDocument && <FileQuestion className="h-6 w-6 text-amber-600" />}
          {title}
          {unitNumber && (
            <span className="ml-3 text-base bg-primary/10 text-primary px-2 py-1 rounded-full">
              {unitNumber}
            </span>
          )}
          {isImportantDocument && (
            <span className="ml-3 text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
              IMP QUES
            </span>
          )}
          {documentType && (
            <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {documentType}
            </span>
          )}
        </motion.h1>
        
        {subtitle && (
          <motion.div 
            className="text-muted-foreground mb-6"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {subtitle}
          </motion.div>
        )}

        <motion.div 
          className={`rounded-lg shadow-lg overflow-hidden mb-6 ${
            isImportantDocument ? 'bg-amber-50 border-2 border-amber-200' : 'bg-card'
          }`}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          ref={containerRef}
        >
          {/* PDF Toolbar */}
          <div className={`p-2 flex items-center justify-between ${
            isImportantDocument ? 'bg-amber-100/50' : 'bg-muted'
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
                      className="border-2 border-blue-600 rounded-lg hover:bg-blue-100"
                      onClick={handleZoomOut}
                      disabled={zoomLevel <= 50 || loading}
                    >
                      <ZoomOut className="h-5 w-5 text-black" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Zoom Out</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <span className="text-sm w-16 text-center text-black font-bold">
                {loading ? "..." : `${zoomLevel}%`}
              </span>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="border-2 border-blue-600 rounded-lg hover:bg-blue-100"
                      onClick={handleZoomIn}
                      disabled={zoomLevel >= 200 || loading}
                    >
                      <ZoomIn className="h-5 w-5 text-black" />
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
                      className="border-2 border-blue-600 rounded-lg hover:bg-blue-100"
                      onClick={handleRotate}
                      disabled={loading}
                    >
                      <RotateCw className="h-5 w-5 text-black" />
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
                      className="border-2 border-blue-600 rounded-lg hover:bg-blue-100"
                      onClick={toggleIframeFullscreen}
                      disabled={loading}
                    >
                      <Expand className="h-5 w-5 text-black" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Fullscreen PDF</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="border-2 border-blue-600 rounded-lg hover:bg-blue-100"
                      onClick={toggleFullscreen}
                      disabled={loading}
                    >
                      {isFullscreen ? 
                        <Minimize2 className="h-5 w-5 text-black" /> : 
                        <Maximize2 className="h-5 w-5 text-black" />
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
            className="bg-white min-h-[600px] flex items-center justify-center"
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
            ) : error ? (
              <motion.div 
                className="flex flex-col items-center gap-4 p-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <AlertTriangle className="h-10 w-10 text-destructive" />
                <p className="text-destructive font-medium">Error loading PDF</p>
                <p className="text-muted-foreground">{error}</p>
              </motion.div>
            ) : (
              <iframe 
                ref={iframeRef}
                src={getSecureFileUrl()}
                className="w-full h-[600px] border-0"
                title={title}
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease'
                }}
                allowFullScreen
              />
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PDFViewer;
