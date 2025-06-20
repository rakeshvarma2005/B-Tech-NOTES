import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import { 
  fadeIn, 
  slideInFromLeft, 
  slideInFromRight, 
  slideInFromBottom,
  slideInFromTop,
  staggerContainer,
  buttonHover,
  buttonTap,
  floatAnimation,
  pulseAnimation,
  rotateAnimation,
  shimmer,
  revealFromLeft,
  staggeredFadeIn,
  staggeredChildren,
  popUp
} from "@/lib/animations";
import Navigation from "@/components/Navigation";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import NotesBrowser from "@/components/sections/NotesBrowser";
import About from "@/components/sections/About";
import Contact from "@/components/sections/Contact";
import { useAuth } from "@/lib/AuthContext";
import { Sparkles, BookOpen, GraduationCap, BookCheck, ScrollText } from "lucide-react";

const GetStarted = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("home");
  const { currentUser } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Track mouse position for parallax effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Scroll to section
    const element = document.getElementById(section);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Floating icons animation
  const floatingIcons = [
    { icon: <BookOpen className="text-blue-500" />, left: "10%", top: "15%" },
    { icon: <GraduationCap className="text-purple-500" />, left: "85%", top: "25%" },
    { icon: <BookCheck className="text-green-500" />, left: "20%", top: "70%" },
    { icon: <ScrollText className="text-amber-500" />, left: "75%", top: "80%" },
  ];

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 overflow-hidden relative">
        {/* Background animated elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Floating icons */}
          {floatingIcons.map((item, index) => (
            <motion.div
              key={index}
              className="absolute w-8 h-8 opacity-20"
              style={{
                left: item.left,
                top: item.top,
                x: mousePosition.x * 0.02,
                y: mousePosition.y * 0.02,
              }}
              initial={{ y: 0 }}
              animate={{ 
                y: [-10, 10, -10],
                transition: {
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }
              }}
            >
              {item.icon}
            </motion.div>
          ))}

          {/* Animated gradient circles */}
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl"
            style={{ left: '15%', top: '20%' }}
            initial={{ scale: 0.9 }}
            animate={{ 
              scale: [0.9, 1.1, 0.9],
              transition: {
                repeat: Infinity,
                duration: 8,
                ease: "easeInOut"
              }
            }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-green-400/10 to-teal-400/10 blur-3xl"
            style={{ right: '10%', top: '60%' }}
            initial={{ scale: 0.9 }}
            animate={{ 
              scale: [0.9, 1.1, 0.9],
              transition: {
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut"
              }
            }}
          />
        </div>

        <Navigation onSectionChange={handleSectionChange} />
        
        {/* Hero section */}
        {!currentUser && (
          <motion.div 
            id="home"
            className="flex-1 flex flex-col items-center justify-center pt-20 pb-16 px-4 relative z-10"
            initial="hidden"
            animate="visible"
            variants={staggeredFadeIn}
          >
            <div className="container mx-auto">
              <div className="flex flex-row items-center justify-between gap-8">
                {/* Text content - centered on mobile, left on desktop */}
                <motion.div 
                  className="flex-1 flex flex-col items-center md:items-start text-center md:text-left max-w-md mx-auto z-10"
                  variants={slideInFromLeft}
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mb-4"
                  >
                    <motion.div 
                      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm"
                      initial={{ scale: 1 }}
                      animate={{ 
                        scale: [1, 1.05, 1],
                        transition: {
                          repeat: Infinity,
                          duration: 2,
                          ease: "easeInOut"
                        }
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Your ultimate study resource</span>
                    </motion.div>
                  </motion.div>
                  
                  <motion.h1 
                    className="text-4xl md:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 relative"
                    variants={revealFromLeft}
                  >
                    B-TECH NOTES
                    <motion.div 
                      className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 w-full"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ 
                        delay: 1.2, 
                        duration: 1, 
                        ease: "easeOut" 
                      }}
                    />
                  </motion.h1>
                  <motion.p 
                    className="text-xl mb-8 text-muted-foreground"
                    variants={staggeredChildren}
                  >
                    Your one-stop solution rakesh varma for accessing study materials, notes, and resources for all your academic needs.
                  </motion.p>
                  <motion.div 
                    className="flex justify-center w-full"
                    variants={staggeredChildren}
                  >
                    <motion.div
                      className="relative group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <motion.div 
                        className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg blur-md opacity-70 group-hover:opacity-100 transition duration-300"
                        animate={{ 
                          boxShadow: ["0px 0px 0px rgba(79, 70, 229, 0.2)", "0px 0px 20px rgba(79, 70, 229, 0.6)", "0px 0px 0px rgba(79, 70, 229, 0.2)"]
                        }}
                        transition={{ 
                          duration: 3,
                          repeat: Infinity,
                          repeatType: "reverse"
                        }}
                      />
                      <Button 
                        size="lg" 
                        className="relative px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg font-medium shadow-lg" 
                        onClick={() => navigate("/login")}
                      >
                        <motion.span 
                          className="flex items-center gap-2"
                          animate={{ 
                            textShadow: ["0px 0px 0px rgba(255, 255, 255, 0)", "0px 0px 5px rgba(255, 255, 255, 0.7)", "0px 0px 0px rgba(255, 255, 255, 0)"]
                          }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        >
                          Log In
                          <motion.span
                            animate={{ x: [0, 3, 0] }}
                            transition={{ 
                              duration: 1,
                              repeat: Infinity,
                              repeatType: "reverse"
                            }}
                          >→</motion.span>
                        </motion.span>
                      </Button>
                    </motion.div>
                  </motion.div>

                  <motion.div 
                    className="mt-12 grid grid-cols-3 gap-4 w-full max-w-md"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    transition={{ delayChildren: 1.5, staggerChildren: 0.2 }}
                  >
                    {[
                      { label: "Study Materials", value: "1000+" },
                      { label: "Subjects", value: "50+" },
                      { label: "Students", value: "500+" },
                    ].map((stat, idx) => (
                      <motion.div 
                        key={idx} 
                        className="flex flex-col items-center p-2 rounded-lg bg-white/50 dark:bg-gray-800/50"
                        variants={popUp}
                      >
                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stat.value}</p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>

                {/* Book images - stacked and animated */}
                <div className="flex-1 hidden md:block"></div>
              </div>
            </div>
            
            {/* Books displayed as absolutely positioned for all screen sizes */}
            <div className="absolute top-40 md:top-1/2 right-4 md:right-[10%] transform md:-translate-y-1/2 w-[45%] md:w-[35%] max-w-md h-[400px] hidden md:block">
              <motion.div 
                className="absolute w-full max-w-[280px]"
                variants={slideInFromRight}
              >
                {/* Main book */}
                <motion.div 
                  className="absolute top-0 right-[10%] w-56 sm:w-64 h-72 sm:h-80 rounded-lg shadow-xl overflow-hidden z-30"
                  initial={{ rotate: -5 }}
                  animate={{ rotate: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 5,
                    ease: "easeInOut"
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 p-4 flex flex-col">
                    <div className="text-white font-bold text-lg sm:text-xl mb-2">Engineering Mathematics</div>
                    <div className="text-blue-100 text-xs sm:text-sm mb-4">Complete Notes</div>
                    <div className="flex-1 bg-white/10 rounded"></div>
                    <div className="h-4 w-12 bg-white/20 rounded mt-2"></div>
                  </div>
                </motion.div>

                {/* Second book */}
                <motion.div 
                  className="absolute top-10 right-[25%] w-56 sm:w-64 h-72 sm:h-80 rounded-lg shadow-xl overflow-hidden z-20"
                  initial={{ rotate: 5 }}
                  animate={{ rotate: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 6,
                    ease: "easeInOut"
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    zIndex: 40,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-purple-500 to-pink-600 p-4 flex flex-col">
                    <div className="text-white font-bold text-lg sm:text-xl mb-2">Data Structures</div>
                    <div className="text-purple-100 text-xs sm:text-sm mb-4">Algorithms & Examples</div>
                    <div className="flex-1 bg-white/10 rounded"></div>
                    <div className="h-4 w-12 bg-white/20 rounded mt-2"></div>
                  </div>
                </motion.div>

                {/* Third book */}
                <motion.div 
                  className="absolute top-20 right-[40%] w-56 sm:w-64 h-72 sm:h-80 rounded-lg shadow-xl overflow-hidden z-10"
                  initial={{ rotate: -3 }}
                  animate={{ rotate: 0 }}
                  transition={{ 
                    repeat: Infinity, 
                    repeatType: "reverse", 
                    duration: 7,
                    ease: "easeInOut"
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    zIndex: 40,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 p-4 flex flex-col">
                    <div className="text-white font-bold text-lg sm:text-xl mb-2">Computer Networks</div>
                    <div className="text-emerald-100 text-xs sm:text-sm mb-4">Illustrated Guide</div>
                    <div className="flex-1 bg-white/10 rounded"></div>
                    <div className="h-4 w-12 bg-white/20 rounded mt-2"></div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Alternative mobile image */}
            <motion.div
              className="mt-8 mb-4 mx-auto md:hidden w-full max-w-[280px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-blue-900 p-4 flex flex-col items-center justify-center text-center">
                  <div className="bg-white/10 rounded-full p-4 mb-4">
                    <GraduationCap className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-white font-bold text-xl mb-2">Access Your Notes Anywhere</h3>
                  <p className="text-blue-100 text-sm">All your academic resources in one place</p>
                  <div className="absolute bottom-0 right-0 w-32 h-32">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
                      <path fill="white" d="M46.5,-63.5C59.9,-53.8,70.1,-39.5,75.6,-23.6C81.1,-7.7,82,9.8,76.1,24.6C70.3,39.4,57.8,51.6,43.7,58.7C29.6,65.8,14.8,67.9,-0.6,68.7C-16,69.6,-32,69.3,-43.9,62C-55.8,54.6,-63.5,40.3,-69.1,25C-74.7,9.7,-78.1,-6.5,-74.7,-21.4C-71.3,-36.2,-61.2,-49.8,-47.8,-59.3C-34.4,-68.8,-17.2,-74.4,-0.3,-74C16.6,-73.6,33.1,-73.3,46.5,-63.5Z" transform="translate(100 100)" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Scroll down indicator */}
            <motion.div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 0.5 }}
            >
              <motion.div 
                className="w-8 h-12 border-2 border-indigo-500 rounded-full flex justify-center pt-2"
                animate={{ y: [0, 10, 0] }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1.5 
                }}
              >
                <motion.div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Show content for authenticated users */}
        {currentUser && (
          <div className="container mx-auto py-8 px-4 relative z-10">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              className="text-center"
            >
              <motion.h1 
                className="text-3xl font-bold mb-4"
                variants={slideInFromTop}
              >
                Welcome to B-TECH NOTES
              </motion.h1>
              <motion.p 
                className="text-lg text-muted-foreground mb-6"
                variants={slideInFromBottom}
              >
                Access your study materials and notes here.
              </motion.p>
              <motion.div whileHover={buttonHover} whileTap={buttonTap}>
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/20"
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
        <footer className="bg-background py-8 border-t mt-auto relative z-10">
          <div className="container mx-auto px-4">
            <motion.div 
              className="flex flex-col md:flex-row justify-between items-center"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="mb-4 md:mb-0">
                <motion.h3 
                  className="font-bold text-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  B-TECH NOTES
                </motion.h3>
                <p className="text-sm text-muted-foreground">© 2023 B-TECH NOTES. All rights reserved.</p>
              </div>
              <div className="flex gap-4">
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Button variant="ghost" size="sm">Terms</Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Button variant="ghost" size="sm">Privacy</Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.1 }}>
                  <Button variant="ghost" size="sm">Cookies</Button>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
};

export default GetStarted; 