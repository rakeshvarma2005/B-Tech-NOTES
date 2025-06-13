import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Calendar } from "lucide-react";

export default function Profile() {
  const { currentUser } = useAuth();

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!currentUser || !currentUser.email) return "?";
    return currentUser.email
      .split("@")[0]
      .slice(0, 2)
      .toUpperCase();
  };

  // Format account creation date
  const formatCreationDate = () => {
    if (!currentUser || !currentUser.metadata.creationTime) return "Unknown";
    return new Date(currentUser.metadata.creationTime).toLocaleDateString();
  };

  if (!currentUser) {
    return (
      <div className="container max-w-5xl py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <p className="text-muted-foreground">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <Avatar className="w-24 h-24 mx-auto">
                <AvatarImage src={currentUser.photoURL || ""} alt={currentUser.email || "User"} />
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="mt-4">
                {currentUser.displayName || currentUser.email?.split("@")[0]}
              </CardTitle>
              <CardDescription>
                {currentUser.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined on {formatCreationDate()}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Edit Profile
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Email Verification</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${currentUser.emailVerified ? "bg-green-500" : "bg-yellow-500"}`}></div>
                  <span className="text-sm">
                    {currentUser.emailVerified ? "Email verified" : "Email not verified"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Account Status</h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Active</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Authentication Method</h3>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {currentUser.providerData[0]?.providerId === "google.com" 
                      ? "Google Account" 
                      : "Email and Password"}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Update Account Settings
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 