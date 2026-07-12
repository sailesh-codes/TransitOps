import {
  date,
  int,
  decimal,
  mysqlTable,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { vehiclesTable } from "./vehicles";
import { tripsTable } from "./trips";

export const fuelLogsTable = mysqlTable("fuel_logs", {
  id: int("id").primaryKey().autoincrement(),
  vehicleId: int("vehicle_id")
    .notNull()
    .references(() => vehiclesTable.id),
  tripId: int("trip_id").references(() => tripsTable.id),
  liters: decimal("liters", { precision: 10, scale: 2 }).notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

export const insertFuelLogSchema = createInsertSchema(fuelLogsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertFuelLog = z.infer<typeof insertFuelLogSchema>;
export type FuelLog = typeof fuelLogsTable.$inferSelect;
