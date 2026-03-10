import { eq, and, isNull, sql, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { projects } from "../db/schema/projects.js";

export type NewProject = typeof projects.$inferInsert;
export type Project = typeof projects.$inferSelect;

export const projectRepo = {
  async create(data: NewProject): Promise<Project> {
    const rows = await db.insert(projects).values(data).returning();
    return rows[0]!;
  },

  async findById(id: string): Promise<Project | undefined> {
    const rows = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
      .limit(1);
    return rows[0];
  },

  async findByUserId(
    userId: string,
    opts: {
      status?: string[];
      limit?: number;
      offset?: number;
    } = {},
  ): Promise<Project[]> {
    const { status, limit = 50, offset = 0 } = opts;

    const conditions = [
      eq(projects.userId, userId),
      isNull(projects.deletedAt),
    ];
    if (status?.length) {
      conditions.push(inArray(projects.status, status));
    }

    return db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(projects.sortOrder)
      .limit(limit)
      .offset(offset);
  },

  async updateById(
    id: string,
    data: Partial<Omit<NewProject, "id" | "userId" | "createdAt">>,
  ): Promise<Project | undefined> {
    const rows = await db
      .update(projects)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(projects.id, id), isNull(projects.deletedAt)))
      .returning();
    return rows[0];
  },

  async softDelete(id: string, userId: string): Promise<boolean> {
    const rows = await db
      .update(projects)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(projects.id, id),
          eq(projects.userId, userId),
          isNull(projects.deletedAt),
        ),
      )
      .returning();
    return rows.length > 0;
  },
};
