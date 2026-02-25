import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { auth } from "@/auth";
import RecruiterJobsTable from "@/components/dashboard/recruiter/RecruiterJobsTable";

export const dynamic = 'force-dynamic';

async function getAssignedJobs() {
    const session = await auth();
    const token = (session as any)?.user?.accessToken;
    const userId = (session as any)?.user?.id;

    if (!token || !userId) {
        console.error("No access token or user ID found in session");
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

        const allJobs = await response.json();

        // Filter jobs strictly where the current user is in assignedRecruiters
        if (Array.isArray(allJobs)) {
            const assignedJobs = allJobs.filter((job: any) =>
                job.assignedRecruiters?.some((recruiter: any) => recruiter.id === userId)
            );
            return assignedJobs;
        }

        return [];
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
