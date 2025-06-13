import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/AuthContext";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";

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
  const { currentUser } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={
        currentUser ? 
          <Navigate to="/dashboard" replace /> : 
          <Navigate to="/login" replace />
      } />
      
      <Route path="/get-started" element={
        <RedirectIfAuthenticated>
          <GetStarted />
        </RedirectIfAuthenticated>
      } />
      
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
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
