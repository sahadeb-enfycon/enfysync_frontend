"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import JobsTable from "@/components/dashboard/account-manager/JobsTable";
import { useSession } from "next-auth/react";
import { useNotifications } from "@/contexts/NotificationContext";

export default function DeliveryHeadJobsClientPage() {
    const { data: session } = useSession();
    const { registerJobRefetch, unregisterJobRefetch } = useNotifications();
    const [jobs, setJobs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchJobs = useCallback(async () => {
        const token = (session as any)?.user?.accessToken;
        if (!token) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/jobs`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            });
            if (res.ok) {
                const data = await res.json();
                setJobs(data);
            }
        } catch (err) {
            console.error("Error fetching delivery head jobs:", err);
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    // Initial load
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Auto-refresh when a job is created or deleted via SSE
    useEffect(() => {
        registerJobRefetch(fetchJobs);
        return () => unregisterJobRefetch(fetchJobs);
    }, [fetchJobs, registerJobRefetch, unregisterJobRefetch]);

    if (isLoading) {
        return (
            <>
                <DashboardBreadcrumb title="All Jobs" text="Job Management" />
                <div className="p-6 flex items-center justify-center h-48 text-muted-foreground">
                    Loading jobs...
                </div>
            </>
        );
    }

    return (
        <>
            <DashboardBreadcrumb title="All Jobs" text="Job Management" />
            <div className="p-6">
                <JobsTable
                    jobs={jobs}
                    showAccountManager={true}
                    showPod={true}
                    showActions={true}
                    showFilters={true}
                    onRefresh={fetchJobs}
                />
            </div>
        </>
    );
}
