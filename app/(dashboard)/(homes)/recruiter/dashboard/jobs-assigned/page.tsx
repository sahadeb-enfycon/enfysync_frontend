import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { auth } from "@/auth";
import RecruiterJobsTable from "@/components/dashboard/recruiter/RecruiterJobsTable";

export const dynamic = 'force-dynamic';

async function getAssignedJobs() {
    const session = await auth();
    const token = (session as any)?.user?.accessToken;

    if (!token) {
        console.error("No access token found in session");
        return [];
    }

    try {
        // Use the dedicated endpoint for recruiter assigned jobs
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs?my=true`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error("Failed to fetch assigned jobs. Status:", response.status);
            return [];
        }

        const assignedJobs = await response.json();
        return Array.isArray(assignedJobs) ? assignedJobs : [];

    } catch (error) {
        console.error("Error fetching assigned jobs:", error);
        return [];
    }
}

export default async function RecruiterAssignedJobsPage() {
    const jobs = await getAssignedJobs();
    console.log(`RecruiterAssignedJobsPage: fetched ${jobs.length} assigned jobs`);

    return (
        <>
            <DashboardBreadcrumb title="Assigned Jobs" text="Job Management" />
            <div className="p-6">
                <RecruiterJobsTable
                    jobs={jobs}
                    baseUrl="/recruiter/dashboard/jobs"
                    hideRecruiterFilter={true}
                />
            </div>
        </>
    );
}
