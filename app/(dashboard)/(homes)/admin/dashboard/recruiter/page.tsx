import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { auth } from "@/auth";
import RecentJobsTable from "@/app/(dashboard)/(homes)/recruiter/dashboard/components/recent-jobs-table";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";
import { serverApiClient } from "@/lib/serverApiClient";
import StatCard from "@/app/(dashboard)/(homes)/dashboard/components/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import AudienceStatsChart from "@/components/charts/audience-stats-chart";
import AnalysisDonutChart from "@/components/dashboard/admin/AnalysisDonutChart";

export const dynamic = "force-dynamic";

interface JobRow {
  id: string;
  status?: string;
  createdAt?: string;
  jobTitle?: string;
  clientName?: string;
}

interface SubmissionRow {
  recruiterId?: string;
  recruiter?: {
    fullName?: string | null;
    email?: string;
  } | null;
  submissionDate?: string;
  l1Status?: string;
  l2Status?: string;
  l3Status?: string;
  finalStatus?: string;
}

const norm = (value?: string) => (value || "").trim().toUpperCase();

async function getRecruiterJobs(): Promise<JobRow[]> {
  try {
    const response = await serverApiClient("/jobs", {
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

async function getSubmissions(): Promise<SubmissionRow[]> {
  try {
    const response = await serverApiClient("/recruiter-submissions", {
      cache: "no-store",
    });
    if (!response.ok) return [];
    const data = await response.json();
    const arr = Array.isArray(data) ? data : data?.submissions;
    return Array.isArray(arr) ? arr : [];
  } catch (error) {
    console.error("Error fetching recruiter submissions:", error);
    return [];
  }
}

export default async function AdminRecruiterDashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "Admin";
  const [jobs, submissions] = await Promise.all([getRecruiterJobs(), getSubmissions()]);

  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  const welcomeMessage = `${greeting}, ${userName}!`;
  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => norm(job.status) === "ACTIVE").length;
  const totalSubmissions = submissions.length;

  const l1Count = submissions.filter((s) => norm(s.l1Status) && norm(s.l2Status) === "" && norm(s.l3Status) === "" && !["SELECTED", "REJECTED", "FILLED", "CLOSED"].includes(norm(s.finalStatus))).length;
  const l2Count = submissions.filter((s) => norm(s.l2Status) && norm(s.l3Status) === "" && !["SELECTED", "REJECTED", "FILLED", "CLOSED"].includes(norm(s.finalStatus))).length;
  const finalRoundCount = submissions.filter((s) => norm(s.l3Status) && !["SELECTED", "REJECTED", "FILLED", "CLOSED"].includes(norm(s.finalStatus))).length;
  const selectedCount = submissions.filter((s) => ["SELECTED", "FILLED"].includes(norm(s.finalStatus))).length;
  const rejectedCount = submissions.filter((s) => norm(s.finalStatus) === "REJECTED").length;

  const recruiterMap = new Map<
    string,
    { name: string; submissions: number; selected: number; rejected: number }
  >();

  submissions.forEach((submission) => {
    const key = submission.recruiterId || "unknown";
    const displayName =
      submission.recruiter?.fullName ||
      submission.recruiter?.email ||
      key;
    const current = recruiterMap.get(key) || {
      name: displayName,
      submissions: 0,
      selected: 0,
      rejected: 0,
    };
    current.submissions += 1;
    if (["SELECTED", "FILLED"].includes(norm(submission.finalStatus))) current.selected += 1;
    if (norm(submission.finalStatus) === "REJECTED") current.rejected += 1;
    recruiterMap.set(key, current);
  });

  const recruiterRows = Array.from(recruiterMap.values()).sort(
    (a, b) => b.submissions - a.submissions
  );
  const activeRecruiters = recruiterRows.length;

  const recentMonths: string[] = [];
  const monthlySubmissions: number[] = [];
  const monthlySelections: number[] = [];
  for (let i = 5; i >= 0; i -= 1) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const month = d.getMonth();
    const year = d.getFullYear();
    recentMonths.push(d.toLocaleString("en-US", { month: "short" }));

    monthlySubmissions.push(
      submissions.filter((s) => {
        if (!s.submissionDate) return false;
        const date = new Date(s.submissionDate);
        return date.getMonth() === month && date.getFullYear() === year;
      }).length
    );

    monthlySelections.push(
      submissions.filter((s) => {
        if (!s.submissionDate || !["SELECTED", "FILLED"].includes(norm(s.finalStatus))) return false;
        const date = new Date(s.submissionDate);
        return date.getMonth() === month && date.getFullYear() === year;
      }).length
    );
  }

  const statusDistribution = [
    l1Count,
    l2Count,
    finalRoundCount,
    selectedCount,
    rejectedCount,
  ];

  const recruiterStats = [
    {
      title: "Active Recruiters",
      value: String(activeRecruiters),
      icon: "UsersRound",
      iconBg: "bg-cyan-600",
      gradientFrom: "from-cyan-600/10",
      growth: `${activeRecruiters}`,
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Contributing in current cycle",
    },
    {
      title: "Open Jobs",
      value: String(activeJobs),
      icon: "BriefcaseBusiness",
      iconBg: "bg-blue-600",
      gradientFrom: "from-blue-600/10",
      growth: `${totalJobs > 0 ? Math.round((activeJobs / totalJobs) * 100) : 0}%`,
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Share of active requisitions",
    },
    {
      title: "Total Submissions",
      value: String(totalSubmissions),
      icon: "FileText",
      iconBg: "bg-purple-600",
      gradientFrom: "from-purple-600/10",
      growth: `${selectedCount}`,
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Selected candidates so far",
    },
    {
      title: "Pipeline In Progress",
      value: String(l1Count + l2Count + finalRoundCount),
      icon: "Timer",
      iconBg: "bg-amber-600",
      gradientFrom: "from-amber-600/10",
      growth: `${l2Count + finalRoundCount}`,
      growthIcon: "ArrowUp",
      growthColor: "text-amber-600 dark:text-amber-400",
      description: "Candidates beyond L1",
    },
  ];

  return (
    <>
      <DashboardBreadcrumb title={welcomeMessage} text="Admin Recruiter Dashboard" />
      <div className="p-6 space-y-6">
        <Suspense fallback={<LoadingSkeleton />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard data={recruiterStats} />
          </div>
        </Suspense>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 rounded-md shadow-none h-full">
              <CardContent className="p-6">
                <h6 className="font-semibold text-lg text-neutral-900 dark:text-white mb-4">
                  Recruiter Throughput Trend (6 Months)
                </h6>
                <AudienceStatsChart
                  series={[
                    { name: "Submissions", data: monthlySubmissions },
                    { name: "Selections", data: monthlySelections },
                  ]}
                  categories={recentMonths}
                  colors={["#487FFF", "#10B981"]}
                  height={350}
                />
              </CardContent>
            </Card>
          </div>
          <div className="xl:col-span-4">
            <AnalysisDonutChart
              title="Recruitment Pipeline Mix"
              labels={["L1", "L2", "Final Round", "Selected", "Rejected"]}
              series={statusDistribution.some((value) => value > 0) ? statusDistribution : [1, 0, 0, 0, 0]}
              colors={["#06B6D4", "#487FFF", "#F59E0B", "#10B981", "#EF4444"]}
              totalLabel="Candidates"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-8">
            <Suspense fallback={<LoadingSkeleton />}>
              <RecentJobsTable jobs={jobs} />
            </Suspense>
          </div>
          <div className="xl:col-span-4">
            <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 rounded-md shadow-none h-full">
              <CardContent className="p-6">
                <h6 className="font-semibold text-lg text-neutral-900 dark:text-white mb-4">
                  Recruiter Productivity
                </h6>
                <div className="space-y-3">
                  {(recruiterRows.slice(0, 6).length > 0
                    ? recruiterRows.slice(0, 6)
                    : [{ name: "No recruiter activity", submissions: 0, selected: 0, rejected: 0 }]
                  ).map((row) => {
                    const conversion =
                      row.submissions > 0
                        ? Math.round((row.selected / row.submissions) * 100)
                        : 0;
                    return (
                      <div
                        key={row.name}
                        className="rounded-lg border border-neutral-200 dark:border-slate-700 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">
                            {row.name}
                          </p>
                          <span className="text-xs text-primary font-semibold">
                            {row.submissions} subs
                          </span>
                        </div>
                        <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-300">
                          <span>{row.selected} selected</span>
                          <span>{conversion}% conversion</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
