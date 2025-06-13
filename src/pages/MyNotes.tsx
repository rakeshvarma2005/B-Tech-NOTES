import { useEffect, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NotesUploadForm } from "@/components/NotesUploadForm";
import { FileText, Upload, Clock, Check, X, Download, Eye } from "lucide-react";
import { format } from "date-fns";

interface NoteRequest {
  id: string;
  title: string;
  subject: string;
  description: string;
  fileName: string;
  fileURL: string;
  status: "pending" | "approved" | "rejected";
  createdAt: {
    toDate: () => Date;
  };
}

export default function MyNotes() {
  const { currentUser } = useAuth();
  const [acceptedNotes, setAcceptedNotes] = useState<NoteRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<NoteRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        // Fetch accepted notes
        const acceptedQuery = query(
          collection(db, "acceptedNotes"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const acceptedSnapshot = await getDocs(acceptedQuery);
        const acceptedData = acceptedSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as NoteRequest[];
        setAcceptedNotes(acceptedData);

        // Fetch pending requests
        const requestsQuery = query(
          collection(db, "noteRequests"),
          where("userId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        const requestsData = requestsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as NoteRequest[];
        setPendingRequests(requestsData);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [currentUser]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
            <Check className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
            <X className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getSubjectLabel = (subjectValue: string) => {
    const subjects: Record<string, string> = {
      mathematics: "Mathematics",
      physics: "Physics",
      chemistry: "Chemistry",
      biology: "Biology",
      computer_science: "Computer Science",
      engineering: "Engineering",
      other: "Other",
    };
    return subjects[subjectValue] || subjectValue;
  };

  return (
    <div className="container max-w-5xl py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Notes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload New Note
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Upload Notes</DialogTitle>
            </DialogHeader>
            <NotesUploadForm onClose={() => setIsDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="accepted" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="accepted">My Notes</TabsTrigger>
          <TabsTrigger value="requests">Pending Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="accepted" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : acceptedNotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No notes found</h3>
              <p className="mt-2 text-muted-foreground">
                You don't have any approved notes yet. Upload a note to get started.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Note
              </Button>
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
                          {getSubjectLabel(note.subject)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(note.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {note.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {note.description}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>
                        Uploaded on{" "}
                        {format(note.createdAt.toDate(), "MMM d, yyyy")}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <a href={note.fileURL} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </a>
                    </Button>
                    <Button size="sm" asChild>
                      <a href={note.fileURL} download={note.fileName}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-4 text-lg font-medium">No pending requests</h3>
              <p className="mt-2 text-muted-foreground">
                You don't have any pending note requests. Upload a note to get started.
              </p>
              <Button variant="outline" className="mt-4" onClick={() => setIsDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Note
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="line-clamp-1">{request.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {getSubjectLabel(request.subject)}
                        </CardDescription>
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {request.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {request.description}
                      </p>
                    )}
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span>
                        Requested on{" "}
                        {format(request.createdAt.toDate(), "MMM d, yyyy")}
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <a href={request.fileURL} target="_blank" rel="noopener noreferrer">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </a>
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      Waiting for admin approval
                    </div>
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