import { Router, type IRouter } from "express";
import { and, eq } from "drizzle-orm";
import { db, expensesTable, type Expense } from "@workspace/db";
import {
  CreateExpenseBody,
  CreateExpenseResponse,
  ListExpensesResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

function serialize(e: Expense) {
  return {
    id: e.id,
    vehicleId: e.vehicleId,
    category: e.category,
    amount: Number(e.amount),
    date: e.date,
    description: e.description,
    createdAt: e.createdAt.toISOString(),
  };
}

router.get("/expenses", requireAuth, async (req, res) => {
  const { vehicleId, category } = req.query as Record<string, string | undefined>;
  const conditions = [];
  if (vehicleId) conditions.push(eq(expensesTable.vehicleId, Number(vehicleId)));
  if (category) conditions.push(eq(expensesTable.category, category as never));
  const rows = await db
    .select()
    .from(expensesTable)
    .where(conditions.length ? and(...conditions) : undefined);
  res.json(ListExpensesResponse.parse(rows.map(serialize)));
});

router.post("/expenses", requireAuth, async (req, res) => {
  const body = CreateExpenseBody.parse(req.body);
  const [{ id }] = await db
    .insert(expensesTable)
    .values({
      vehicleId: body.vehicleId,
      category: body.category,
      amount: String(body.amount),
      date: body.date,
      description: body.description,
    })
    .$returningId();
  const [created] = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.id, id))
    .limit(1);
  res.status(201).json(CreateExpenseResponse.parse(serialize(created)));
});

router.delete("/expenses/:id", requireAuth, async (req, res) => {
  const [deleted] = await db
    .select()
    .from(expensesTable)
    .where(eq(expensesTable.id, Number(req.params.id)))
    .limit(1);
  if (!deleted) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }
  await db
    .delete(expensesTable)
    .where(eq(expensesTable.id, Number(req.params.id)));
  res.status(204).end();
});

export default router;
