import { useState } from "react";
import { 
  useListUsers, 
  useUpdateUserRole,
  useGetCurrentUser
} from "@workspace/api-client-react";
import { UserRole } from "@workspace/api-zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Shield, ShieldAlert, Key, Loader2 } from "lucide-react";

export default function Team() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: users, isLoading } = useListUsers();
  const { data: currentUser } = useGetCurrentUser();
  const updateUserRole = useUpdateUserRole();
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const handleRoleChange = (userId: number, newRole: UserRole) => {
    setUpdatingId(userId);
    updateUserRole.mutate(
      { id: userId, data: { role: newRole } },
      {
        onSuccess: () => {
          toast({ title: "Role updated successfully" });
          queryClient.invalidateQueries({ queryKey: ["listUsers"] });
          setUpdatingId(null);
        },
        onError: (err: any) => {
          toast({ title: "Update Failed", description: err.error || "Could not change role", variant: "destructive" });
          setUpdatingId(null);
        }
      }
    );
  };

  const getRoleBadge = (role: string | null) => {
    if (!role) return <Badge variant="outline" className="bg-gray-50 text-gray-500">Unassigned</Badge>;
    
    switch (role) {
      case "fleet_manager": return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Fleet Manager</Badge>;
      case "safety_officer": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Safety Officer</Badge>;
      case "financial_analyst": return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Financial Analyst</Badge>;
      case "driver": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Driver</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  // Only allow fleet_manager to see this page, Layout normally protects it but good to double check
  if (currentUser && currentUser.role !== "fleet_manager") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <ShieldAlert className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">Only Fleet Managers can access the team directory.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Team Management</h2>
          <p className="text-muted-foreground">Manage system access and assign roles to personnel.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Directory & Permissions</CardTitle>
          </div>
          <CardDescription>
            Change a user's role to alter their permissions across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Current Role</TableHead>
                  <TableHead>Assign Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading directory...</TableCell></TableRow>
                ) : !users || users.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No users found.</TableCell></TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.name || "Unknown"}
                        {user.id === currentUser?.id && (
                          <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/20">You</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Select 
                            disabled={updatingId === user.id || user.id === currentUser?.id} 
                            value={user.role || ""} 
                            onValueChange={(val) => handleRoleChange(user.id, val as UserRole)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="driver">Driver</SelectItem>
                              <SelectItem value="fleet_manager">Fleet Manager</SelectItem>
                              <SelectItem value="safety_officer">Safety Officer</SelectItem>
                              <SelectItem value="financial_analyst">Financial Analyst</SelectItem>
                            </SelectContent>
                          </Select>
                          {updatingId === user.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
