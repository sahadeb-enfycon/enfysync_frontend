import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { auth } from "@/auth";
import RecruiterStatsCards from "./components/recruiter-stats-cards";
import RecruiterPerformanceChart from "./components/performance-chart";
import RecentJobsTable from "./components/recent-jobs-table";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";
import { serverApiClient } from "@/lib/serverApiClient";

async function getJobs() {
    try {
        const response = await serverApiClient("/jobs/recruiter/available-jobs", {
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

export default async function RecruiterDashboard() {
    const session = await auth();
    const userName = session?.user?.name || "Recruiter";
    const jobs = await getJobs();

    const hour = new Date().getHours();
    let greeting = "Good Evening";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";

    const welcomeMessage = `${greeting}, ${userName}!`;

    // Calculate basic stats
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter((j: any) => j.status === 'ACTIVE').length;

    return (
        <>
            <DashboardBreadcrumb title={welcomeMessage} text="Recruiter Dashboard" />
            <div className="p-6 space-y-6">
                <Suspense fallback={<LoadingSkeleton />}>
                    <RecruiterStatsCards
                        jobsCount={totalJobs}
                        activeJobsCount={activeJobs}
                        submissionsCount={totalJobs * 3} // Placeholder ratio
                    />
                </Suspense>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-8">
                        <Suspense fallback={<LoadingSkeleton />}>
                            <RecentJobsTable jobs={jobs} />
                        </Suspense>
                    </div>
                    {/* <div className="xl:col-span-4">
                        <Suspense fallback={<LoadingSkeleton />}>
                            <RecruiterPerformanceChart />
                        </Suspense>
                    </div> */}
                </div>
            </div>
        </>
    );
}
