import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { auth } from "@/auth";
import RecruiterStatsCards from "@/app/(dashboard)/(homes)/recruiter/dashboard/components/recruiter-stats-cards";
import RecentJobsTable from "@/app/(dashboard)/(homes)/recruiter/dashboard/components/recent-jobs-table";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";
import { serverApiClient } from "@/lib/serverApiClient";

export const dynamic = "force-dynamic";

async function getRecruiterJobs() {
  try {
    const response = await serverApiClient("/jobs/recruiter/available-jobs", {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch recruiter jobs. Status:", response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching recruiter jobs:", error);
    return [];
  }
}

export default async function AdminRecruiterDashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "Admin";
  const jobs = await getRecruiterJobs();

  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  const welcomeMessage = `${greeting}, ${userName}!`;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job: { status?: string }) => job.status === "ACTIVE").length;

  return (
    <>
      <DashboardBreadcrumb title={welcomeMessage} text="Admin Recruiter Dashboard" />
      <div className="p-6 space-y-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <RecruiterStatsCards
            jobsCount={totalJobs}
            activeJobsCount={activeJobs}
            submissionsCount={totalJobs * 3}
          />
        </Suspense>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <RecentJobsTable jobs={jobs} />
            </Suspense>
          </div>
        </div>
      </div>
    </>
  );
}

