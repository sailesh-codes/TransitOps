import { useState } from "react";
import { 
  useListDrivers, 
  useCreateDriver, 
  useUpdateDriver, 
  useDeleteDriver
} from "@workspace/api-client-react";
import { DriverStatus } from "@workspace/api-zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Plus, Search, Edit2, Trash2, AlertTriangle, ShieldAlert } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format, isBefore, addDays } from "date-fns";

const driverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  licenseCategory: z.string().min(1, "License category is required"),
  licenseExpiryDate: z.coerce.date({ required_error: "Expiry date is required" }),
  contactNumber: z.string().min(1, "Contact is required"),
  safetyScore: z.coerce.number().min(0).max(100),
});

export default function Drivers() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<any | null>(null);

  const queryParams = {
    ...(statusFilter !== "all" ? { status: statusFilter as DriverStatus } : {}),
    ...(search ? { search } : {}),
  };
  
  const { data: drivers, isLoading } = useListDrivers(queryParams);
  const createDriver = useCreateDriver();
  const updateDriver = useUpdateDriver();
  const deleteDriver = useDeleteDriver();

  const form = useForm<z.infer<typeof driverSchema>>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: "",
      licenseNumber: "",
      licenseCategory: "",
      licenseExpiryDate: new Date(),
      contactNumber: "",
      safetyScore: 100,
    },
  });

  const openCreateDialog = () => {
    setEditingDriver(null);
    form.reset({
      name: "",
      licenseNumber: "",
      licenseCategory: "",
      licenseExpiryDate: new Date(),
      contactNumber: "",
      safetyScore: 100,
    });
    setIsDialogOpen(true);
  };

  const openEditDialog = (driver: any) => {
    setEditingDriver(driver);
    form.reset({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseCategory: driver.licenseCategory,
      licenseExpiryDate: new Date(driver.licenseExpiryDate),
      contactNumber: driver.contactNumber,
      safetyScore: driver.safetyScore,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (values: z.infer<typeof driverSchema>) => {
    const payload = { ...values, licenseExpiryDate: values.licenseExpiryDate.toISOString() } as any;
    
    if (editingDriver) {
      updateDriver.mutate(
        { id: editingDriver.id, data: payload },
        {
          onSuccess: () => {
            toast({ title: "Driver updated successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["listDrivers"] });
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err.error || "Failed to update driver", variant: "destructive" });
          }
        }
      );
    } else {
      createDriver.mutate(
        { data: payload },
        {
          onSuccess: () => {
            toast({ title: "Driver created successfully" });
            setIsDialogOpen(false);
            queryClient.invalidateQueries({ queryKey: ["listDrivers"] });
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err.error || "Failed to create driver", variant: "destructive" });
          }
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this driver?")) {
      deleteDriver.mutate(
        { id },
        {
          onSuccess: () => {
            toast({ title: "Driver deleted" });
            queryClient.invalidateQueries({ queryKey: ["listDrivers"] });
          },
          onError: (err: any) => {
            toast({ title: "Error", description: err.error || "Failed to delete driver", variant: "destructive" });
          }
        }
      );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available": return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Available</Badge>;
      case "On Trip": return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">On Duty</Badge>;
      case "Off Duty": return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Off Duty</Badge>;
      case "Suspended": return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Suspended</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getLicenseWarning = (expiryDate: string | Date) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = addDays(today, 30);
    
    if (isBefore(expiry, today)) {
      return <Badge variant="destructive" className="ml-2 gap-1 px-1.5"><ShieldAlert className="w-3 h-3"/> Expired</Badge>;
    } else if (isBefore(expiry, thirtyDaysFromNow)) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 ml-2 gap-1 px-1.5"><AlertTriangle className="w-3 h-3"/> Soon</Badge>;
    }
    return null;
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 font-semibold";
    if (score >= 75) return "text-yellow-600 font-medium";
    return "text-red-600 font-bold";
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Drivers</h2>
          <p className="text-muted-foreground">Manage personnel, licenses, and safety scores.</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" /> Add Driver
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name or license..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="On Trip">On Duty / Trip</SelectItem>
                  <SelectItem value="Off Duty">Off Duty</SelectItem>
                  <SelectItem value="Suspended">Suspended</SelectItem>
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
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>License Info</TableHead>
                  <TableHead>Safety Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading drivers...</TableCell>
                  </TableRow>
                ) : drivers?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No drivers found.</TableCell>
                  </TableRow>
                ) : (
                  drivers?.map((driver) => (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">{driver.name}</TableCell>
                      <TableCell>{driver.contactNumber}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="font-mono text-xs mr-2">{driver.licenseNumber}</span>
                          <span className="text-xs text-muted-foreground">({driver.licenseCategory})</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex items-center">
                          Exp: {format(new Date(driver.licenseExpiryDate), "MMM dd, yyyy")}
                          {getLicenseWarning(driver.licenseExpiryDate)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getScoreColor(driver.safetyScore)}>
                          {driver.safetyScore}/100
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(driver.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(driver)}>
                          <Edit2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(driver.id)}>
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
            <DialogTitle>{editingDriver ? "Edit Driver" : "Add Driver"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 555-0123" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input placeholder="DL-12345678" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="licenseCategory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Class/Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Class A, CDL, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="licenseExpiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Expiry</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="safetyScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Safety Score (0-100)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" max="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createDriver.isPending || updateDriver.isPending}>
                  {createDriver.isPending || updateDriver.isPending ? "Saving..." : "Save Driver"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
