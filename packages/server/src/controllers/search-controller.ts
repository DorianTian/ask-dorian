import type { Context } from "koa";
import { z } from "zod";
import { searchService } from "../services/search-service.js";

const searchSchema = z.object({
  q: z.string().min(1).max(500),
  limit: z.coerce.number().min(1).max(100).default(20),
  types: z.string().optional(), // comma-separated: "fragment,task,event,knowledge"
});

export const searchController = {
  async search(ctx: Context) {
    const query = searchSchema.parse(ctx.query);
    const entityTypes = query.types?.split(",").filter(Boolean);

    const results = await searchService.search(ctx.state.userId, query.q, {
      limit: query.limit,
      entityTypes,
    });

    ctx.body = results;
  },
};
