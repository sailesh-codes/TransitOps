import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, maintenanceLogsTable, vehiclesTable, type MaintenanceLog } from "@workspace/db";
import {
  CloseMaintenanceLogResponse,
  CreateMaintenanceLogBody,
  CreateMaintenanceLogResponse,
  ListMaintenanceLogsResponse,
  UpdateMaintenanceLogBody,
  UpdateMaintenanceLogResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function serialize(m: MaintenanceLog) {
  return {
    id: m.id,
    vehicleId: m.vehicleId,
    description: m.description,
    cost: Number(m.cost),
    status: m.status,
    startedAt: m.startedAt.toISOString(),
    closedAt: m.closedAt ? m.closedAt.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
  };
}

router.get("/maintenance-logs", requireAuth, async (req, res) => {
  const { vehicleId, status } = req.query as Record<string, string | undefined>;
  const conditions = [];
  if (vehicleId) conditions.push(eq(maintenanceLogsTable.vehicleId, Number(vehicleId)));
  if (status) conditions.push(eq(maintenanceLogsTable.status, status as never));
  const rows = await db
    .select()
    .from(maintenanceLogsTable)
    .where(conditions.length ? and(...conditions) : undefined);
  res.json(ListMaintenanceLogsResponse.parse(rows.map(serialize)));
});

router.post("/maintenance-logs", requireAuth, async (req, res) => {
  const body = CreateMaintenanceLogBody.parse(req.body);

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, body.vehicleId))
    .limit(1);
  if (!vehicle) {
    res.status(400).json({ error: "Vehicle not found" });
    return;
  }
  if (vehicle.status === "Retired") {
    res.status(400).json({ error: "Cannot log maintenance for a retired vehicle" });
    return;
  }

  const [created] = await db
    .insert(maintenanceLogsTable)
    .values({
      vehicleId: body.vehicleId,
      description: body.description,
      cost: String(body.cost),
    })
    .returning();

  await db
    .update(vehiclesTable)
    .set({ status: "In Shop" })
    .where(eq(vehiclesTable.id, body.vehicleId));

  res.status(201).json(CreateMaintenanceLogResponse.parse(serialize(created)));
});

router.patch("/maintenance-logs/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const body = UpdateMaintenanceLogBody.parse(req.body);
  const values: Record<string, unknown> = {};
  if (body.description !== undefined) values.description = body.description;
  if (body.cost !== undefined) values.cost = String(body.cost);

  const [updated] = await db
    .update(maintenanceLogsTable)
    .set(values)
    .where(eq(maintenanceLogsTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Maintenance log not found" });
    return;
  }
  res.json(UpdateMaintenanceLogResponse.parse(serialize(updated)));
});

router.post("/maintenance-logs/:id/close", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [log] = await db
    .select()
    .from(maintenanceLogsTable)
    .where(eq(maintenanceLogsTable.id, id))
    .limit(1);
  if (!log) {
    res.status(404).json({ error: "Maintenance log not found" });
    return;
  }
  if (log.status === "Closed") {
    res.status(400).json({ error: "Maintenance log is already closed" });
    return;
  }

  const [updated] = await db
    .update(maintenanceLogsTable)
    .set({ status: "Closed", closedAt: new Date() })
    .where(eq(maintenanceLogsTable.id, id))
    .returning();

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, log.vehicleId))
    .limit(1);
  if (vehicle && vehicle.status !== "Retired") {
    await db
      .update(vehiclesTable)
      .set({ status: "Available" })
      .where(eq(vehiclesTable.id, log.vehicleId));
  }

  res.json(CloseMaintenanceLogResponse.parse(serialize(updated)));
});

export default router;
