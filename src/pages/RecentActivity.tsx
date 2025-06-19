import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { FileText, Upload, Check, X, Clock } from "lucide-react";

interface Activity {
  id: string;
  type: "upload" | "approval" | "rejection";
  title: string;
  subject: string;
  timestamp: string;
  status?: "pending" | "approved" | "rejected";
}

interface NoteWithCourse {
  id: string;
  title: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  courses: {
    name: string;
  } | null;
}

export default function RecentActivity() {
  const { currentUser } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        // Fetch user's notes
        const { data: notesData, error: notesError } = await supabase
          .from("notes")
          .select("id, title, status, created_at, courses(name)")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false })
          .limit(20);

        if (notesError) throw notesError;

        const formattedActivities: Activity[] = (notesData as NoteWithCourse[]).map((note) => ({
          id: note.id,
          type: "upload" as const,
          title: note.title,
          subject: note.courses?.name || "Unknown",
          timestamp: note.created_at,
          status: note.status,
        }));

        setActivities(formattedActivities);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [currentUser]);

  const getActivityIcon = (type: string, status?: string) => {
    switch (type) {
      case "upload":
        if (status === "pending") return <Clock className="h-4 w-4 text-yellow-500" />;
        if (status === "approved") return <Check className="h-4 w-4 text-green-500" />;
        if (status === "rejected") return <X className="h-4 w-4 text-red-500" />;
        return <Upload className="h-4 w-4 text-blue-500" />;
      case "approval":
        return <Check className="h-4 w-4 text-green-500" />;
      case "rejection":
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: Activity) => {
    switch (activity.type) {
      case "upload":
        if (activity.status === "pending") return `Requested approval for "${activity.title}"`;
        if (activity.status === "approved") return `Note "${activity.title}" was approved`;
        if (activity.status === "rejected") return `Note "${activity.title}" was rejected`;
        return `Uploaded "${activity.title}"`;
      case "approval":
        return `Note "${activity.title}" was approved`;
      case "rejection":
        return `Note "${activity.title}" was rejected`;
      default:
        return `Activity related to "${activity.title}"`;
    }
  };

  const getSubjectLabel = (subject: string) => {
    return subject || "Unknown Subject";
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  if (!currentUser) {
    return (
      <div className="container max-w-5xl py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Recent Activity</h1>
        <p className="text-muted-foreground">Please sign in to view your recent activity.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-6">Recent Activity</h1>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="all">All Activity</TabsTrigger>
          <TabsTrigger value="uploads">Uploads</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Recent Activity</CardTitle>
              <CardDescription>
                Your recent actions and status updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No recent activity</h3>
                  <p className="mt-2 text-muted-foreground">
                    You haven't performed any actions recently.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border">
                      <div className="mt-0.5">
                        {getActivityIcon(activity.type, activity.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{getActivityText(activity)}</p>
                          {getStatusBadge(activity.status)}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <span>{getSubjectLabel(activity.subject)}</span>
                          <span>•</span>
                          <span>{format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="uploads">
          <Card>
            <CardHeader>
              <CardTitle>Upload Activity</CardTitle>
              <CardDescription>
                Your recent note uploads and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : activities.filter(a => a.type === "upload").length === 0 ? (
                <div className="text-center py-12">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No upload activity</h3>
                  <p className="mt-2 text-muted-foreground">
                    You haven't uploaded any notes recently.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities
                    .filter(a => a.type === "upload")
                    .map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border">
                        <div className="mt-0.5">
                          {getActivityIcon(activity.type, activity.status)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{getActivityText(activity)}</p>
                            {getStatusBadge(activity.status)}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{getSubjectLabel(activity.subject)}</span>
                            <span>•</span>
                            <span>{format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals">
          <Card>
            <CardHeader>
              <CardTitle>Approval Activity</CardTitle>
              <CardDescription>
                Your notes that have been approved
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : activities.filter(a => a.status === "approved").length === 0 ? (
                <div className="text-center py-12">
                  <Check className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                  <h3 className="mt-4 text-lg font-medium">No approved notes</h3>
                  <p className="mt-2 text-muted-foreground">
                    None of your notes have been approved yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities
                    .filter(a => a.status === "approved")
                    .map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg border">
                        <div className="mt-0.5">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{`Note "${activity.title}" was approved`}</p>
                            {getStatusBadge("approved")}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            <span>{getSubjectLabel(activity.subject)}</span>
                            <span>•</span>
                            <span>{format(new Date(activity.timestamp), "MMM d, yyyy 'at' h:mm a")}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 