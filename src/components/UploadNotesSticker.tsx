import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUp, X, Plus } from "lucide-react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { NotesUploadForm } from "./NotesUploadForm";

export function UploadNotesSticker() {
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const controls = useAnimation();
  
  // Floating animation for the sticker
  useEffect(() => {
    controls.start({
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    });
  }, [controls]);

  const handleStickerClick = () => {
    setIsOpen(true);
    // Delay showing the form to allow the animation to complete
    setTimeout(() => setShowForm(true), 300);
  };

  const handleClose = () => {
    setShowForm(false);
    setTimeout(() => setIsOpen(false), 200);
  };

  return (
    <>
      {/* Animated sticker */}
      {!isOpen && (
        <motion.div
          className="fixed bottom-16 left-6 z-50 cursor-pointer"
          animate={controls}
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          whileTap={{ scale: 0.9 }}
          onClick={handleStickerClick}
        >
          <div className="relative">
            {/* Sticker background */}
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-lg flex items-center justify-center"
              initial={{ rotate: -10 }}
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <FileUp className="h-8 w-8 text-white" />
            </motion.div>
            
            {/* Small "plus" indicator */}
            <motion.div 
              className="absolute -top-1 -right-1 bg-green-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Plus className="h-4 w-4 text-white" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Upload form modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) handleClose();
            }}
          >
            <motion.div
              className="relative"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
            >
              {showForm ? (
                <Card className="max-w-md w-full">
                  <CardContent className="p-0">
                    <Button 
                      className="absolute top-2 right-2 h-8 w-8 p-0 rounded-full" 
                      variant="ghost"
                      onClick={handleClose}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <NotesUploadForm onClose={handleClose} />
                  </CardContent>
                </Card>
              ) : (
                <div className="flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-primary border-l-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default UploadNotesSticker; 