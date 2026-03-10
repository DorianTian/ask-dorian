import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  jsonb,
  index,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";

export const integrations = pgTable(
  "integrations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    provider: varchar("provider", { length: 50 }).notNull(),
    providerAccountId: varchar("provider_account_id", { length: 255 }),

    accessTokenEnc: text("access_token_enc").notNull(),
    refreshTokenEnc: text("refresh_token_enc"),
    tokenExpiresAt: timestamp("token_expires_at", { withTimezone: true }),
    scopes: text("scopes").array().notNull().default(sql`'{}'`),

    syncEnabled: boolean("sync_enabled").notNull().default(true),
    syncDirection: varchar("sync_direction", { length: 20 })
      .notNull()
      .default("bidirectional"),
    syncConfig: jsonb("sync_config").notNull().default({}),
    lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
    lastSyncError: text("last_sync_error"),

    status: varchar("status", { length: 20 }).notNull().default("active"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    unique("integrations_user_provider_account").on(
      t.userId,
      t.provider,
      t.providerAccountId,
    ),
    check(
      "integrations_provider_check",
      sql`${t.provider} IN (
        'google', 'outlook', 'feishu', 'apple',
        'slack', 'notion', 'linear', 'jira', 'todoist',
        'telegram', 'wechat', 'github', 'asana'
      )`,
    ),
    check(
      "integrations_sync_direction_check",
      sql`${t.syncDirection} IN ('inbound', 'outbound', 'bidirectional')`,
    ),
    check(
      "integrations_status_check",
      sql`${t.status} IN ('active', 'expired', 'revoked', 'error')`,
    ),
    index("idx_integration_user").on(t.userId, t.status),
    index("idx_integration_sync")
      .on(t.provider, t.status)
      .where(sql`${t.syncEnabled} = TRUE`),
  ],
);
