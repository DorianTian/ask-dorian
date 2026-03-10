import { eq, and, isNull, desc, sql, inArray, gte, lt } from "drizzle-orm";
import { db } from "../db/index.js";
import { tasks } from "../db/schema/tasks.js";

export type NewTask = typeof tasks.$inferInsert;
export type Task = typeof tasks.$inferSelect;

export const taskRepo = {
  async create(data: NewTask): Promise<Task> {
    const rows = await db.insert(tasks).values(data).returning();
    return rows[0]!;
  },

  async findById(id: string): Promise<Task | undefined> {
    const rows = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .limit(1);
    return rows[0];
  },

  async findByUserId(
    userId: string,
    opts: {
      status?: ("todo" | "in_progress" | "done" | "cancelled" | "archived")[];
      projectId?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<Task[]> {
    const { status, projectId, limit = 50, offset = 0 } = opts;

    const conditions = [eq(tasks.userId, userId), isNull(tasks.deletedAt)];
    if (status?.length) {
      conditions.push(inArray(tasks.status, status));
    }
    if (projectId) {
      conditions.push(eq(tasks.projectId, projectId));
    }

    return db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(tasks.sortOrder)
      .limit(limit)
      .offset(offset);
  },

  /** Find tasks scheduled for a specific date */
  async findByScheduledDate(
    userId: string,
    date: string,
  ): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          eq(tasks.scheduledDate, date),
          isNull(tasks.deletedAt),
        ),
      )
      .orderBy(tasks.sortOrder);
  },

  /** Find tasks due on or before a date (overdue detection) */
  async findOverdue(userId: string, beforeDate: string): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          sql`${tasks.dueDate} < ${beforeDate}`,
          inArray(tasks.status, ["todo", "in_progress"]),
          isNull(tasks.deletedAt),
        ),
      )
      .orderBy(tasks.dueDate);
  },

  async updateById(
    id: string,
    data: Partial<Omit<NewTask, "id" | "userId" | "createdAt">>,
  ): Promise<Task | undefined> {
    const rows = await db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(tasks.id, id), isNull(tasks.deletedAt)))
      .returning();
    return rows[0];
  },

  async complete(id: string): Promise<Task | undefined> {
    const rows = await db
      .update(tasks)
      .set({
        status: "done",
        completedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tasks.id, id),
          inArray(tasks.status, ["todo", "in_progress"]),
          isNull(tasks.deletedAt),
        ),
      )
      .returning();
    return rows[0];
  },

  async softDelete(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .update(tasks)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(tasks.id, id),
          eq(tasks.userId, userId),
          isNull(tasks.deletedAt),
        ),
      )
      .returning();
    return rows.length > 0;
  },

  /** Find tasks completed within a date range [start, end) */
  async findCompletedInRange(userId: string, start: string, end: string): Promise<Task[]> {
    return db
      .select()
      .from(tasks)
      .where(
        and(
          eq(tasks.userId, userId),
          isNull(tasks.deletedAt),
          eq(tasks.status, "done"),
          gte(tasks.completedAt, new Date(start)),
          lt(tasks.completedAt, new Date(end)),
        ),
      )
      .orderBy(desc(tasks.completedAt));
  },

  /** Unlink all tasks from a deleted project */
  async unlinkFromProject(projectId: string): Promise<void> {
    await db
      .update(tasks)
      .set({ projectId: null, updatedAt: new Date() })
      .where(and(eq(tasks.projectId, projectId), isNull(tasks.deletedAt)));
  },

  /** Count tasks by status for a user */
  async countByStatus(
    userId: string,
  ): Promise<{ status: string; count: number }[]> {
    const rows = await db
      .select({
        status: tasks.status,
        count: sql<number>`count(*)::int`,
      })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), isNull(tasks.deletedAt)))
      .groupBy(tasks.status);
    return rows;
  },
};
