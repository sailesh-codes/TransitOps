import { Router, type IRouter } from "express";
import {
  db,
  vehiclesTable,
  tripsTable,
  fuelLogsTable,
  maintenanceLogsTable,
  expensesTable,
} from "@workspace/db";
import {
  GetVehicleCostReportResponse,
  ListRegionsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

async function buildReport() {
  const vehicles = await db.select().from(vehiclesTable);
  const trips = await db.select().from(tripsTable);
  const fuelLogs = await db.select().from(fuelLogsTable);
  const maintenanceLogs = await db.select().from(maintenanceLogsTable);
  const expenses = await db.select().from(expensesTable);

  return vehicles.map((v) => {
    const vTrips = trips.filter((t) => t.vehicleId === v.id && t.status === "Completed");
    const totalDistance = vTrips.reduce(
      (sum, t) => sum + Number(t.actualDistance ?? 0),
      0,
    );
    const vFuelLogs = fuelLogs.filter((f) => f.vehicleId === v.id);
    const totalFuelLiters = vFuelLogs.reduce((sum, f) => sum + Number(f.liters), 0);
    const fuelCost = vFuelLogs.reduce((sum, f) => sum + Number(f.cost), 0);
    const maintenanceCost = maintenanceLogs
      .filter((m) => m.vehicleId === v.id)
      .reduce((sum, m) => sum + Number(m.cost), 0);
    const expenseCost = expenses
      .filter((e) => e.vehicleId === v.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const totalOperationalCost = fuelCost + maintenanceCost + expenseCost;
    const fuelEfficiency = totalFuelLiters > 0 ? totalDistance / totalFuelLiters : null;
    // Revenue proxy: distance-based earnings estimate, standard fleet-industry rate per km.
    const revenue = totalDistance * 2;
    const roi =
      Number(v.acquisitionCost) > 0
        ? ((revenue - totalOperationalCost) / Number(v.acquisitionCost)) * 100
        : null;

    return {
      vehicleId: v.id,
      registrationNumber: v.registrationNumber,
      name: v.name,
      totalDistance,
      totalFuelLiters,
      fuelEfficiency: fuelEfficiency === null ? null : Math.round(fuelEfficiency * 100) / 100,
      fuelCost: Math.round(fuelCost * 100) / 100,
      maintenanceCost: Math.round(maintenanceCost * 100) / 100,
      expenseCost: Math.round(expenseCost * 100) / 100,
      totalOperationalCost: Math.round(totalOperationalCost * 100) / 100,
      revenue: Math.round(revenue * 100) / 100,
      roi: roi === null ? null : Math.round(roi * 100) / 100,
    };
  });
}

router.get("/reports/vehicle-costs", requireAuth, async (_req, res) => {
  const rows = await buildReport();
  res.json(GetVehicleCostReportResponse.parse(rows));
});

router.get("/reports/vehicle-costs/export", requireAuth, async (_req, res) => {
  const rows = await buildReport();
  const headers = [
    "Vehicle ID",
    "Registration Number",
    "Name",
    "Total Distance",
    "Total Fuel Liters",
    "Fuel Efficiency (km/L)",
    "Fuel Cost",
    "Maintenance Cost",
    "Expense Cost",
    "Total Operational Cost",
    "Revenue",
    "ROI (%)",
  ];
  const lines = [
    headers.join(","),
    ...rows.map((r) =>
      [
        r.vehicleId,
        r.registrationNumber,
        `"${r.name.replace(/"/g, '""')}"`,
        r.totalDistance,
        r.totalFuelLiters,
        r.fuelEfficiency ?? "",
        r.fuelCost,
        r.maintenanceCost,
        r.expenseCost,
        r.totalOperationalCost,
        r.revenue,
        r.roi ?? "",
      ].join(","),
    ),
  ];
  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    "attachment; filename=vehicle-cost-report.csv",
  );
  res.send(lines.join("\n"));
});

router.get("/reports/regions", requireAuth, async (_req, res) => {
  const vehicles = await db.select().from(vehiclesTable);
  const regions = Array.from(new Set(vehicles.map((v) => v.region))).sort();
  res.json(ListRegionsResponse.parse(regions));
});

export default router;
