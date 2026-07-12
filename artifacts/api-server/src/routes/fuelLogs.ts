import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, fuelLogsTable, type FuelLog } from "@workspace/db";
import {
  CreateFuelLogBody,
  CreateFuelLogResponse,
  ListFuelLogsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function serialize(f: FuelLog) {
  return {
    id: f.id,
    vehicleId: f.vehicleId,
    tripId: f.tripId,
    liters: Number(f.liters),
    cost: Number(f.cost),
    date: f.date,
    createdAt: f.createdAt.toISOString(),
  };
}

router.get("/fuel-logs", requireAuth, async (req, res) => {
  const { vehicleId } = req.query as Record<string, string | undefined>;
  const rows = await db
    .select()
    .from(fuelLogsTable)
    .where(vehicleId ? eq(fuelLogsTable.vehicleId, Number(vehicleId)) : undefined);
  res.json(ListFuelLogsResponse.parse(rows.map(serialize)));
});

router.post("/fuel-logs", requireAuth, async (req, res) => {
  const body = CreateFuelLogBody.parse(req.body);
  const [created] = await db
    .insert(fuelLogsTable)
    .values({
      vehicleId: body.vehicleId,
      tripId: body.tripId,
      liters: String(body.liters),
      cost: String(body.cost),
      date: toDateOnly(body.date),
    })
    .returning();
  res.status(201).json(CreateFuelLogResponse.parse(serialize(created)));
});

router.delete("/fuel-logs/:id", requireAuth, async (req, res) => {
  const [deleted] = await db
    .delete(fuelLogsTable)
    .where(eq(fuelLogsTable.id, Number(req.params.id)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Fuel log not found" });
    return;
  }
  res.status(204).end();
});

export default router;
