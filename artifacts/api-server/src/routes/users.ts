import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable, userRoles } from "@workspace/db";
import {
  GetCurrentUserResponse,
  ListUsersResponse,
  SetMyRoleBody,
  SetMyRoleResponse,
  UpdateUserRoleBody,
  UpdateUserRoleResponse,
} from "@workspace/api-zod";
import { requireAuth, requireRole, type AuthedRequest } from "../middlewares/auth";

const router: IRouter = Router();

function serializeUser(u: {
  id: number;
  clerkUserId: string;
  email: string;
  name: string;
  role: string | null;
  createdAt: Date;
}) {
  return {
    id: u.id,
    clerkUserId: u.clerkUserId,
    email: u.email,
    name: u.name,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  };
}

router.get("/users/me", requireAuth, (req: AuthedRequest, res) => {
  const data = GetCurrentUserResponse.parse(serializeUser(req.localUser!));
  res.json(data);
});

router.patch("/users/me/role", requireAuth, async (req: AuthedRequest, res) => {
  if (req.localUser!.role) {
    res.status(403).json({ error: "Role has already been set" });
    return;
  }
  const body = SetMyRoleBody.parse(req.body);
  if (!userRoles.includes(body.role as (typeof userRoles)[number])) {
    res.status(400).json({ error: "Invalid role" });
    return;
  }
  const [updated] = await db
    .update(usersTable)
    .set({ role: body.role })
    .where(eq(usersTable.id, req.localUser!.id))
    .returning();
  const data = SetMyRoleResponse.parse(serializeUser(updated));
  res.json(data);
});

router.get(
  "/users",
  requireAuth,
  requireRole("fleet_manager"),
  async (_req, res) => {
    const rows = await db.select().from(usersTable);
    const data = ListUsersResponse.parse(rows.map(serializeUser));
    res.json(data);
  },
);

router.patch(
  "/users/:id/role",
  requireAuth,
  requireRole("fleet_manager"),
  async (req, res) => {
    const id = Number(req.params.id);
    const body = UpdateUserRoleBody.parse(req.body);
    if (!userRoles.includes(body.role as (typeof userRoles)[number])) {
      res.status(400).json({ error: "Invalid role" });
      return;
    }
    const [updated] = await db
      .update(usersTable)
      .set({ role: body.role })
      .where(eq(usersTable.id, id))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const data = UpdateUserRoleResponse.parse(serializeUser(updated));
    res.json(data);
  },
);

export default router;
