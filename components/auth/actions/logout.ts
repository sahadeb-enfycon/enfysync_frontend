"use server";

import { signOut } from "@/auth";

export type LogoutResponse = { success: true } | { error: string };

export async function doLogout(): Promise<LogoutResponse> {
  try {
    await signOut({ redirect: false });
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { error: "Logout failed. Please try again." };
  }
}
