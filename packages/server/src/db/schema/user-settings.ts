import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const userSettings = pgTable("user_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .unique()
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  language: varchar("language", { length: 10 }).notNull().default("zh"),
  theme: varchar("theme", { length: 20 }).notNull().default("system"),

  aiPreferences: jsonb("ai_preferences").notNull().default({}),
  notificationSettings: jsonb("notification_settings").notNull().default({}),
  workPreferences: jsonb("work_preferences").notNull().default({}),
  defaultViews: jsonb("default_views").notNull().default({}),

  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
