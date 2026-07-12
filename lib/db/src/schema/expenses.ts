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

export const expenseCategories = [
  "Toll",
  "Insurance",
  "Permit",
  "Other",
] as const;

export const expensesTable = mysqlTable("expenses", {
  id: int("id").primaryKey().autoincrement(),
  vehicleId: int("vehicle_id")
    .notNull()
    .references(() => vehiclesTable.id),
  category: text("category", { enum: expenseCategories }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: date("date").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
});

export const insertExpenseSchema = createInsertSchema(expensesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expensesTable.$inferSelect;
