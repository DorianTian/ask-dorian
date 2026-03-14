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

  async getRitualsCountByDate(
    userId: string,
    from: string,
    to: string,
  ): Promise<{ date: string; total: number }[]> {
    const rows = await db.execute<{ date: string; total: number }>(sql`
      SELECT d.date::date::text AS date, count(r.id)::int AS total
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
