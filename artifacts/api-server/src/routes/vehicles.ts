import { Router, type IRouter } from "express";
import { and, eq, ilike, or } from "drizzle-orm";
import { db, vehiclesTable, type Vehicle } from "@workspace/db";
import {
  CreateVehicleBody,
  CreateVehicleResponse,
  GetVehicleResponse,
  ListVehiclesResponse,
  UpdateVehicleBody,
  UpdateVehicleResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function serialize(v: Vehicle) {
  return {
    id: v.id,
    registrationNumber: v.registrationNumber,
    name: v.name,
    type: v.type,
    maxLoadCapacity: Number(v.maxLoadCapacity),
    odometer: Number(v.odometer),
    acquisitionCost: Number(v.acquisitionCost),
    status: v.status,
    region: v.region,
    createdAt: v.createdAt.toISOString(),
    updatedAt: v.updatedAt.toISOString(),
  };
}

router.get("/vehicles", requireAuth, async (req, res) => {
  const { type, status, region, search } = req.query as Record<
    string,
    string | undefined
  >;
  const conditions = [];
  if (type) conditions.push(eq(vehiclesTable.type, type));
  if (status) conditions.push(eq(vehiclesTable.status, status as never));
  if (region) conditions.push(eq(vehiclesTable.region, region));
  if (search) {
    conditions.push(
      or(
        ilike(vehiclesTable.name, `%${search}%`),
        ilike(vehiclesTable.registrationNumber, `%${search}%`),
      ),
    );
  }
  const rows = await db
    .select()
    .from(vehiclesTable)
    .where(conditions.length ? and(...conditions) : undefined);
  res.json(ListVehiclesResponse.parse(rows.map(serialize)));
});

router.post("/vehicles", requireAuth, async (req, res) => {
  const body = CreateVehicleBody.parse(req.body);

  const [existing] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.registrationNumber, body.registrationNumber))
    .limit(1);
  if (existing) {
    res.status(400).json({ error: "Registration number already exists" });
    return;
  }

  const [created] = await db
    .insert(vehiclesTable)
    .values({
      registrationNumber: body.registrationNumber,
      name: body.name,
      type: body.type,
      maxLoadCapacity: String(body.maxLoadCapacity),
      odometer: String(body.odometer ?? 0),
      acquisitionCost: String(body.acquisitionCost),
      region: body.region,
    })
    .returning();
  res.status(201).json(CreateVehicleResponse.parse(serialize(created)));
});

router.get("/vehicles/:id", requireAuth, async (req, res) => {
  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, Number(req.params.id)))
    .limit(1);
  if (!vehicle) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(GetVehicleResponse.parse(serialize(vehicle)));
});

router.patch("/vehicles/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const body = UpdateVehicleBody.parse(req.body);

  if (body.registrationNumber) {
    const [existing] = await db
      .select()
      .from(vehiclesTable)
      .where(eq(vehiclesTable.registrationNumber, body.registrationNumber))
      .limit(1);
    if (existing && existing.id !== id) {
      res.status(400).json({ error: "Registration number already exists" });
      return;
    }
  }

  const values: Record<string, unknown> = {};
  if (body.registrationNumber !== undefined)
    values.registrationNumber = body.registrationNumber;
  if (body.name !== undefined) values.name = body.name;
  if (body.type !== undefined) values.type = body.type;
  if (body.maxLoadCapacity !== undefined)
    values.maxLoadCapacity = String(body.maxLoadCapacity);
  if (body.odometer !== undefined) values.odometer = String(body.odometer);
  if (body.acquisitionCost !== undefined)
    values.acquisitionCost = String(body.acquisitionCost);
  if (body.region !== undefined) values.region = body.region;
  if (body.status !== undefined) values.status = body.status;

  const [updated] = await db
    .update(vehiclesTable)
    .set(values)
    .where(eq(vehiclesTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.json(UpdateVehicleResponse.parse(serialize(updated)));
});

router.delete("/vehicles/:id", requireAuth, async (req, res) => {
  const [deleted] = await db
    .delete(vehiclesTable)
    .where(eq(vehiclesTable.id, Number(req.params.id)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Vehicle not found" });
    return;
  }
  res.status(204).end();
});

export default router;
