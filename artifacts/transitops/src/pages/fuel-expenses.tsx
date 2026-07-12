import { useState } from "react";
import { 
  useListFuelLogs, 
  useCreateFuelLog, 
  useDeleteFuelLog,
  useListExpenses,
  useCreateExpense,
  useDeleteExpense,
  useListVehicles,
  useListTrips
} from "@workspace/api-client-react";
import { ExpenseCategory } from "@workspace/api-zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Trash2, Droplets, Receipt } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

const fuelLogSchema = z.object({
  vehicleId: z.coerce.number().min(1, "Vehicle is required"),
  tripId: z.coerce.number().optional().nullable(),
  liters: z.coerce.number().min(0.1, "Liters required"),
  cost: z.coerce.number().min(0.1, "Cost required"),
  date: z.coerce.date({ required_error: "Date required" }),
});

const expenseSchema = z.object({
  vehicleId: z.coerce.number().min(1, "Vehicle is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().min(0.1, "Amount required"),
  date: z.coerce.date({ required_error: "Date required" }),
  description: z.string().min(1, "Description is required"),
});

export default function FuelExpenses() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("fuel");
  
  const [isFuelDialogOpen, setIsFuelDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  const queryParams = vehicleFilter !== "all" ? { vehicleId: parseInt(vehicleFilter) } : {};
  
  const { data: vehicles } = useListVehicles();
  const { data: trips } = useListTrips();
  
  const { data: fuelLogs, isLoading: isLoadingFuel } = useListFuelLogs(queryParams);
  const { data: expenses, isLoading: isLoadingExpenses } = useListExpenses(queryParams);

  const createFuelLog = useCreateFuelLog();
  const deleteFuelLog = useDeleteFuelLog();
  const createExpense = useCreateExpense();
  const deleteExpense = useDeleteExpense();

  const fuelForm = useForm<z.infer<typeof fuelLogSchema>>({
    resolver: zodResolver(fuelLogSchema),
    defaultValues: { vehicleId: 0, liters: 0, cost: 0, date: new Date() },
  });

  const expenseForm = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: { vehicleId: 0, category: "", amount: 0, description: "", date: new Date() },
  });

  const onFuelSubmit = (values: z.infer<typeof fuelLogSchema>) => {
    const payload = { 
      ...values, 
      date: values.date.toISOString(),
      tripId: values.tripId || undefined 
    } as any;
    
    createFuelLog.mutate({ data: payload }, {
      onSuccess: () => {
        toast({ title: "Fuel log added" });
        setIsFuelDialogOpen(false);
        fuelForm.reset();
        queryClient.invalidateQueries({ queryKey: ["listFuelLogs"] });
      },
      onError: (err: any) => toast({ title: "Error", description: err.error, variant: "destructive" })
    });
  };

  const onExpenseSubmit = (values: z.infer<typeof expenseSchema>) => {
    const payload = { 
      ...values, 
      category: values.category as ExpenseCategory,
      date: values.date.toISOString() 
    } as any;
    
    createExpense.mutate({ data: payload }, {
      onSuccess: () => {
        toast({ title: "Expense added" });
        setIsExpenseDialogOpen(false);
        expenseForm.reset();
        queryClient.invalidateQueries({ queryKey: ["listExpenses"] });
      },
      onError: (err: any) => toast({ title: "Error", description: err.error, variant: "destructive" })
    });
  };

  const handleDeleteFuel = (id: number) => {
    if (confirm("Delete this fuel log?")) {
      deleteFuelLog.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Deleted" });
          queryClient.invalidateQueries({ queryKey: ["listFuelLogs"] });
        }
      });
    }
  };

  const handleDeleteExpense = (id: number) => {
    if (confirm("Delete this expense?")) {
      deleteExpense.mutate({ id }, {
        onSuccess: () => {
          toast({ title: "Deleted" });
          queryClient.invalidateQueries({ queryKey: ["listExpenses"] });
        }
      });
    }
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Fuel & Expenses</h2>
          <p className="text-muted-foreground">Log refueling and operational expenditures.</p>
        </div>
        <div className="flex gap-2">
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="w-[180px] bg-background">
              <SelectValue placeholder="Filter by Vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              {vehicles?.map(v => (
                <SelectItem key={v.id} value={v.id.toString()}>{v.registrationNumber}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="fuel" className="flex items-center gap-2"><Droplets className="w-4 h-4" /> Fuel Logs</TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2"><Receipt className="w-4 h-4" /> Other Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="fuel" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Fuel Logs</CardTitle>
                <CardDescription>Track refueling events and fuel costs.</CardDescription>
              </div>
              <Button onClick={() => setIsFuelDialogOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Fuel Log
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Vehicle ID</TableHead>
                      <TableHead>Trip ID</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingFuel ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : fuelLogs?.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No fuel logs found.</TableCell></TableRow>
                    ) : (
                      fuelLogs?.map(log => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm text-muted-foreground">{format(new Date(log.date), "MMM dd, yyyy")}</TableCell>
                          <TableCell className="font-medium">V-{log.vehicleId}</TableCell>
                          <TableCell className="text-muted-foreground">{log.tripId ? `T-${log.tripId}` : "-"}</TableCell>
                          <TableCell>{log.liters} L</TableCell>
                          <TableCell>₹{log.cost.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteFuel(log.id)}>
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
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Other Expenses</CardTitle>
                <CardDescription>Track insurance, tolls, permits, and miscellaneous costs.</CardDescription>
              </div>
              <Button onClick={() => setIsExpenseDialogOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-1" /> Add Expense
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Vehicle ID</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingExpenses ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">Loading...</TableCell></TableRow>
                    ) : expenses?.length === 0 ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-6 text-muted-foreground">No expenses found.</TableCell></TableRow>
                    ) : (
                      expenses?.map(exp => (
                        <TableRow key={exp.id}>
                          <TableCell className="text-sm text-muted-foreground">{format(new Date(exp.date), "MMM dd, yyyy")}</TableCell>
                          <TableCell className="font-medium">V-{exp.vehicleId}</TableCell>
                          <TableCell className="capitalize">{exp.category.replace('_', ' ')}</TableCell>
                          <TableCell className="max-w-[200px] truncate" title={exp.description}>{exp.description}</TableCell>
                          <TableCell>₹{exp.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteExpense(exp.id)}>
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
        </TabsContent>
      </Tabs>

      {/* Fuel Log Dialog */}
      <Dialog open={isFuelDialogOpen} onOpenChange={setIsFuelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Fuel Log</DialogTitle>
          </DialogHeader>
          <Form {...fuelForm}>
            <form onSubmit={fuelForm.handleSubmit(onFuelSubmit)} className="space-y-4">
              <FormField
                control={fuelForm.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {vehicles?.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.registrationNumber}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={fuelForm.control}
                name="tripId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trip (Optional)</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val === "0" ? null : parseInt(val))} value={field.value?.toString() || "0"}>
                      <FormControl><SelectTrigger><SelectValue placeholder="None" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="0">None</SelectItem>
                        {trips?.map(t => <SelectItem key={t.id} value={t.id.toString()}>T-{t.id} ({t.source} to {t.destination})</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={fuelForm.control}
                  name="liters"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Volume (Liters)</FormLabel>
                      <FormControl><Input type="number" step="0.1" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={fuelForm.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost (₹)</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={fuelForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsFuelDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createFuelLog.isPending}>{createFuelLog.isPending ? "Saving..." : "Save Log"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <Form {...expenseForm}>
            <form onSubmit={expenseForm.handleSubmit(onExpenseSubmit)} className="space-y-4">
              <FormField
                control={expenseForm.control}
                name="vehicleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vehicle</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? field.value.toString() : ""}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select vehicle" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {vehicles?.map(v => <SelectItem key={v.id} value={v.id.toString()}>{v.registrationNumber}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={expenseForm.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="toll">Toll</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="permit">Permit</SelectItem>
                        <SelectItem value="cleaning">Cleaning</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={expenseForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Input placeholder="Bridge toll, monthly insurance..." {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={expenseForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={expenseForm.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" value={field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""} onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createExpense.isPending}>{createExpense.isPending ? "Saving..." : "Save Expense"}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
