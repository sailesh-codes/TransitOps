import { Router, type IRouter } from "express";
import { and, eq, ilike, or } from "drizzle-orm";
import { db, driversTable, type Driver } from "@workspace/db";
import {
  CreateDriverBody,
  CreateDriverResponse,
  GetDriverResponse,
  ListDriversResponse,
  UpdateDriverBody,
  UpdateDriverResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function toDateOnly(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function serialize(d: Driver) {
  return {
    id: d.id,
    name: d.name,
    licenseNumber: d.licenseNumber,
    licenseCategory: d.licenseCategory,
    licenseExpiryDate: d.licenseExpiryDate,
    contactNumber: d.contactNumber,
    safetyScore: Number(d.safetyScore),
    status: d.status,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

router.get("/drivers", requireAuth, async (req, res) => {
  const { status, search } = req.query as Record<string, string | undefined>;
  const conditions = [];
  if (status) conditions.push(eq(driversTable.status, status as never));
  if (search) {
    conditions.push(
      or(
        ilike(driversTable.name, `%${search}%`),
        ilike(driversTable.licenseNumber, `%${search}%`),
      ),
    );
  }
  const rows = await db
    .select()
    .from(driversTable)
    .where(conditions.length ? and(...conditions) : undefined);
  res.json(ListDriversResponse.parse(rows.map(serialize)));
});

router.post("/drivers", requireAuth, async (req, res) => {
  const body = CreateDriverBody.parse(req.body);

  const [existing] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.licenseNumber, body.licenseNumber))
    .limit(1);
  if (existing) {
    res.status(400).json({ error: "License number already exists" });
    return;
  }

  const [created] = await db
    .insert(driversTable)
    .values({
      name: body.name,
      licenseNumber: body.licenseNumber,
      licenseCategory: body.licenseCategory,
      licenseExpiryDate: toDateOnly(body.licenseExpiryDate),
      contactNumber: body.contactNumber,
      safetyScore: String(body.safetyScore ?? 100),
    })
    .returning();
  res.status(201).json(CreateDriverResponse.parse(serialize(created)));
});

router.get("/drivers/:id", requireAuth, async (req, res) => {
  const [driver] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.id, Number(req.params.id)))
    .limit(1);
  if (!driver) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  res.json(GetDriverResponse.parse(serialize(driver)));
});

router.patch("/drivers/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const body = UpdateDriverBody.parse(req.body);

  if (body.licenseNumber) {
    const [existing] = await db
      .select()
      .from(driversTable)
      .where(eq(driversTable.licenseNumber, body.licenseNumber))
      .limit(1);
    if (existing && existing.id !== id) {
      res.status(400).json({ error: "License number already exists" });
      return;
    }
  }

  const values: Record<string, unknown> = {};
  if (body.name !== undefined) values.name = body.name;
  if (body.licenseNumber !== undefined) values.licenseNumber = body.licenseNumber;
  if (body.licenseCategory !== undefined)
    values.licenseCategory = body.licenseCategory;
  if (body.licenseExpiryDate !== undefined)
    values.licenseExpiryDate = toDateOnly(body.licenseExpiryDate);
  if (body.contactNumber !== undefined) values.contactNumber = body.contactNumber;
  if (body.safetyScore !== undefined) values.safetyScore = String(body.safetyScore);
  if (body.status !== undefined) values.status = body.status;

  const [updated] = await db
    .update(driversTable)
    .set(values)
    .where(eq(driversTable.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  res.json(UpdateDriverResponse.parse(serialize(updated)));
});

router.delete("/drivers/:id", requireAuth, async (req, res) => {
  const [deleted] = await db
    .delete(driversTable)
    .where(eq(driversTable.id, Number(req.params.id)))
    .returning();
  if (!deleted) {
    res.status(404).json({ error: "Driver not found" });
    return;
  }
  res.status(204).end();
});

export default router;
