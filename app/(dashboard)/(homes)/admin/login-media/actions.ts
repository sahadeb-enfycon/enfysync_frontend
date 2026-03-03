"use server";

import { serverApiClient } from "@/lib/serverApiClient";

export async function uploadLoginMediaAction(formData: FormData) {
    try {
        const response = await serverApiClient("/login-media/upload", {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            return { success: true };
        } else {
            let errorMsg = "Failed to upload login media.";
            try {
                const errorData = await response.json();
                if (errorData.message) errorMsg = errorData.message;
            } catch { }
            return { success: false, error: errorMsg };
        }
    } catch (error: any) {
        console.error("error in uploadLoginMediaAction:", error);
        return { success: false, error: "An unexpected error occurred during server upload." };
    }
}
