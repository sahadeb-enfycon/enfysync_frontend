import { Card, CardContent } from '@/components/ui/card';
import React from 'react';
import { ArrowDown } from "lucide-react";
import AudienceStatsChart from '@/components/charts/audience-stats-chart';

const TotalSubscriberCard = () => {
    const submissionSeries = [
        {
            name: "Submissions",
            data: [15, 12, 18, 20, 13, 16, 6, 14, 19]
        }
    ];
    const categories = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun2', 'Mon2'];

    return (
        <Card className="card">
            <CardContent className="card-body p-0">
                <h6 className="mb-3 font-semibold text-lg">Daily Submissions</h6>
                <div className="flex items-center gap-2 mb-5">
                    <h6 className="font-semibold mb-0">5,000</h6>
                    <span className="text-sm font-semibold rounded-full bg-red-100 dark:bg-red-600/25 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-600/50 px-2 py-1.5 line-height-1 flex items-center gap-1">
                        10% <ArrowDown width={14} height={14} />
                    </span>
                    - 20 Per Day
                </div>

                <div className="apexcharts-tooltip-z-none">
                    <AudienceStatsChart
                        series={submissionSeries}
                        categories={categories}
                        colors={['#487FFF']}
                        height={235}
                        columnWidth="50%"
                        borderRadius={2}
                    />
                </div>

            </CardContent>
        </Card>
    );
};

export default TotalSubscriberCard;