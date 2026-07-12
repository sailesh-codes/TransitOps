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

export const maintenanceStatuses = ["Open", "Closed"] as const;

export const maintenanceLogsTable = pgTable("maintenance_logs", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id")
    .notNull()
    .references(() => vehiclesTable.id),
  description: text("description").notNull(),
  cost: numeric("cost", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: maintenanceStatuses })
    .notNull()
    .default("Open"),
  startedAt: timestamp("started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertMaintenanceLogSchema = createInsertSchema(
  maintenanceLogsTable,
).omit({
  id: true,
  createdAt: true,
  status: true,
  startedAt: true,
  closedAt: true,
});
export type InsertMaintenanceLog = z.infer<typeof insertMaintenanceLogSchema>;
export type MaintenanceLog = typeof maintenanceLogsTable.$inferSelect;
