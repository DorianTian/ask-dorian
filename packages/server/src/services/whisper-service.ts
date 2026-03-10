import OpenAI from "openai";
import fs from "node:fs";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

const client = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  ...(env.OPENAI_BASE_URL ? { baseURL: env.OPENAI_BASE_URL } : {}),
});

export const whisperService = {
  async transcribe(filePath: string, language?: string): Promise<string> {
    logger.debug({ filePath, language }, "Starting Whisper transcription");

    try {
      const response = await client.audio.transcriptions.create({
        model: env.WHISPER_MODEL,
        file: fs.createReadStream(filePath),
        ...(language ? { language } : {}),
      });

      logger.info(
        { filePath, textLength: response.text.length },
        "Whisper transcription completed",
      );

      return response.text;
    } catch (err) {
      logger.error({ err, filePath }, "Whisper transcription failed");
      throw err;
    }
  },
};
