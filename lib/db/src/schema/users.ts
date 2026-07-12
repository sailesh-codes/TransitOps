import { mysqlTable, int, text, timestamp } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoles = [
  "fleet_manager",
  "driver",
  "safety_officer",
  "financial_analyst",
] as const;

export const usersTable = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role", { enum: userRoles }),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  createdAt: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
