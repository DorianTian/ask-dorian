import { eq, and, isNull, desc, sql, inArray, gte, lt } from "drizzle-orm";
import { db } from "../db/index.js";
import { fragments } from "../db/schema/fragments.js";

export type NewFragment = typeof fragments.$inferInsert;
export type Fragment = typeof fragments.$inferSelect;

export const fragmentRepo = {
  async create(data: NewFragment): Promise<Fragment> {
    const rows = await db.insert(fragments).values(data).returning();
    return rows[0]!;
  },

  async findById(id: string): Promise<Fragment | undefined> {
    const rows = await db
      .select()
      .from(fragments)
      .where(and(eq(fragments.id, id), isNull(fragments.deletedAt)))
      .limit(1);
    return rows[0];
  },

  async findByUserId(
    userId: string,
    opts: {
      status?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<Fragment[]> {
    const { status, limit = 50, offset = 0 } = opts;

    const conditions = [
      eq(fragments.userId, userId),
      isNull(fragments.deletedAt),
    ];
    if (status) {
      conditions.push(eq(fragments.status, status));
    }

    return db
      .select()
      .from(fragments)
      .where(and(...conditions))
      .orderBy(desc(fragments.capturedAt))
      .limit(limit)
      .offset(offset);
  },

  async updateById(
    id: string,
    data: Partial<Omit<NewFragment, "id" | "userId" | "createdAt">>,
  ): Promise<Fragment | undefined> {
    const rows = await db
      .update(fragments)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(fragments.id, id), isNull(fragments.deletedAt)))
      .returning();
    return rows[0];
  },

  /** Mark as processing + increment attempts atomically */
  async markProcessing(id: string): Promise<Fragment | undefined> {
    const rows = await db
      .update(fragments)
      .set({
        status: "processing",
        processingAttempts: sql`${fragments.processingAttempts} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(fragments.id, id),
          inArray(fragments.status, ["pending", "failed"]),
          isNull(fragments.deletedAt),
        ),
      )
      .returning();
    return rows[0];
  },

  /** Mark processing complete */
  async markProcessed(
    id: string,
    normalizedContent: string,
    ftsContent: string,
  ): Promise<Fragment | undefined> {
    const rows = await db
      .update(fragments)
      .set({
        status: "processed",
        normalizedContent,
        ftsContent,
        processedAt: new Date(),
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(fragments.id, id))
      .returning();
    return rows[0];
  },

  /** Mark processing failed */
  async markFailed(
    id: string,
    error: string,
  ): Promise<Fragment | undefined> {
    const rows = await db
      .update(fragments)
      .set({
        status: "failed",
        lastError: error,
        updatedAt: new Date(),
      })
      .where(eq(fragments.id, id))
      .returning();
    return rows[0];
  },

  /** User confirms AI result */
  async confirm(id: string): Promise<Fragment | undefined> {
    const rows = await db
      .update(fragments)
      .set({
        status: "confirmed",
        confirmedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(eq(fragments.id, id), eq(fragments.status, "processed")),
      )
      .returning();
    return rows[0];
  },

  /** User rejects AI result */
  async reject(id: string): Promise<Fragment | undefined> {
    const rows = await db
      .update(fragments)
      .set({
        status: "rejected",
        updatedAt: new Date(),
      })
      .where(
        and(eq(fragments.id, id), eq(fragments.status, "processed")),
      )
      .returning();
    return rows[0];
  },

  /** Soft delete */
  async softDelete(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .update(fragments)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(fragments.id, id),
          eq(fragments.userId, userId),
          isNull(fragments.deletedAt),
        ),
      )
      .returning();
    return rows.length > 0;
  },

  /** Find pending fragments ready for AI processing (max retries = 3) */
  async findPending(limit = 10): Promise<Fragment[]> {
    return db
      .select()
      .from(fragments)
      .where(
        and(
          inArray(fragments.status, ["pending", "failed"]),
          sql`${fragments.processingAttempts} < 3`,
          isNull(fragments.deletedAt),
        ),
      )
      .orderBy(fragments.capturedAt)
      .limit(limit);
  },

  /** Find confirmed fragments within a date range [start, end) */
  async findConfirmedInRange(userId: string, start: string, end: string): Promise<Fragment[]> {
    return db
      .select()
      .from(fragments)
      .where(
        and(
          eq(fragments.userId, userId),
          isNull(fragments.deletedAt),
          eq(fragments.status, "confirmed"),
          gte(fragments.processedAt, new Date(start)),
          lt(fragments.processedAt, new Date(end)),
        ),
      )
      .orderBy(desc(fragments.processedAt));
  },

  /** Check dedup by content hash */
  async findByContentHash(
    userId: string,
    hash: string,
  ): Promise<Fragment | undefined> {
    const rows = await db
      .select()
      .from(fragments)
      .where(
        and(
          eq(fragments.userId, userId),
          eq(fragments.contentHash, hash),
          isNull(fragments.deletedAt),
        ),
      )
      .limit(1);
    return rows[0];
  },
};
