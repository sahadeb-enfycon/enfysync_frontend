"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { apiClient } from "@/lib/apiClient";

const PUBLIC_PATHS = ["/auth/login", "/auth/error", "/auth/signout", "/callback"];

/**
 * SessionGuard — redirects unauthenticated users.
 * Validates session via GET /auth/me on:
 *   1. Page load / refresh (immediately on mount)
 *   2. Tab focus (visibilitychange)
 */
export default function SessionGuard({ children }: { children: React.ReactNode }) {
    const { status } = useSession();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (status === "unauthenticated" && !PUBLIC_PATHS.some(p => pathname?.startsWith(p))) {
            router.replace("/auth/login");
        }
    }, [status, router, pathname]);

    useEffect(() => {
        if (status !== "authenticated") return;

        const checkToken = async () => {
            try {
                const res = await apiClient("/auth/me");
                if (res.status === 401) {
                    await signOut({ redirectTo: "/auth/login" });
                }
            } catch {
                // Network error — don't force logout
            }
        };

        // Run immediately on page load/refresh
        checkToken();

        // Also run when user switches back to the tab
        const onVisibility = () => {
            if (document.visibilityState === "visible") checkToken();
        };
        document.addEventListener("visibilitychange", onVisibility);
        return () => document.removeEventListener("visibilitychange", onVisibility);
    }, [status]);

    return <>{children}</>;
}
