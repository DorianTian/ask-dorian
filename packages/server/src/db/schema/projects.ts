import {
  pgTable,
  uuid,
  varchar,
  text,
  smallint,
  integer,
  date,
  timestamp,
  jsonb,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    name: varchar("name", { length: 200 }).notNull(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    color: varchar("color", { length: 20 }).notNull().default("#6366f1"),
    coverUrl: text("cover_url"),

    status: varchar("status", { length: 20 }).notNull().default("active"),
    goal: text("goal"),
    dueDate: date("due_date"),
    progress: smallint("progress").default(0),

    sortOrder: varchar("sort_order", { length: 255 })
      .notNull()
      .default("0|hzzzzz:"),

    // External integration
    externalId: varchar("external_id", { length: 255 }),
    externalSource: varchar("external_source", { length: 50 }),
    externalUrl: varchar("external_url", { length: 1000 }),
    syncStatus: varchar("sync_status", { length: 20 })
      .notNull()
      .default("local"),
    syncVersion: integer("sync_version").notNull().default(0),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),

    tags: text("tags").array().notNull().default(sql`'{}'`),

    version: integer("version").notNull().default(1),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),

    metadata: jsonb("metadata").notNull().default({}),

    ftsContent: text("fts_content"),
    // fts_vector is a GENERATED ALWAYS column — handled at DB level, not in ORM
  },
  (t) => [
    check(
      "projects_status_check",
      sql`${t.status} IN ('active', 'paused', 'completed', 'archived')`,
    ),
    check(
      "projects_progress_check",
      sql`${t.progress} >= 0 AND ${t.progress} <= 100`,
    ),
    check(
      "projects_sync_status_check",
      sql`${t.syncStatus} IN ('local', 'synced', 'pending', 'conflict', 'error')`,
    ),
    index("idx_project_user_status")
      .on(t.userId, t.status)
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_project_external")
      .on(t.externalSource, t.externalId)
      .where(sql`${t.externalId} IS NOT NULL`),
  ],
);
