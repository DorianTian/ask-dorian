# Rituals Feature Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the Rituals (Morning Routine) feature — independent daily habit checklist with completion tracking, toggle-based check-in, and streak/stats for the Review page.

**Architecture:** Two new DB tables (rituals + ritual_completions), standard 4-layer server split (schema → repo → service → controller → routes), core package types + API wrapper + SWR hooks. Today dashboard aggregation expanded to include rituals.

**Tech Stack:** Drizzle ORM (schema), Koa.js (routes/controller), Zod (validation), PostgreSQL (DB), SWR (hooks), TypeScript throughout.

**Spec:** `docs/superpowers/specs/2026-03-14-rituals-design.md`

---

## File Structure

| Action | Path | Responsibility |
|--------|------|----------------|
| CREATE | `packages/server/src/db/schema/rituals.ts` | Drizzle table definitions for rituals + ritual_completions |
| EDIT | `packages/server/src/db/schema/index.ts` | Export new schema |
| CREATE | `packages/server/src/repositories/ritual-repo.ts` | All DB queries (CRUD + completions + stats aggregation) |
| CREATE | `packages/server/src/services/ritual-service.ts` | Business logic (authz, toggle, streak calculation) |
| CREATE | `packages/server/src/controllers/ritual-controller.ts` | Zod validation + 6 handler methods |
| CREATE | `packages/server/src/routes/rituals.ts` | Route definitions (6 endpoints) |
| EDIT | `packages/server/src/routes/index.ts` | Register ritual routes |
| EDIT | `packages/server/src/controllers/today-controller.ts` | Add rituals to dashboard aggregation |
| EDIT | `packages/core/src/types/api.ts` | Ritual entity types + TodayDashboard update |
| EDIT | `packages/core/src/types/requests.ts` | Ritual request types |
| CREATE | `packages/core/src/api/rituals.ts` | API wrapper functions |
| EDIT | `packages/core/src/api/index.ts` | Export ritual API |
| CREATE | `packages/core/src/hooks/use-rituals.ts` | SWR hooks |
| EDIT | `packages/core/src/hooks/index.ts` | Export hooks |
| EDIT | `docs/architecture/database-schema.sql` | Already done (v1.2) |
| EDIT | `docs/architecture/technical-architecture.md` | Already done (v1.4) |

---

## Chunk 1: Server — DB Schema + Repository

### Task 1: Drizzle Schema (rituals + ritual_completions)

**Files:**
- Create: `packages/server/src/db/schema/rituals.ts`
- Modify: `packages/server/src/db/schema/index.ts:19` (add export)

- [ ] **Step 1: Create rituals.ts with both table definitions**

```typescript
// packages/server/src/db/schema/rituals.ts
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
```

- [ ] **Step 2: Export from schema index**

Add to `packages/server/src/db/schema/index.ts` after line 19 (`export * from "./attachments.js";`):

```typescript
export * from "./rituals.js";
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd packages/server && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors (or pre-existing errors only)

- [ ] **Step 4: Run DB migration to create the tables**

Run: `cd packages/server && npx tsx src/db/migrate.ts`
Expected: Tables created (table count increases from 16 to 18), or "already exists" if DDL was already applied.

- [ ] **Step 5: Commit**

```bash
git add packages/server/src/db/schema/rituals.ts packages/server/src/db/schema/index.ts
git commit -m "feat(rituals): add Drizzle schema for rituals + ritual_completions tables"
```

---

### Task 2: Ritual Repository

**Files:**
- Create: `packages/server/src/repositories/ritual-repo.ts`

- [ ] **Step 1: Create ritual-repo.ts with all query methods**

```typescript
// packages/server/src/repositories/ritual-repo.ts
import { eq, and, isNull, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { rituals, ritualCompletions } from "../db/schema/rituals.js";

export type NewRitual = typeof rituals.$inferInsert;
export type RitualRow = typeof rituals.$inferSelect;
export type NewCompletion = typeof ritualCompletions.$inferInsert;

export const ritualRepo = {
  // --- Ritual CRUD ---

  async create(data: NewRitual): Promise<RitualRow> {
    const rows = await db.insert(rituals).values(data).returning();
    return rows[0]!;
  },

  async findById(id: string): Promise<RitualRow | undefined> {
    const rows = await db
      .select()
      .from(rituals)
      .where(and(eq(rituals.id, id), isNull(rituals.deletedAt)))
      .limit(1);
    return rows[0];
  },

  async findActiveByUserId(userId: string): Promise<RitualRow[]> {
    return db
      .select()
      .from(rituals)
      .where(
        and(
          eq(rituals.userId, userId),
          eq(rituals.isActive, true),
          isNull(rituals.deletedAt),
        ),
      )
      .orderBy(rituals.sortOrder);
  },

  async updateById(
    id: string,
    data: Partial<Omit<NewRitual, "id" | "userId" | "createdAt">>,
  ): Promise<RitualRow | undefined> {
    const rows = await db
      .update(rituals)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(rituals.id, id), isNull(rituals.deletedAt)))
      .returning();
    return rows[0];
  },

  async softDelete(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .update(rituals)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(rituals.id, id),
          eq(rituals.userId, userId),
          isNull(rituals.deletedAt),
        ),
      )
      .returning();
    return rows.length > 0;
  },

  // --- Completions ---

  async findCompletionsForDate(
    userId: string,
    date: string,
  ): Promise<{ ritualId: string; completedAt: Date }[]> {
    return db
      .select({
        ritualId: ritualCompletions.ritualId,
        completedAt: ritualCompletions.completedAt,
      })
      .from(ritualCompletions)
      .where(
        and(
          eq(ritualCompletions.userId, userId),
          eq(ritualCompletions.completedDate, date),
        ),
      );
  },

  async findCompletion(
    ritualId: string,
    date: string,
  ): Promise<{ id: string; completedAt: Date } | undefined> {
    const rows = await db
      .select({
        id: ritualCompletions.id,
        completedAt: ritualCompletions.completedAt,
      })
      .from(ritualCompletions)
      .where(
        and(
          eq(ritualCompletions.ritualId, ritualId),
          eq(ritualCompletions.completedDate, date),
        ),
      )
      .limit(1);
    return rows[0];
  },

  async insertCompletion(
    ritualId: string,
    userId: string,
    date: string,
  ): Promise<Date> {
    const rows = await db
      .insert(ritualCompletions)
      .values({ ritualId, userId, completedDate: date })
      .returning();
    return rows[0]!.completedAt;
  },

  async deleteCompletion(ritualId: string, date: string): Promise<boolean> {
    const rows = await db
      .delete(ritualCompletions)
      .where(
        and(
          eq(ritualCompletions.ritualId, ritualId),
          eq(ritualCompletions.completedDate, date),
        ),
      )
      .returning();
    return rows.length > 0;
  },

  // --- Stats aggregation ---

  /**
   * Get daily completion counts for a date range.
   * Returns: [{ date: "2026-03-09", completed: 3 }, ...]
   */
  async getCompletionsByDateRange(
    userId: string,
    from: string,
    to: string,
  ): Promise<{ date: string; completed: number }[]> {
    return db
      .select({
        date: ritualCompletions.completedDate,
        completed: sql<number>`count(*)::int`,
      })
      .from(ritualCompletions)
      .where(
        and(
          eq(ritualCompletions.userId, userId),
          sql`${ritualCompletions.completedDate} >= ${from}`,
          sql`${ritualCompletions.completedDate} <= ${to}`,
        ),
      )
      .groupBy(ritualCompletions.completedDate)
      .orderBy(ritualCompletions.completedDate);
  },

  /**
   * Get all rituals that existed on each day in a date range.
   * A ritual counts for a day if: created_at <= day AND (deleted_at IS NULL OR deleted_at > day) AND is_active = true
   */
  async getRitualsCountByDate(
    userId: string,
    from: string,
    to: string,
  ): Promise<{ date: string; total: number }[]> {
    // Generate date series and cross-join with rituals
    const rows = await db.execute<{ date: string; total: number }>(sql`
      SELECT d.date::text AS date, count(r.id)::int AS total
      FROM generate_series(${from}::date, ${to}::date, '1 day'::interval) AS d(date)
      LEFT JOIN rituals r ON r.user_id = ${userId}
        AND r.is_active = true
        AND r.created_at::date <= d.date
        AND (r.deleted_at IS NULL OR r.deleted_at > d.date)
      GROUP BY d.date
      ORDER BY d.date
    `);
    return [...rows];
  },
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd packages/server && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/server/src/repositories/ritual-repo.ts
git commit -m "feat(rituals): add ritual repository with CRUD, completions, and stats queries"
```

---

## Chunk 2: Server — Service + Controller + Routes

### Task 3: Ritual Service

**Files:**
- Create: `packages/server/src/services/ritual-service.ts`

- [ ] **Step 1: Create ritual-service.ts**

```typescript
// packages/server/src/services/ritual-service.ts
import { AppError } from "../middleware/error-handler.js";
import { ritualRepo, type RitualRow } from "../repositories/ritual-repo.js";
import { taskRepo } from "../repositories/task-repo.js";

export interface CreateRitualInput {
  title: string;
  isFocus?: boolean;
  taskId?: string | null;
}

export interface UpdateRitualInput {
  title?: string;
  isFocus?: boolean;
  sortOrder?: string;
  isActive?: boolean;
  taskId?: string | null;
}

export interface RitualWithCompletion extends RitualRow {
  completed: boolean;
  completedAt: string | null;
}

export interface RitualListResult {
  items: RitualWithCompletion[];
  progress: { completed: number; total: number };
}

export interface RitualDailyBreakdown {
  date: string;
  completed: number;
  total: number;
}

export interface RitualStatsResult {
  completionRate: number;
  totalCompleted: number;
  totalPossible: number;
  currentStreak: number;
  bestStreak: number;
  dailyBreakdown: RitualDailyBreakdown[];
}

export const ritualService = {
  /** List active rituals with completion status for a given date */
  async list(userId: string, date: string): Promise<RitualListResult> {
    const [activeRituals, completions] = await Promise.all([
      ritualRepo.findActiveByUserId(userId),
      ritualRepo.findCompletionsForDate(userId, date),
    ]);

    const completionMap = new Map(
      completions.map((c) => [c.ritualId, c.completedAt]),
    );

    const items: RitualWithCompletion[] = activeRituals.map((r) => {
      const completedAt = completionMap.get(r.id);
      return {
        ...r,
        completed: !!completedAt,
        completedAt: completedAt?.toISOString() ?? null,
      };
    });

    const completedCount = items.filter((i) => i.completed).length;

    return {
      items,
      progress: { completed: completedCount, total: items.length },
    };
  },

  /** Create a new ritual (sortOrder auto-generated, appended to end) */
  async create(userId: string, input: CreateRitualInput): Promise<RitualRow> {
    // Validate taskId ownership if provided
    if (input.taskId) {
      const task = await taskRepo.findById(input.taskId);
      if (!task || task.userId !== userId) {
        throw new AppError(400, "INVALID_TASK", "Task not found or not owned by user");
      }
    }

    // Auto-generate sortOrder: find the last ritual's sortOrder and append after it
    const existing = await ritualRepo.findActiveByUserId(userId);
    let sortOrder = "0|hzzzzz:";
    if (existing.length > 0) {
      const lastOrder = existing[existing.length - 1].sortOrder;
      // Simple append: add a character to push it after the last item
      sortOrder = lastOrder + "V";
    }

    return ritualRepo.create({
      userId,
      title: input.title,
      isFocus: input.isFocus ?? false,
      taskId: input.taskId ?? null,
      sortOrder,
    });
  },

  /** Update an existing ritual */
  async update(
    userId: string,
    id: string,
    input: UpdateRitualInput,
  ): Promise<RitualRow> {
    const existing = await ritualRepo.findById(id);
    if (!existing || existing.userId !== userId) {
      throw new AppError(404, "RITUAL_NOT_FOUND", "Ritual not found");
    }

    // Validate taskId ownership if provided
    if (input.taskId !== undefined && input.taskId !== null) {
      const task = await taskRepo.findById(input.taskId);
      if (!task || task.userId !== userId) {
        throw new AppError(400, "INVALID_TASK", "Task not found or not owned by user");
      }
    }

    const data: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      if (value !== undefined) {
        data[key] = value;
      }
    }

    const updated = await ritualRepo.updateById(id, data);
    if (!updated) {
      throw new AppError(404, "RITUAL_NOT_FOUND", "Ritual not found");
    }
    return updated;
  },

  /** Soft delete a ritual */
  async delete(userId: string, id: string): Promise<void> {
    const deleted = await ritualRepo.softDelete(id, userId);
    if (!deleted) {
      throw new AppError(404, "RITUAL_NOT_FOUND", "Ritual not found");
    }
  },

  /** Toggle completion for a ritual on a given date */
  async toggleComplete(
    userId: string,
    id: string,
    date: string,
  ): Promise<{ completed: boolean; completedAt: string | null }> {
    const ritual = await ritualRepo.findById(id);
    if (!ritual || ritual.userId !== userId) {
      throw new AppError(404, "RITUAL_NOT_FOUND", "Ritual not found");
    }

    const existing = await ritualRepo.findCompletion(id, date);

    if (existing) {
      // Already completed → un-complete
      await ritualRepo.deleteCompletion(id, date);
      return { completed: false, completedAt: null };
    } else {
      // Not completed → complete
      const completedAt = await ritualRepo.insertCompletion(id, userId, date);
      return { completed: true, completedAt: completedAt.toISOString() };
    }
  },

  /** Get stats for a date range (Review page) */
  async getStats(
    userId: string,
    from: string,
    to: string,
  ): Promise<RitualStatsResult> {
    const [completionsByDate, ritualCountsByDate] = await Promise.all([
      ritualRepo.getCompletionsByDateRange(userId, from, to),
      ritualRepo.getRitualsCountByDate(userId, from, to),
    ]);

    const completionMap = new Map(
      completionsByDate.map((c) => [c.date, c.completed]),
    );

    // Build daily breakdown
    const dailyBreakdown: RitualDailyBreakdown[] = ritualCountsByDate.map(
      (day) => ({
        date: day.date,
        completed: completionMap.get(day.date) ?? 0,
        total: day.total,
      }),
    );

    // Compute totals
    let totalCompleted = 0;
    let totalPossible = 0;
    for (const day of dailyBreakdown) {
      totalCompleted += day.completed;
      totalPossible += day.total;
    }

    const completionRate =
      totalPossible > 0 ? totalCompleted / totalPossible : 0;

    // Compute streaks (all-completed days)
    // A day is "all completed" when completed === total AND total > 0
    let currentStreak = 0;
    let bestStreak = 0;
    let streak = 0;

    for (const day of dailyBreakdown) {
      if (day.total > 0 && day.completed === day.total) {
        streak++;
        if (streak > bestStreak) bestStreak = streak;
      } else {
        streak = 0;
      }
    }

    // Current streak: count backwards from the last day
    currentStreak = 0;
    for (let i = dailyBreakdown.length - 1; i >= 0; i--) {
      const day = dailyBreakdown[i];
      if (day.total > 0 && day.completed === day.total) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      completionRate: Math.round(completionRate * 100) / 100,
      totalCompleted,
      totalPossible,
      currentStreak,
      bestStreak,
      dailyBreakdown,
    };
  },
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd packages/server && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/server/src/services/ritual-service.ts
git commit -m "feat(rituals): add ritual service with list, CRUD, toggle, and stats logic"
```

---

### Task 4: Ritual Controller

**Files:**
- Create: `packages/server/src/controllers/ritual-controller.ts`

- [ ] **Step 1: Create ritual-controller.ts**

```typescript
// packages/server/src/controllers/ritual-controller.ts
import type { Context } from "koa";
import { z } from "zod";
import { ritualService } from "../services/ritual-service.js";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const listRitualsSchema = z.object({
  date: z.string().regex(dateRegex, "Expected YYYY-MM-DD").optional(),
  timezone: z.string().max(50).default("UTC"),
});

const createRitualSchema = z.object({
  title: z.string().min(1).max(200),
  isFocus: z.boolean().default(false),
  taskId: z.string().uuid().nullable().optional(),
});

const updateRitualSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  isFocus: z.boolean().optional(),
  sortOrder: z.string().max(255).optional(),
  isActive: z.boolean().optional(),
  taskId: z.string().uuid().nullable().optional(),
});

const toggleCompleteSchema = z.object({
  date: z.string().regex(dateRegex, "Expected YYYY-MM-DD").optional(),
  timezone: z.string().max(50).default("UTC"),
});

const statsQuerySchema = z.object({
  from: z.string().regex(dateRegex, "Expected YYYY-MM-DD"),
  to: z.string().regex(dateRegex, "Expected YYYY-MM-DD"),
});

function todayDateStr(timezone: string): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: timezone }); // YYYY-MM-DD
}

export const ritualController = {
  /** GET /rituals — list with completion status */
  async list(ctx: Context) {
    const query = listRitualsSchema.parse(ctx.query);
    const date = query.date ?? todayDateStr(query.timezone);
    const result = await ritualService.list(ctx.state.userId, date);
    ctx.body = result;
  },

  /** POST /rituals — create */
  async create(ctx: Context) {
    const body = createRitualSchema.parse(ctx.request.body);
    const ritual = await ritualService.create(ctx.state.userId, body);
    ctx.status = 201;
    ctx.body = ritual;
  },

  /** PATCH /rituals/:id — update */
  async update(ctx: Context) {
    const body = updateRitualSchema.parse(ctx.request.body);
    const ritual = await ritualService.update(
      ctx.state.userId,
      ctx.params.id,
      body,
    );
    ctx.body = ritual;
  },

  /** DELETE /rituals/:id — soft delete */
  async delete(ctx: Context) {
    await ritualService.delete(ctx.state.userId, ctx.params.id);
    ctx.status = 204;
  },

  /** POST /rituals/:id/toggle-complete — toggle check-in */
  async toggleComplete(ctx: Context) {
    const body = toggleCompleteSchema.parse(ctx.request.body ?? {});
    const date = body.date ?? todayDateStr(body.timezone);
    const result = await ritualService.toggleComplete(
      ctx.state.userId,
      ctx.params.id,
      date,
    );
    ctx.body = result;
  },

  /** GET /rituals/stats — stats for Review page */
  async getStats(ctx: Context) {
    const query = statsQuerySchema.parse(ctx.query);
    const stats = await ritualService.getStats(
      ctx.state.userId,
      query.from,
      query.to,
    );
    ctx.body = stats;
  },
};
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd packages/server && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/server/src/controllers/ritual-controller.ts
git commit -m "feat(rituals): add ritual controller with Zod validation for all 6 endpoints"
```

---

### Task 5: Routes + Registration

**Files:**
- Create: `packages/server/src/routes/rituals.ts`
- Modify: `packages/server/src/routes/index.ts:15,37` (add import + register)

- [ ] **Step 1: Create rituals.ts route file**

```typescript
// packages/server/src/routes/rituals.ts
import Router from "@koa/router";
import { ritualController } from "../controllers/ritual-controller.js";
import { authGuard } from "../middleware/auth-guard.js";

export const ritualRoutes = new Router({ prefix: "/rituals" });

ritualRoutes.use(authGuard);

// IMPORTANT: /stats must come before /:id to avoid "stats" being parsed as an id
ritualRoutes.get("/stats", ritualController.getStats);
ritualRoutes.get("/", ritualController.list);
ritualRoutes.post("/", ritualController.create);
ritualRoutes.patch("/:id", ritualController.update);
ritualRoutes.delete("/:id", ritualController.delete);
ritualRoutes.post("/:id/toggle-complete", ritualController.toggleComplete);
```

- [ ] **Step 2: Register in routes/index.ts**

Add import after line 15 (`import { sseRoutes } from "./sse.js";`):
```typescript
import { ritualRoutes } from "./rituals.js";
```

Add registration after line 37 (`router.use(sseRoutes.routes());`):
```typescript
router.use(ritualRoutes.routes());
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd packages/server && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Start server and test health**

Run: `cd packages/server && npx tsx src/index.ts &` (if not already running)
Run: `curl http://localhost:4000/api/v1/health`
Expected: `{"status":"ok"}`

- [ ] **Step 5: Commit**

```bash
git add packages/server/src/routes/rituals.ts packages/server/src/routes/index.ts
git commit -m "feat(rituals): add ritual routes and register in router (6 endpoints)"
```

---

### Task 6: Today Integration

**Files:**
- Modify: `packages/server/src/controllers/today-controller.ts`

- [ ] **Step 1: Add ritualService import and parallel query**

In `packages/server/src/controllers/today-controller.ts`:

Add import (after line 5):
```typescript
import { ritualService } from "../services/ritual-service.js";
```

Replace the `Promise.all` block (lines 25-37) and response body (lines 39-52):

```typescript
    // Run all queries in parallel
    const [
      scheduledTasks,
      overdueTasks,
      todayEvents,
      pendingFragments,
      statusCounts,
      ritualsResult,
    ] = await Promise.all([
      taskService.getScheduledForDate(userId, dateStr),
      taskService.getOverdue(userId, dateStr),
      eventService.getToday(userId, query.timezone),
      fragmentService.list(userId, { status: "pending", limit: 20 }),
      taskService.getStatusCounts(userId),
      ritualService.list(userId, dateStr),
    ]);

    ctx.body = {
      date: dateStr,
      timezone: query.timezone,
      tasks: {
        scheduled: scheduledTasks,
        overdue: overdueTasks,
      },
      events: todayEvents,
      pendingFragments,
      rituals: ritualsResult,
      stats: {
        taskCounts: statusCounts,
      },
    };
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `cd packages/server && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add packages/server/src/controllers/today-controller.ts
git commit -m "feat(rituals): integrate rituals into today dashboard aggregation"
```

---

## Chunk 3: Core Package — Types + API + Hooks

### Task 7: Core Types

**Files:**
- Modify: `packages/core/src/types/api.ts` (after Notification interface, ~line 220)
- Modify: `packages/core/src/types/requests.ts` (after Knowledge section, ~line 167)

- [ ] **Step 1: Add Ritual types to api.ts**

Append after the Notification interface block in `packages/core/src/types/api.ts`:

```typescript
// --- Rituals ---

export interface Ritual {
  id: string
  userId: string
  taskId: string | null
  title: string
  isFocus: boolean
  sortOrder: string
  isActive: boolean
  version: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface RitualWithCompletion extends Ritual {
  completed: boolean
  completedAt: string | null
}

export interface RitualProgress {
  completed: number
  total: number
}

export interface RitualListResponse {
  items: RitualWithCompletion[]
  progress: RitualProgress
}

export interface RitualToggleResponse {
  completed: boolean
  completedAt: string | null
}

export interface RitualDailyBreakdown {
  date: string
  completed: number
  total: number
}

export interface RitualStats {
  completionRate: number
  totalCompleted: number
  totalPossible: number
  currentStreak: number
  bestStreak: number
  dailyBreakdown: RitualDailyBreakdown[]
}
```

- [ ] **Step 2: Update TodayDashboard type in api.ts**

Find the `TodayDashboard` interface (~line 268) and add the `rituals` field:

```typescript
export interface TodayDashboard {
  date: string
  timezone: string
  tasks: {
    scheduled: Task[]
    overdue: Task[]
  }
  events: CalendarEvent[]
  pendingFragments: Fragment[]
  rituals: RitualListResponse  // <-- add this line
  stats: {
    taskCounts: { status: string; count: number }[]
  }
}
```

- [ ] **Step 3: Add Ritual request types to requests.ts**

Append after the Knowledge section in `packages/core/src/types/requests.ts`:

```typescript
// --- Ritual ---

export interface CreateRitualRequest {
  title: string
  isFocus?: boolean
  taskId?: string | null
}

export type UpdateRitualRequest = Partial<{
  title: string
  isFocus: boolean
  sortOrder: string
  isActive: boolean
  taskId: string | null
}>

export interface RitualStatsParams {
  from: string
  to: string
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `cd packages/core && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add packages/core/src/types/api.ts packages/core/src/types/requests.ts
git commit -m "feat(rituals): add Ritual entity + request types to core package, update TodayDashboard"
```

---

### Task 8: Core API Wrapper

**Files:**
- Create: `packages/core/src/api/rituals.ts`
- Modify: `packages/core/src/api/index.ts` (add export)

- [ ] **Step 1: Create rituals.ts API wrapper**

```typescript
// packages/core/src/api/rituals.ts
import { api } from "./client"
import type {
  Ritual,
  RitualListResponse,
  RitualToggleResponse,
  RitualStats,
} from "../types/api"
import type {
  CreateRitualRequest,
  UpdateRitualRequest,
  RitualStatsParams,
} from "../types/requests"

const BASE = "/api/v1/rituals"

export const ritualApi = {
  list: (date?: string) =>
    api.get<RitualListResponse>(`${BASE}`, date ? { date } : undefined),

  create: (body: CreateRitualRequest) =>
    api.post<Ritual>(`${BASE}`, body),

  update: (id: string, body: UpdateRitualRequest) =>
    api.patch<Ritual>(`${BASE}/${id}`, body),

  delete: (id: string) =>
    api.delete(`${BASE}/${id}`),

  toggleComplete: (id: string, date?: string) =>
    api.post<RitualToggleResponse>(
      `${BASE}/${id}/toggle-complete`,
      date ? { date } : {},
    ),

  getStats: (params: RitualStatsParams) =>
    api.get<RitualStats>(`${BASE}/stats`, params),
}
```

- [ ] **Step 2: Export from api/index.ts**

Add to `packages/core/src/api/index.ts` after the last export:

```typescript
export { ritualApi } from "./rituals"
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd packages/core && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/api/rituals.ts packages/core/src/api/index.ts
git commit -m "feat(rituals): add ritual API wrapper in core package"
```

---

### Task 9: Core SWR Hooks

**Files:**
- Create: `packages/core/src/hooks/use-rituals.ts`
- Modify: `packages/core/src/hooks/index.ts` (add exports)

- [ ] **Step 1: Create use-rituals.ts**

```typescript
// packages/core/src/hooks/use-rituals.ts
import { useSWRApi } from "./use-swr-api"
import { ritualApi } from "../api/rituals"
import type { RitualStatsParams } from "../types/requests"

export function useRituals(date?: string) {
  const key = date ? `/rituals?date=${date}` : "/rituals"
  return useSWRApi(key, () => ritualApi.list(date))
}

export function useRitualStats(params: RitualStatsParams | null) {
  const key = params
    ? `/rituals/stats?from=${params.from}&to=${params.to}`
    : null
  return useSWRApi(key, () => ritualApi.getStats(params!))
}
```

- [ ] **Step 2: Export from hooks/index.ts**

Add to `packages/core/src/hooks/index.ts` after the last export:

```typescript
export { useRituals, useRitualStats } from "./use-rituals"
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `cd packages/core && npx tsc --noEmit 2>&1 | head -20`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add packages/core/src/hooks/use-rituals.ts packages/core/src/hooks/index.ts
git commit -m "feat(rituals): add useRituals and useRitualStats SWR hooks"
```

---

## Chunk 4: Manual API Verification

### Task 10: End-to-End Manual Test

- [ ] **Step 1: Start the server locally**

Run: `cd packages/server && npx tsx src/index.ts`
Expected: Server starts on port 4000

- [ ] **Step 2: Obtain auth token (login)**

```bash
curl -s http://localhost:4000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"test@example.com","password":"test123","deviceInfo":{"deviceId":"test-dev","deviceType":"web","deviceName":"curl"}}' \
  | jq .accessToken
```

Save the token as `$TOKEN`.

- [ ] **Step 3: Create a ritual**

```bash
curl -s http://localhost:4000/api/v1/rituals \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{"title":"10min Mindful Breathing"}' \
  | jq .
```

Expected: 201 with ritual object (id, title, isFocus=false, isActive=true)

- [ ] **Step 4: List rituals (with progress)**

```bash
curl -s http://localhost:4000/api/v1/rituals \
  -H 'Authorization: Bearer $TOKEN' \
  | jq .
```

Expected: `{ items: [...], progress: { completed: 0, total: 1 } }`

- [ ] **Step 5: Toggle complete**

```bash
curl -s -X POST http://localhost:4000/api/v1/rituals/<ritual-id>/toggle-complete \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{}' \
  | jq .
```

Expected: `{ completed: true, completedAt: "..." }`

- [ ] **Step 6: Verify list shows completed**

```bash
curl -s http://localhost:4000/api/v1/rituals \
  -H 'Authorization: Bearer $TOKEN' \
  | jq .progress
```

Expected: `{ completed: 1, total: 1 }`

- [ ] **Step 7: Toggle again (un-complete)**

Expected: `{ completed: false, completedAt: null }`

- [ ] **Step 8: Test stats endpoint**

```bash
curl -s "http://localhost:4000/api/v1/rituals/stats?from=2026-03-01&to=2026-03-14" \
  -H 'Authorization: Bearer $TOKEN' \
  | jq .
```

Expected: Stats object with completionRate, streak, dailyBreakdown

- [ ] **Step 9: Test today dashboard includes rituals**

```bash
curl -s http://localhost:4000/api/v1/today \
  -H 'Authorization: Bearer $TOKEN' \
  | jq .rituals
```

Expected: `{ items: [...], progress: { completed: N, total: N } }`

- [ ] **Step 10: Test soft delete**

```bash
curl -s -X DELETE http://localhost:4000/api/v1/rituals/<ritual-id> \
  -H 'Authorization: Bearer $TOKEN' -w '\nHTTP Status: %{http_code}\n'
```

Expected: HTTP 204, ritual no longer shows in list

- [ ] **Step 11: Final commit (docs + plan)**

```bash
git add docs/superpowers/plans/2026-03-14-rituals-feature.md
git commit -m "docs: add rituals feature implementation plan"
```

Note: `database-schema.sql` (v1.2) and `technical-architecture.md` (v1.4) were already updated before this plan was created. Commit them separately if not yet committed.
