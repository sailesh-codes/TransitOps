import {
  int,
  decimal,
  mysqlTable,
  text,
  timestamp,
  datetime,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { vehiclesTable } from "./vehicles";

export const maintenanceStatuses = ["Open", "Closed"] as const;

export const maintenanceLogsTable = mysqlTable("maintenance_logs", {
  id: int("id").primaryKey().autoincrement(),
  vehicleId: int("vehicle_id")
    .notNull()
    .references(() => vehiclesTable.id),
  description: text("description").notNull(),
  cost: decimal("cost", { precision: 10, scale: 2 }).notNull(),
  status: text("status", { enum: maintenanceStatuses })
    .notNull()
    .default("Open"),
  startedAt: timestamp("started_at")
    .notNull()
    .defaultNow(),
  closedAt: datetime("closed_at"),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

export const insertMaintenanceLogSchema = z.object({
  vehicleId: z.number(),
  description: z.string(),
  cost: z.number(),
});

export type InsertMaintenanceLog = {
  vehicleId: number;
  description: string;
  cost: number;
};
export type MaintenanceLog = typeof maintenanceLogsTable.$inferSelect;
