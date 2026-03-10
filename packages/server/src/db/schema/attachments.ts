import {
  pgTable,
  uuid,
  varchar,
  text,
  bigint,
  timestamp,
  jsonb,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { entityTypeEnum } from "./enums.js";
import { users } from "./users.js";

export const attachments = pgTable(
  "attachments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    entityType: entityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),

    fileName: varchar("file_name", { length: 500 }).notNull(),
    fileType: varchar("file_type", { length: 100 }).notNull(),
    fileSize: bigint("file_size", { mode: "number" }).notNull(),
    storageKey: varchar("storage_key", { length: 1000 }).notNull(),
    storageProvider: varchar("storage_provider", { length: 20 })
      .notNull()
      .default("s3"),
    thumbnailKey: varchar("thumbnail_key", { length: 1000 }),

    metadata: jsonb("metadata").notNull().default({}),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    check(
      "attachments_storage_provider_check",
      sql`${t.storageProvider} IN ('s3', 'local')`,
    ),
    index("idx_attach_entity")
      .on(t.entityType, t.entityId)
      .where(sql`${t.deletedAt} IS NULL`),
    index("idx_attach_user")
      .on(t.userId, t.createdAt)
      .where(sql`${t.deletedAt} IS NULL`),
  ],
);
