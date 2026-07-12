import { useState } from "react";
import { 
  useGetVehicleCostReport, 
  useExportVehicleCostReport,
  getExportVehicleCostReportQueryKey
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, BarChart3, TrendingUp, TrendingDown, Clock, Activity, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, AreaChart, Area, XAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, type ChartConfig } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

// Chart configs
const trendConfig = {
  revenue: { label: "Revenue", color: "#10b981" }, // Emerald 500
  cost: { label: "Total Cost", color: "#3b82f6" }, // Blue 500
} satisfies ChartConfig;

const expenseConfig = {
  fuel: { label: "Fuel", color: "#3b82f6" },
  maintenance: { label: "Maintenance", color: "#10b981" },
  other: { label: "Other", color: "#8b5cf6" },
} satisfies ChartConfig;

// Custom SVG Progress Ring Component
function ProgressRing({ value, label, color, sublabel }: { value: number, label: string, color: string, sublabel: string }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center w-28 h-28">
        <svg className="w-full h-full transform -rotate-90 drop-shadow-sm">
          <circle cx="56" cy="56" r={radius} stroke="currentColor" strokeWidth="10" fill="transparent" className="text-slate-100" />
          <circle 
            cx="56" cy="56" r={radius} stroke={color} strokeWidth="10" fill="transparent" 
            strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" className="transition-all duration-1000 ease-out" 
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-slate-800">{value}%</span>
        </div>
      </div>
      <span className="text-sm font-bold text-slate-700 mt-3 tracking-wide">{label}</span>
      <span className="text-xs font-medium text-slate-400 mt-0.5">{sublabel}</span>
    </div>
  );
}

export default function Reports() {
  const { toast } = useToast();
  const { data: reportRows, isLoading } = useGetVehicleCostReport();
  
  const { refetch: fetchExport, isFetching: isExporting } = useExportVehicleCostReport({
    query: { enabled: false, queryKey: getExportVehicleCostReportQueryKey() }
  });

  const handleExport = async () => {
    try {
      const result = await fetchExport();
      if (result.data) {
        const blob = new Blob([result.data as any], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vehicle-cost-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast({ title: "Export downloaded successfully" });
      }
    } catch (err) {
      toast({ title: "Export Failed", description: "Could not generate CSV", variant: "destructive" });
    }
  };

  const totals = reportRows?.reduce((acc, row) => ({
    revenue: acc.revenue + row.revenue,
    cost: acc.cost + row.totalOperationalCost,
    distance: acc.distance + row.totalDistance,
  }), { revenue: 0, cost: 0, distance: 0 });

  const profitMargin = totals && totals.revenue > 0 ? ((totals.revenue - totals.cost) / totals.revenue) * 100 : 0;
  
  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto w-full pb-8 pt-2">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-md shadow-blue-500/20">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800 uppercase">Maintenance Costs & Analytics</h2>
            <p className="text-slate-500 text-sm font-medium mt-1 tracking-wide">
              Global Asset Overview <span className="text-slate-300 mx-2">|</span> Real-Time Data <span className="text-slate-300 mx-2">|</span> {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => window.print()} variant="outline" className="shadow-sm rounded-xl font-semibold px-6 hover:bg-slate-50">
            Export PDF
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-xl font-semibold px-6">
            <Download className="mr-2 h-4 w-4" /> 
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {/* Top Metric Cards (4 columns) */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-3xl border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
              Total Revenue
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 tracking-tight">
              ₹{totals?.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}
            </div>
            <p className="text-xs text-emerald-700 font-bold mt-2 flex items-center bg-emerald-100 w-fit px-2.5 py-0.5 rounded-full">
              +12.5% <span className="text-slate-500 font-medium ml-1">vs last month</span>
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-3xl border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
              Total Maintenance Cost
              <TrendingDown className="h-4 w-4 text-blue-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 tracking-tight">
              ₹{totals?.cost.toLocaleString(undefined, { maximumFractionDigits: 0 }) || 0}
            </div>
            <p className="text-xs text-red-600 font-bold mt-2 flex items-center bg-red-50 w-fit px-2.5 py-0.5 rounded-full">
              +5.2% <span className="text-slate-500 font-medium ml-1">vs last month</span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
              Profit Margin (ROI)
              <Activity className="h-4 w-4 text-amber-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 tracking-tight flex items-baseline gap-1">
              {profitMargin.toFixed(1)}<span className="text-xl">%</span>
            </div>
            <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, profitMargin))}%` }}></div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
              Active Vehicles
              <AlertCircle className="h-4 w-4 text-purple-400" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 tracking-tight">
              {reportRows?.length || 0}
            </div>
            <p className="text-xs text-slate-500 font-bold mt-2 flex items-center bg-slate-100 w-fit px-2.5 py-0.5 rounded-full">
              Currently operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Trend Chart (Wide) */}
      <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 px-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-bold text-slate-800 tracking-tight">Maintenance Costs Trend</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white hover:bg-slate-50 text-slate-600 border-slate-200 cursor-pointer font-semibold shadow-sm">By Vehicle</Badge>
              <Badge variant="outline" className="bg-white hover:bg-slate-50 text-slate-600 border-slate-200 cursor-pointer font-semibold shadow-sm">All Time</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8 px-2 pb-6">
          <ChartContainer config={trendConfig} className="min-h-[350px] w-full">
            <AreaChart data={reportRows} margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.0}/>
                </linearGradient>
                <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-cost)" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="var(--color-cost)" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e2e8f0" />
              <XAxis dataKey="registrationNumber" tickLine={false} tickMargin={12} axisLine={false} tick={{fill: '#64748b', fontWeight: 600, fontSize: 12}} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
              <ChartLegend content={<ChartLegendContent />} className="mt-4 font-semibold text-slate-700" />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="var(--color-revenue)" strokeWidth={4} fillOpacity={1} fill="url(#fillRevenue)" activeDot={{ r: 8, strokeWidth: 0, fill: "var(--color-revenue)" }} />
              <Area type="monotone" dataKey="totalOperationalCost" name="cost" stroke="var(--color-cost)" strokeWidth={4} fillOpacity={1} fill="url(#fillCost)" activeDot={{ r: 8, strokeWidth: 0, fill: "var(--color-cost)" }} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Bottom Grid (3 Columns) */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cost Breakdown */}
        <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden lg:col-span-1">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 px-6">
            <CardTitle className="text-base font-bold text-slate-800 tracking-tight">Monthly Cost Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-8 px-2 pb-6">
            <ChartContainer config={expenseConfig} className="min-h-[250px] w-full">
              <BarChart data={reportRows?.slice(0, 5)} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="4 4" stroke="#e2e8f0" />
                <XAxis dataKey="registrationNumber" tickLine={false} tickMargin={12} axisLine={false} tick={{fill: '#64748b', fontWeight: 600, fontSize: 11}} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
                <Bar dataKey="fuelCost" name="fuel" stackId="a" fill="var(--color-fuel)" radius={[0, 0, 6, 6]} barSize={28} />
                <Bar dataKey="maintenanceCost" name="maintenance" stackId="a" fill="var(--color-maintenance)" barSize={28} />
                <Bar dataKey="expenseCost" name="other" stackId="a" fill="var(--color-other)" radius={[6, 6, 0, 0]} barSize={28} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden lg:col-span-1 flex flex-col">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 px-6">
            <CardTitle className="text-base font-bold text-slate-800 tracking-tight">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="pt-10 pb-8 flex-1 flex flex-row items-center justify-around">
            <ProgressRing value={98.6} label="Uptime" sublabel="Fleet Availability" color="#10b981" />
            <ProgressRing value={89.0} label="Efficiency" sublabel="Cost to Revenue" color="#3b82f6" />
          </CardContent>
        </Card>

        {/* Recent Incidents / Cost Report Mini */}
        <Card className="rounded-3xl border-slate-200/60 shadow-sm overflow-hidden lg:col-span-1 flex flex-col">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4 px-6">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-bold text-slate-800 tracking-tight">Recent Incidents</CardTitle>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600"><AlertCircle className="h-5 w-5" /></Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-transparent">
                <TableRow className="hover:bg-transparent border-b-slate-100">
                  <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider h-10 px-6">Asset ID</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider h-10 text-right">Cost</TableHead>
                  <TableHead className="text-xs font-bold text-slate-500 uppercase tracking-wider h-10 text-right px-6">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportRows?.slice(0, 5).map(row => (
                  <TableRow key={row.vehicleId} className="border-b-slate-50 hover:bg-slate-50/50">
                    <TableCell className="font-bold text-slate-800 text-sm px-6 py-3.5 font-mono">{row.registrationNumber}</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-slate-600 py-3.5">₹{row.totalOperationalCost.toLocaleString(undefined, {maximumFractionDigits: 0})}</TableCell>
                    <TableCell className="text-right px-6 py-3.5">
                      {row.roi && row.roi > 0 ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm font-bold tracking-wide">Positive</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 shadow-sm font-bold tracking-wide">Active</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
