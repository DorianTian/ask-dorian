import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  jsonb,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";

export const devices = pgTable(
  "devices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    deviceName: varchar("device_name", { length: 200 }),
    deviceType: varchar("device_type", { length: 20 }).notNull(),
    platform: varchar("platform", { length: 20 }).notNull(),
    appVersion: varchar("app_version", { length: 50 }),
    osInfo: varchar("os_info", { length: 100 }),
    deviceFingerprint: varchar("device_fingerprint", { length: 255 }),

    // Push
    pushToken: text("push_token"),
    pushProvider: varchar("push_provider", { length: 20 }),
    pushEnabled: boolean("push_enabled").notNull().default(true),

    // Sync
    syncCursor: jsonb("sync_cursor").notNull().default({}),

    isActive: boolean("is_active").notNull().default(true),
    lastActiveAt: timestamp("last_active_at", { withTimezone: true })
      .notNull()
      .defaultNow(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_device_unique")
      .on(t.userId, t.platform, t.deviceFingerprint)
      .where(sql`${t.deviceFingerprint} IS NOT NULL`),
    index("idx_device_user")
      .on(t.userId)
      .where(sql`${t.isActive} = TRUE`),
    index("idx_device_push")
      .on(t.pushProvider)
      .where(
        sql`${t.pushToken} IS NOT NULL AND ${t.pushEnabled} = TRUE`,
      ),
  ],
);
