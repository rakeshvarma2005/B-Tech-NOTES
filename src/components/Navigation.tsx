import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { buttonHover, buttonTap } from "@/lib/animations";
import UserProfile from "@/components/UserProfile";
import { useAuth } from "@/lib/AuthContext";

interface NavigationProps {
  onSectionChange: (section: string) => void;
}

export default function Navigation({ onSectionChange }: NavigationProps) {
  const [activeSection, setActiveSection] = useState("home");
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    onSectionChange(section);
    setIsOpen(false);
  };

  // Only show these navigation items when not logged in
  const publicNavItems = [
    { id: "home", label: "Home" },
    { id: "features", label: "Features" },
    { id: "notes-browser", label: "Browse Notes" },
    { id: "how-it-works", label: "How It Works" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];

  // Navigation items to display based on auth status
  const navItems = currentUser ? [] : publicNavItems;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <motion.div 
            className="font-bold text-xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            B-Tech Notes
          </motion.div>
        </div>
        <div className="flex flex-1 items-center justify-between">
          {!currentUser && (
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {navItems.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                >
                  <Button
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className="text-sm font-medium transition-colors"
                    onClick={() => handleSectionClick(item.id)}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              ))}
            </nav>
          )}
          
          {/* Always show User Profile */}
          <div className={currentUser ? "ml-auto" : ""}>
            <UserProfile />
          </div>
          
          {!currentUser && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="outline" size="icon" className="ml-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[240px] sm:w-[300px]">
                <nav className="flex flex-col gap-4 mt-6">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeSection === item.id ? "default" : "ghost"}
                      className="justify-start"
                      onClick={() => handleSectionClick(item.id)}
                    >
                      {item.label}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  );
} 