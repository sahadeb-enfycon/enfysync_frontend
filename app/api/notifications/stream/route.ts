import { NextRequest } from "next/server";
import {
    clients,
    nextClientId,
    recentNotifications,
    pruneOld,
} from "./store";

export async function GET(req: NextRequest) {
    const clientId = nextClientId();

    const url = new URL(req.url);
    const lastSeen = parseInt(url.searchParams.get("lastSeen") || "0", 10);

    pruneOld();
    const missed = recentNotifications.filter((n) => n.timestamp > lastSeen);

    console.log(`[stream] Client ${clientId} connected. Total clients: ${clients.size + 1}. Missed: ${missed.length}`);

    const stream = new ReadableStream({
        start(controller) {
            clients.set(clientId, controller);
            const enc = new TextEncoder();

            // Handshake
            controller.enqueue(enc.encode(`data: ${JSON.stringify({ type: "connected", clientId })}\n\n`));

            // Replay missed notifications
            missed.forEach((n) => {
                controller.enqueue(enc.encode(`data: ${JSON.stringify({ ...n, replayed: true })}\n\n`));
            });

            // Heartbeat every 15s
            const heartbeat = setInterval(() => {
                try { controller.enqueue(enc.encode(`: heartbeat\n\n`)); }
                catch { clearInterval(heartbeat); clients.delete(clientId); }
            }, 15000);

            req.signal.addEventListener("abort", () => {
                clearInterval(heartbeat);
                clients.delete(clientId);
                console.log(`[stream] Client ${clientId} disconnected. Remaining: ${clients.size}`);
                try { controller.close(); } catch { /* already closed */ }
            });
        },
        cancel() {
            clients.delete(clientId);
            console.log(`[stream] Client ${clientId} cancelled. Remaining: ${clients.size}`);
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
