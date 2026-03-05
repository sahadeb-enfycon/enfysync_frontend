"use server";

import { auth, signOut } from "@/auth";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "https://backend.enfycon.com").replace(/\/+$/, "");

export type LogoutResponse = { success: true } | { error: string };

export async function doLogout(): Promise<LogoutResponse> {
  try {
    const session = await auth();
    const refreshToken = session?.user?.refreshToken;

    // Call backend to revoke Keycloak SSO session (fire-and-forget — don't block if it fails)
    if (refreshToken) {
      try {
        await fetch(`${API_URL}/auth/logout`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (err) {
        console.error("Backend logout call failed:", err);
      }
    }

    await signOut({ redirect: false });
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "Logout failed. Please try again." };
  }
}
