import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import { auth } from "@/auth";
import { getGreeting } from "@/lib/utils";
import DeliveryStatsCards from "./components/delivery-stats-cards";
import PodSubmissionChart from "./components/pod-submission-chart";
import JobAgingChart from "./components/job-aging-chart";
import UrgentJobsTable from "./components/urgent-jobs-table";
import { Suspense } from "react";
import LoadingSkeleton from "@/components/loading-skeleton";

export default async function DeliveryHeadDashboard() {
    const session = await auth();
    const userName = session?.user?.name || "Delivery Head";

    const welcomeMessage = `${getGreeting()}, ${userName}!`;

    return (
        <>
            <DashboardBreadcrumb title={welcomeMessage} text="Delivery Dashboard" />
            <div className="p-6 space-y-6">
                <Suspense fallback={<LoadingSkeleton />}>
                    <DeliveryStatsCards />
                </Suspense>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    <div className="xl:col-span-8">
                        <Suspense fallback={<LoadingSkeleton />}>
                            <PodSubmissionChart />
                        </Suspense>
                    </div>
                    <div className="xl:col-span-4">
                        <Suspense fallback={<LoadingSkeleton />}>
                            <JobAgingChart />
                        </Suspense>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <Suspense fallback={<LoadingSkeleton />}>
                        <UrgentJobsTable />
                    </Suspense>
                </div>
            </div>
        </>
    );
}
