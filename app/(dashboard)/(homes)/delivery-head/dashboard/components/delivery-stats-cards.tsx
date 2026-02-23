"use client";

import StatCard from "@/app/(dashboard)/(homes)/dashboard/components/stat-card";
import { BriefcaseBusiness, FileText, CheckCircle2, TrendingUp, ArrowUp } from "lucide-react";

const DeliveryStatsCards = () => {
    const deliveryStats = [
        {
            title: "Active High-Priority Jobs",
            value: "18",
            icon: BriefcaseBusiness,
            iconBg: "bg-red-600",
            gradientFrom: "from-red-600/10",
            growth: "+3",
            growthIcon: ArrowUp,
            growthColor: "text-red-600 dark:text-red-400",
            description: "New critical roles this week",
        },
        {
            title: "Weekly Submission Velocity",
            value: "142",
            icon: FileText,
            iconBg: "bg-blue-600",
            gradientFrom: "from-blue-600/10",
            growth: "+14%",
            growthIcon: ArrowUp,
            growthColor: "text-green-600 dark:text-green-400",
            description: "Increase vs last week",
        },
        {
            title: "L1/L2 Conversion Rate",
            value: "68%",
            icon: TrendingUp,
            iconBg: "bg-purple-600",
            gradientFrom: "from-purple-600/10",
            growth: "+5%",
            growthIcon: ArrowUp,
            growthColor: "text-green-600 dark:text-green-400",
            description: "Quality of initial screenings",
        },
        {
            title: "Offer-to-Join Ratio",
            value: "92%",
            icon: CheckCircle2,
            iconBg: "bg-green-600",
            gradientFrom: "from-green-600/10",
            growth: "+2%",
            growthIcon: ArrowUp,
            growthColor: "text-green-600 dark:text-green-400",
            description: "Successful delivery rate",
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard data={deliveryStats as any} />
        </div>
    );
};

export default DeliveryStatsCards;
