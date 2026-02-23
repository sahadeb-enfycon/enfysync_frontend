import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { auth } from "@/auth";
import JobsTable from "@/components/dashboard/account-manager/JobsTable";

export const dynamic = 'force-dynamic';

async function getJobs() {
    const session = await auth();
    const token = (session as any)?.user?.accessToken;

    if (!token) {
        console.error("No access token found in session");
        return [];
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error("Failed to fetch jobs. Status:", response.status);
            return [];
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return [];
    }
}

export default async function DeliveryHeadJobsPage() {
    const jobs = await getJobs();

    return (
        <>
            <DashboardBreadcrumb title="All Jobs" text="Job Management" />
            <div className="p-6">
                {/* <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">All Jobs</h1>
                        <p className="mt-1 text-muted-foreground italic text-sm">Overview of all jobs posted in the system across all account managers.</p>
                    </div>
                </div> */}

                <JobsTable
                    jobs={jobs}
                    showAccountManager={true}
                    showPod={true}
                    showActions={true}
                    showFilters={true}
                />
            </div>
        </>
    );
}
