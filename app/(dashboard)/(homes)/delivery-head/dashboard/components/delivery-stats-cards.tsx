"use client";

import StatCard from "@/app/(dashboard)/(homes)/dashboard/components/stat-card";
import { BriefcaseBusiness, FileText, CheckCircle2, TrendingUp, ArrowUp } from "lucide-react";

interface DeliveryStatsProps {
    stats: {
        activeHotJobs: number;
        weeklySubmissions: number;
        l1l2Conversion: number;
        offerToJoin: number;
    }
}

const DeliveryStatsCards = ({ stats }: DeliveryStatsProps) => {
    const deliveryStats = [
        {
            title: "Active Hot Jobs",
            value: String(stats.activeHotJobs),
            icon: BriefcaseBusiness,
            iconBg: "bg-red-600",
            gradientFrom: "from-red-600/10",
            growth: `${stats.activeHotJobs}`,
            growthIcon: ArrowUp,
            growthColor: "text-red-600 dark:text-red-400",
            description: "High priority active roles",
        },
        {
            title: "Total Submissions",
            value: String(stats.weeklySubmissions),
            icon: FileText,
            iconBg: "bg-blue-600",
            gradientFrom: "from-blue-600/10",
            growth: "Active",
            growthIcon: ArrowUp,
            growthColor: "text-green-600 dark:text-green-400",
            description: "Total submissions so far",
        },
        {
            title: "L1/L2 Pipeline",
            value: String(stats.l1l2Conversion),
            icon: TrendingUp,
            iconBg: "bg-purple-600",
            gradientFrom: "from-purple-600/10",
            growth: "Active",
            growthIcon: ArrowUp,
            growthColor: "text-green-600 dark:text-green-400",
            description: "Candidates actively interviewing",
        },
        {
            title: "Successful Placements",
            value: String(stats.offerToJoin),
            icon: CheckCircle2,
            iconBg: "bg-green-600",
            gradientFrom: "from-green-600/10",
            growth: "Total",
            growthIcon: ArrowUp,
            growthColor: "text-green-600 dark:text-green-400",
            description: "Candidates Joined/Offered",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard data={deliveryStats as any} />
        </div>
    );
};

export default DeliveryStatsCards;
