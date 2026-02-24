"use client";

import StatCard from "@/app/(dashboard)/(homes)/dashboard/components/stat-card";
import { BriefcaseBusiness, FileText, CheckCircle2, Timer, ArrowUp } from "lucide-react";

interface RecruiterStatsCardsProps {
    jobsCount: number;
    activeJobsCount: number;
    submissionsCount: number;
    pendingInterviews?: number;
}

const RecruiterStatsCards = ({
    jobsCount = 0,
    activeJobsCount = 0,
    submissionsCount = 0,
    pendingInterviews = 5
}: RecruiterStatsCardsProps) => {
    const recruiterStats = [
        {
            title: "Total Assigned Jobs",
            value: jobsCount.toString(),
            icon: BriefcaseBusiness,
            iconBg: "bg-blue-600",
            gradientFrom: "from-blue-600/10",
            growth: "+2",
            growthIcon: ArrowUp,
            growthColor: "text-green-600 dark:text-green-400",
            description: "Jobs assigned this week",
        },
        {
            title: "Active Roles",
            value: activeJobsCount.toString(),
            icon: Timer,
            iconBg: "bg-orange-600",
            gradientFrom: "from-orange-600/10",
            growth: "+1",
            growthIcon: ArrowUp,
            growthColor: "text-orange-600 dark:text-orange-400",
            description: "Currently sourcing",
        },
        {
            title: "Total Submissions",
            value: submissionsCount.toString(),
            icon: FileText,
            iconBg: "bg-purple-600",
            gradientFrom: "from-purple-600/10",
            growth: "+12%",
            growthIcon: ArrowUp,
            growthColor: "text-green-600 dark:text-green-400",
            description: "Increase vs last month",
        },
        {
            title: "Upcoming Interviews",
            value: pendingInterviews.toString(),
            icon: CheckCircle2,
            iconBg: "bg-green-600",
            gradientFrom: "from-green-600/10",
            growth: "0",
            growthIcon: ArrowUp,
            growthColor: "text-neutral-600 dark:text-neutral-400",
            description: "Scheduled for this week",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard data={recruiterStats as any} />
        </div>
    );
};

export default RecruiterStatsCards;
