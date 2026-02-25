import { NextRequest, NextResponse } from "next/server";
import { storeNotification, broadcastToClients, StoredNotification, clients } from "../stream/store";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { event = "job_created", jobTitle, clientName, postedBy, jobId } = body;

        console.log(`[broadcast] Received event="${event}" job="${jobTitle}" clients=${clients.size}`);

        const notification: StoredNotification = {
            type: event,
            jobTitle: jobTitle || "",
            clientName: clientName || "",
            postedBy,
            jobId,
            timestamp: Date.now(),
        };

        storeNotification(notification);
        broadcastToClients(notification);

        console.log(`[broadcast] Sent to ${clients.size} connected SSE client(s)`);
        return NextResponse.json({ ok: true, sentTo: clients.size });
    } catch (err) {
        console.error("[broadcast] Error:", err);
        return NextResponse.json({ ok: false, error: "Failed to broadcast" }, { status: 500 });
    }
}
