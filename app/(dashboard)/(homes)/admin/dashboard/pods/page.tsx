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
  pod?: { id: string; name: string } | null;
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

export default async function AdminPodsDashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "Admin";
  const jobs = await getJobs();

  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";
  const welcomeMessage = `${greeting}, ${userName}!`;

  const podBuckets = new Map<string, { total: number; active: number; filled: number }>();

  for (const job of jobs) {
    const podName = job.pod?.name || "Unassigned";
    const current = podBuckets.get(podName) || { total: 0, active: 0, filled: 0 };
    current.total += 1;
    if (job.status === "ACTIVE") current.active += 1;
    if (job.status === "FILLED") current.filled += 1;
    podBuckets.set(podName, current);
  }

  const podRows = Array.from(podBuckets.entries())
    .filter(([name]) => name !== "Unassigned")
    .sort((a, b) => b[1].total - a[1].total);

  const totalPods = podRows.length;
  const activeJobs = jobs.filter((j) => j.status === "ACTIVE").length;
  const blockedJobs = jobs.filter(
    (j) => j.status === "ON_HOLD" || j.status === "HOLD_BY_CLIENT"
  ).length;
  const avgJobsPerPod = totalPods ? (jobs.length / totalPods).toFixed(1) : "0";

  const podStats = [
    {
      title: "Total Active Pods",
      value: String(totalPods),
      icon: "UsersRound",
      iconBg: "bg-cyan-600",
      gradientFrom: "from-cyan-600/10",
      growth: `+${Math.max(totalPods - 1, 0)}`,
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Pods with active requisitions",
    },
    {
      title: "Jobs Assigned To Pods",
      value: String(jobs.filter((j) => j.pod?.id).length),
      icon: "BriefcaseBusiness",
      iconBg: "bg-blue-600",
      gradientFrom: "from-blue-600/10",
      growth: `${activeJobs}`,
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Currently active jobs",
    },
    {
      title: "Blocked Pod Jobs",
      value: String(blockedJobs),
      icon: "Timer",
      iconBg: "bg-red-600",
      gradientFrom: "from-red-600/10",
      growth: blockedJobs > 0 ? "+1" : "0",
      growthIcon: "ArrowUp",
      growthColor: blockedJobs > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400",
      description: "On hold by pod/client",
    },
    {
      title: "Average Jobs Per Pod",
      value: avgJobsPerPod,
      icon: "FileText",
      iconBg: "bg-purple-600",
      gradientFrom: "from-purple-600/10",
      growth: "+0.3",
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Load balancing indicator",
    },
  ];

  const topPods = podRows.slice(0, 6);
  const categories = topPods.map(([name]) => name);
  const podSeries = [
    { name: "Total Jobs", data: topPods.map(([, v]) => v.total) },
    { name: "Active", data: topPods.map(([, v]) => v.active) },
    { name: "Filled", data: topPods.map(([, v]) => v.filled) },
  ];

  const statusSeries = [
    jobs.filter((j) => j.status === "ACTIVE").length,
    jobs.filter((j) => j.status === "ON_HOLD" || j.status === "HOLD_BY_CLIENT").length,
    jobs.filter((j) => j.status === "FILLED").length,
    jobs.filter((j) => j.status === "CLOSED").length,
  ];

  return (
    <>
      <DashboardBreadcrumb title={welcomeMessage} text="Admin Pods Dashboard" />
      <div className="p-6 space-y-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard data={podStats} />
          </div>
        </Suspense>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 rounded-md shadow-none h-full">
              <CardContent className="p-6">
                <h6 className="font-semibold text-lg text-neutral-900 dark:text-white mb-4">
                  Pod Throughput Analysis
                </h6>
                <div className="apexcharts-tooltip-z-none">
                  <AudienceStatsChart
                    series={podSeries}
                    categories={categories.length ? categories : ["No Pod Data"]}
                    colors={["#487FFF", "#10B981", "#8B5CF6"]}
                    height={350}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="xl:col-span-4">
            <AnalysisDonutChart
              title="Pod Job Status Mix"
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
