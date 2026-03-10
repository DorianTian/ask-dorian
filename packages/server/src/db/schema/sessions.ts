import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  inet,
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";
import { devices } from "./devices.js";

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceId: uuid("device_id").references(() => devices.id, {
      onDelete: "set null",
    }),

    refreshTokenHash: varchar("refresh_token_hash", { length: 64 }).notNull(),
    previousTokenHash: varchar("previous_token_hash", { length: 64 }),
    ipAddress: inet("ip_address"),
    userAgent: text("user_agent"),

    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_session_user")
      .on(t.userId)
      .where(sql`${t.revokedAt} IS NULL`),
    index("idx_session_token")
      .on(t.refreshTokenHash)
      .where(sql`${t.revokedAt} IS NULL`),
    index("idx_session_prev_token")
      .on(t.previousTokenHash)
      .where(
        sql`${t.previousTokenHash} IS NOT NULL AND ${t.revokedAt} IS NULL`,
      ),
    index("idx_session_device")
      .on(t.deviceId)
      .where(sql`${t.revokedAt} IS NULL`),
    index("idx_session_cleanup")
      .on(t.expiresAt)
      .where(sql`${t.revokedAt} IS NULL`),
  ],
);
