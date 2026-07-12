import {
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { vehiclesTable } from "./vehicles";
import { driversTable } from "./drivers";

export const tripStatuses = [
  "Draft",
  "Dispatched",
  "Completed",
  "Cancelled",
] as const;

export const tripsTable = pgTable("trips", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(),
  destination: text("destination").notNull(),
  vehicleId: integer("vehicle_id")
    .notNull()
    .references(() => vehiclesTable.id),
  driverId: integer("driver_id")
    .notNull()
    .references(() => driversTable.id),
  cargoWeight: numeric("cargo_weight", { precision: 10, scale: 2 }).notNull(),
  plannedDistance: numeric("planned_distance", {
    precision: 10,
    scale: 2,
  }).notNull(),
  status: text("status", { enum: tripStatuses }).notNull().default("Draft"),
  actualDistance: numeric("actual_distance", { precision: 10, scale: 2 }),
  fuelConsumed: numeric("fuel_consumed", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
});

export const insertTripSchema = createInsertSchema(tripsTable).omit({
  id: true,
  createdAt: true,
  status: true,
  actualDistance: true,
  fuelConsumed: true,
  dispatchedAt: true,
  completedAt: true,
  cancelledAt: true,
});
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof tripsTable.$inferSelect;
