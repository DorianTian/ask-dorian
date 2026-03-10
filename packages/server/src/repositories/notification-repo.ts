import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { notifications } from "../db/schema/notifications.js";

export type NewNotification = typeof notifications.$inferInsert;
export type Notification = typeof notifications.$inferSelect;

export const notificationRepo = {
  async create(data: NewNotification): Promise<Notification> {
    const rows = await db.insert(notifications).values(data).returning();
    return rows[0]!;
  },

  /** Check if a notification already exists for a given entity today (dedup) */
  async existsForEntityToday(
    userId: string,
    type: string,
    entityType: string,
    entityId: string,
  ): Promise<boolean> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const rows = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.type, type),
          sql`${notifications.entityType} = ${entityType}`,
          eq(notifications.entityId, entityId),
          sql`${notifications.createdAt} >= ${todayStart}`,
        ),
      )
      .limit(1);
    return rows.length > 0;
  },

  /** Check if an event reminder notification exists for the current hour (dedup) */
  async existsForEntityThisHour(
    userId: string,
    type: string,
    entityType: string,
    entityId: string,
  ): Promise<boolean> {
    const hourStart = new Date();
    hourStart.setMinutes(0, 0, 0);

    const rows = await db
      .select({ id: notifications.id })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.type, type),
          sql`${notifications.entityType} = ${entityType}`,
          eq(notifications.entityId, entityId),
          sql`${notifications.createdAt} >= ${hourStart}`,
        ),
      )
      .limit(1);
    return rows.length > 0;
  },

  async findByUserId(
    userId: string,
    opts: {
      unreadOnly?: boolean;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<Notification[]> {
    const { unreadOnly = false, limit = 50, offset = 0 } = opts;

    const conditions = [eq(notifications.userId, userId)];
    if (unreadOnly) {
      conditions.push(eq(notifications.isRead, false));
    }

    return db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);
  },

  async markRead(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
        ),
      )
      .returning();
    return rows.length > 0;
  },

  async markAllRead(userId: string): Promise<number> {
    const rows = await db
      .update(notifications)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
        ),
      )
      .returning();
    return rows.length;
  },

  async countUnread(userId: string): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false),
        ),
      );
    return result[0]?.count ?? 0;
  },
};
