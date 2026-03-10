import type { Context } from "koa";
import { logger } from "../config/logger.js";

interface SSEClient {
  ctx: Context;
  userId: string;
}

const MAX_CONNECTIONS_PER_USER = 5;
const clients = new Map<string, Set<SSEClient>>();

export const sseService = {
  /** Add a client to the SSE pool. Returns null if per-user limit exceeded. */
  addClient(userId: string, ctx: Context): SSEClient | null {
    if (!clients.has(userId)) {
      clients.set(userId, new Set());
    }

    const userClients = clients.get(userId)!;

    // Enforce per-user connection limit
    if (userClients.size >= MAX_CONNECTIONS_PER_USER) {
      return null;
    }

    const client: SSEClient = { ctx, userId };
    userClients.add(client);

    logger.debug({ userId, totalClients: userClients.size }, "SSE client connected");
    return client;
  },

  /** Remove a client from the SSE pool */
  removeClient(client: SSEClient) {
    const userClients = clients.get(client.userId);
    if (userClients) {
      userClients.delete(client);
      if (userClients.size === 0) {
        clients.delete(client.userId);
      }
    }
    logger.debug({ userId: client.userId }, "SSE client disconnected");
  },

  /** Send an event to all connected clients of a user */
  sendToUser(userId: string, event: string, data: unknown) {
    const userClients = clients.get(userId);
    if (!userClients || userClients.size === 0) return;

    const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

    for (const client of userClients) {
      try {
        client.ctx.res.write(payload);
      } catch {
        // Client disconnected, cleanup will happen via 'close' event
        userClients.delete(client);
      }
    }
  },

  /** Get connected client count for a user */
  getClientCount(userId: string): number {
    return clients.get(userId)?.size ?? 0;
  },

  /** Close all SSE connections (for graceful shutdown) */
  closeAll() {
    for (const [, userClients] of clients) {
      for (const client of userClients) {
        try {
          client.ctx.res.write("event: shutdown\ndata: {}\n\n");
          client.ctx.res.end();
        } catch {
          /* client already disconnected */
        }
      }
    }
    clients.clear();
    logger.info("All SSE clients disconnected");
  },
};
