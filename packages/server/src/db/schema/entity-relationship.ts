import {
  pgTable,
  uuid,
  varchar,
  real,
  timestamp,
  jsonb,
  primaryKey,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { entityTypeEnum, relationTypeEnum } from "./enums.js";

export const entityRelationship = pgTable(
  "entity_relationship",
  {
    fromId: uuid("from_id").notNull(),
    fromEntity: entityTypeEnum("from_entity").notNull(),
    toId: uuid("to_id").notNull(),
    toEntity: entityTypeEnum("to_entity").notNull(),
    relation: relationTypeEnum("relation").notNull(),

    confidence: real("confidence"),
    createdBy: varchar("created_by", { length: 20 })
      .notNull()
      .default("system"),
    metadata: jsonb("metadata").notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.fromId, t.toId, t.relation] }),
    check(
      "er_created_by_check",
      sql`${t.createdBy} IN ('user', 'ai', 'sync', 'system')`,
    ),
    check(
      "er_no_self_loop",
      sql`${t.fromId} != ${t.toId} OR ${t.relation} = 'duplicate_of'`,
    ),
    index("idx_er_from").on(t.fromId, t.fromEntity, t.relation),
    index("idx_er_to").on(t.toId, t.toEntity, t.relation),
    index("idx_er_type_relation").on(t.fromEntity, t.relation),
  ],
);
