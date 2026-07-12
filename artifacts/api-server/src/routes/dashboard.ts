import { Router, type IRouter } from "express";
import { and, eq, sql } from "drizzle-orm";
import {
  db,
  vehiclesTable,
  driversTable,
  tripsTable,
  maintenanceLogsTable,
} from "@workspace/db";
import {
  GetDashboardSummaryResponse,
  GetRecentActivityResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/dashboard/summary", requireAuth, async (req, res) => {
  const { type, status, region } = req.query as Record<string, string | undefined>;
  const conditions = [];
  if (type) conditions.push(eq(vehiclesTable.type, type));
  if (status) conditions.push(eq(vehiclesTable.status, status as never));
  if (region) conditions.push(eq(vehiclesTable.region, region));
  const where = conditions.length ? and(...conditions) : undefined;

  const vehicles = await db.select().from(vehiclesTable).where(where);
  const drivers = await db.select().from(driversTable);
  const trips = await db.select().from(tripsTable);

  const vehicleIds = new Set(vehicles.map((v) => v.id));
  const activeVehicles = vehicles.filter((v) => v.status !== "Retired").length;
  const availableVehicles = vehicles.filter((v) => v.status === "Available").length;
  const vehiclesInMaintenance = vehicles.filter((v) => v.status === "In Shop").length;
  const retiredVehicles = vehicles.filter((v) => v.status === "Retired").length;
  const activeTrips = trips.filter(
    (t) => t.status === "Dispatched" && vehicleIds.has(t.vehicleId),
  ).length;
  const pendingTrips = trips.filter(
    (t) => t.status === "Draft" && vehicleIds.has(t.vehicleId),
  ).length;
  const driversOnDuty = drivers.filter((d) => d.status === "On Trip").length;
  const fleetUtilization =
    vehicles.length > 0
      ? (vehicles.filter((v) => v.status === "On Trip").length / vehicles.length) * 100
      : 0;
  const expiringSoon = new Date();
  expiringSoon.setDate(expiringSoon.getDate() + 30);
  const expiringLicenses = drivers.filter(
    (d) => new Date(d.licenseExpiryDate) <= expiringSoon,
  ).length;

  const data = GetDashboardSummaryResponse.parse({
    activeVehicles,
    availableVehicles,
    vehiclesInMaintenance,
    retiredVehicles,
    activeTrips,
    pendingTrips,
    driversOnDuty,
    fleetUtilization: Math.round(fleetUtilization * 100) / 100,
    expiringLicenses,
  });
  res.json(data);
});

router.get("/dashboard/recent-activity", requireAuth, async (_req, res) => {
  const trips = await db.select().from(tripsTable);
  const maintenance = await db.select().from(maintenanceLogsTable);

  const entries = [
    ...trips
      .filter((t) => t.status !== "Draft")
      .map((t) => ({
        id: `trip-${t.id}-${t.status}`,
        type: "trip",
        message: `Trip #${t.id} (${t.source} to ${t.destination}) is ${t.status.toLowerCase()}`,
        timestamp: (
          t.cancelledAt ??
          t.completedAt ??
          t.dispatchedAt ??
          t.createdAt
        ).toISOString(),
      })),
    ...maintenance.map((m) => ({
      id: `maintenance-${m.id}-${m.status}`,
      type: "maintenance",
      message: `Maintenance #${m.id} for vehicle #${m.vehicleId} is ${m.status.toLowerCase()}`,
      timestamp: (m.closedAt ?? m.startedAt).toISOString(),
    })),
  ]
    .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1))
    .slice(0, 20);

  res.json(GetRecentActivityResponse.parse(entries));
});

export default router;
