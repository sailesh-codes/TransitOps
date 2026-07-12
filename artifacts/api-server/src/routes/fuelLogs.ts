import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, fuelLogsTable, type FuelLog } from "@workspace/db";
import {
  CreateFuelLogBody,
  CreateFuelLogResponse,
  ListFuelLogsResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

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
  const [{ id }] = await db
    .insert(fuelLogsTable)
    .values({
      vehicleId: body.vehicleId,
      tripId: body.tripId,
      liters: String(body.liters),
      cost: String(body.cost),
      date: body.date,
    })
    .$returningId();
  const [created] = await db
    .select()
    .from(fuelLogsTable)
    .where(eq(fuelLogsTable.id, id))
    .limit(1);
  res.status(201).json(CreateFuelLogResponse.parse(serialize(created)));
});

router.delete("/fuel-logs/:id", requireAuth, async (req, res) => {
  const [deleted] = await db
    .select()
    .from(fuelLogsTable)
    .where(eq(fuelLogsTable.id, Number(req.params.id)))
    .limit(1);
  if (!deleted) {
    res.status(404).json({ error: "Fuel log not found" });
    return;
  }
  await db
    .delete(fuelLogsTable)
    .where(eq(fuelLogsTable.id, Number(req.params.id)));
  res.status(204).end();
});

export default router;
