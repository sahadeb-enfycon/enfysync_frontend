import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import { getGreeting } from "@/lib/utils";
import { auth } from "@/auth";
import { Suspense } from "react";
import { serverApiClient } from "@/lib/serverApiClient";
import StatCard from "@/app/(dashboard)/(homes)/dashboard/components/stat-card";
import AnalysisDonutChart from "@/components/dashboard/admin/AnalysisDonutChart";
import { Card, CardContent } from "@/components/ui/card";
import AccountManagerProductivityTable from "@/components/dashboard/admin/AccountManagerProductivityTable";

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

async function getJobs(): Promise<JobRow[]> {
  try {
    const response = await serverApiClient("/jobs", { cache: "no-store" });
    if (!response.ok) return [];
    const data = await response.json();
    const jobs = Array.isArray(data) ? data : (data?.data ?? data?.content ?? data?.jobs ?? []);
    return Array.isArray(jobs) ? jobs : [];
  } catch {
    return [];
  }
}

export default async function AdminAccountManagerDashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "Admin";
  const jobs = await getJobs();

  const welcomeMessage = `${getGreeting()}, ${userName}!`;

  const norm = (value?: string) => (value || "").trim().toUpperCase();
  const amBuckets = new Map<string, { name: string; jobs: number; active: number; filled: number; blocked: number }>();

  for (const job of jobs) {
    const key = job.accountManager?.email || "unassigned";
    const name = job.accountManager?.fullName || job.accountManager?.email || "Unassigned";
    const current = amBuckets.get(key) || { name, jobs: 0, active: 0, filled: 0, blocked: 0 };
    current.jobs += 1;
    if (norm(job.status) === "ACTIVE") current.active += 1;
    if (norm(job.status) === "FILLED") current.filled += 1;
    if (norm(job.status) === "ON_HOLD" || norm(job.status) === "HOLD_BY_CLIENT") current.blocked += 1;
    amBuckets.set(key, current);
  }

  const amRows = Array.from(amBuckets.entries())
    .filter(([key]) => key !== "unassigned")
    .sort((a, b) => b[1].jobs - a[1].jobs);

  const totalAMs = amRows.length;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((j) => norm(j.status) === "ACTIVE").length;
  const blockedJobs = jobs.filter((j) => norm(j.status) === "ON_HOLD" || norm(j.status) === "HOLD_BY_CLIENT").length;
  const avgJobsPerAM = totalAMs ? (totalJobs / totalAMs).toFixed(1) : "0";

  const amStats = [
    {
      title: "Active Account Managers",
      value: String(totalAMs),
      icon: "UsersRound",
      iconBg: "bg-cyan-600",
      gradientFrom: "from-cyan-600/10",
      growth: `${totalAMs}`,
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
      growth: `${activeJobs}`,
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
      growth: `${blockedJobs}`,
      growthIcon: "ArrowUp",
      growthColor: blockedJobs > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400",
      description: "Currently in hiring pipeline (blocked shown in trend)",
    },
    {
      title: "Avg Jobs / Account Manager",
      value: avgJobsPerAM,
      icon: "FileText",
      iconBg: "bg-purple-600",
      gradientFrom: "from-purple-600/10",
      growth: `${totalJobs}`,
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Workload distribution index",
    },
  ];

  const amTableRows = amRows
    .filter(([email]) => email.toLowerCase() !== "sambit@enfycon.com")
    .map(([email, v]) => {
    const fillRate = v.jobs > 0 ? Math.round((v.filled / v.jobs) * 100) : 0;
    return {
      email,
      name: v.name,
      jobs: v.jobs,
      active: v.active,
      filled: v.filled,
      blocked: v.blocked,
      fillRate,
    };
  });

  const statusSeries = [
    jobs.filter((j) => norm(j.status) === "ACTIVE").length,
    jobs.filter((j) => norm(j.status) === "ON_HOLD" || norm(j.status) === "HOLD_BY_CLIENT").length,
    jobs.filter((j) => norm(j.status) === "FILLED").length,
    jobs.filter((j) => norm(j.status) === "CLOSED").length,
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

        <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 rounded-md shadow-none">
          <CardContent className="p-6">
            <h6 className="font-semibold text-lg text-neutral-900 dark:text-white mb-4">
              Account Manager Productivity Analysis
            </h6>
            <AccountManagerProductivityTable rows={amTableRows} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4 xl:col-start-9">
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
