import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  tripsTable,
  vehiclesTable,
  driversTable,
  type Trip,
} from "@workspace/db";
import {
  CancelTripResponse,
  CompleteTripBody,
  CompleteTripResponse,
  CreateTripBody,
  CreateTripResponse,
  DispatchTripResponse,
  GetTripResponse,
  ListTripsResponse,
  UpdateTripBody,
  UpdateTripResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function serialize(t: Trip) {
  return {
    id: t.id,
    source: t.source,
    destination: t.destination,
    vehicleId: t.vehicleId,
    driverId: t.driverId,
    cargoWeight: Number(t.cargoWeight),
    plannedDistance: Number(t.plannedDistance),
    status: t.status,
    actualDistance: t.actualDistance === null ? null : Number(t.actualDistance),
    fuelConsumed: t.fuelConsumed === null ? null : Number(t.fuelConsumed),
    createdAt: t.createdAt.toISOString(),
    dispatchedAt: t.dispatchedAt ? t.dispatchedAt.toISOString() : null,
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    cancelledAt: t.cancelledAt ? t.cancelledAt.toISOString() : null,
  };
}

router.get("/trips", requireAuth, async (req, res) => {
  const { status } = req.query as Record<string, string | undefined>;
  const rows = status
    ? await db
        .select()
        .from(tripsTable)
        .where(eq(tripsTable.status, status as never))
    : await db.select().from(tripsTable);
  res.json(ListTripsResponse.parse(rows.map(serialize)));
});

router.post("/trips", requireAuth, async (req, res) => {
  const body = CreateTripBody.parse(req.body);

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, body.vehicleId))
    .limit(1);
  if (!vehicle) {
    res.status(400).json({ error: "Vehicle not found" });
    return;
  }
  const [driver] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.id, body.driverId))
    .limit(1);
  if (!driver) {
    res.status(400).json({ error: "Driver not found" });
    return;
  }
  if (body.cargoWeight > Number(vehicle.maxLoadCapacity)) {
    res
      .status(400)
      .json({ error: "Cargo weight exceeds vehicle's max load capacity" });
    return;
  }

  const [created] = await db
    .insert(tripsTable)
    .values({
      source: body.source,
      destination: body.destination,
      vehicleId: body.vehicleId,
      driverId: body.driverId,
      cargoWeight: String(body.cargoWeight),
      plannedDistance: String(body.plannedDistance),
    })
    .returning();
  res.status(201).json(CreateTripResponse.parse(serialize(created)));
});

router.get("/trips/:id", requireAuth, async (req, res) => {
  const [trip] = await db
    .select()
    .from(tripsTable)
    .where(eq(tripsTable.id, Number(req.params.id)))
    .limit(1);
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  res.json(GetTripResponse.parse(serialize(trip)));
});

router.patch("/trips/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const body = UpdateTripBody.parse(req.body);

  const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, id)).limit(1);
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  if (trip.status !== "Draft") {
    res.status(400).json({ error: "Only draft trips can be edited" });
    return;
  }

  const vehicleId = body.vehicleId ?? trip.vehicleId;
  const cargoWeight = body.cargoWeight ?? Number(trip.cargoWeight);
  if (body.vehicleId !== undefined || body.cargoWeight !== undefined) {
    const [vehicle] = await db
      .select()
      .from(vehiclesTable)
      .where(eq(vehiclesTable.id, vehicleId))
      .limit(1);
    if (!vehicle) {
      res.status(400).json({ error: "Vehicle not found" });
      return;
    }
    if (cargoWeight > Number(vehicle.maxLoadCapacity)) {
      res
        .status(400)
        .json({ error: "Cargo weight exceeds vehicle's max load capacity" });
      return;
    }
  }

  const values: Record<string, unknown> = {};
  if (body.source !== undefined) values.source = body.source;
  if (body.destination !== undefined) values.destination = body.destination;
  if (body.vehicleId !== undefined) values.vehicleId = body.vehicleId;
  if (body.driverId !== undefined) values.driverId = body.driverId;
  if (body.cargoWeight !== undefined) values.cargoWeight = String(body.cargoWeight);
  if (body.plannedDistance !== undefined)
    values.plannedDistance = String(body.plannedDistance);

  const [updated] = await db
    .update(tripsTable)
    .set(values)
    .where(eq(tripsTable.id, id))
    .returning();
  res.json(UpdateTripResponse.parse(serialize(updated)));
});

router.delete("/trips/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, id)).limit(1);
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  if (trip.status !== "Draft") {
    res.status(400).json({ error: "Only draft trips can be deleted" });
    return;
  }
  await db.delete(tripsTable).where(eq(tripsTable.id, id));
  res.status(204).end();
});

router.post("/trips/:id/dispatch", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, id)).limit(1);
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  if (trip.status !== "Draft") {
    res.status(400).json({ error: "Only draft trips can be dispatched" });
    return;
  }

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, trip.vehicleId))
    .limit(1);
  const [driver] = await db
    .select()
    .from(driversTable)
    .where(eq(driversTable.id, trip.driverId))
    .limit(1);
  if (!vehicle || !driver) {
    res.status(400).json({ error: "Vehicle or driver no longer exists" });
    return;
  }
  if (vehicle.status !== "Available") {
    res
      .status(400)
      .json({ error: `Vehicle is not available (status: ${vehicle.status})` });
    return;
  }
  if (driver.status !== "Available") {
    res
      .status(400)
      .json({ error: `Driver is not available (status: ${driver.status})` });
    return;
  }
  if (new Date(driver.licenseExpiryDate) < new Date()) {
    res.status(400).json({ error: "Driver's license has expired" });
    return;
  }
  if (Number(trip.cargoWeight) > Number(vehicle.maxLoadCapacity)) {
    res
      .status(400)
      .json({ error: "Cargo weight exceeds vehicle's max load capacity" });
    return;
  }

  const [updated] = await db
    .update(tripsTable)
    .set({ status: "Dispatched", dispatchedAt: new Date() })
    .where(eq(tripsTable.id, id))
    .returning();
  await db
    .update(vehiclesTable)
    .set({ status: "On Trip" })
    .where(eq(vehiclesTable.id, trip.vehicleId));
  await db
    .update(driversTable)
    .set({ status: "On Trip" })
    .where(eq(driversTable.id, trip.driverId));

  res.json(DispatchTripResponse.parse(serialize(updated)));
});

router.post("/trips/:id/complete", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const body = CompleteTripBody.parse(req.body);
  const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, id)).limit(1);
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  if (trip.status !== "Dispatched") {
    res.status(400).json({ error: "Only dispatched trips can be completed" });
    return;
  }

  const [vehicle] = await db
    .select()
    .from(vehiclesTable)
    .where(eq(vehiclesTable.id, trip.vehicleId))
    .limit(1);
  const actualDistance = vehicle
    ? Math.max(0, body.finalOdometer - Number(vehicle.odometer))
    : 0;

  const [updated] = await db
    .update(tripsTable)
    .set({
      status: "Completed",
      completedAt: new Date(),
      actualDistance: String(actualDistance),
      fuelConsumed: String(body.fuelConsumed),
    })
    .where(eq(tripsTable.id, id))
    .returning();

  await db
    .update(vehiclesTable)
    .set({ status: "Available", odometer: String(body.finalOdometer) })
    .where(eq(vehiclesTable.id, trip.vehicleId));
  await db
    .update(driversTable)
    .set({ status: "Available" })
    .where(eq(driversTable.id, trip.driverId));

  res.json(CompleteTripResponse.parse(serialize(updated)));
});

router.post("/trips/:id/cancel", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, id)).limit(1);
  if (!trip) {
    res.status(404).json({ error: "Trip not found" });
    return;
  }
  if (trip.status !== "Dispatched" && trip.status !== "Draft") {
    res
      .status(400)
      .json({ error: "Only draft or dispatched trips can be cancelled" });
    return;
  }

  const [updated] = await db
    .update(tripsTable)
    .set({ status: "Cancelled", cancelledAt: new Date() })
    .where(eq(tripsTable.id, id))
    .returning();

  if (trip.status === "Dispatched") {
    const [vehicle] = await db
      .select()
      .from(vehiclesTable)
      .where(eq(vehiclesTable.id, trip.vehicleId))
      .limit(1);
    if (vehicle && vehicle.status === "On Trip") {
      await db
        .update(vehiclesTable)
        .set({ status: "Available" })
        .where(eq(vehiclesTable.id, trip.vehicleId));
    }
    const [driver] = await db
      .select()
      .from(driversTable)
      .where(eq(driversTable.id, trip.driverId))
      .limit(1);
    if (driver && driver.status === "On Trip") {
      await db
        .update(driversTable)
        .set({ status: "Available" })
        .where(eq(driversTable.id, trip.driverId));
    }
  }

  res.json(CancelTripResponse.parse(serialize(updated)));
});

export default router;
