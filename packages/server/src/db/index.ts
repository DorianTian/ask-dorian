import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import * as schema from "./schema/index.js";

const queryClient = postgres(env.DATABASE_URL, {
  max: env.NODE_ENV === "production" ? 20 : 5,
  idle_timeout: 20,
  connect_timeout: 10,
  max_lifetime: 60 * 30, // 30 min
  onnotice: () => {}, // suppress notices
});

export const db = drizzle(queryClient, { schema });

/** Verify DB connectivity — used by health check and startup */
export async function checkDbConnection(): Promise<boolean> {
  try {
    await queryClient`SELECT 1`;
    return true;
  } catch (err) {
    logger.error({ err }, "Database connection check failed");
    return false;
  }
}

/** Gracefully close DB pool */
export async function closeDb(): Promise<void> {
  logger.info("Closing database connections...");
  await queryClient.end({ timeout: 5 });
  logger.info("Database connections closed");
}
