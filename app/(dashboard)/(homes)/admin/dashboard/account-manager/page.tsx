import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import { auth } from "@/auth";
import { Suspense } from "react";
import { serverApiClient } from "@/lib/serverApiClient";
import StatCard from "@/app/(dashboard)/(homes)/dashboard/components/stat-card";
import AudienceStatsChart from "@/components/charts/audience-stats-chart";
import AnalysisDonutChart from "@/components/dashboard/admin/AnalysisDonutChart";
import { Card, CardContent } from "@/components/ui/card";

export const dynamic = "force-dynamic";

interface JobRow {
  id: string;
  status?: string;
  createdAt?: string;
  accountManager?: {
    email?: string;
    fullName?: string | null;
  } | null;
}

interface SubmissionRow {
  jobId?: string;
  finalStatus?: string;
}

async function getJobs(): Promise<JobRow[]> {
  try {
    const response = await serverApiClient("/jobs", { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

async function getSubmissions(): Promise<SubmissionRow[]> {
  try {
    const response = await serverApiClient("/recruiter-submissions", { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    const arr = Array.isArray(data) ? data : data?.submissions;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export default async function AdminAccountManagerDashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "Admin";
  const [jobs, submissions] = await Promise.all([getJobs(), getSubmissions()]);

  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";
  const welcomeMessage = `${greeting}, ${userName}!`;

  const amBuckets = new Map<string, { name: string; jobs: number; active: number; submissions: number }>();
  const jobToAm = new Map<string, string>();

  for (const job of jobs) {
    const key = job.accountManager?.email || "unassigned";
    const name = job.accountManager?.fullName || job.accountManager?.email || "Unassigned";
    const current = amBuckets.get(key) || { name, jobs: 0, active: 0, submissions: 0 };
    current.jobs += 1;
    if (job.status === "ACTIVE") current.active += 1;
    amBuckets.set(key, current);
    jobToAm.set(job.id, key);
  }

  for (const sub of submissions) {
    if (!sub.jobId) continue;
    const amKey = jobToAm.get(sub.jobId);
    if (!amKey) continue;
    const current = amBuckets.get(amKey);
    if (!current) continue;
    current.submissions += 1;
    amBuckets.set(amKey, current);
  }

  const amRows = Array.from(amBuckets.entries())
    .filter(([key]) => key !== "unassigned")
    .sort((a, b) => b[1].jobs - a[1].jobs);

  const totalAMs = amRows.length;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => j.status === "ACTIVE").length;
  const totalSubmissions = submissions.length;
  const avgSubPerJob = totalJobs ? (totalSubmissions / totalJobs).toFixed(1) : "0";

  const amStats = [
    {
      title: "Active Account Managers",
      value: String(totalAMs),
      icon: "UsersRound",
      iconBg: "bg-cyan-600",
      gradientFrom: "from-cyan-600/10",
      growth: "+1",
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Posting jobs this cycle",
    },
    {
      title: "Total Requisitions Posted",
      value: String(totalJobs),
      icon: "BriefcaseBusiness",
      iconBg: "bg-blue-600",
      gradientFrom: "from-blue-600/10",
      growth: `+${Math.max(activeJobs - 1, 0)}`,
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Across all account managers",
    },
    {
      title: "Active Open Requisitions",
      value: String(activeJobs),
      icon: "Timer",
      iconBg: "bg-amber-600",
      gradientFrom: "from-amber-600/10",
      growth: "+4",
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Currently in hiring pipeline",
    },
    {
      title: "Avg Submissions / Job",
      value: avgSubPerJob,
      icon: "FileText",
      iconBg: "bg-purple-600",
      gradientFrom: "from-purple-600/10",
      growth: `${totalSubmissions}`,
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Submission efficiency index",
    },
  ];

  const topAM = amRows.slice(0, 6);
  const categories = topAM.map(([, v]) => v.name);
  const amSeries = [
    { name: "Posted Jobs", data: topAM.map(([, v]) => v.jobs) },
    { name: "Active Jobs", data: topAM.map(([, v]) => v.active) },
    { name: "Submissions", data: topAM.map(([, v]) => v.submissions) },
  ];

  const statusSeries = [
    jobs.filter((j) => j.status === "ACTIVE").length,
    jobs.filter((j) => j.status === "ON_HOLD" || j.status === "HOLD_BY_CLIENT").length,
    jobs.filter((j) => j.status === "FILLED").length,
    jobs.filter((j) => j.status === "CLOSED").length,
  ];

  return (
    <>
      <DashboardBreadcrumb title={welcomeMessage} text="Admin Account Manager Dashboard" />
      <div className="p-6 space-y-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard data={amStats} />
          </div>
        </Suspense>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 rounded-md shadow-none h-full">
              <CardContent className="p-6">
                <h6 className="font-semibold text-lg text-neutral-900 dark:text-white mb-4">
                  Account Manager Productivity Analysis
                </h6>
                <div className="apexcharts-tooltip-z-none">
                  <AudienceStatsChart
                    series={amSeries}
                    categories={categories.length ? categories : ["No Account Manager Data"]}
                    colors={["#487FFF", "#10B981", "#8B5CF6"]}
                    height={350}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="xl:col-span-4">
            <AnalysisDonutChart
              title="Requisition Status Distribution"
              labels={["Active", "On Hold", "Filled", "Closed"]}
              series={statusSeries.some((v) => v > 0) ? statusSeries : [1, 0, 0, 0]}
              colors={["#10B981", "#F59E0B", "#487FFF", "#EF4444"]}
              totalLabel="Jobs"
            />
          </div>
        </div>
      </div>
    </>
  );
}
