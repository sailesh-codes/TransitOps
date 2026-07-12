import { drizzle } from "drizzle-orm/mysql2";
import type { MySql2Database } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to initialize the database.");
}

const pool = mysql.createPool(databaseUrl);
const db: MySql2Database<typeof schema> = drizzle(pool, {
  schema,
  mode: "default",
});

export { pool, db };
export * from "./schema";
