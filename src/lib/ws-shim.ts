/**
 * Supabase's realtime client throws at construction time when it runs on a
 * Node runtime older than 22 that has no global WebSocket
 * ("Node.js detected but no native WebSocket found").
 *
 * We never use realtime on the server, so a harmless stub is enough to keep
 * `createClient()` working on older Node hosts. Modern runtimes (Workers,
 * Node 22+, browsers) already have WebSocket and are left untouched.
 */
const g = globalThis as unknown as { WebSocket?: unknown };

if (typeof g.WebSocket === "undefined") {
  class UnsupportedWebSocket {
    constructor() {
      throw new Error("WebSocket/realtime is not available in this server runtime.");
    }
  }
  g.WebSocket = UnsupportedWebSocket;
}

export {};
