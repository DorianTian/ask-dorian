import { db } from "../db/index.js";
import { fragments } from "../db/schema/fragments.js";
import { tasks } from "../db/schema/tasks.js";
import { events } from "../db/schema/events.js";
import { knowledge } from "../db/schema/knowledge.js";
import { embeddingRepo } from "../repositories/embedding-repo.js";
import { embeddingService } from "./embedding-service.js";
import { eq, and, isNull, sql } from "drizzle-orm";
import { logger } from "../config/logger.js";

export interface SearchResult {
  entityType: string;
  entityId: string;
  title: string;
  snippet: string;
  score: number;
  createdAt: Date;
}

export const searchService = {
  /** Hybrid search: FTS + vector similarity */
  async search(
    userId: string,
    query: string,
    opts: { limit?: number; entityTypes?: string[] } = {},
  ): Promise<SearchResult[]> {
    const limit = opts.limit ?? 20;
    const results: SearchResult[] = [];

    // 1. Full-text search across entities
    const ftsResults = await this.ftsSearch(
      userId,
      query,
      limit,
      opts.entityTypes,
    );
    results.push(...ftsResults);

    // 2. Vector similarity search
    try {
      const queryEmbedding = await embeddingService.generateEmbedding(query);
      const vectorResults = await embeddingRepo.findSimilar(
        queryEmbedding,
        userId,
        limit,
      );

      // Filter by entity type if specified
      const filtered = opts.entityTypes
        ? vectorResults.filter((r) => opts.entityTypes!.includes(r.entityType))
        : vectorResults;

      // Merge vector results (avoid duplicates)
      for (const vr of filtered) {
        if (!results.find((r) => r.entityId === vr.entityId)) {
          results.push({
            entityType: vr.entityType,
            entityId: vr.entityId,
            title: "",
            snippet: "",
            score: vr.similarity,
            createdAt: new Date(),
          });
        }
      }
    } catch (err) {
      logger.warn({ err }, "Vector search failed, using FTS results only");
    }

    // Sort by score descending, take top N
    return results.sort((a, b) => b.score - a.score).slice(0, limit);
  },

  async ftsSearch(
    userId: string,
    query: string,
    limit: number,
    entityTypes?: string[],
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    const tsQuery = query
      .split(/\s+/)
      .filter(Boolean)
      .join(" & ");

    if (!tsQuery) return results;

    const types = entityTypes ?? ["fragment", "task", "event", "knowledge"];

    if (types.includes("fragment")) {
      const rows = await db
        .select({
          id: fragments.id,
          title: fragments.rawContent,
          createdAt: fragments.createdAt,
          rank: sql<number>`ts_rank(fts_vector, to_tsquery('simple', ${tsQuery}))`,
        })
        .from(fragments)
        .where(
          and(
            eq(fragments.userId, userId),
            isNull(fragments.deletedAt),
            sql`fts_vector @@ to_tsquery('simple', ${tsQuery})`,
          ),
        )
        .orderBy(
          sql`ts_rank(fts_vector, to_tsquery('simple', ${tsQuery})) DESC`,
        )
        .limit(limit);

      for (const row of rows) {
        results.push({
          entityType: "fragment",
          entityId: row.id,
          title: (row.title ?? "").slice(0, 100),
          snippet: (row.title ?? "").slice(0, 200),
          score: row.rank,
          createdAt: row.createdAt!,
        });
      }
    }

    if (types.includes("task")) {
      const rows = await db
        .select({
          id: tasks.id,
          title: tasks.title,
          description: tasks.description,
          createdAt: tasks.createdAt,
          rank: sql<number>`ts_rank(fts_vector, to_tsquery('simple', ${tsQuery}))`,
        })
        .from(tasks)
        .where(
          and(
            eq(tasks.userId, userId),
            isNull(tasks.deletedAt),
            sql`fts_vector @@ to_tsquery('simple', ${tsQuery})`,
          ),
        )
        .orderBy(
          sql`ts_rank(fts_vector, to_tsquery('simple', ${tsQuery})) DESC`,
        )
        .limit(limit);

      for (const row of rows) {
        results.push({
          entityType: "task",
          entityId: row.id,
          title: row.title,
          snippet: (row.description ?? "").slice(0, 200),
          score: row.rank,
          createdAt: row.createdAt!,
        });
      }
    }

    if (types.includes("event")) {
      const rows = await db
        .select({
          id: events.id,
          title: events.title,
          description: events.description,
          createdAt: events.createdAt,
          rank: sql<number>`ts_rank(fts_vector, to_tsquery('simple', ${tsQuery}))`,
        })
        .from(events)
        .where(
          and(
            eq(events.userId, userId),
            isNull(events.deletedAt),
            sql`fts_vector @@ to_tsquery('simple', ${tsQuery})`,
          ),
        )
        .orderBy(
          sql`ts_rank(fts_vector, to_tsquery('simple', ${tsQuery})) DESC`,
        )
        .limit(limit);

      for (const row of rows) {
        results.push({
          entityType: "event",
          entityId: row.id,
          title: row.title,
          snippet: (row.description ?? "").slice(0, 200),
          score: row.rank,
          createdAt: row.createdAt!,
        });
      }
    }

    if (types.includes("knowledge")) {
      const rows = await db
        .select({
          id: knowledge.id,
          title: knowledge.title,
          content: knowledge.content,
          createdAt: knowledge.createdAt,
          rank: sql<number>`ts_rank(fts_vector, to_tsquery('simple', ${tsQuery}))`,
        })
        .from(knowledge)
        .where(
          and(
            eq(knowledge.userId, userId),
            isNull(knowledge.deletedAt),
            sql`fts_vector @@ to_tsquery('simple', ${tsQuery})`,
          ),
        )
        .orderBy(
          sql`ts_rank(fts_vector, to_tsquery('simple', ${tsQuery})) DESC`,
        )
        .limit(limit);

      for (const row of rows) {
        results.push({
          entityType: "knowledge",
          entityId: row.id,
          title: row.title,
          snippet: (row.content ?? "").slice(0, 200),
          score: row.rank,
          createdAt: row.createdAt!,
        });
      }
    }

    return results;
  },
};
