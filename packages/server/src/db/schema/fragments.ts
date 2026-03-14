import {
  pgTable,
  uuid,
  varchar,
  text,
  smallint,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { fragmentContentTypeEnum } from "./enums.js";
import { users } from "./users.js";
import { devices } from "./devices.js";

export const fragments = pgTable(
  "fragments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceId: uuid("device_id").references(() => devices.id, {
      onDelete: "set null",
    }),

    // Content (raw_content is immutable after write)
    rawContent: text("raw_content").notNull(),
    contentType: fragmentContentTypeEnum("content_type")
      .notNull()
      .default("text"),
    contentHash: varchar("content_hash", { length: 64 }),
    normalizedContent: text("normalized_content"),

    // Source tracking
    inputSource: varchar("input_source", { length: 50 })
      .notNull()
      .default("inbox"),
    inputDevice: varchar("input_device", { length: 50 }),
    sourceApp: varchar("source_app", { length: 100 }),
    sourceRef: varchar("source_ref", { length: 500 }),

    // AI processing
    status: varchar("status", { length: 20 }).notNull().default("pending"),
    processingAttempts: smallint("processing_attempts").notNull().default(0),
    lastError: text("last_error"),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),

    // Context
    locale: varchar("locale", { length: 10 }),
    timezone: varchar("timezone", { length: 50 }),
    location: jsonb("location"),
    clientContext: jsonb("client_context").notNull().default({}),

    // Organization
    parentId: uuid("parent_id"),
    isPinned: boolean("is_pinned").notNull().default(false),
    isArchived: boolean("is_archived").notNull().default(false),

    metadata: jsonb("metadata").notNull().default({}),

    version: integer("version").notNull().default(1),

    capturedAt: timestamp("captured_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),

    ftsContent: text("fts_content"),
  },
  (t) => [
    check(
      "fragments_input_source_check",
      sql`${t.inputSource} IN (
        'cmd_k', 'inbox', 'voice', 'wechat', 'slack', 'telegram',
        'email', 'chrome_ext', 'api', 'import', 'shortcut', 'share_sheet',
        'web_capture_bar'
      )`,
    ),
    check(
      "fragments_status_check",
      sql`${t.status} IN ('pending', 'processing', 'processed', 'confirmed', 'rejected', 'failed')`,
    ),
    uniqueIndex("idx_frag_source_ref")
      .on(t.sourceRef)
      .where(sql`${t.sourceRef} IS NOT NULL`),
    index("idx_frag_user_status")
      .on(t.userId, t.status)
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_frag_user_time")
      .on(t.userId, t.capturedAt)
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_frag_content_hash")
      .on(t.contentHash)
      .where(sql`${t.contentHash} IS NOT NULL`),
    index("idx_frag_parent")
      .on(t.parentId)
      .where(sql`${t.parentId} IS NOT NULL`),
    index("idx_frag_device")
      .on(t.deviceId)
      .where(sql`${t.deviceId} IS NOT NULL`),
  ],
);
