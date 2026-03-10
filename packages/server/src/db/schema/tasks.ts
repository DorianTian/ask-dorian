import {
  pgTable,
  uuid,
  varchar,
  text,
  smallint,
  integer,
  date,
  time,
  boolean,
  timestamp,
  jsonb,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { taskStatusEnum, taskPriorityEnum, energyLevelEnum } from "./enums.js";
import { users } from "./users.js";
import { projects } from "./projects.js";

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    parentId: uuid("parent_id"),

    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    checklist: jsonb("checklist").notNull().default([]),

    status: taskStatusEnum("status").notNull().default("todo"),
    priority: taskPriorityEnum("priority").notNull().default("none"),
    energyLevel: energyLevelEnum("energy_level"),

    // Time planning
    startDate: date("start_date"),
    dueDate: date("due_date"),
    dueTime: time("due_time", { withTimezone: true }),
    scheduledDate: date("scheduled_date"),
    scheduledStart: timestamp("scheduled_start", { withTimezone: true }),
    scheduledEnd: timestamp("scheduled_end", { withTimezone: true }),

    estimatedMinutes: smallint("estimated_minutes"),
    actualMinutes: smallint("actual_minutes"),

    // Recurrence
    isRecurring: boolean("is_recurring").notNull().default(false),
    recurrenceRule: varchar("recurrence_rule", { length: 255 }),
    recurrenceParentId: uuid("recurrence_parent_id"),

    sortOrder: varchar("sort_order", { length: 255 })
      .notNull()
      .default("0|hzzzzz:"),
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

    // Collaboration
    assigneeId: uuid("assignee_id").references(() => users.id, {
      onDelete: "set null",
    }),
    creatorId: uuid("creator_id").references(() => users.id, {
      onDelete: "set null",
    }),

    version: integer("version").notNull().default(1),

    completedAt: timestamp("completed_at", { withTimezone: true }),
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
      "tasks_source_check",
      sql`${t.source} IN ('manual', 'ai_generated', 'imported', 'recurring', 'template')`,
    ),
    check(
      "tasks_sync_status_check",
      sql`${t.syncStatus} IN ('local', 'synced', 'pending', 'conflict', 'error')`,
    ),
    index("idx_task_user_status")
      .on(t.userId, t.status)
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_task_user_scheduled")
      .on(t.userId, t.scheduledDate)
      .where(
        sql`${t.deletedAt} IS NULL AND ${t.status} NOT IN ('done', 'cancelled', 'archived')`,
      ),
    index("idx_task_user_due")
      .on(t.userId, t.dueDate)
      .where(sql`${t.deletedAt} IS NULL AND ${t.dueDate} IS NOT NULL`),
    index("idx_task_project")
      .on(t.projectId)
      .where(sql`${t.projectId} IS NOT NULL AND ${t.deletedAt} IS NULL`),
    index("idx_task_parent")
      .on(t.parentId)
      .where(sql`${t.parentId} IS NOT NULL`),
    index("idx_task_external")
      .on(t.externalSource, t.externalId)
      .where(sql`${t.externalId} IS NOT NULL`),
  ],
);
