import { eq, and, isNull, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { events } from "../db/schema/events.js";

export type NewEvent = typeof events.$inferInsert;
export type Event = typeof events.$inferSelect;

export const eventRepo = {
  async create(data: NewEvent): Promise<Event> {
    const rows = await db.insert(events).values(data).returning();
    return rows[0]!;
  },

  async findById(id: string): Promise<Event | undefined> {
    const rows = await db
      .select()
      .from(events)
      .where(and(eq(events.id, id), isNull(events.deletedAt)))
      .limit(1);
    return rows[0];
  },

  /** Find events in a time range (for calendar view) */
  async findByRange(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(
        and(
          eq(events.userId, userId),
          sql`${events.startTime} < ${end.toISOString()}::timestamptz`,
          sql`COALESCE(${events.endTime}, ${events.startTime}) >= ${start.toISOString()}::timestamptz`,
          isNull(events.deletedAt),
        ),
      )
      .orderBy(events.startTime);
  },

  /** Find busy slots for conflict detection */
  async findBusySlots(
    userId: string,
    start: Date,
    end: Date,
  ): Promise<Pick<Event, "id" | "startTime" | "endTime" | "title">[]> {
    return db
      .select({
        id: events.id,
        startTime: events.startTime,
        endTime: events.endTime,
        title: events.title,
      })
      .from(events)
      .where(
        and(
          eq(events.userId, userId),
          eq(events.status, "confirmed"),
          eq(events.busyStatus, "busy"),
          sql`${events.startTime} < ${end.toISOString()}::timestamptz`,
          sql`COALESCE(${events.endTime}, ${events.startTime}) >= ${start.toISOString()}::timestamptz`,
          isNull(events.deletedAt),
        ),
      )
      .orderBy(events.startTime);
  },

  async updateById(
    id: string,
    data: Partial<Omit<NewEvent, "id" | "userId" | "createdAt">>,
  ): Promise<Event | undefined> {
    const rows = await db
      .update(events)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(events.id, id), isNull(events.deletedAt)))
      .returning();
    return rows[0];
  },

  async softDelete(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .update(events)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(events.id, id),
          eq(events.userId, userId),
          isNull(events.deletedAt),
        ),
      )
      .returning();
    return rows.length > 0;
  },

  /** Unlink all events from a deleted project */
  async unlinkFromProject(projectId: string): Promise<void> {
    await db
      .update(events)
      .set({ projectId: null, updatedAt: new Date() })
      .where(and(eq(events.projectId, projectId), isNull(events.deletedAt)));
  },

  /** Find today's events */
  async findToday(userId: string, timezone: string): Promise<Event[]> {
    return db
      .select()
      .from(events)
      .where(
        and(
          eq(events.userId, userId),
          sql`(${events.startTime} AT TIME ZONE ${timezone})::date = (NOW() AT TIME ZONE ${timezone})::date`,
          isNull(events.deletedAt),
        ),
      )
      .orderBy(events.startTime);
  },
};
