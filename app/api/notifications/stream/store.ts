/**
 * Shared in-memory notification store using globalThis so it survives
 * Next.js module isolation between route handlers in the same process.
 */
export interface StoredNotification {
    type: string;
    jobTitle: string;
    clientName: string;
    postedBy?: string;
    jobId?: string;
    timestamp: number; // epoch ms
}

const BUFFER_MAX = 100;
const BUFFER_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Use globalThis so the same array/Map is shared across all route modules
declare global {
    var __notif_buffer: StoredNotification[] | undefined;
    var __notif_clients: Map<string, ReadableStreamDefaultController> | undefined;
    var __notif_counter: number | undefined;
}

if (!globalThis.__notif_buffer) globalThis.__notif_buffer = [];
if (!globalThis.__notif_clients) globalThis.__notif_clients = new Map();
if (!globalThis.__notif_counter) globalThis.__notif_counter = 0;

export const recentNotifications: StoredNotification[] = globalThis.__notif_buffer;
export const clients: Map<string, ReadableStreamDefaultController> = globalThis.__notif_clients;
export function nextClientId(): string {
    return String(++globalThis.__notif_counter!);
}

export function pruneOld() {
    const cutoff = Date.now() - BUFFER_TTL_MS;
    while (recentNotifications.length > 0 && recentNotifications[0].timestamp < cutoff) {
        recentNotifications.shift();
    }
}

export function storeNotification(n: StoredNotification) {
    recentNotifications.push(n);
    if (recentNotifications.length > BUFFER_MAX) {
        recentNotifications.shift();
    }
}

export function broadcastToClients(notification: StoredNotification) {
    const message = `data: ${JSON.stringify(notification)}\n\n`;
    const encoded = new TextEncoder().encode(message);
    const dead: string[] = [];
    clients.forEach((ctrl, id) => {
        try { ctrl.enqueue(encoded); }
        catch { dead.push(id); }
    });
    dead.forEach((id) => clients.delete(id));
}
