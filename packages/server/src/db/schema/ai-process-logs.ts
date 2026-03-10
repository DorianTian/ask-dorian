import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  decimal,
  timestamp,
  jsonb,
  index,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";
import { fragments } from "./fragments.js";

export const aiProcessLogs = pgTable(
  "ai_process_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    fragmentId: uuid("fragment_id").references(() => fragments.id, {
      onDelete: "set null",
    }),

    processType: varchar("process_type", { length: 50 }).notNull(),

    // Input snapshot
    contextSnapshot: jsonb("context_snapshot").notNull(),
    promptSent: jsonb("prompt_sent").notNull(),

    // Output
    aiResponse: jsonb("ai_response").notNull(),
    parsedResult: jsonb("parsed_result"),

    // Model info
    modelUsed: varchar("model_used", { length: 100 }).notNull(),
    modelVersion: varchar("model_version", { length: 50 }),

    // Performance
    inputTokens: integer("input_tokens").notNull(),
    outputTokens: integer("output_tokens").notNull(),
    // total_tokens is GENERATED ALWAYS in SQL; we compute in app layer
    processingTimeMs: integer("processing_time_ms").notNull(),
    embeddingTimeMs: integer("embedding_time_ms"),

    // Status
    status: varchar("status", { length: 20 }).notNull().default("success"),
    errorMessage: text("error_message"),

    // Cost
    estimatedCostUsd: decimal("estimated_cost_usd", {
      precision: 10,
      scale: 6,
    }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    check(
      "ai_log_process_type_check",
      sql`${t.processType} IN (
        'fragment_classify', 'fragment_process', 'context_enrich',
        'weekly_review', 'duplicate_detect', 'auto_schedule',
        'knowledge_summarize', 'task_estimate'
      )`,
    ),
    check(
      "ai_log_status_check",
      sql`${t.status} IN ('success', 'error', 'timeout', 'rate_limited')`,
    ),
    index("idx_ai_log_user").on(t.userId, t.createdAt),
    index("idx_ai_log_fragment")
      .on(t.fragmentId)
      .where(sql`${t.fragmentId} IS NOT NULL`),
    index("idx_ai_log_type").on(t.processType, t.createdAt),
    index("idx_ai_log_model").on(t.modelUsed, t.createdAt),
  ],
);
