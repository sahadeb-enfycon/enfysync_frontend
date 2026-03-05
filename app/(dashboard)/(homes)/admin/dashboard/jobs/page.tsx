import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import JobsTable from "@/components/dashboard/account-manager/JobsTable";
import { serverApiClient } from "@/lib/serverApiClient";

export const dynamic = "force-dynamic";

async function getJobs() {
  try {
    const response = await serverApiClient("/jobs", {
      cache: "no-store",
    });

    if (!response.ok) {
      console.error("Failed to fetch jobs. Status:", response.status);
      return [];
    }

    const data = await response.json();
    const jobs = Array.isArray(data) ? data : (data?.data ?? data?.content ?? data?.jobs ?? []);
    return Array.isArray(jobs) ? jobs : [];
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

export default async function AdminAllJobsPage() {
  const jobs = await getJobs();

  return (
    <>
      <DashboardBreadcrumb title="All Jobs" text="Admin Dashboard" />
      <div className="p-6">
        <JobsTable
          jobs={jobs}
          showAccountManager={true}
          showPod={true}
          showActions={false}
          showFilters={true}
          showEstCreatedDateTime={true}
          showCfrExtend={true}
        />
      </div>
    </>
  );
}
