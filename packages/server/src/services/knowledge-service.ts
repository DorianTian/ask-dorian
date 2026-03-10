import { AppError } from "../middleware/error-handler.js";
import { knowledgeRepo, type Knowledge } from "../repositories/knowledge-repo.js";

export interface CreateKnowledgeInput {
  title: string;
  content: string;
  knowledgeType?: string;
  summary?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  projectId?: string;
  tags?: string[];
}

export interface UpdateKnowledgeInput {
  title?: string;
  content?: string;
  type?: string;
  summary?: string | null;
  sourceUrl?: string | null;
  sourceTitle?: string | null;
  projectId?: string | null;
  tags?: string[];
}

export const knowledgeService = {
  async create(userId: string, input: CreateKnowledgeInput): Promise<Knowledge> {
    const ftsContent = [input.title, input.content, ...(input.tags ?? [])].filter(Boolean).join(" ");
    return knowledgeRepo.create({
      userId,
      title: input.title,
      content: input.content,
      type: input.knowledgeType ?? "note",
      summary: input.summary,
      sourceUrl: input.sourceUrl,
      sourceTitle: input.sourceTitle,
      projectId: input.projectId,
      tags: input.tags ?? [],
      source: "manual",
      ftsContent,
    });
  },

  async findById(userId: string, id: string): Promise<Knowledge> {
    const item = await knowledgeRepo.findById(id);
    if (!item || item.userId !== userId) {
      throw new AppError(404, "KNOWLEDGE_NOT_FOUND", "Knowledge item not found");
    }
    return item;
  },

  async list(
    userId: string,
    opts: { type?: string; projectId?: string; limit?: number; offset?: number },
  ): Promise<Knowledge[]> {
    return knowledgeRepo.findByUserId(userId, opts);
  },

  async update(userId: string, id: string, input: UpdateKnowledgeInput): Promise<Knowledge> {
    const existing = await this.findById(userId, id);
    const data: Record<string, unknown> = { ...input };

    // Regenerate FTS content when searchable fields change
    if (input.title !== undefined || input.content !== undefined || input.tags !== undefined) {
      const title = input.title ?? existing.title;
      const content = input.content ?? existing.content;
      const tags = input.tags ?? (existing.tags as string[]) ?? [];
      data.ftsContent = [title, content, ...tags].filter(Boolean).join(" ");
    }

    const updated = await knowledgeRepo.updateById(id, data);
    if (!updated) {
      throw new AppError(404, "KNOWLEDGE_NOT_FOUND", "Knowledge item not found");
    }
    return updated;
  },

  async getCreatedInRange(userId: string, start: string, end: string): Promise<Knowledge[]> {
    return knowledgeRepo.findCreatedInRange(userId, start, end);
  },

  async delete(userId: string, id: string): Promise<void> {
    const deleted = await knowledgeRepo.softDelete(id, userId);
    if (!deleted) {
      throw new AppError(404, "KNOWLEDGE_NOT_FOUND", "Knowledge item not found");
    }
  },
};
