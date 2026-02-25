import { NextRequest, NextResponse } from "next/server";
import { recentNotifications, StoredNotification } from "../stream/store";

/**
 * Lightweight poll endpoint.
 * Returns only notifications newer than the caller's `lastSeen` timestamp.
 * Reads from the in-memory buffer — NO calls to the external backend.
 * Cost: one simple array.filter() per request.
 */
export async function GET(req: NextRequest) {
    const url = new URL(req.url);
    const lastSeen = parseInt(url.searchParams.get("lastSeen") || "0", 10);

    const missed: StoredNotification[] = recentNotifications.filter((n) => n.timestamp > lastSeen);

    return NextResponse.json({ notifications: missed });
}
