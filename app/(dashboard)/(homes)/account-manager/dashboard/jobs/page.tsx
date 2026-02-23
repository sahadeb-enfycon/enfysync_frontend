import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { auth } from "@/auth";
import JobsTable from "@/components/dashboard/account-manager/JobsTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

async function getJobs() {
    const session = await auth();
    // In auth.ts, accessToken is added to session.user
    const token = (session as any)?.user?.accessToken;

    if (!token) {
        console.error("No access token found in session");
        return [];
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs?my=true`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            next: { revalidate: 60 }, // Revalidate every minute
        });

        if (!response.ok) {
            console.error("Failed to fetch jobs. Status:", response.status);
            return [];
        }

        return response.json();
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return [];
    }
}

export default async function AccountManagerJobsPage() {
    const jobs = await getJobs();

    return (
        <>
            <DashboardBreadcrumb title="My Posted Jobs" text="Job Management" />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">My Posted Jobs</h1>
                        <p className="mt-1 text-muted-foreground italic text-sm">List of past posted jobs, allowing updates to status and properties.</p>
                    </div>
                    <Button asChild className="h-10 px-4">
                        <Link href="/account-manager/dashboard/jobs/create">
                            <Plus className="h-4 w-4 mr-2" />
                            Post a New Job
                        </Link>
                    </Button>
                </div>

                <JobsTable jobs={jobs} />
            </div>
        </>
    );
}
