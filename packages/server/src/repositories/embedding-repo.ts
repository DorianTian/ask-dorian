import { eq, and, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import { embeddings } from "../db/schema/embeddings.js";
import { contentHash } from "../utils/hash.js";

export type NewEmbedding = typeof embeddings.$inferInsert;
export type Embedding = typeof embeddings.$inferSelect;

export interface SimilarResult {
  entityType: string;
  entityId: string;
  similarity: number;
}

export const embeddingRepo = {
  /** Insert or update embedding on conflict (entity_type + entity_id) */
  async upsert(
    entityType: string,
    entityId: string,
    embedding: number[],
    content: string,
    userId?: string,
  ): Promise<Embedding> {
    const hash = contentHash(content);

    const values: NewEmbedding = {
      entityType: entityType as NewEmbedding["entityType"],
      entityId,
      embedding,
      contentHash: hash,
      userId: userId ?? "00000000-0000-0000-0000-000000000000",
    };

    const rows = await db
      .insert(embeddings)
      .values(values)
      .onConflictDoUpdate({
        target: [embeddings.entityType, embeddings.entityId],
        set: {
          embedding,
          contentHash: hash,
          createdAt: new Date(),
        },
      })
      .returning();

    return rows[0]!;
  },

  /** Cosine similarity search using pgvector <=> operator */
  async findSimilar(
    embedding: number[],
    userId: string,
    limit = 10,
  ): Promise<SimilarResult[]> {
    const vectorStr = `[${embedding.join(",")}]`;

    const rows = await db
      .select({
        entityType: embeddings.entityType,
        entityId: embeddings.entityId,
        similarity: sql<number>`1 - (${embeddings.embedding} <=> ${vectorStr}::vector)`,
      })
      .from(embeddings)
      .where(eq(embeddings.userId, userId))
      .orderBy(sql`${embeddings.embedding} <=> ${vectorStr}::vector`)
      .limit(limit);

    return rows.map((row) => ({
      entityType: row.entityType,
      entityId: row.entityId,
      similarity: row.similarity,
    }));
  },

  /** Delete embedding by entity type and entity id */
  async deleteByEntity(entityType: string, entityId: string): Promise<void> {
    await db
      .delete(embeddings)
      .where(
        and(
          eq(embeddings.entityType, entityType as NewEmbedding["entityType"]),
          eq(embeddings.entityId, entityId),
        ),
      );
  },
};
