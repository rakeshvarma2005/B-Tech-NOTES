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
import { FileText, Check, X, Eye, Clock, RefreshCw } from "lucide-react";
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
  profiles: {
    email: string;
    full_name: string;
  };
  courses: {
    name: string;
    code: string;
    year: number;
    semester: number;
    departments: {
      name: string;
      code: string;
    };
  };
}

export default function AdminPanel() {
  const { currentUser } = useAuth();
  const [pendingNotes, setPendingNotes] = useState<Note[]>([]);
  const [approvedNotes, setApprovedNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger a refresh

  const isAdmin = currentUser?.email === "admin@example.com" || 
                  currentUser?.email === "rakeshvarma9704@gmail.com";

  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        // Fetch pending notes
        const { data: pendingData, error: pendingError } = await supabase
          .from("notes")
          .select(`
            *,
            profiles (email, full_name),
            courses (
              name, code, year, semester,
              departments (name, code)
            )
          `)
          .eq("status", "pending")
          .order("created_at", { ascending: false });

        if (pendingError) throw pendingError;
        setPendingNotes(pendingData as Note[]);

        // Fetch approved notes
        const { data: approvedData, error: approvedError } = await supabase
          .from("notes")
          .select(`
            *,
            profiles (email, full_name),
            courses (
              name, code, year, semester,
              departments (name, code)
            )
          `)
          .eq("status", "approved")
          .order("created_at", { ascending: false });

        if (approvedError) throw approvedError;
        setApprovedNotes(approvedData as Note[]);
      } catch (error) {
        console.error("Error fetching notes:", error);
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

      // Refresh the data
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
    if (note.courses) {
      return `${note.courses.name} (${note.courses.code})`;
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
                        <CardTitle className="line-clamp-1">{note.title}</CardTitle>
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
                        <span className="font-medium">{note.profiles?.email}</span>
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
                          <DialogTitle>{note.title}</DialogTitle>
                          <DialogDescription>
                            {getSubjectLabel(note)} • Uploaded by {note.profiles?.email}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          <iframe 
                            src={note.file_url} 
                            className="w-full h-[70vh] border rounded-md"
                            title={note.title}
                          />
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
                        <CardTitle className="line-clamp-1">{note.title}</CardTitle>
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
                        <span className="font-medium">{note.profiles?.email}</span>
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
                          <DialogTitle>{note.title}</DialogTitle>
                          <DialogDescription>
                            {getSubjectLabel(note)} • Uploaded by {note.profiles?.email}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="mt-4">
                          <iframe 
                            src={note.file_url} 
                            className="w-full h-[70vh] border rounded-md"
                            title={note.title}
                          />
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
            <AlertDialogTitle>Reject Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
