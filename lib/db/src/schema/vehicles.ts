import {
  decimal,
  mysqlTable,
  int,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vehicleStatuses = [
  "Available",
  "On Trip",
  "In Shop",
  "Retired",
] as const;

export const vehiclesTable = mysqlTable("vehicles", {
  id: int("id").primaryKey().autoincrement(),
  registrationNumber: text("registration_number").notNull().unique(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  maxLoadCapacity: decimal("max_load_capacity", {
    precision: 10,
    scale: 2,
  }).notNull(),
  odometer: decimal("odometer", { precision: 12, scale: 2 })
    .notNull()
    .default("0"),
  acquisitionCost: decimal("acquisition_cost", {
    precision: 12,
    scale: 2,
  }).notNull(),
  status: text("status", { enum: vehicleStatuses })
    .notNull()
    .default("Available"),
  region: text("region").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertVehicleSchema = createInsertSchema(vehiclesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehiclesTable.$inferSelect;
