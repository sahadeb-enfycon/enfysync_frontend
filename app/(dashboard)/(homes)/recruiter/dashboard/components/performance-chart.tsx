"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AudienceStatsChart from "@/components/charts/audience-stats-chart";

const RecruiterPerformanceChart = () => {
    return (
        <Card className="shadow-none border border-neutral-200 dark:border-slate-700">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Submission Performance</CardTitle>
                <p className="text-sm text-muted-foreground italic">Weekly submission trends for assigned jobs.</p>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <AudienceStatsChart />
                </div>
            </CardContent>
        </Card>
    );
};

export default RecruiterPerformanceChart;
