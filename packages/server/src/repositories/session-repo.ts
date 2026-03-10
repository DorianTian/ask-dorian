import { eq, and, isNull, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { sessions } from "../db/schema/sessions.js";

export type NewSession = typeof sessions.$inferInsert;
export type Session = typeof sessions.$inferSelect;

export const sessionRepo = {
  async create(data: NewSession): Promise<Session> {
    const rows = await db.insert(sessions).values(data).returning();
    return rows[0]!;
  },

  async findByTokenHash(hash: string): Promise<Session | undefined> {
    const rows = await db
      .select()
      .from(sessions)
      .where(
        and(eq(sessions.refreshTokenHash, hash), isNull(sessions.revokedAt)),
      )
      .limit(1);
    return rows[0];
  },

  /** Reuse detection: check if a previous (rotated-out) token is being replayed */
  async findByPreviousTokenHash(hash: string): Promise<Session | undefined> {
    const rows = await db
      .select()
      .from(sessions)
      .where(
        and(
          eq(sessions.previousTokenHash, hash),
          isNull(sessions.revokedAt),
        ),
      )
      .limit(1);
    return rows[0];
  },

  /** Rotate: set new token hash, store old as previous (atomic CAS) */
  async rotate(
    sessionId: string,
    newTokenHash: string,
    previousTokenHash: string,
    newExpiresAt: Date,
    ip?: string,
  ): Promise<boolean> {
    const rows = await db
      .update(sessions)
      .set({
        refreshTokenHash: newTokenHash,
        previousTokenHash,
        expiresAt: newExpiresAt,
        lastActiveAt: new Date(),
        ipAddress: ip,
      })
      .where(
        and(
          eq(sessions.id, sessionId),
          eq(sessions.refreshTokenHash, previousTokenHash),
          isNull(sessions.revokedAt),
        ),
      )
      .returning();
    return rows.length > 0;
  },

  /** Revoke a single session */
  async revoke(sessionId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(eq(sessions.id, sessionId));
  },

  /** Revoke ALL sessions for a user (all-device logout) */
  async revokeAllForUser(userId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(and(eq(sessions.userId, userId), isNull(sessions.revokedAt)));
  },

  /** Revoke all sessions for a specific device */
  async revokeByDevice(userId: string, deviceId: string): Promise<void> {
    await db
      .update(sessions)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(sessions.userId, userId),
          eq(sessions.deviceId, deviceId),
          isNull(sessions.revokedAt),
        ),
      );
  },

  /** Cleanup expired sessions (background job) */
  async cleanupExpired(): Promise<number> {
    const result = await db
      .delete(sessions)
      .where(
        and(
          sql`${sessions.expiresAt} < NOW()`,
          sql`${sessions.revokedAt} IS NOT NULL OR ${sessions.expiresAt} < NOW() - INTERVAL '30 days'`,
        ),
      )
      .returning();
    return result.length;
  },
};
