import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import { useEffect, useState } from "react";
import { initializeDatabase } from "@/lib/dbFunctions";
import { testSupabaseConnection } from "@/lib/supabase";
import { toast } from "sonner";
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from "@/components/ThemeProvider";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GetStarted from "./pages/GetStarted";
import Welcome from "./pages/Welcome";
import SignInPage from "./components/Auth/SignInPage";
import MyNotes from "./pages/MyNotes";
import AdminPanel from "./components/AdminPanel";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import RecentActivity from "./pages/RecentActivity";
import UploadNotes from "./pages/UploadNotes";
import NotesExample from "./pages/NotesExample";
import AuthCallback from "./pages/auth/callback";
import Header from "./components/Header";
import ImageUploadExample from "./pages/ImageUploadExample";

// Import curriculum for debugging
import { curriculum } from "./data/curriculum";

const queryClient = new QueryClient();

// Redirect authenticated users away from auth pages
const RedirectIfAuthenticated = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();
  const [isInitializing, setIsInitializing] = useState(true);
  
  useEffect(() => {
    // Test Supabase connection first
    const testConnection = async () => {
      try {
        await testSupabaseConnection();
      } catch (error) {
        console.error("Error testing Supabase connection:", error);
        toast.error("Failed to connect to Supabase. Please check your API credentials.");
      }
    };
    
    testConnection();
    
    // Initialize database only if user is authenticated
    const setupDatabase = async () => {
      setIsInitializing(true);
      
      try {
        if (currentUser) {
          const result = await initializeDatabase();
          if (!result) {
            toast.warning("Some database operations may be restricted. Please check your Supabase setup.");
          }
        } else {
          console.log("User not authenticated. Database initialization skipped.");
        }
      } catch (error) {
        console.error("Error initializing database:", error);
        toast.error("Failed to initialize database. Some features may not work correctly.");
      } finally {
        setIsInitializing(false);
      }
    };
    
    setupDatabase();

    // Log curriculum structure for debugging
    console.log("CURRICULUM STRUCTURE FOR DEBUGGING:");
    curriculum.forEach(year => {
      console.log(`Year: ${year.name}, ID: ${year.id}`);
      year.semesters.forEach(semester => {
        console.log(`  Semester: ${semester.name}, ID: ${semester.id}`);
        semester.subjects.forEach(subject => {
          console.log(`    Subject: ${subject.name}, ID: ${subject.id}, Code: ${subject.code}`);
        });
      });
    });
  }, [currentUser]);
  
  // Show loading indicator while initializing
  if (isInitializing && currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Initializing application...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-background">Loading...</div>;
  }
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        currentUser ? 
          <Navigate to="/dashboard" replace /> : 
          <Navigate to="/get-started" replace />
      } />
      
      {/* Auth callback route for OAuth */}
      <Route path="/auth/callback" element={<AuthCallback />} />
      
      <Route path="/get-started" element={<GetStarted />} />
      
      {/* Auth Routes - redirect if already logged in */}
      <Route path="/login" element={
        <RedirectIfAuthenticated>
          <SignInPage />
        </RedirectIfAuthenticated>
      } />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Index />
        </ProtectedRoute>
      } />
      <Route path="/welcome" element={
        <ProtectedRoute>
          <Welcome />
        </ProtectedRoute>
      } />
      <Route path="/my-notes" element={
        <ProtectedRoute>
          <MyNotes />
        </ProtectedRoute>
      } />
      <Route path="/upload-notes" element={
        <ProtectedRoute>
          <UploadNotes />
        </ProtectedRoute>
      } />
      <Route path="/notes-example" element={
        <ProtectedRoute>
          <NotesExample />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <Settings />
        </ProtectedRoute>
      } />
      <Route path="/recent-activity" element={
        <ProtectedRoute>
          <RecentActivity />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminPanel />
        </ProtectedRoute>
      } />
      <Route path="/image-upload-example" element={
        <ProtectedRoute>
          <ImageUploadExample />
        </ProtectedRoute>
      } />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatePresence mode="wait" initial={false}>
              <div className="flex flex-col min-h-screen bg-background dark:bg-background">
                <Header />
                <main className="flex-1">
                  <AppRoutes />
                </main>
              </div>
            </AnimatePresence>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
