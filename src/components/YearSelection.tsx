import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { curriculum } from "@/data/curriculum";
import { motion } from "framer-motion";
import { useState } from "react";
import { floatAnimation, pulseAnimation } from "@/lib/animations";

interface YearSelectionProps {
  onYearSelect: (yearId: string) => void;
}

const YearSelection = ({ onYearSelect }: YearSelectionProps) => {
  const [hoveredYear, setHoveredYear] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <motion.div 
            className="flex items-center justify-center gap-3 mb-4"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <GraduationCap className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">BTech Notes</h1>
          </motion.div>
          <motion.h2 
            className="text-2xl font-semibold text-primary mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Select Year
          </motion.h2>
          <motion.p 
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Choose your academic year to access study materials
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {curriculum.map((year, index) => (
            <motion.div
              key={year.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
              onHoverStart={() => setHoveredYear(year.id)}
              onHoverEnd={() => setHoveredYear(null)}
              className="relative"
            >
              {/* Highlight glow effect when hovered */}
              {hoveredYear === year.id && (
                <motion.div
                  className="absolute inset-0 bg-primary/20 rounded-lg blur-xl"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1.1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              
              <Card 
                className={`hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden ${
                  hoveredYear === year.id ? 'shadow-xl border-primary' : ''
                }`}
              >
                <CardContent className="p-8 text-center">
                  <motion.div
                    whileHover={{ 
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={() => onYearSelect(year.id)}
                      className={`w-full h-16 text-xl font-semibold relative overflow-hidden ${
                        hoveredYear === year.id 
                          ? 'bg-primary text-primary-foreground' 
                          : ''
                      }`}
                      variant={hoveredYear === year.id ? "default" : "outline"}
                    >
                      {/* Animated background gradient when hovered */}
                      {hoveredYear === year.id && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary-foreground/20 to-primary/0"
                          animate={{
                            x: ["100%", "-100%"],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                      )}
                      
                      <span className="relative z-10">{year.name}</span>
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Recently Opened PDFs Section */}
        <motion.div 
          className="mt-16 text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="bg-primary/10 p-6 rounded-lg max-w-md mx-auto">
            <h3 className="font-semibold text-primary mb-2">Recently Opened PDFs</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>No recently opened PDFs yet.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default YearSelection;
