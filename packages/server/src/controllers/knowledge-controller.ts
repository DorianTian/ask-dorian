import type { Context } from "koa";
import { z } from "zod";
import { knowledgeService } from "../services/knowledge-service.js";

const createKnowledgeSchema = z.object({
  title: z.string().min(1).max(500),
  content: z.string().min(1).max(100000),
  knowledgeType: z.string().max(30).default("note"),
  summary: z.string().max(2000).optional(),
  sourceUrl: z.string().url().max(1000).optional(),
  sourceTitle: z.string().max(500).optional(),
  projectId: z.string().uuid().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

const updateKnowledgeSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  content: z.string().min(1).max(100000).optional(),
  type: z.string().max(30).optional(),
  summary: z.string().max(2000).nullable().optional(),
  sourceUrl: z.string().url().max(1000).nullable().optional(),
  sourceTitle: z.string().max(500).nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
});

const listKnowledgeSchema = z.object({
  type: z.string().optional(),
  projectId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const knowledgeController = {
  async create(ctx: Context) {
    const body = createKnowledgeSchema.parse(ctx.request.body);
    const item = await knowledgeService.create(ctx.state.userId, body);
    ctx.status = 201;
    ctx.body = item;
  },

  async list(ctx: Context) {
    const query = listKnowledgeSchema.parse(ctx.query);
    const items = await knowledgeService.list(ctx.state.userId, query);
    ctx.body = items;
  },

  async getById(ctx: Context) {
    const item = await knowledgeService.findById(ctx.state.userId, ctx.params.id);
    ctx.body = item;
  },

  async update(ctx: Context) {
    const body = updateKnowledgeSchema.parse(ctx.request.body);
    const item = await knowledgeService.update(ctx.state.userId, ctx.params.id, body);
    ctx.body = item;
  },

  async delete(ctx: Context) {
    await knowledgeService.delete(ctx.state.userId, ctx.params.id);
    ctx.status = 204;
  },
};
