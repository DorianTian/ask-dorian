import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  jsonb,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";
import { projects } from "./projects.js";

export const knowledge = pgTable(
  "knowledge",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),

    title: varchar("title", { length: 500 }).notNull(),
    content: text("content").notNull(),
    type: varchar("type", { length: 30 }).notNull().default("note"),
    summary: text("summary"),
    sourceUrl: varchar("source_url", { length: 1000 }),
    sourceTitle: varchar("source_title", { length: 500 }),

    tags: text("tags").array().notNull().default(sql`'{}'`),

    source: varchar("source", { length: 20 }).notNull().default("manual"),

    // External integration
    externalId: varchar("external_id", { length: 255 }),
    externalSource: varchar("external_source", { length: 50 }),
    externalUrl: varchar("external_url", { length: 1000 }),
    syncStatus: varchar("sync_status", { length: 20 })
      .notNull()
      .default("local"),
    syncVersion: integer("sync_version").notNull().default(0),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),

    version: integer("version").notNull().default(1),
    lastEditedBy: uuid("last_edited_by").references(() => users.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),

    metadata: jsonb("metadata").notNull().default({}),
    ftsContent: text("fts_content"),
  },
  (t) => [
    check(
      "knowledge_type_check",
      sql`${t.type} IN ('note', 'meeting_note', 'decision', 'reference', 'summary', 'snippet', 'insight')`,
    ),
    check(
      "knowledge_source_check",
      sql`${t.source} IN ('manual', 'ai_generated', 'imported')`,
    ),
    check(
      "knowledge_sync_status_check",
      sql`${t.syncStatus} IN ('local', 'synced', 'pending', 'conflict', 'error')`,
    ),
    index("idx_knowledge_user")
      .on(t.userId, t.type)
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_knowledge_project")
      .on(t.projectId)
      .where(sql`${t.projectId} IS NOT NULL AND ${t.deletedAt} IS NULL`),
  ],
);
