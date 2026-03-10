import { eq, and, isNull, desc, sql, inArray, gte, lt } from "drizzle-orm";
import { db } from "../db/index.js";
import { knowledge } from "../db/schema/knowledge.js";

export type NewKnowledge = typeof knowledge.$inferInsert;
export type Knowledge = typeof knowledge.$inferSelect;

export const knowledgeRepo = {
  async create(data: NewKnowledge): Promise<Knowledge> {
    const rows = await db.insert(knowledge).values(data).returning();
    return rows[0]!;
  },

  async findById(id: string): Promise<Knowledge | undefined> {
    const rows = await db
      .select()
      .from(knowledge)
      .where(and(eq(knowledge.id, id), isNull(knowledge.deletedAt)))
      .limit(1);
    return rows[0];
  },

  async findByUserId(
    userId: string,
    opts: {
      type?: string;
      projectId?: string;
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<Knowledge[]> {
    const { type, projectId, limit = 50, offset = 0 } = opts;

    const conditions = [
      eq(knowledge.userId, userId),
      isNull(knowledge.deletedAt),
    ];
    if (type) {
      conditions.push(eq(knowledge.type, type));
    }
    if (projectId) {
      conditions.push(eq(knowledge.projectId, projectId));
    }

    return db
      .select()
      .from(knowledge)
      .where(and(...conditions))
      .orderBy(desc(knowledge.createdAt))
      .limit(limit)
      .offset(offset);
  },

  async updateById(
    id: string,
    data: Partial<Omit<NewKnowledge, "id" | "userId" | "createdAt">>,
  ): Promise<Knowledge | undefined> {
    const rows = await db
      .update(knowledge)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(knowledge.id, id), isNull(knowledge.deletedAt)))
      .returning();
    return rows[0];
  },

  /** Find knowledge items created within a date range [start, end) */
  async findCreatedInRange(userId: string, start: string, end: string): Promise<Knowledge[]> {
    return db
      .select()
      .from(knowledge)
      .where(
        and(
          eq(knowledge.userId, userId),
          isNull(knowledge.deletedAt),
          gte(knowledge.createdAt, new Date(start)),
          lt(knowledge.createdAt, new Date(end)),
        ),
      )
      .orderBy(desc(knowledge.createdAt));
  },

  async softDelete(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .update(knowledge)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(knowledge.id, id),
          eq(knowledge.userId, userId),
          isNull(knowledge.deletedAt),
        ),
      )
      .returning();
    return rows.length > 0;
  },
};
