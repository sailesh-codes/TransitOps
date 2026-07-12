import type { NextFunction, Request, Response } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { db, usersTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";

export interface AuthedRequest extends Request {
  userId?: string;
  localUser?: User;
}

/**
 * Requires a valid Clerk session. Also ensures a local `users` row exists
 * for the Clerk user (just-in-time provisioning), attaching it as
 * `req.localUser`.
 */
export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
) {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.userId = userId;

  try {
    let [localUser] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerkUserId, userId))
      .limit(1);

    if (!localUser) {
      const clerkUser = await clerkClient.users.getUser(userId);
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        email ||
        "New user";

      await db
        .insert(usersTable)
        .values({ clerkUserId: userId, email, name, role: null })
        .onDuplicateKeyUpdate({ set: { email, name } });

      localUser =
        (
          await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.clerkUserId, userId))
            .limit(1)
        )[0];
    }

    req.localUser = localUser;
    next();
  } catch (err) {
    next(err);
  }
}

/** Requires the local user to have one of the given roles. Call after requireAuth. */
export function requireRole(...roles: string[]) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const role = req.localUser?.role;
    if (!role || !roles.includes(role)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
