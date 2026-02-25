"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardBreadcrumb from "@/components/layout/dashboard-breadcrumb";
import RecruiterJobsTable from "@/components/dashboard/recruiter/RecruiterJobsTable";
import { useSession } from "next-auth/react";
import { useNotifications } from "@/contexts/NotificationContext";

export default function RecruiterJobsClientPage() {
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
            console.error("Error fetching recruiter jobs:", err);
        } finally {
            setIsLoading(false);
        }
    }, [session]);

    // Initial load
    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);

    // Register with notification context to re-fetch when a job is created/deleted
    useEffect(() => {
        registerJobRefetch(fetchJobs);
        return () => unregisterJobRefetch(fetchJobs);
    }, [fetchJobs, registerJobRefetch, unregisterJobRefetch]);

    if (isLoading) {
        return (
            <>
                <DashboardBreadcrumb title="Available Jobs" text="Job Management" />
                <div className="p-6 flex items-center justify-center h-48 text-muted-foreground">
                    Loading jobs...
                </div>
            </>
        );
    }

    return (
        <>
            <DashboardBreadcrumb title="Available Jobs" text="Job Management" />
            <div className="p-6">
                <RecruiterJobsTable
                    jobs={jobs}
                    baseUrl="/recruiter/dashboard/jobs"
                    onRefresh={fetchJobs}
                />
            </div>
        </>
    );
}
