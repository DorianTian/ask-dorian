import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  bigint,
  timestamp,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums.js";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    avatarUrl: text("avatar_url"),
    timezone: varchar("timezone", { length: 50 }).notNull().default("Asia/Shanghai"),
    role: userRoleEnum("role").notNull().default("free"),
    locale: varchar("locale", { length: 10 }).notNull().default("zh"),

    // OAuth
    googleSub: varchar("google_sub", { length: 255 }).unique(),
    githubId: varchar("github_id", { length: 64 }).unique(),
    wechatOpenid: varchar("wechat_openid", { length: 128 }).unique(),
    appleSub: varchar("apple_sub", { length: 255 }).unique(),

    // Quota
    aiQuotaUsed: integer("ai_quota_used").notNull().default(0),
    aiQuotaResetAt: timestamp("ai_quota_reset_at", { withTimezone: true }),
    storageUsedBytes: bigint("storage_used_bytes", { mode: "number" })
      .notNull()
      .default(0),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("idx_user_email").on(t.email),
    index("idx_user_wechat").on(t.wechatOpenid),
  ],
);
