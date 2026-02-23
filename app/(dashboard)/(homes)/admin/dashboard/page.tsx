import GenerateContentCard from "@/app/(dashboard)/(homes)/dashboard/components/generate-content-card";
import SalesStaticCard from "@/app/(dashboard)/(homes)/dashboard/components/sales-static-card";
import StatCard from "@/app/(dashboard)/(homes)/dashboard/components/stat-card";
import TabsWithTableCard from "@/app/(dashboard)/(homes)/dashboard/components/tabs-with-table-card";
import TopCountriesCard from "@/app/(dashboard)/(homes)/dashboard/components/top-countries-card";
import TopPerformerCard from "@/app/(dashboard)/(homes)/dashboard/components/top-performer-card";
import TotalSubscriberCard from "@/app/(dashboard)/(homes)/dashboard/components/total-subscriber-card";
import UserOverviewCard from "@/app/(dashboard)/(homes)/dashboard/components/user-overview-card";
import PodPerformanceCard from "@/app/(dashboard)/(homes)/dashboard/components/pod-performance-card";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import LoadingSkeleton from "@/components/loading-skeleton";
import type { Metadata } from "next";
import { Suspense } from "react";
import { auth } from "@/auth";
import { ArrowUp, BriefcaseBusiness, FileText, UsersRound, Timer } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Dashboard | enfySync",
  description: "Recruitment Management Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();
  const userName = session?.user?.name || "User";

  const hour = new Date().getHours();
  let greeting = "Good Evening";
  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  const welcomeMessage = `${greeting}, ${userName}!`;

  const adminStats = [
    {
      title: "Total Open Jobs",
      value: "42",
      icon: "BriefcaseBusiness",
      iconBg: "bg-blue-600",
      gradientFrom: "from-blue-600/10",
      growth: "+5",
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Increase from last month",
    },
    {
      title: "Total Submissions",
      value: "1,248",
      icon: "FileText",
      iconBg: "bg-purple-600",
      gradientFrom: "from-purple-600/10",
      growth: "+12%",
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Better than last week",
    },
    {
      title: "Candidates in L1",
      value: "86",
      icon: "UsersRound",
      iconBg: "bg-cyan-600",
      gradientFrom: "from-cyan-600/10",
      growth: "+15",
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Currently in screening",
    },
    {
      title: "Candidates in L2",
      value: "34",
      icon: "Timer",
      iconBg: "bg-orange-600",
      gradientFrom: "from-orange-600/10",
      growth: "+4",
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Technical rounds scheduled",
    },
    {
      title: "Final Rounds",
      value: "12",
      icon: "UsersRound",
      iconBg: "bg-green-600",
      gradientFrom: "from-green-600/10",
      growth: "+2",
      growthIcon: "ArrowUp",
      growthColor: "text-green-600 dark:text-green-400",
      description: "Waiting for feedback",
    },
  ];

  return (
    <>
      <DashboardBreadcrumb title={welcomeMessage} text="Admin Dashboard" />

      <Suspense fallback={<LoadingSkeleton />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6">
          <StatCard data={adminStats} />
        </div>
      </Suspense>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
        <div className="xl:col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <SalesStaticCard
              title="Recruitment Throughput"
              value="156 Placements"
              subtitle="+ 12 from last month"
              percentage="15%"
            />
          </Suspense>
        </div>

        <div className="xl:col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <PodPerformanceCard />
          </Suspense>
        </div>

        <div className="xl:col-span-6 2xl:col-span-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <TotalSubscriberCard />
          </Suspense>
        </div>

        <div className="xl:col-span-6 2xl:col-span-4">
          <Suspense fallback={<LoadingSkeleton />}>
            <UserOverviewCard />
          </Suspense>
        </div>

        <div className="xl:col-span-12 2xl:col-span-9">
          <Suspense fallback={<LoadingSkeleton />}>
            <TabsWithTableCard />
          </Suspense>
        </div>

        <div className="xl:col-span-12 2xl:col-span-3">
          <Suspense fallback={<LoadingSkeleton />}>
            <TopPerformerCard />
          </Suspense>
        </div>

        <div className="xl:col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <TopCountriesCard />
          </Suspense>
        </div>

        <div className="xl:col-span-12 2xl:col-span-6">
          <Suspense fallback={<LoadingSkeleton />}>
            <GenerateContentCard />
          </Suspense>
        </div>
      </div>
    </>
  );
}
