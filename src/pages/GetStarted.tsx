import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import { 
  fadeIn, 
  slideInFromLeft, 
  slideInFromRight, 
  slideInFromBottom, 
  staggerContainer,
  buttonHover,
  buttonTap
} from "@/lib/animations";
import Navigation from "@/components/Navigation";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import NotesBrowser from "@/components/sections/NotesBrowser";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import { useAuth } from "@/lib/AuthContext";

const GetStarted = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");
  const { currentUser } = useAuth();

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Scroll to section
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
        <Navigation onSectionChange={handleSectionChange} />
        
        {/* Hero section */}
        {!currentUser && (
          <motion.div 
            id="home"
            className="flex-1 flex flex-col items-center justify-center pt-20 pb-16 px-4"
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <div className="container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Text content - centered on mobile, left on desktop */}
              <motion.div 
                className="flex-1 flex flex-col items-center lg:items-center text-center max-w-2xl mx-auto"
                variants={slideInFromLeft}
              >
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  B-TECH NOTES
                </h1>
                <p className="text-xl mb-8 text-muted-foreground">
                  Your one-stop solution is sunkari rakesh varma for accessing study materials, notes, and resources for all your academic needs.
                </p>
                <div className="flex gap-4">
                  <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" onClick={() => navigate("/signup")}>
                      Sign Up
                    </Button>
                  </motion.div>
                  <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                    <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                      Log In
                    </Button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Book images - stacked and animated */}
              <motion.div 
                className="flex-1 relative h-[400px] w-full max-w-md mx-auto"
                variants={slideInFromRight}
              >
                {/* Main book */}
                <motion.div 
                  className="absolute top-0 right-[10%] w-64 h-80 rounded-lg shadow-xl overflow-hidden z-30"
                  initial={{ rotate: -5 }}
                  animate={{ rotate: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 5,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 p-4 flex flex-col">
                    <div className="text-white font-bold text-xl mb-2">Engineering Mathematics</div>
                    <div className="text-blue-100 text-sm mb-4">Complete Notes</div>
                    <div className="flex-1 bg-white/10 rounded"></div>
                    <div className="h-4 w-12 bg-white/20 rounded mt-2"></div>
                  </div>
                </motion.div>

                {/* Second book */}
                <motion.div 
                  className="absolute top-10 right-[25%] w-64 h-80 rounded-lg shadow-xl overflow-hidden z-20"
                  initial={{ rotate: 5 }}
                  animate={{ rotate: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 6,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 p-4 flex flex-col">
                    <div className="text-white font-bold text-xl mb-2">Data Structures</div>
                    <div className="text-purple-100 text-sm mb-4">Algorithms & Examples</div>
                    <div className="flex-1 bg-white/10 rounded"></div>
                    <div className="h-4 w-12 bg-white/20 rounded mt-2"></div>
                  </div>
                </motion.div>

                {/* Third book */}
                <motion.div 
                  className="absolute top-20 right-[40%] w-64 h-80 rounded-lg shadow-xl overflow-hidden z-10"
                  initial={{ rotate: -3 }}
                  animate={{ rotate: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 7,
                    ease: "easeInOut"
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 p-4 flex flex-col">
                    <div className="text-white font-bold text-xl mb-2">Computer Networks</div>
                    <div className="text-emerald-100 text-sm mb-4">Illustrated Guide</div>
                    <div className="flex-1 bg-white/10 rounded"></div>
                    <div className="h-4 w-12 bg-white/20 rounded mt-2"></div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Show content for authenticated users */}
        {currentUser && (
          <div className="container mx-auto py-8 px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-center"
            >
              <h1 className="text-3xl font-bold mb-4">Welcome to B-TECH NOTES</h1>
              <p className="text-lg text-muted-foreground mb-6">
                Access your study materials and notes here.
              </p>
              <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={() => navigate("/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* Only show these sections when not logged in */}
        {!currentUser && (
          <>
            {/* Features Section */}
            <div id="features">
              <Features />
            </div>

            {/* Notes Browser Section */}
            <div id="notes-browser">
              <NotesBrowser />
            </div>

            {/* How It Works Section */}
            <div id="how-it-works">
              <HowItWorks />
            </div>

            {/* About Section */}
            <div id="about">
              <About />
            </div>

            {/* Contact Section */}
            <div id="contact">
              <Contact />
            </div>
          </>
        )}

        {/* Footer */}
        <footer className="bg-background py-8 border-t mt-auto">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <h3 className="font-bold text-lg">B-TECH NOTES</h3>
                <p className="text-sm text-muted-foreground">© 2023 B-TECH NOTES. All rights reserved.</p>
              </div>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm">Terms</Button>
                <Button variant="ghost" size="sm">Privacy</Button>
                <Button variant="ghost" size="sm">Cookies</Button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default GetStarted; 