import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  where,
  addDoc,
  serverTimestamp
} from "firebase/firestore";
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

interface NoteRequest {
  id: string;
  userId: string;
  userEmail: string;
  title: string;
  subject: string;
  yearId?: string;
  semesterId?: string;
  subjectId?: string;
  description: string;
  fileName: string;
  fileURL: string;
  fileType: string;
  fileSize: number;
  status: "pending" | "approved" | "rejected";
  createdAt: {
    toDate: () => Date;
  };
}

export default function AdminPanel() {
  const { currentUser } = useAuth();
  const [noteRequests, setNoteRequests] = useState<NoteRequest[]>([]);
  const [acceptedNotes, setAcceptedNotes] = useState<NoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<NoteRequest | null>(null);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger a refresh

  const isAdmin = currentUser?.email === "admin@example.com" || 
                  currentUser?.email === "rakeshvarma9704@gmail.com" || 
                  currentUser?.uid === "qadmin";

  useEffect(() => {
    if (!currentUser || !isAdmin) return;

    const fetchRequests = async () => {
      setIsLoading(true);
      try {
        // Fetch pending requests
        const requestsQuery = query(
          collection(db, "noteRequests"),
          where("status", "==", "pending"),
          orderBy("createdAt", "desc")
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        const requestsData = requestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as NoteRequest[];
        setNoteRequests(requestsData);

        // Fetch accepted notes
        const acceptedQuery = query(
          collection(db, "acceptedNotes"),
          orderBy("createdAt", "desc")
        );
        const acceptedSnapshot = await getDocs(acceptedQuery);
        const acceptedData = acceptedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as NoteRequest[];
        setAcceptedNotes(acceptedData);
      } catch (error) {
        console.error("Error fetching requests:", error);
        toast.error("Failed to fetch note requests");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [currentUser, isAdmin, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleAcceptRequest = async (request: NoteRequest) => {
    if (!isAdmin) {
      toast.error("You don't have permission to perform this action");
      return;
    }

    try {
      // 1. Add to acceptedNotes collection
      await addDoc(collection(db, "acceptedNotes"), {
        ...request,
        status: "approved",
        approvedAt: serverTimestamp(),
        approvedBy: currentUser?.uid
      });

      // 2. Update status in noteRequests collection
      const requestRef = doc(db, "noteRequests", request.id);
      await updateDoc(requestRef, {
        status: "approved"
      });

      // 3. Update UI
      setNoteRequests(noteRequests.filter(req => req.id !== request.id));
      toast.success("Note request approved successfully");

      // Refresh the data
      handleRefresh();
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error("Failed to approve note request");
    }
  };

  const handleRejectRequest = async (request: NoteRequest) => {
    if (!isAdmin) {
      toast.error("You don't have permission to perform this action");
      return;
    }

    try {
      // Update status in noteRequests collection
      const requestRef = doc(db, "noteRequests", request.id);
      await updateDoc(requestRef, {
        status: "rejected",
        rejectedAt: serverTimestamp(),
        rejectedBy: currentUser?.uid
      });

      // Update UI
      setNoteRequests(noteRequests.filter(req => req.id !== request.id));
      setIsRejectDialogOpen(false);
      setSelectedRequest(null);
      toast.success("Note request rejected");
    } catch (error) {
      console.error("Error rejecting request:", error);
      toast.error("Failed to reject note request");
    }
  };

  // Get subject label from curriculum
  const getSubjectLabel = (request: NoteRequest) => {
    // If we have yearId, semesterId and subjectId, use curriculum to get the subject name
    if (request.yearId && request.semesterId && request.subjectId) {
      const year = curriculum.find(y => y.id === request.yearId);
      const semester = year?.semesters.find(s => s.id === request.semesterId);
      const subject = semester?.subjects.find(s => s.id === request.subjectId);
      
      if (subject) {
        if (subject.isImportantQuestions) {
          return (
            <span className="font-medium">
              <span className="text-amber-600">🔥 {subject.name}</span> ({subject.code})
            </span>
          );
        }
        return `${subject.name} (${subject.code})`;
      }
    }
    
    // Fallback to the subject code or default mapping
    const subjects: Record<string, string> = {
      mathematics: "Mathematics",
      physics: "Physics",
      chemistry: "Chemistry",
      biology: "Biology",
      computer_science: "Computer Science",
      engineering: "Engineering",
      other: "Other",
    };
    return subjects[request.subject] || request.subject;
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
            {noteRequests.length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {noteRequests.length}
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
          ) : noteRequests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No pending requests</h3>
              <p className="mt-2 text-muted-foreground">
                There are no pending note requests to review.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {noteRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="line-clamp-1">{request.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {getSubjectLabel(request)}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
                        <Clock className="h-3 w-3" />
                        Pending
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {request.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {request.description}
                      </p>
                    )}
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="text-muted-foreground">
                        Submitted by: {request.userEmail}
                      </div>
                      <div className="text-muted-foreground">
                        Requested on: {format(request.createdAt.toDate(), "MMM d, yyyy")}
                      </div>
                      <div className="text-muted-foreground">
                        File: {request.fileName} ({(request.fileSize / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col gap-2">
                    <div className="flex w-full gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <a href={request.fileURL} target="_blank" rel="noopener noreferrer">
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </a>
                      </Button>
                    </div>
                    <div className="flex w-full gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        onClick={() => handleAcceptRequest(request)}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Accept
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            className="flex-1"
                          >
                            <X className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reject Note Request</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to reject this note request? 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleRejectRequest(request)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Reject
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
          ) : acceptedNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No approved notes</h3>
              <p className="mt-2 text-muted-foreground">
                There are no approved notes in the system yet.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {acceptedNotes.map((note) => (
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
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="text-muted-foreground">
                        Submitted by: {note.userEmail}
                      </div>
                      <div className="text-muted-foreground">
                        Approved on: {format(note.createdAt.toDate(), "MMM d, yyyy")}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <a href={note.fileURL} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
