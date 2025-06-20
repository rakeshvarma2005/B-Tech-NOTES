import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FileText, Check, X, Eye, Clock, RefreshCw, Users, FileUp, Upload } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { curriculum } from "@/data/curriculum";

interface Note {
  id: string;
  user_id: string;
  course_id: string;
  title: string;
  description: string;
  file_url: string;
  thumbnail_url: string;
  file_type: string;
  page_count: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
  profiles?: {
    email?: string;
    full_name?: string;
  };
  courses?: {
    name?: string;
    code?: string;
    year?: number;
    semester?: number;
    departments?: {
      name?: string;
      code?: string;
    };
  };
  year_id?: string;
  semester_id?: string;
  subject_id?: string;
  unit_number?: number;
  is_important_questions?: boolean;
  notes_type?: string;
}

interface DashboardStats {
  totalUsers: number;
  totalNotes: number;
  totalViews: number;
  pendingApprovals: number;
}

export default function AdminPanel() {
  const { currentUser } = useAuth();
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [approvedNotes, setApprovedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger a refresh
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalNotes: 0,
    totalViews: 0,
    pendingApprovals: 0
  });

  const isAdmin = currentUser?.email === "admin@example.com" || 
                  currentUser?.email === "rakeshvarma9704@gmail.com";

  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    const fetchStats = async () => {
      try {
        // Get total users
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        // Get total notes (both pending and approved)
        const { count: noteCount } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true });
        
        // Get pending approvals count
        const { count: pendingCount } = await supabase
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        
        // For views, we'll use a placeholder for now
        // In a real app, you would have a view_count column or a separate table tracking views
        
        setStats({
          totalUsers: userCount || 0,
          totalNotes: noteCount || 0,
          // This is a placeholder - in a real app, get this from your database
          totalViews: 969,
          pendingApprovals: pendingCount || 0
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchStats();
  }, [currentUser, isAdmin, refreshKey]);
  
  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    const fetchNotes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch only basic notes data without any joins
        const { data: pendingData, error: pendingError } = await supabase
          .from("notes")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (pendingError) {
          console.error("Error fetching notes:", pendingError);
          throw pendingError;
        }

        // Fetch approved notes with the same approach
        const { data: approvedData, error: approvedError } = await supabase
          .from("notes")
          .select("*")
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (approvedError) {
          console.error("Error fetching approved notes:", approvedError);
          throw approvedError;
        }
        
        // Fetch user profiles separately for the notes we have
        const userIds = [...(pendingData || []), ...(approvedData || [])]
          .map(note => note.user_id)
          .filter((id, index, self) => id && self.indexOf(id) === index);
        
        let profilesData = {};
        if (userIds.length > 0) {
          try {
            const { data: profiles, error: profilesError } = await supabase
              .from("profiles")
              .select("id, email, full_name")
              .in("id", userIds);
            
            if (!profilesError && profiles) {
              profilesData = profiles.reduce((acc, profile) => {
                acc[profile.id] = profile;
                return acc;
              }, {});
            }
          } catch (profileErr) {
            console.warn("Could not fetch profiles:", profileErr);
          }
        }
        
        // Fetch course data separately for the notes we have
        const courseIds = [...(pendingData || []), ...(approvedData || [])]
          .map(note => note.course_id)
          .filter((id, index, self) => id && self.indexOf(id) === index);
        
        let coursesData = {};
        if (courseIds.length > 0) {
          try {
            const { data: courses, error: coursesError } = await supabase
              .from("courses")
              .select("id, name, code, year, semester")
              .in("id", courseIds);
            
            if (!coursesError && courses) {
              coursesData = courses.reduce((acc, course) => {
                acc[course.id] = course;
                return acc;
              }, {});
            }
          } catch (courseErr) {
            console.warn("Could not fetch courses:", courseErr);
          }
        }
        
        // Combine the data
        const enrichedPendingData = (pendingData || []).map(note => ({
          ...note,
          profiles: profilesData[note.user_id] || {},
          courses: coursesData[note.course_id] || {}
        }));
        
        const enrichedApprovedData = (approvedData || []).map(note => ({
          ...note,
          profiles: profilesData[note.user_id] || {},
          courses: coursesData[note.course_id] || {}
        }));
        
        setPendingNotes(enrichedPendingData);
        setApprovedNotes(enrichedApprovedData);
        
        // Update pending approvals count in stats
        setStats(prev => ({
          ...prev,
          pendingApprovals: enrichedPendingData.length,
          totalNotes: enrichedPendingData.length + enrichedApprovedData.length
        }));
        
      } catch (error) {
        console.error("Error fetching notes:", error);
        setError("Failed to fetch notes. Please check your database configuration.");
        toast.error("Failed to fetch notes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [currentUser, isAdmin, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleApproveNote = async (note: Note) => {
    if (!isAdmin) {
      toast.error("You don't have permission to perform this action");
      return;
    }

    try {
      toast.info("Approving note...");
      
      // Check if file URL is valid
      if (!note.file_url) {
        toast.error("Note has no associated file");
        return;
      }

      // Update note status to approved
      const { error } = await supabase
        .from("notes")
        .update({
          status: "approved",
          updated_at: new Date().toISOString()
        })
        .eq("id", note.id);

      if (error) throw error;

      // Update UI
      setPendingNotes(pendingNotes.filter(n => n.id !== note.id));
      toast.success("Note approved successfully");

      // Refresh the data to update the approved notes list
      handleRefresh();
    } catch (error) {
      console.error("Error approving note:", error);
      toast.error("Failed to approve note");
    }
  };

  const handleRejectNote = async (note: Note) => {
    if (!isAdmin) {
      toast.error("You don't have permission to perform this action");
      return;
    }

    try {
      // Update note status to rejected
      const { error } = await supabase
        .from("notes")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString()
        })
        .eq("id", note.id);

      if (error) throw error;

      // Update UI
      setPendingNotes(pendingNotes.filter(n => n.id !== note.id));
      setIsRejectDialogOpen(false);
      setSelectedNote(null);
      toast.success("Note rejected");
    } catch (error) {
      console.error("Error rejecting note:", error);
      toast.error("Failed to reject note");
    }
  };

  // Get subject label from curriculum
  const getSubjectLabel = (note: Note) => {
    if (note.courses?.name) {
      return `${note.courses.name}${note.courses.code ? ` (${note.courses.code})` : ''}`;
    }
    return "Unknown Subject";
  };

  if (!isAdmin) {
    return (
      <div className="container max-w-5xl py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Admin Panel</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gray-900 text-white">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-gray-400 mb-1">Total Users</p>
              <h3 className="text-4xl font-bold">{stats.totalUsers}</h3>
            </div>
            <div className="bg-indigo-900 p-3 rounded-full">
              <Users className="h-6 w-6 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 text-white">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-gray-400 mb-1">Total Notes</p>
              <h3 className="text-4xl font-bold">{stats.totalNotes}</h3>
            </div>
            <div className="bg-indigo-900 p-3 rounded-full">
              <FileText className="h-6 w-6 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 text-white">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-gray-400 mb-1">Total Views</p>
              <h3 className="text-4xl font-bold">{stats.totalViews}</h3>
            </div>
            <div className="bg-indigo-900 p-3 rounded-full">
              <Eye className="h-6 w-6 text-indigo-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 text-white">
          <CardContent className="p-6 flex justify-between items-center">
            <div>
              <p className="text-gray-400 mb-1">Pending Approvals</p>
              <h3 className="text-4xl font-bold">{stats.pendingApprovals}</h3>
            </div>
            <div className="bg-indigo-900 p-3 rounded-full">
              <Upload className="h-6 w-6 text-indigo-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Error: {error}</p>
          <p className="text-sm mt-1">Please check your database configuration and try again.</p>
        </div>
      )}

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="requests" className="relative">
            Pending Requests
            {pendingNotes.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {pendingNotes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : pendingNotes.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No pending requests</h3>
              <p className="mt-2 text-muted-foreground">
                There are no notes waiting for approval.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {pendingNotes.map((note) => (
                <Card key={note.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="line-clamp-1">{note.title || "Untitled Note"}</CardTitle>
                        <CardDescription className="mt-1">
                          {getSubjectLabel(note)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {note.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {note.description}
                      </p>
                    )}
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <span>
                        Uploaded by{" "}
                        <span className="font-medium">{note.profiles?.email || "Unknown"}</span>
                      </span>
                      <span>
                        Uploaded on{" "}
                        {format(new Date(note.created_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{note.title || "Untitled Note"}</DialogTitle>
                          <DialogDescription>
                            {getSubjectLabel(note)} • Uploaded by {note.profiles?.email || "Unknown"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          {note.file_url ? (
                            <iframe 
                              src={note.file_url} 
                              className="w-full h-[70vh] border rounded-md"
                              title={note.title || "Note preview"}
                            />
                          ) : (
                            <div className="w-full h-[70vh] border rounded-md flex items-center justify-center bg-muted">
                              <p className="text-muted-foreground">No preview available</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => {
                          setSelectedNote(note);
                          setIsRejectDialogOpen(true);
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleApproveNote(note)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : approvedNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No approved notes</h3>
              <p className="mt-2 text-muted-foreground">
                There are no approved notes yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {approvedNotes.map((note) => (
                <Card key={note.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="line-clamp-1">{note.title || "Untitled Note"}</CardTitle>
                        <CardDescription className="mt-1">
                          {getSubjectLabel(note)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
                        <Check className="h-3 w-3" />
                        Approved
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {note.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {note.description}
                      </p>
                    )}
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <span>
                        Uploaded by{" "}
                        <span className="font-medium">{note.profiles?.email || "Unknown"}</span>
                      </span>
                      <span>
                        Approved on{" "}
                        {format(new Date(note.updated_at), "MMM d, yyyy")}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl">
                        <DialogHeader>
                          <DialogTitle>{note.title || "Untitled Note"}</DialogTitle>
                          <DialogDescription>
                            {getSubjectLabel(note)} • Uploaded by {note.profiles?.email || "Unknown"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          {note.file_url ? (
                            <iframe 
                              src={note.file_url} 
                              className="w-full h-[70vh] border rounded-md"
                              title={note.title || "Note preview"}
                            />
                          ) : (
                            <div className="w-full h-[70vh] border rounded-md flex items-center justify-center bg-muted">
                              <p className="text-muted-foreground">No preview available</p>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Reject confirmation dialog */}
      <AlertDialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this note?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The note will be marked as rejected and will no longer be visible to users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => selectedNote && handleRejectNote(selectedNote)}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
