import {
  date,
  decimal,
  mysqlTable,
  int,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const driverStatuses = [
  "Available",
  "On Trip",
  "Off Duty",
  "Suspended",
] as const;

export const driversTable = mysqlTable("drivers", {
  id: int("id").primaryKey().autoincrement(),
  name: text("name").notNull(),
  licenseNumber: text("license_number").notNull().unique(),
  licenseCategory: text("license_category").notNull(),
  licenseExpiryDate: date("license_expiry_date").notNull(),
  contactNumber: text("contact_number").notNull(),
  safetyScore: decimal("safety_score", { precision: 5, scale: 2 })
    .notNull()
    .default("100"),
  status: text("status", { enum: driverStatuses })
    .notNull()
    .default("Available"),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertDriverSchema = createInsertSchema(driversTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof driversTable.$inferSelect;
