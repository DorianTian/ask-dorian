import Anthropic from "@anthropic-ai/sdk";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { taskRepo } from "../repositories/task-repo.js";
import { eventRepo } from "../repositories/event-repo.js";
import { knowledgeRepo } from "../repositories/knowledge-repo.js";
import { entityRelationshipRepo } from "../repositories/entity-relationship-repo.js";

const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
  ...(env.ANTHROPIC_BASE_URL ? { baseURL: env.ANTHROPIC_BASE_URL } : {}),
});

export interface ClassifyResult {
  classification: "task" | "event" | "knowledge" | "note" | "mixed";
  normalizedContent: string;
  ftsContent: string;
  generatedEntities: GeneratedEntity[];
}

export interface GeneratedEntity {
  type: "task" | "event" | "knowledge";
  data: Record<string, unknown>;
}

const CLASSIFY_SYSTEM_PROMPT = `You are a personal productivity AI assistant for Ask Dorian.
Your job is to analyze user input fragments and:
1. Classify the intent (task, event, knowledge, note, or mixed)
2. Extract structured data
3. Generate normalized content (cleaned-up, structured version)
4. Generate FTS content (searchable text for full-text search)

Respond in JSON only. Schema:
{
  "classification": "task" | "event" | "knowledge" | "note" | "mixed",
  "normalizedContent": "cleaned up text",
  "ftsContent": "searchable keywords and phrases",
  "generatedEntities": [
    {
      "type": "task" | "event" | "knowledge",
      "data": {
        // For task: { title, description?, priority?, dueDate?, estimatedMinutes?, tags? }
        // For event: { title, description?, startTime?, endTime?, location? }
        // For knowledge: { title, content, knowledgeType?, tags? }
      }
    }
  ]
}

Rules:
- priority: "urgent" | "high" | "medium" | "low" | "none"
- Date/time in ISO 8601 format
- If no clear action, classify as "note" with empty generatedEntities
- For "mixed", generate multiple entities
- Keep normalizedContent concise but complete
- ftsContent should include key terms, names, dates for search
- Always respond in the same language as the input`;

export const aiService = {
  async classifyFragment(
    rawContent: string,
    contentType: string,
    context: {
      locale?: string | null;
      timezone?: string | null;
      clientContext?: Record<string, unknown>;
    },
  ): Promise<ClassifyResult> {
    const now = new Date().toISOString();
    const userPrompt = `Content type: ${contentType}
Timezone: ${context.timezone || "UTC"}
Current time: ${now}

Fragment:
${rawContent}`;

    const response = await anthropic.messages.create({
      model: env.CLAUDE_HAIKU_MODEL,
      max_tokens: 1024,
      system: CLASSIFY_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "";

    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/) || [
        null,
        text,
      ];
      const parsed = JSON.parse(jsonMatch[1]!.trim()) as ClassifyResult;

      logger.debug(
        {
          model: env.CLAUDE_HAIKU_MODEL,
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
          classification: parsed.classification,
        },
        "AI classification complete",
      );

      return parsed;
    } catch (err) {
      logger.error({ err, rawResponse: text }, "Failed to parse AI response");
      // Fallback: treat as note
      return {
        classification: "note",
        normalizedContent: rawContent,
        ftsContent: rawContent,
        generatedEntities: [],
      };
    }
  },

  async createGeneratedEntities(
    userId: string,
    fragmentId: string,
    entities: GeneratedEntity[],
  ): Promise<void> {
    const createdIds: { type: string; id: string }[] = [];

    try {
      for (const entity of entities) {
        let createdId: string | undefined;

        switch (entity.type) {
          case "task": {
            const data = entity.data as {
              title: string;
              description?: string;
              priority?: string;
              dueDate?: string;
              estimatedMinutes?: number;
              tags?: string[];
            };
            const task = await taskRepo.create({
              userId,
              title: data.title,
              description: data.description,
              priority: (data.priority as "urgent" | "high" | "medium" | "low" | "none") ?? "none",
              dueDate: data.dueDate,
              estimatedMinutes: data.estimatedMinutes,
              tags: data.tags ?? [],
              source: "ai_generated",
            });
            createdId = task.id;
            break;
          }
          case "event": {
            const data = entity.data as {
              title: string;
              description?: string;
              startTime?: string;
              endTime?: string;
              location?: string;
            };
            const event = await eventRepo.create({
              userId,
              title: data.title,
              description: data.description,
              startTime: data.startTime ? new Date(data.startTime) : new Date(),
              endTime: data.endTime
                ? new Date(data.endTime)
                : new Date(Date.now() + 60 * 60 * 1000),
              location: data.location,
              source: "ai_generated",
            });
            createdId = event.id;
            break;
          }
          case "knowledge": {
            const data = entity.data as {
              title: string;
              content: string;
              knowledgeType?: string;
              tags?: string[];
            };
            const k = await knowledgeRepo.create({
              userId,
              title: data.title,
              content: data.content,
              type: data.knowledgeType ?? "note",
              tags: data.tags ?? [],
              source: "ai_generated",
            });
            createdId = k.id;
            break;
          }
        }

        // Link generated entity to source fragment
        if (createdId) {
          createdIds.push({ type: entity.type, id: createdId });
          await entityRelationshipRepo.create({
            fromEntityType: entity.type,
            fromEntityId: createdId,
            toEntityType: "fragment",
            toEntityId: fragmentId,
            relationType: "generated_from",
          });
        }
      }
    } catch (err) {
      // Log and surface the error — partial entities may exist, caller needs to know
      logger.error(
        { err, fragmentId, createdIds },
        "Failed to create generated entities, partial cleanup needed",
      );
      throw err;
    }
  },

  /** Extract text from an image using Claude Vision (OCR) */
  async extractTextFromImage(
    imageBase64: string,
    mimeType: string,
  ): Promise<string> {
    const response = await anthropic.messages.create({
      model: env.CLAUDE_HAIKU_MODEL,
      max_tokens: 2048,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: "Extract all text from this image. If it's a screenshot of a message, note, or document, extract the full content. If it contains a task, event, or important information, include all details. Respond with the extracted text only, no explanations.",
            },
          ],
        },
      ],
    });

    const text =
      response.content[0]?.type === "text" ? response.content[0].text : "";
    logger.debug(
      {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      "Vision OCR complete",
    );
    return text;
  },
};
