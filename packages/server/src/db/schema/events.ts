import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";
import { projects } from "./projects.js";
import { tasks } from "./tasks.js";

export const events = pgTable(
  "events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    projectId: uuid("project_id").references(() => projects.id, {
      onDelete: "set null",
    }),
    taskId: uuid("task_id").references(() => tasks.id, {
      onDelete: "set null",
    }),

    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    type: varchar("type", { length: 20 }).notNull().default("other"),
    color: varchar("color", { length: 20 }),

    status: varchar("status", { length: 20 }).notNull().default("confirmed"),
    visibility: varchar("visibility", { length: 20 })
      .notNull()
      .default("default"),
    busyStatus: varchar("busy_status", { length: 20 })
      .notNull()
      .default("busy"),

    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }),
    isAllDay: boolean("is_all_day").notNull().default(false),
    originalTimezone: varchar("original_timezone", { length: 50 }),

    location: varchar("location", { length: 500 }),
    locationGeo: jsonb("location_geo"),
    conferenceUrl: varchar("conference_url", { length: 1000 }),
    conferenceType: varchar("conference_type", { length: 50 }),

    reminders: jsonb("reminders")
      .notNull()
      .default([{ minutes: 15, method: "push" }]),
    attendees: jsonb("attendees").notNull().default([]),
    organizerId: uuid("organizer_id").references(() => users.id, {
      onDelete: "set null",
    }),

    // Recurrence
    isRecurring: boolean("is_recurring").notNull().default(false),
    recurrenceRule: varchar("recurrence_rule", { length: 255 }),
    recurrenceParentId: uuid("recurrence_parent_id"),
    recurrenceException: boolean("recurrence_exception")
      .notNull()
      .default(false),

    source: varchar("source", { length: 20 }).notNull().default("manual"),

    // External integration
    externalId: varchar("external_id", { length: 255 }),
    externalSource: varchar("external_source", { length: 50 }),
    externalCalendarId: varchar("external_calendar_id", { length: 255 }),
    externalUrl: varchar("external_url", { length: 1000 }),
    icalUid: varchar("ical_uid", { length: 500 }),
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
  },
  (t) => [
    check(
      "events_type_check",
      sql`${t.type} IN ('meeting', 'focus', 'reminder', 'deadline', 'personal', 'travel', 'break', 'other')`,
    ),
    check(
      "events_status_check",
      sql`${t.status} IN ('tentative', 'confirmed', 'cancelled')`,
    ),
    check(
      "events_visibility_check",
      sql`${t.visibility} IN ('default', 'public', 'private')`,
    ),
    check(
      "events_busy_status_check",
      sql`${t.busyStatus} IN ('busy', 'free', 'tentative')`,
    ),
    check(
      "events_source_check",
      sql`${t.source} IN ('manual', 'ai_generated', 'imported', 'recurring', 'timeboxing')`,
    ),
    check(
      "events_sync_status_check",
      sql`${t.syncStatus} IN ('local', 'synced', 'pending', 'conflict', 'error')`,
    ),
    index("idx_event_user_range")
      .on(t.userId, t.startTime, t.endTime)
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_event_user_busy")
      .on(t.userId, t.startTime, t.endTime)
      .where(
        sql`${t.deletedAt} IS NULL AND ${t.status} = 'confirmed' AND ${t.busyStatus} = 'busy'`,
      ),
    index("idx_event_project")
      .on(t.projectId)
      .where(sql`${t.projectId} IS NOT NULL AND ${t.deletedAt} IS NULL`),
    index("idx_event_task")
      .on(t.taskId)
      .where(sql`${t.taskId} IS NOT NULL`),
    index("idx_event_ical_uid")
      .on(t.icalUid)
      .where(sql`${t.icalUid} IS NOT NULL`),
    index("idx_event_external")
      .on(t.externalSource, t.externalId)
      .where(sql`${t.externalId} IS NOT NULL`),
    index("idx_event_recurring")
      .on(t.recurrenceParentId)
      .where(sql`${t.recurrenceParentId} IS NOT NULL`),
  ],
);
