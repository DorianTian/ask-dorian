import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { entityTypeEnum } from "./enums.js";
import { users } from "./users.js";
import { devices } from "./devices.js";

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceId: uuid("device_id").references(() => devices.id, {
      onDelete: "set null",
    }),

    type: varchar("type", { length: 50 }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    body: text("body"),
    severity: varchar("severity", { length: 20 }).notNull().default("info"),

    entityType: entityTypeEnum("entity_type"),
    entityId: uuid("entity_id"),

    isRead: boolean("is_read").notNull().default(false),
    readAt: timestamp("read_at", { withTimezone: true }),
    isPushed: boolean("is_pushed").notNull().default(false),
    pushedAt: timestamp("pushed_at", { withTimezone: true }),
    pushChannel: varchar("push_channel", { length: 20 }),

    scheduledAt: timestamp("scheduled_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check(
      "notifications_type_check",
      sql`${t.type} IN (
        'task_due', 'task_overdue', 'event_reminder',
        'fragment_pending', 'ai_completed', 'weekly_review',
        'sync_conflict', 'integration_error', 'system',
        'quota_warning', 'feature_announcement'
      )`,
    ),
    check(
      "notifications_severity_check",
      sql`${t.severity} IN ('info', 'warning', 'urgent')`,
    ),
    index("idx_notif_user_unread")
      .on(t.userId, t.scheduledAt)
      .where(sql`${t.isRead} = FALSE`),
    index("idx_notif_pending_push")
      .on(t.scheduledAt)
      .where(sql`${t.isPushed} = FALSE`),
    index("idx_notif_entity")
      .on(t.entityType, t.entityId)
      .where(sql`${t.entityType} IS NOT NULL`),
  ],
);
