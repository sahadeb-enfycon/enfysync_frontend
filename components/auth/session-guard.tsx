"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";
import toast from "react-hot-toast";

export default function SessionGuard({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.error === "RefreshTokenError") {
            toast.error("Your session has expired. Please log in again.");
            signOut({ callbackUrl: "/auth/login" });
        }
    }, [session]);

    return <>{children}</>;
}
