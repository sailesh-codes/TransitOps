import {
  int,
  decimal,
  mysqlTable,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";
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

export const tripsTable = mysqlTable("trips", {
  id: int("id").primaryKey().autoincrement(),
  source: text("source").notNull(),
  destination: text("destination").notNull(),
  vehicleId: int("vehicle_id")
    .notNull()
    .references(() => vehiclesTable.id),
  driverId: int("driver_id")
    .notNull()
    .references(() => driversTable.id),
  cargoWeight: decimal("cargo_weight", { precision: 10, scale: 2 }).notNull(),
  plannedDistance: decimal("planned_distance", {
    precision: 10,
    scale: 2,
  }).notNull(),
  status: text("status", { enum: tripStatuses }).notNull().default("Draft"),
  actualDistance: decimal("actual_distance", { precision: 10, scale: 2 }),
  fuelConsumed: decimal("fuel_consumed", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
  dispatchedAt: timestamp("dispatched_at"),
  completedAt: timestamp("completed_at"),
  cancelledAt: timestamp("cancelled_at"),
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
