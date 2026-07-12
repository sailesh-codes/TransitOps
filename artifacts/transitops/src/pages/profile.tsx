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
  const baseClass = "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm transition-transform hover:scale-105 cursor-default";
  
  if (!role) {
    return (
      <Badge variant="outline" className={`bg-slate-100 text-slate-500 border-slate-200 ${baseClass}`}>
        Unassigned
      </Badge>
    );
  }
  switch (role) {
    case "fleet_manager":
      return (
        <Badge variant="outline" className={`bg-indigo-100 text-indigo-700 border-indigo-200 ${baseClass}`}>
          Fleet Manager
        </Badge>
      );
    case "safety_officer":
      return (
        <Badge variant="outline" className={`bg-blue-100 text-blue-700 border-blue-200 ${baseClass}`}>
          Safety Officer
        </Badge>
      );
    case "financial_analyst":
      return (
        <Badge variant="outline" className={`bg-amber-100 text-amber-700 border-amber-200 ${baseClass}`}>
          Financial Analyst
        </Badge>
      );
    case "driver":
      return (
        <Badge variant="outline" className={`bg-emerald-100 text-emerald-700 border-emerald-200 ${baseClass}`}>
          Driver
        </Badge>
      );
    default:
      return <Badge variant="outline" className={baseClass}>{role}</Badge>;
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
    <div className="flex-1 space-y-8 max-w-4xl mx-auto w-full pt-4">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-800">Your Profile</h2>
        <p className="text-muted-foreground mt-2 text-base">
          Manage your account details and role permissions.
        </p>
      </div>

      <Card className="overflow-hidden border-blue-100/50 shadow-md">
        <CardHeader className="bg-blue-50/50 border-b border-blue-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <UserCircle className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-xl">Account Identity</CardTitle>
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

      <Card className="overflow-hidden border-blue-100/50 shadow-md">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-200/50 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-slate-700" />
            </div>
            <CardTitle className="text-xl">Role & Permissions</CardTitle>
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

      <div className="flex justify-end pt-4">
        <Button variant="destructive" onClick={handleSignOut} className="rounded-xl shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 px-6">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out Securely
        </Button>
      </div>
    </div>
  );
}
