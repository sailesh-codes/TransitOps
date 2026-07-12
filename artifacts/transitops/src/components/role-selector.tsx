import { useState, useRef, useEffect } from "react";
import { useGetCurrentUser, useSetMyRole } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function RoleSelector() {
  const { data: user, isLoading } = useGetCurrentUser();
  const setRole = useSetMyRole();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedRole, setSelectedRole] = useState<string>("driver");
  const hasUser = !!user;
  const isMissingRole = hasUser && !user.role;
  
  const handleSetRole = () => {
    if (!selectedRole) return;
    
    setRole.mutate(
      { data: { role: selectedRole as any } },
      {
        onSuccess: () => {
          toast({ title: "Role updated successfully." });
          queryClient.invalidateQueries({ queryKey: ["getCurrentUser"] });
        },
        onError: (err) => {
          toast({ 
            title: "Failed to update role", 
            description: (err as any)?.error || "An error occurred",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (isLoading || !isMissingRole) return null;

  return (
    <Dialog open={isMissingRole} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md [&>button]:hidden" onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Select Your Role</DialogTitle>
          <DialogDescription>
            Please choose your role in TransitOps to continue. Your role determines what you can see and do.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="space-y-4">
            <div className="flex items-start space-x-3 space-y-0 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
              <RadioGroupItem value="driver" id="role-driver" className="mt-1" />
              <div className="flex flex-col">
                <Label htmlFor="role-driver" className="font-medium cursor-pointer">Driver</Label>
                <span className="text-xs text-muted-foreground mt-1">Can view assigned trips and log fuel.</span>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 space-y-0 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
              <RadioGroupItem value="fleet_manager" id="role-fleet-manager" className="mt-1" />
              <div className="flex flex-col">
                <Label htmlFor="role-fleet-manager" className="font-medium cursor-pointer">Fleet Manager</Label>
                <span className="text-xs text-muted-foreground mt-1">Full access to vehicles, trips, drivers, and team settings.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-y-0 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
              <RadioGroupItem value="safety_officer" id="role-safety-officer" className="mt-1" />
              <div className="flex flex-col">
                <Label htmlFor="role-safety-officer" className="font-medium cursor-pointer">Safety Officer</Label>
                <span className="text-xs text-muted-foreground mt-1">Manages maintenance, compliance, and driver safety scores.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3 space-y-0 p-3 border rounded-md has-[:checked]:border-primary has-[:checked]:bg-primary/5 cursor-pointer">
              <RadioGroupItem value="financial_analyst" id="role-financial-analyst" className="mt-1" />
              <div className="flex flex-col">
                <Label htmlFor="role-financial-analyst" className="font-medium cursor-pointer">Financial Analyst</Label>
                <span className="text-xs text-muted-foreground mt-1">Access to expenses, cost reports, and analytics.</span>
              </div>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button onClick={handleSetRole} disabled={!selectedRole || setRole.isPending} className="w-full">
            {setRole.isPending ? "Saving..." : "Continue"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
