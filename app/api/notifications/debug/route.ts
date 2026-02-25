import { NextResponse } from "next/server";
import { clients, recentNotifications } from "../stream/store";

/**
 * Debug endpoint — open in browser to inspect notification state.
 * GET /api/notifications/debug
 */
export async function GET() {
    return NextResponse.json({
        connectedClients: clients.size,
        bufferedNotifications: recentNotifications.length,
        recentBuffer: recentNotifications.slice(-5), // last 5 only
        timestamp: new Date().toISOString(),
    });
}
