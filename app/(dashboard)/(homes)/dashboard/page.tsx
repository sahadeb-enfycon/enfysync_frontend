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

    if (normalizedRoles.includes("DELIVERY_HEAD") || normalizedRoles.includes("DELIVERY-HEAD")) {
        redirect("/dashboard/delivery-head");
    } else if (normalizedRoles.includes("ADMIN")) {
        redirect("/dashboard/admin");
    } else if (normalizedRoles.includes("ACCOUNT_MANAGER") || normalizedRoles.includes("ACCOUNT-MANAGER")) {
        redirect("/dashboard/account-manager");
    } else if (normalizedRoles.includes("RECRUITER")) {
        redirect("/dashboard/recruiter");
    } else if (normalizedRoles.includes("POD_LEAD") || normalizedRoles.includes("POD-LEAD")) {
        redirect("/dashboard/pod-lead");
    } else {
        // Default fallback if no specific role matched
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-2">Unauthorized Access</h1>
                    <p className="text-neutral-500">You do not have the required roles to view this dashboard.</p>
                </div>
            </div>
        );
    }
}
