import { useState } from "react";
import { 
  useGetDashboardSummary, 
  useGetRecentActivity, 
  useListRegions,
  getGetDashboardSummaryQueryKey,
  getGetRecentActivityQueryKey
} from "@workspace/api-client-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Truck, 
  Wrench, 
  Map, 
  Users, 
  Activity, 
  AlertTriangle,
  Clock,
  CheckCircle2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const [region, setRegion] = useState<string>("all");
  const [vehicleType, setVehicleType] = useState<string>("all");

  const { data: regions } = useListRegions();
  
  const params = {
    ...(region !== "all" ? { region } : {}),
    ...(vehicleType !== "all" ? { vehicleType } : {}),
  };

  const { data: summary, isLoading: isLoadingSummary } = useGetDashboardSummary(params, { 
    query: { refetchInterval: 30000, queryKey: getGetDashboardSummaryQueryKey(params) } 
  });
  
  const { data: activity, isLoading: isLoadingActivity } = useGetRecentActivity({
    query: { refetchInterval: 30000, queryKey: getGetRecentActivityQueryKey() }
  });

  return (
    <div className="flex-1 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of fleet operations and status.</p>
        </div>
        
        <div className="flex gap-2">
          <Select value={vehicleType} onValueChange={setVehicleType}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="All Vehicles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              <SelectItem value="truck">Trucks</SelectItem>
              <SelectItem value="van">Vans</SelectItem>
              <SelectItem value="car">Cars</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[140px] bg-background">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regions?.map((r) => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoadingSummary ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-muted-foreground">Available Vehicles</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{summary?.availableVehicles || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Ready for dispatch</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-muted-foreground">Active Vehicles</CardTitle>
              <Truck className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{summary?.activeVehicles || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently on trips</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-muted-foreground">In Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{summary?.vehiclesInMaintenance || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Out of service</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-muted-foreground">Fleet Utilization</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{summary?.fleetUtilization || 0}%</div>
              <p className="text-xs text-muted-foreground mt-1">Active / Total (usable)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-muted-foreground">Active Trips</CardTitle>
              <Map className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{summary?.activeTrips || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Trips in progress</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-muted-foreground">Pending Trips</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{summary?.pendingTrips || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting dispatch</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-muted-foreground">Drivers On Duty</CardTitle>
              <Users className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{summary?.driversOnDuty || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Currently driving</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-bold text-muted-foreground">Expiring Licenses</CardTitle>
              <AlertTriangle className={`h-4 w-4 ${summary?.expiringLicenses ? "text-red-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-extrabold tracking-tight text-foreground">{summary?.expiringLicenses || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events across your fleet operations.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingActivity ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-2 w-2 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-full max-w-[400px]" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : activity?.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              No recent activity found.
            </div>
          ) : (
            <div className="space-y-6">
              {activity?.map((entry) => (
                <div key={entry.id} className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-sm font-medium leading-none">
                      {entry.type === "trip_dispatched" ? "Trip Dispatched" : 
                       entry.type === "trip_completed" ? "Trip Completed" : 
                       entry.type === "maintenance_started" ? "Maintenance Started" : 
                       entry.type === "maintenance_completed" ? "Maintenance Completed" :
                       entry.type.replace('_', ' ')}
                    </span>
                    <Badge variant="outline" className="text-[10px] h-5 ml-auto">
                      {formatDistanceToNow(new Date(entry.timestamp), { addSuffix: true })}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground pl-4">
                    {entry.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
