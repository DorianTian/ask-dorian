import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  unique,
  customType,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { entityTypeEnum } from "./enums.js";
import { users } from "./users.js";

/**
 * pgvector `vector(1536)` custom type for Drizzle ORM.
 * Stored as float[] in JS, serialized as `[0.1,0.2,...]` string for SQL.
 */
const vector = customType<{
  data: number[];
  driverData: string;
  config: { dimensions: number };
}>({
  dataType(config) {
    return `vector(${config?.dimensions ?? 1536})`;
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: string): number[] {
    // postgres returns "[0.1,0.2,...]"
    return value
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map(Number);
  },
});

export const embeddings = pgTable(
  "embeddings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    entityType: entityTypeEnum("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    embedding: vector("embedding", { dimensions: 1536 }).notNull(),
    model: varchar("model", { length: 100 })
      .notNull()
      .default("text-embedding-3-small"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("embeddings_entity_unique").on(t.entityType, t.entityId),
    // HNSW index created via raw SQL migration (Drizzle doesn't support HNSW params natively)
    index("idx_emb_user_entity").on(t.userId, t.entityType),
    index("idx_emb_content_hash").on(t.contentHash),
  ],
);
