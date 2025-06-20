import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { supabase, createTrackedChannel, unsubscribeChannel } from "@/lib/supabase";
import { motion } from "framer-motion";
import { buttonHover, buttonTap } from "@/lib/animations";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, LogOut, Settings, BookOpen, History, Upload, ShieldCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NotesUploadForm } from "./NotesUploadForm";

export default function UserProfile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);

  // Check if user is admin
  const isAdmin = currentUser?.email === "admin@example.com" || 
                  currentUser?.email === "rakeshvarma9704@gmail.com";

  // Fetch pending note requests if user is admin
  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    const fetchPendingRequests = async () => {
      try {
        const { data, error, count } = await supabase
          .from("notes")
          .select("*", { count: 'exact' })
          .eq("status", "pending");

        if (error) {
          console.error("Error fetching pending requests:", error);
          return;
        }

        setPendingRequestsCount(count || 0);
      } catch (err) {
        console.error("Failed to fetch pending requests:", err);
      }
    };

    fetchPendingRequests();

    // Set up realtime subscription for notes table using our tracked channel system
    try {
      const channel = createTrackedChannel('admin_pending_notes', {
        config: {
          broadcast: {
            self: true
          }
        }
      });
      
      channel.on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'notes',
          filter: 'status=eq.pending'
        }, 
        () => {
          fetchPendingRequests();
        }
      ).subscribe();
    } catch (err) {
      console.error("Failed to set up subscription:", err);
    }

    return () => {
      // Clean up subscription
      unsubscribeChannel('admin_pending_notes');
    };
  }, [currentUser, isAdmin]);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleMyNotesClick = () => {
    navigate("/my-notes");
  };

  const handleRecentActivityClick = () => {
    navigate("/recent-activity");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleAdminPanelClick = () => {
    navigate("/admin");
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!currentUser || !currentUser.email) return "?";
    return currentUser.email
      .split("@")[0]
      .slice(0, 2)
      .toUpperCase();
  };

  // If user is logged in, show profile dropdown
  if (currentUser) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div
              className="cursor-pointer flex items-center gap-2"
              whileHover={buttonHover}
              whileTap={buttonTap}
            >
              <Avatar>
                <AvatarImage src={currentUser.user_metadata?.avatar_url || ""} alt={currentUser.email || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline-block text-sm font-medium">
                {currentUser.user_metadata?.full_name || currentUser.email?.split("@")[0]}
              </span>
              {isAdmin && pendingRequestsCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {pendingRequestsCount}
                </Badge>
              )}
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2"
              onClick={handleProfileClick}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2"
              onClick={handleMyNotesClick}
            >
              <BookOpen className="h-4 w-4" />
              <span>My Notes</span>
            </DropdownMenuItem>
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <DropdownMenuItem 
                    className="cursor-pointer flex items-center gap-2"
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Notes</span>
                  </DropdownMenuItem>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Upload Notes</DialogTitle>
                  </DialogHeader>
                  <NotesUploadForm onClose={() => setIsDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            )}
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2"
              onClick={handleRecentActivityClick}
            >
              <History className="h-4 w-4" />
              <span>Recent Activity</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2"
              onClick={handleSettingsClick}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer flex items-center gap-2 text-primary relative"
                  onClick={handleAdminPanelClick}
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Admin Panel</span>
                  {pendingRequestsCount > 0 && (
                    <Badge variant="destructive" className="ml-auto">
                      {pendingRequestsCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
              </>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer flex items-center gap-2 text-red-500 focus:text-red-500"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut className="h-4 w-4" />
              <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  // If user is not logged in, show login button only
  return (
    <div className="flex items-center gap-2">
      <motion.div whileHover={buttonHover} whileTap={buttonTap}>
        <Button variant="ghost" size="sm" onClick={handleLogin}>
          Log in
        </Button>
      </motion.div>
    </div>
  );
} 