import OpenAI from "openai";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  ...(env.OPENAI_BASE_URL ? { baseURL: env.OPENAI_BASE_URL } : {}),
});

const MAX_BATCH_SIZE = 100;

export const embeddingService = {
  /** Generate a single embedding vector (1536 dimensions) */
  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await client.embeddings.create({
        model: env.EMBEDDING_MODEL,
        input: text,
      });
      return response.data[0]!.embedding;
    } catch (err) {
      logger.error({ err }, "Failed to generate embedding");
      throw err;
    }
  },

  /** Generate embeddings for multiple texts (max 100 per call) */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];

    if (texts.length > MAX_BATCH_SIZE) {
      throw new Error(
        `Batch size ${texts.length} exceeds maximum of ${MAX_BATCH_SIZE}`,
      );
    }

    try {
      const response = await client.embeddings.create({
        model: env.EMBEDDING_MODEL,
        input: texts,
      });

      // Sort by index to guarantee order matches input
      const sorted = response.data.sort((a, b) => a.index - b.index);
      return sorted.map((item) => item.embedding);
    } catch (err) {
      logger.error({ err, count: texts.length }, "Failed to generate batch embeddings");
      throw err;
    }
  },
};
