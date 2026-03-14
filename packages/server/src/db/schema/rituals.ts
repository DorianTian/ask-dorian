import {
  pgTable,
  uuid,
  varchar,
  boolean,
  integer,
  timestamp,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { users } from "./users.js";
import { tasks } from "./tasks.js";

// ========================
// rituals — 晨间仪式模板
// ========================
export const rituals = pgTable(
  "rituals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    taskId: uuid("task_id").references(() => tasks.id, {
      onDelete: "set null",
    }),

    title: varchar("title", { length: 200 }).notNull(),
    isFocus: boolean("is_focus").notNull().default(false),
    sortOrder: varchar("sort_order", { length: 255 })
      .notNull()
      .default("0|hzzzzz:"),
    isActive: boolean("is_active").notNull().default(true),
    version: integer("version").notNull().default(1),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [
    index("idx_rituals_user_active")
      .on(t.userId)
      .where(sql`${t.isActive} = true AND ${t.deletedAt} IS NULL`),
  ],
);

// ========================
// ritual_completions — 每日打卡记录
// ========================
export const ritualCompletions = pgTable(
  "ritual_completions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ritualId: uuid("ritual_id")
      .notNull()
      .references(() => rituals.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    completedDate: date("completed_date").notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("idx_ritual_completion_unique").on(
      t.ritualId,
      t.completedDate,
    ),
    index("idx_ritual_completions_user_date").on(t.userId, t.completedDate),
  ],
);
