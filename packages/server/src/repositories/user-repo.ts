import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { users } from "../db/schema/users.js";
import { userSettings } from "../db/schema/user-settings.js";

export type NewUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const userRepo = {
  async findById(id: string): Promise<User | undefined> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0];
  },

  async findByEmail(email: string): Promise<User | undefined> {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);
    return rows[0];
  },

  async findByGoogleSub(googleSub: string): Promise<User | undefined> {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.googleSub, googleSub))
      .limit(1);
    return rows[0];
  },

  async create(data: NewUser): Promise<User> {
    const rows = await db
      .insert(users)
      .values({ ...data, email: data.email.toLowerCase() })
      .returning();
    const user = rows[0]!;

    // Auto-create user_settings
    await db.insert(userSettings).values({ userId: user.id });

    return user;
  },

  async updateById(
    id: string,
    data: Partial<Omit<NewUser, "id">>,
  ): Promise<User | undefined> {
    const rows = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return rows[0];
  },

  async incrementAiQuota(id: string): Promise<void> {
    await db
      .update(users)
      .set({ aiQuotaUsed: sql`${users.aiQuotaUsed} + 1` })
      .where(eq(users.id, id));
  },
};
