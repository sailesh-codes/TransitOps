import { useEffect, useState } from "react";
import {
  useGetCurrentUser,
  useUpdateUserRole,
} from "@workspace/api-client-react";
import { UserRole } from "@workspace/api-zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useClerk } from "@clerk/react";
import {
  UserCircle,
  Mail,
  ShieldCheck,
  Info,
  LogOut,
  Loader2,
} from "lucide-react";

function getRoleBadge(role: UserRole | null | undefined) {
  if (!role) {
    return (
      <Badge variant="outline" className="bg-gray-50 text-gray-500">
        Unassigned
      </Badge>
    );
  }
  switch (role) {
    case "fleet_manager":
      return (
        <Badge
          variant="outline"
          className="bg-purple-50 text-purple-700 border-purple-200"
        >
          Fleet Manager
        </Badge>
      );
    case "safety_officer":
      return (
        <Badge
          variant="outline"
          className="bg-blue-50 text-blue-700 border-blue-200"
        >
          Safety Officer
        </Badge>
      );
    case "financial_analyst":
      return (
        <Badge
          variant="outline"
          className="bg-amber-50 text-amber-700 border-amber-200"
        >
          Financial Analyst
        </Badge>
      );
    case "driver":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200"
        >
          Driver
        </Badge>
      );
    default:
      return <Badge variant="outline">{role}</Badge>;
  }
}

export default function Profile() {
  const { data: user, isLoading } = useGetCurrentUser();
  const updateUserRole = useUpdateUserRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { signOut } = useClerk();

  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");

  // Keep the local select in sync with the user's current role.
  useEffect(() => {
    if (user?.role) setSelectedRole(user.role);
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        Loading profile…
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
        Unable to load your profile.
      </div>
    );
  }

  const isFleetManager = user.role === "fleet_manager";

  const handleRoleChange = (value: string) => {
    setSelectedRole(value as UserRole);
    updateUserRole.mutate(
      { id: user.id, data: { role: value as UserRole } },
      {
        onSuccess: () => {
          toast({ title: "Role updated" });
          queryClient.invalidateQueries({ queryKey: ["getCurrentUser"] });
        },
        onError: (err: any) => {
          toast({
            title: "Could not update role",
            description: err?.error || "An error occurred",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleSignOut = () => {
    signOut({ redirectUrl: import.meta.env.BASE_URL.replace(/\/$/, "") || "/" });
  };

  return (
    <div className="flex-1 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">
          Your account details and role.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <UserCircle className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Account</CardTitle>
          </div>
          <CardDescription>
            Your identity in TransitOps. Managed by Clerk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Name
              </dt>
              <dd className="text-sm font-medium">{user.name || "—"}</dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Email
              </dt>
              <dd className="flex items-center gap-2 text-sm font-medium">
                <Mail className="h-4 w-4 text-muted-foreground" />
                {user.email}
              </dd>
            </div>
            <div className="space-y-1">
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Current Role
              </dt>
              <dd>{getRoleBadge(user.role)}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Role</CardTitle>
          </div>
          <CardDescription>
            Your role determines which pages and actions are available to you.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isFleetManager ? (
            <div className="space-y-2">
              <label
                htmlFor="profile-role-select"
                className="text-sm font-medium"
              >
                Change your role
              </label>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedRole}
                  onValueChange={handleRoleChange}
                  disabled={updateUserRole.isPending}
                >
                  <SelectTrigger id="profile-role-select" className="w-[240px]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="driver">Driver</SelectItem>
                    <SelectItem value="fleet_manager">Fleet Manager</SelectItem>
                    <SelectItem value="safety_officer">
                      Safety Officer
                    </SelectItem>
                    <SelectItem value="financial_analyst">
                      Financial Analyst
                    </SelectItem>
                  </SelectContent>
                </Select>
                {updateUserRole.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Changes take effect immediately and refresh the sidebar.
              </p>
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Role is read-only</AlertTitle>
              <AlertDescription>
                Your role was set when you first signed in. To change it, ask a
                Fleet Manager to update it from the Team page.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
