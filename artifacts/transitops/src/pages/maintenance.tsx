import { useState } from "react";
import { 
  useListMaintenanceLogs, 
  useCreateMaintenanceLog, 
  useCloseMaintenanceLog,
  useListVehicles
} from "@workspace/api-client-react";
import { MaintenanceLogInput, MaintenanceStatus } from "@workspace/api-zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Wrench, Plus, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const maintenanceSchema = z.object({
  vehicleId: z.coerce.number().min(1, "Vehicle is required"),
  description: z.string().min(1, "Description is required"),
  cost: z.coerce.number().min(0, "Cost must be a positive number"),
});

export default function Maintenance() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const queryParams = {
    ...(statusFilter !== "all" ? { status: statusFilter as MaintenanceStatus } : {}),
  };
  
  const { data: logs, isLoading } = useListMaintenanceLogs(queryParams);
  const { data: vehicles } = useListVehicles({ status: "Available" }); // To start maintenance, vehicle must be available
  
  const createLog = useCreateMaintenanceLog();
  const closeLog = useCloseMaintenanceLog();

  const form = useForm<z.infer<typeof maintenanceSchema>>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      vehicleId: 0,
      description: "",
      cost: 0,
    },
  });

  const onSubmit = (values: z.infer<typeof maintenanceSchema>) => {
    createLog.mutate(
      { data: values as MaintenanceLogInput },
      {
        onSuccess: () => {
          toast({ title: "Maintenance started", description: "Vehicle status changed to 'maintenance'." });
          setIsDialogOpen(false);
          form.reset();
          queryClient.invalidateQueries({ queryKey: ["listMaintenanceLogs"] });
          queryClient.invalidateQueries({ queryKey: ["listVehicles"] });
        },
        onError: (err: any) => {
          toast({ title: "Error", description: err.error || "Failed to start maintenance", variant: "destructive" });
        }
      }
    );
  };

  const handleClose = (id: number) => {
    if (confirm("Mark maintenance as completed? The vehicle will be available for dispatch again.")) {
      closeLog.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Maintenance completed", description: "Vehicle is now available." });
            queryClient.invalidateQueries({ queryKey: ["listMaintenanceLogs"] });
            queryClient.invalidateQueries({ queryKey: ["listVehicles"] });
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err.error || "Failed to close log", variant: "destructive" });
          }
        }
      );
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maintenance</h2>
          <p className="text-muted-foreground">Track repairs, servicing, and vehicle downtime.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Wrench className="mr-2 h-4 w-4" /> Start Maintenance
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-end">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Records</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle ID</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Closed</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Loading maintenance logs...</TableCell>
                  </TableRow>
                ) : logs?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No maintenance records found.</TableCell>
                  </TableRow>
                ) : (
                  logs?.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">V-{log.vehicleId}</TableCell>
                      <TableCell className="max-w-[250px] truncate" title={log.description}>{log.description}</TableCell>
                      <TableCell>₹{log.cost.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{format(new Date(log.startedAt), "MMM dd, yyyy")}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {log.closedAt ? format(new Date(log.closedAt), "MMM dd, yyyy") : "-"}
                      </TableCell>
                      <TableCell>
                        {log.status === "Open" 
                          ? <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">In Progress</Badge>
                          : <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {log.status === "Open" && (
                          <Button variant="outline" size="sm" onClick={() => handleClose(log.id)} className="h-8 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Finish
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Start Maintenance</DialogTitle>
            <DialogDescription>
              Log a new maintenance event. The selected vehicle will be marked as "in maintenance" and pulled from the available dispatch pool.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle (Available Only)</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select vehicle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {vehicles?.map((v) => (
                          <SelectItem key={v.id} value={v.id.toString()}>{v.registrationNumber} ({v.type})</SelectItem>
                        ))}
                        {(!vehicles || vehicles.length === 0) && (
                          <SelectItem value="0" disabled>No available vehicles</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description / Reason</FormLabel>
                    <FormControl>
                      <Input placeholder="Oil change, brake pad replacement..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated/Actual Cost (₹)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createLog.isPending}>
                  {createLog.isPending ? "Saving..." : "Start Maintenance"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
