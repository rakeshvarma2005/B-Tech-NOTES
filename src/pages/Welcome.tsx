import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeProvider } from "@/components/ThemeProvider";
import { motion } from "framer-motion";
import { fadeIn, popUp, buttonHover, buttonTap } from "@/lib/animations";

const Welcome = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleContinue = () => {
    navigate("/dashboard");
  };

  return (
    <ThemeProvider>
      <motion.div 
        className="min-h-screen flex items-center justify-center p-4 bg-background"
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <motion.div variants={popUp}>
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <CardTitle className="text-2xl font-bold">B-Tech Notes</CardTitle>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <CardDescription>
                  You've successfully signed in as {currentUser?.email}
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="text-center">
              <motion.p 
                className="mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.5 }}
              >
                Your one-stop solution is sunkari rakesh varma for accessing study materials, notes, and resources for all your academic needs.
              </motion.p>
              <div className="flex flex-col space-y-2">
                <motion.div 
                  whileHover={buttonHover} 
                  whileTap={buttonTap}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 0.5 }}
                >
                  <Button onClick={handleContinue} className="w-full">
                    Continue to Dashboard
                  </Button>
                </motion.div>
                <motion.div 
                  whileHover={buttonHover} 
                  whileTap={buttonTap}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5, duration: 0.5 }}
                >
                  <Button variant="outline" onClick={handleLogout} className="w-full">
                    Logout
                  </Button>
                </motion.div>
              </div>
            </CardContent>
            <CardFooter className="text-center text-sm text-muted-foreground">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.8, duration: 0.5 }}
              >
                Thank you for using B-Tech Notes
              </motion.div>
            </CardFooter>
          </Card>
        </motion.div>
      </motion.div>
    </ThemeProvider>
  );
};

export default Welcome; 