import { logger } from "../config/logger.js";
import { AppError } from "../middleware/error-handler.js";
import { embeddingRepo } from "../repositories/embedding-repo.js";
import { entityRelationshipRepo } from "../repositories/entity-relationship-repo.js";
import { eventRepo } from "../repositories/event-repo.js";
import { fragmentRepo, type Fragment } from "../repositories/fragment-repo.js";
import { knowledgeRepo } from "../repositories/knowledge-repo.js";
import { taskRepo } from "../repositories/task-repo.js";
import { sha256 } from "../utils/hash.js";
import { aiService } from "./ai-service.js";
import { embeddingService } from "./embedding-service.js";

export interface CreateFragmentInput {
  rawContent: string;
  contentType: "text" | "voice" | "image" | "url" | "file" | "email" | "forward";
  inputSource: string;
  inputDevice?: string;
  sourceApp?: string;
  sourceRef?: string;
  locale?: string;
  timezone?: string;
  location?: Record<string, unknown>;
  clientContext?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  parentId?: string;
  deviceId?: string;
}

export const fragmentService = {
  async create(
    userId: string,
    input: CreateFragmentInput,
  ): Promise<Fragment> {
    // If image, try OCR to extract text
    let rawContent = input.rawContent;
    if (input.contentType === "image" && input.clientContext?.imageBase64) {
      try {
        const base64 = input.clientContext.imageBase64 as string;
        const mimeType =
          (input.clientContext.mimeType as string) || "image/png";
        const ocrText = await aiService.extractTextFromImage(base64, mimeType);
        if (ocrText.trim()) {
          rawContent = ocrText;
        }
      } catch (ocrErr) {
        logger.warn({ err: ocrErr }, "Image OCR failed, using placeholder");
      }
    }

    // Dedup check
    const contentHash = sha256(rawContent);
    const existing = await fragmentRepo.findByContentHash(userId, contentHash);
    if (existing) {
      logger.info({ fragmentId: existing.id }, "Duplicate fragment detected");
      return existing;
    }

    const fragment = await fragmentRepo.create({
      userId,
      rawContent,
      contentType: input.contentType,
      contentHash,
      inputSource: input.inputSource,
      inputDevice: input.inputDevice,
      sourceApp: input.sourceApp,
      sourceRef: input.sourceRef,
      locale: input.locale,
      timezone: input.timezone,
      location: input.location,
      clientContext: input.clientContext ?? {},
      parentId: input.parentId,
      deviceId: input.deviceId,
      metadata: input.metadata ?? {},
    });

    // Trigger async AI processing (fire-and-forget)
    this.processFragment(fragment.id).catch((err) => {
      logger.error({ err, fragmentId: fragment.id }, "Background processing failed");
    });

    return fragment;
  },

  async findById(userId: string, id: string): Promise<Fragment> {
    const fragment = await fragmentRepo.findById(id);
    if (!fragment || fragment.userId !== userId) {
      throw new AppError(404, "FRAGMENT_NOT_FOUND", "Fragment not found");
    }
    return fragment;
  },

  async list(
    userId: string,
    opts: { status?: string; limit?: number; offset?: number } = {},
  ): Promise<Fragment[]> {
    return fragmentRepo.findByUserId(userId, opts);
  },

  async confirm(userId: string, id: string): Promise<Fragment> {
    const fragment = await this.findById(userId, id);
    const updated = await fragmentRepo.confirm(fragment.id);
    if (!updated) {
      throw new AppError(
        400,
        "INVALID_STATUS",
        "Fragment is not in processed status",
      );
    }
    return updated;
  },

  async reject(userId: string, id: string): Promise<Fragment> {
    const fragment = await this.findById(userId, id);
    const updated = await fragmentRepo.reject(fragment.id);
    if (!updated) {
      throw new AppError(
        400,
        "INVALID_STATUS",
        "Fragment is not in processed status",
      );
    }

    // Clean up generated entities and their relationships
    try {
      const relationships = await entityRelationshipRepo.findByTargetEntity(
        "fragment",
        fragment.id,
        "generated_from",
      );
      for (const rel of relationships) {
        // Soft-delete the generated entity
        switch (rel.fromEntity) {
          case "task":
            await taskRepo.softDelete(rel.fromId, userId).catch(() => {});
            break;
          case "event":
            await eventRepo.softDelete(rel.fromId, userId).catch(() => {});
            break;
          case "knowledge":
            await knowledgeRepo.softDelete(rel.fromId, userId).catch(() => {});
            break;
        }
        // Delete the relationship
        await entityRelationshipRepo.deleteRelation(rel.fromId, rel.toId, rel.relation);
        // Delete embedding
        await embeddingRepo.deleteByEntity(rel.fromEntity, rel.fromId).catch(() => {});
      }
    } catch (err) {
      logger.warn({ err, fragmentId: fragment.id }, "Failed to cleanup rejected fragment entities");
    }

    return updated;
  },

  async getConfirmedInRange(userId: string, start: string, end: string): Promise<Fragment[]> {
    return fragmentRepo.findConfirmedInRange(userId, start, end);
  },

  async update(
    userId: string,
    id: string,
    data: { isPinned?: boolean; isArchived?: boolean },
  ): Promise<Fragment> {
    await this.findById(userId, id);
    const updated = await fragmentRepo.updateById(id, data);
    if (!updated) {
      throw new AppError(404, "FRAGMENT_NOT_FOUND", "Fragment not found");
    }
    return updated;
  },

  async delete(userId: string, id: string): Promise<void> {
    const deleted = await fragmentRepo.softDelete(id, userId);
    if (!deleted) {
      throw new AppError(404, "FRAGMENT_NOT_FOUND", "Fragment not found");
    }
  },

  /** Core AI processing pipeline */
  async processFragment(fragmentId: string): Promise<void> {
    const fragment = await fragmentRepo.markProcessing(fragmentId);
    if (!fragment) {
      logger.warn({ fragmentId }, "Fragment not available for processing");
      return;
    }

    try {
      // Step 1: AI classification + structuring
      const aiResult = await aiService.classifyFragment(
        fragment.rawContent,
        fragment.contentType,
        {
          locale: fragment.locale,
          timezone: fragment.timezone,
          clientContext: fragment.clientContext as Record<string, unknown>,
        },
      );

      // Step 2: Generate normalized content + FTS content
      const normalizedContent = aiResult.normalizedContent || fragment.rawContent;
      const ftsContent = aiResult.ftsContent || normalizedContent;

      // Step 3: Update fragment with processed result
      await fragmentRepo.markProcessed(fragmentId, normalizedContent, ftsContent);

      // Step 3.5: Generate and store embedding for semantic search
      try {
        const embeddingText = `${normalizedContent}`;
        const vector = await embeddingService.generateEmbedding(embeddingText);
        await embeddingRepo.upsert(
          "fragment",
          fragment.id,
          vector,
          embeddingText,
          fragment.userId,
        );
      } catch (embErr) {
        // Embedding failure is non-fatal — log and continue
        logger.warn(
          { err: embErr, fragmentId },
          "Failed to generate embedding, skipping",
        );
      }

      // Step 4: Create generated entities (tasks, events, knowledge) if any
      if (aiResult.generatedEntities.length > 0) {
        await aiService.createGeneratedEntities(
          fragment.userId,
          fragmentId,
          aiResult.generatedEntities,
        );
      }

      logger.info(
        {
          fragmentId,
          entityCount: aiResult.generatedEntities.length,
          classification: aiResult.classification,
        },
        "Fragment processed successfully",
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      await fragmentRepo.markFailed(fragmentId, message);
      logger.error({ err, fragmentId }, "Fragment processing failed");
    }
  },

  /** Retry failed fragments (called by background job) */
  async retryPending(): Promise<number> {
    const pending = await fragmentRepo.findPending(10);
    let processed = 0;
    for (const fragment of pending) {
      try {
        await this.processFragment(fragment.id);
        processed++;
      } catch (err) {
        logger.error({ err, fragmentId: fragment.id }, "Retry processing failed");
      }
    }
    return processed;
  },
};
