import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().default(4000),
  HOST: z.string().default("0.0.0.0"),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_DAYS: z.coerce.number().default(7),

  // CORS
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000,https://askdorian.com"),

  // AI — Claude (via WildCard proxy or direct)
  ANTHROPIC_API_KEY: z.string().startsWith("sk-"),
  ANTHROPIC_BASE_URL: z.string().url().optional(),
  CLAUDE_SONNET_MODEL: z.string().default("claude-sonnet-4-6"),
  CLAUDE_HAIKU_MODEL: z.string().default("claude-haiku-4-5-20251001"),

  // AI — OpenAI (Embedding + Whisper)
  OPENAI_API_KEY: z.string().startsWith("sk-"),
  OPENAI_BASE_URL: z.string().url().optional(),
  EMBEDDING_MODEL: z.string().default("text-embedding-3-small"),
  WHISPER_MODEL: z.string().default("whisper-1"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // File Storage
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default("ap-southeast-1"),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(120),
});

export type Env = z.infer<typeof envSchema>;

function loadEnv(): Env {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.flatten().fieldErrors;
    console.error("Invalid environment variables:", formatted);
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
