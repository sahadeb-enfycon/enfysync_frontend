import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
    const session = await auth();

    if (!session?.user) {
        redirect("/auth/login");
    }

    const roles = (session.user as any)?.roles || [];

    // Standardize roles for comparison
    const normalizedRoles = roles.map((r: string) => r.toUpperCase());

    if (normalizedRoles.includes("ADMIN")) {
        redirect("/dashboard/admin");
    } else if (normalizedRoles.includes("ACCOUNT_MANAGER") || normalizedRoles.includes("ACCOUNT-MANAGER")) {
        redirect("/dashboard/account-manager");
    } else if (normalizedRoles.includes("RECRUITER")) {
        redirect("/dashboard/recruiter");
    } else if (normalizedRoles.includes("POD_LEAD") || normalizedRoles.includes("POD-LEAD")) {
        redirect("/dashboard/pod-lead");
    } else {
        // Default fallback if no specific role matched
        redirect("/dashboard/admin");
    }
}
