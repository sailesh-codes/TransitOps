import { useState } from "react";
import { 
  useListTrips, 
  useCreateTrip, 
  useDispatchTrip, 
  useCompleteTrip,
  useCancelTrip,
  useListVehicles,
  useListDrivers
} from "@workspace/api-client-react";
import { TripStatus, VehicleStatus, DriverStatus } from "@workspace/api-zod";
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
import { Plus, Search, MapPin, Truck, Play, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const createTripSchema = z.object({
  source: z.string().min(1, "Source is required"),
  destination: z.string().min(1, "Destination is required"),
  vehicleId: z.coerce.number().min(1, "Vehicle is required"),
  driverId: z.coerce.number().min(1, "Driver is required"),
  cargoWeight: z.coerce.number().min(0),
  plannedDistance: z.coerce.number().min(1, "Distance is required"),
});

const completeTripSchema = z.object({
  finalOdometer: z.coerce.number().min(0, "Odometer is required"),
  fuelConsumed: z.coerce.number().min(0, "Fuel consumed is required"),
});

export default function Trips() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [completingTrip, setCompletingTrip] = useState<any | null>(null);

  const queryParams = {
    ...(statusFilter !== "all" ? { status: statusFilter as TripStatus } : {}),
  };
  
  const { data: trips, isLoading } = useListTrips(queryParams);
  const { data: vehicles } = useListVehicles({ status: "Available" as VehicleStatus }); // Only allow available vehicles for new trips
  const { data: drivers } = useListDrivers({ status: "Available" as DriverStatus }); // Only allow available drivers

  const createTrip = useCreateTrip();
  const dispatchTrip = useDispatchTrip();
  const completeTrip = useCompleteTrip();
  const cancelTrip = useCancelTrip();

  const createForm = useForm<z.infer<typeof createTripSchema>>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      source: "",
      destination: "",
      vehicleId: 0,
      driverId: 0,
      cargoWeight: 0,
      plannedDistance: 0,
    },
  });

  const completeForm = useForm<z.infer<typeof completeTripSchema>>({
    resolver: zodResolver(completeTripSchema),
    defaultValues: {
      finalOdometer: 0,
      fuelConsumed: 0,
    },
  });

  const onCreateSubmit = (values: z.infer<typeof createTripSchema>) => {
    createTrip.mutate(
      { data: values as any },
      {
        onSuccess: () => {
          toast({ title: "Draft trip created successfully" });
          setIsCreateOpen(false);
          createForm.reset();
          queryClient.invalidateQueries({ queryKey: ["listTrips"] });
          queryClient.invalidateQueries({ queryKey: ["listVehicles"] });
          queryClient.invalidateQueries({ queryKey: ["listDrivers"] });
        },
        onError: (err: any) => {
          toast({ title: "Creation Failed", description: err.error || "Could not create trip", variant: "destructive" });
        }
      }
    );
  };

  const handleDispatch = (id: number) => {
    if (confirm("Dispatch this trip now?")) {
      dispatchTrip.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Trip dispatched" });
            queryClient.invalidateQueries({ queryKey: ["listTrips"] });
          },
          onError: (err: any) => {
            toast({ title: "Dispatch Failed", description: err.error || "Could not dispatch trip", variant: "destructive" });
          }
        }
      );
    }
  };

  const handleCancel = (id: number) => {
    if (confirm("Cancel this trip? This cannot be undone.")) {
      cancelTrip.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Trip cancelled" });
            queryClient.invalidateQueries({ queryKey: ["listTrips"] });
          },
          onError: (err: any) => {
            toast({ title: "Cancel Failed", description: err.error || "Could not cancel trip", variant: "destructive" });
          }
        }
      );
    }
  };

  const onCompleteSubmit = (values: z.infer<typeof completeTripSchema>) => {
    if (!completingTrip) return;
    
    completeTrip.mutate(
      { id: completingTrip.id, data: values },
      {
        onSuccess: () => {
          toast({ title: "Trip marked as completed" });
          setCompletingTrip(null);
          completeForm.reset();
          queryClient.invalidateQueries({ queryKey: ["listTrips"] });
          queryClient.invalidateQueries({ queryKey: ["listVehicles"] });
          queryClient.invalidateQueries({ queryKey: ["listDrivers"] });
        },
        onError: (err: any) => {
          toast({ title: "Completion Failed", description: err.error || "Could not complete trip", variant: "destructive" });
        }
      }
    );
  };

  const openCompleteDialog = (trip: any) => {
    setCompletingTrip(trip);
    // Ideally we would prefill finalOdometer with trip.vehicle.odometer + plannedDistance
    completeForm.reset({
      finalOdometer: 0,
      fuelConsumed: 0,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft": return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Draft</Badge>;
      case "dispatched": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Dispatched</Badge>;
      case "completed": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case "cancelled": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Trip Dispatch</h2>
          <p className="text-muted-foreground">Schedule, dispatch, and track fleet trips.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Trip
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
                <SelectItem value="all">All Trips</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="dispatched">Dispatched</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Cargo/Dist.</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading trips...</TableCell>
                  </TableRow>
                ) : trips?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No trips found.</TableCell>
                  </TableRow>
                ) : (
                  trips?.map((trip: any) => (
                    <TableRow key={trip.id}>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <span className="font-medium truncate max-w-[120px]">{trip.source}</span>
                          <ArrowRight className="h-3 w-3 mx-2 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate max-w-[120px]">{trip.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div className="flex items-center text-muted-foreground">
                            <Truck className="h-3 w-3 mr-1" /> V-{trip.vehicleId}
                          </div>
                          <div className="flex items-center text-muted-foreground">
                            <MapPin className="h-3 w-3 mr-1" /> D-{trip.driverId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-1">
                          <div>{trip.cargoWeight} kg</div>
                          <div className="text-muted-foreground">{trip.plannedDistance} km</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          <div>Created: {format(new Date(trip.createdAt), "MMM d")}</div>
                          {trip.dispatchedAt && <div>Out: {format(new Date(trip.dispatchedAt), "MMM d")}</div>}
                          {trip.completedAt && <div>Done: {format(new Date(trip.completedAt), "MMM d")}</div>}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(trip.status)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {trip.status === "draft" && (
                          <Button variant="outline" size="sm" onClick={() => handleDispatch(trip.id)} className="h-8 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 border-blue-200">
                            <Play className="h-3 w-3 mr-1" /> Dispatch
                          </Button>
                        )}
                        {trip.status === "dispatched" && (
                          <Button variant="outline" size="sm" onClick={() => openCompleteDialog(trip)} className="h-8 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" /> Complete
                          </Button>
                        )}
                        {(trip.status === "draft" || trip.status === "dispatched") && (
                          <Button variant="ghost" size="sm" onClick={() => handleCancel(trip.id)} className="h-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10">
                            <XCircle className="h-3 w-3" />
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

      {/* CREATE TRIP DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Trip</DialogTitle>
            <DialogDescription>Draft a new trip. Only available vehicles and drivers are shown.</DialogDescription>
          </DialogHeader>
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Warehouse A" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Destination</FormLabel>
                      <FormControl>
                        <Input placeholder="Distribution Center B" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Vehicle</FormLabel>
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
                  control={createForm.control}
                  name="driverId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign Driver</FormLabel>
                      <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select driver" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {drivers?.map((d) => (
                            <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                          ))}
                          {(!drivers || drivers.length === 0) && (
                            <SelectItem value="0" disabled>No available drivers</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={createForm.control}
                  name="cargoWeight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cargo Weight (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="plannedDistance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Planned Distance (km)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createTrip.isPending}>
                  {createTrip.isPending ? "Creating..." : "Create Draft Trip"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* COMPLETE TRIP DIALOG */}
      <Dialog open={!!completingTrip} onOpenChange={(open) => !open && setCompletingTrip(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Trip</DialogTitle>
            <DialogDescription>
              Enter the final metrics for this trip. The vehicle's total odometer will be updated.
            </DialogDescription>
          </DialogHeader>
          <Form {...completeForm}>
            <form onSubmit={completeForm.handleSubmit(onCompleteSubmit)} className="space-y-4">
              <FormField
                control={completeForm.control}
                name="finalOdometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Final Vehicle Odometer (km)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={completeForm.control}
                name="fuelConsumed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Consumed (Liters)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setCompletingTrip(null)}>Cancel</Button>
                <Button type="submit" disabled={completeTrip.isPending}>
                  {completeTrip.isPending ? "Saving..." : "Complete Trip"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
