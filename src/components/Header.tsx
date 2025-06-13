import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun, GraduationCap } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/lib/AuthContext";
import UserProfile from "@/components/UserProfile";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const { currentUser } = useAuth();

  return (
    <header className="bg-card border-b border-border p-4 sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="text-2xl font-bold text-foreground">
            BTech Notes
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
          
          {/* Show UserProfile component instead of login button when logged in */}
          {currentUser ? (
            <UserProfile />
          ) : (
              <Button variant="outline">Login</Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
