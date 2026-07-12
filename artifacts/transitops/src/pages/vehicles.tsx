import { useState } from "react";
import { 
  useListVehicles, 
  useCreateVehicle, 
  useUpdateVehicle, 
  useDeleteVehicle,
  useListRegions
} from "@workspace/api-client-react";
import { VehicleStatus } from "@workspace/api-zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

const vehicleSchema = z.object({
  registrationNumber: z.string().min(1, "Registration number is required"),
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  maxLoadCapacity: z.coerce.number().min(0),
  odometer: z.coerce.number().min(0),
  acquisitionCost: z.coerce.number().min(0),
  region: z.string().min(1, "Region is required"),
});

export default function Vehicles() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);

  const { data: regions } = useListRegions();
  
  const queryParams = {
    ...(statusFilter !== "all" ? { status: statusFilter as VehicleStatus } : {}),
    ...(typeFilter !== "all" ? { type: typeFilter } : {}),
    ...(regionFilter !== "all" ? { region: regionFilter } : {}),
    ...(search ? { search } : {}),
  };
  
  const { data: vehicles, isLoading } = useListVehicles(queryParams);
  const createVehicle = useCreateVehicle();
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const form = useForm<z.infer<typeof vehicleSchema>>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      registrationNumber: "",
      name: "",
      type: "",
      maxLoadCapacity: 0,
      odometer: 0,
      acquisitionCost: 0,
      region: "",
    },
  });

  const openCreateDialog = () => {
    setEditingVehicle(null);
    form.reset({
      registrationNumber: "",
      name: "",
      type: "",
      maxLoadCapacity: 0,
      odometer: 0,
      acquisitionCost: 0,
      region: "",
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (vehicle: any) => {
    setEditingVehicle(vehicle);
    form.reset({
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      maxLoadCapacity: vehicle.maxLoadCapacity,
      odometer: vehicle.odometer,
      acquisitionCost: vehicle.acquisitionCost,
      region: vehicle.region,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof vehicleSchema>) => {
    if (editingVehicle) {
      updateVehicle.mutate(
        { id: editingVehicle.id, data: values as any },
        {
          onSuccess: () => {
            toast({ title: "Vehicle updated successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["listVehicles"] });
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err.error || "Failed to update vehicle", variant: "destructive" });
          }
        }
      );
    } else {
      createVehicle.mutate(
        { data: values as any },
        {
          onSuccess: () => {
            toast({ title: "Vehicle created successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["listVehicles"] });
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err.error || "Failed to create vehicle", variant: "destructive" });
          }
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicle.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Vehicle deleted" });
            queryClient.invalidateQueries({ queryKey: ["listVehicles"] });
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err.error || "Failed to delete vehicle", variant: "destructive" });
          }
        }
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Available</Badge>;
      case "on_trip": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">On Trip</Badge>;
      case "maintenance": return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Maintenance</Badge>;
      case "retired": return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Retired</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fleet Registry</h2>
          <p className="text-muted-foreground">Manage vehicles, capacities, and acquisition data.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search registration or name..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="on_trip">On Trip</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="truck">Truck</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions?.map(r => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Registration</TableHead>
                  <TableHead>Name / Model</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Odometer</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Loading vehicles...</TableCell>
                  </TableRow>
                ) : vehicles?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">No vehicles found.</TableCell>
                  </TableRow>
                ) : (
                  vehicles?.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium font-mono">{vehicle.registrationNumber}</TableCell>
                      <TableCell>{vehicle.name}</TableCell>
                      <TableCell className="capitalize">{vehicle.type}</TableCell>
                      <TableCell>{vehicle.maxLoadCapacity} kg</TableCell>
                      <TableCell>{vehicle.odometer.toLocaleString()} km</TableCell>
                      <TableCell>{vehicle.region}</TableCell>
                      <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(vehicle)}>
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(vehicle.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Registration Number</FormLabel>
                      <FormControl>
                        <Input placeholder="XYZ-1234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name / Model</FormLabel>
                      <FormControl>
                        <Input placeholder="Ford Transit 250" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="truck">Truck</SelectItem>
                          <SelectItem value="van">Van</SelectItem>
                          <SelectItem value="car">Car</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="region"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Region</FormLabel>
                      <FormControl>
                        <Input placeholder="North, East, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="maxLoadCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity (kg)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="odometer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Odometer (km)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acquisitionCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createVehicle.isPending || updateVehicle.isPending}>
                  {createVehicle.isPending || updateVehicle.isPending ? "Saving..." : "Save Vehicle"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
