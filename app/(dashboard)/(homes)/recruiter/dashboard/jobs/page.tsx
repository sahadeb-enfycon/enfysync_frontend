import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { auth } from "@/auth";
import RecruiterJobsTable from "@/components/dashboard/recruiter/RecruiterJobsTable";

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

async function getTeam() {
    const session = await auth();
    const token = (session as any)?.user?.accessToken;

    if (!token) return null;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pods/my-team`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
        });

        if (!response.ok) {
            console.error("Failed to fetch team. Status:", response.status);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching team:", error);
        return null;
    }
}

export default async function RecruiterJobsPage() {
    const jobs = await getJobs();
    const team = await getTeam();
    console.log(`RecruiterJobsPage: fetched ${jobs.length} jobs`);

    return (
        <>
            <DashboardBreadcrumb title="Available Jobs" text="Job Management" />
            <div className="p-6">
                <RecruiterJobsTable
                    jobs={jobs}
                    team={team}
                    baseUrl="/recruiter/dashboard/jobs"
                />
            </div>
        </>
    );
}
