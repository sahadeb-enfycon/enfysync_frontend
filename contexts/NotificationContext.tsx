"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
    ReactNode,
} from "react";
import { useSession } from "next-auth/react";

export interface JobNotification {
    id: string;
    type: "job_created" | "job_deleted";
    jobTitle: string;
    clientName: string;
    postedBy?: string;
    jobId?: string;
    timestamp: Date;
    read: boolean;
}

interface NotificationContextValue {
    notifications: JobNotification[];
    unreadCount: number;
    markAllRead: () => void;
    registerJobRefetch: (fn: () => void) => void;
    unregisterJobRefetch: (fn: () => void) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
    notifications: [],
    unreadCount: 0,
    markAllRead: () => { },
    registerJobRefetch: () => { },
    unregisterJobRefetch: () => { },
});

export const useNotifications = () => useContext(NotificationContext);

// ─── LocalStorage helpers ────────────────────────────────────────────────────
const LS_KEY = "enfysync_notifications";
const LS_LAST_SEEN_KEY = "enfysync_notif_last_seen";
const MAX_STORED = 50;
const POLL_INTERVAL_MS = 30_000; // 30 seconds

function loadFromStorage(): JobNotification[] {
    try {
        const raw = localStorage.getItem(LS_KEY);
        if (!raw) return [];
        const parsed: any[] = JSON.parse(raw);
        return parsed.map((n) => ({ ...n, timestamp: new Date(n.timestamp) }));
    } catch {
        return [];
    }
}

function saveToStorage(notifications: JobNotification[]) {
    try {
        localStorage.setItem(LS_KEY, JSON.stringify(notifications.slice(0, MAX_STORED)));
    } catch { /* quota exceeded — silent fail */ }
}

function getLastSeen(): number {
    try {
        return parseInt(localStorage.getItem(LS_LAST_SEEN_KEY) || "0", 10);
    } catch {
        return 0;
    }
}

function setLastSeen(ts: number) {
    try { localStorage.setItem(LS_LAST_SEEN_KEY, String(ts)); } catch { /* ignore */ }
}

// ─── Audio chime ─────────────────────────────────────────────────────────────
function playNotificationSound() {
    try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const playTone = (freq: number, startT: number, duration: number) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq, ctx.currentTime + startT);
            gain.gain.setValueAtTime(0, ctx.currentTime + startT);
            gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + startT + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startT + duration);
            osc.start(ctx.currentTime + startT);
            osc.stop(ctx.currentTime + startT + duration);
        };
        playTone(880, 0, 0.2);
        playTone(1100, 0.22, 0.25);
        setTimeout(() => ctx.close(), 600);
    } catch { /* silent fail */ }
}

// ─── Role matching ────────────────────────────────────────────────────────────
const ROLES_THAT_RECEIVE = ["pod_lead", "recruiter", "delivery_head"];

function normalizeRole(role: string) {
    return role.toLowerCase().replace(/-/g, "_");
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function NotificationProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<JobNotification[]>([]);
    const refetchFns = useRef<Set<() => void>>(new Set());
    const initialized = useRef(false);
    // Snapshot of job IDs from the last poll — used to detect new/deleted jobs
    const knownJobIds = useRef<Set<string> | null>(null);

    const userRoles: string[] = (session as any)?.user?.roles ?? [];
    const shouldConnect = userRoles.some((r) => ROLES_THAT_RECEIVE.includes(normalizeRole(r)));
    const token = (session as any)?.user?.accessToken;

    // Load persisted notifications once on client mount
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;
        const stored = loadFromStorage();
        if (stored.length > 0) setNotifications(stored);
    }, []);

    // Persist to localStorage whenever notifications change
    useEffect(() => {
        if (!initialized.current) return;
        saveToStorage(notifications);
        if (notifications.length > 0) {
            const latest = Math.max(...notifications.map((n) => n.timestamp.getTime()));
            setLastSeen(latest);
        }
    }, [notifications]);

    const registerJobRefetch = useCallback((fn: () => void) => {
        refetchFns.current.add(fn);
    }, []);

    const unregisterJobRefetch = useCallback((fn: () => void) => {
        refetchFns.current.delete(fn);
    }, []);

    const triggerRefetch = useCallback(() => {
        refetchFns.current.forEach((fn) => fn());
    }, []);

    const addNotification = useCallback((data: any, playSound: boolean) => {
        if (data.type !== "job_created" && data.type !== "job_deleted") return;

        const notif: JobNotification = {
            id: `${Date.now()}-${Math.random()}`,
            type: data.type,
            jobTitle: data.jobTitle || "Untitled Job",
            clientName: data.clientName || "",
            postedBy: data.postedBy,
            jobId: data.jobId,
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            read: false,
        };

        setNotifications((prev) => {
            // De-duplicate: don't add if same job + type appeared within 10s
            if (notif.jobId) {
                const exists = prev.some(
                    (p) =>
                        p.jobId === notif.jobId &&
                        p.type === notif.type &&
                        Math.abs(p.timestamp.getTime() - notif.timestamp.getTime()) < 10_000
                );
                if (exists) return prev;
            }
            return [notif, ...prev].slice(0, MAX_STORED);
        });

        if (playSound) {
            playNotificationSound();
            triggerRefetch();
        }
    }, [triggerRefetch]);

    // ── SSE connection (fast path) ──────────────────────────────────────────
    useEffect(() => {
        if (!shouldConnect) return;

        let es: EventSource;
        let reconnectTimeout: NodeJS.Timeout;

        function connect() {
            const lastSeen = getLastSeen();
            es = new EventSource(`/api/notifications/stream?lastSeen=${lastSeen}`);

            es.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "connected") return;
                    // Replayed notifications arrive silently (no chime, no table refresh)
                    addNotification(data, !data.replayed);
                } catch { /* malformed — ignore */ }
            };

            es.onerror = () => {
                es.close();
                reconnectTimeout = setTimeout(connect, 5000);
            };
        }

        connect();
        return () => {
            clearTimeout(reconnectTimeout);
            es?.close();
        };
    }, [shouldConnect, addNotification]);

    // ── Polling fallback (safety net) ──────────────────────────────────────
    // Polls /api/notifications/check every 30s.
    // This is a LIGHTWEIGHT in-memory check on the Next.js server — no external API calls.
    // Cost: one array.filter() per request. Negligible even with 100+ clients.
    // Catches events SSE missed (e.g. sender's network dropped before broadcast fired).
    useEffect(() => {
        if (!shouldConnect) return;

        async function checkMissed() {
            // Skip if tab is hidden — no point wasting requests
            if (document.visibilityState === "hidden") return;

            try {
                const lastSeen = getLastSeen();
                const res = await fetch(`/api/notifications/check?lastSeen=${lastSeen}`);
                if (!res.ok) return;
                const { notifications: missed } = await res.json();
                missed.forEach((n: any) => addNotification({ ...n, replayed: true }, false));
            } catch {
                // Network error — will retry next interval
            }
        }

        const interval = setInterval(checkMissed, POLL_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [shouldConnect, addNotification]);

    const markAllRead = useCallback(() => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);

    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
        <NotificationContext.Provider
            value={{ notifications, unreadCount, markAllRead, registerJobRefetch, unregisterJobRefetch }}
        >
            {children}
        </NotificationContext.Provider>
    );
}

