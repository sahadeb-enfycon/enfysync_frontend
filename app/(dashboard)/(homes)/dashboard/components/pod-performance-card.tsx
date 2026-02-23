"use client";

import AudienceStatsChart from '@/components/charts/audience-stats-chart';
import CustomSelect from '@/components/shared/custom-select';
import { Card, CardContent } from '@/components/ui/card';

const PodPerformanceCard = () => {
    const podCategories = ['Alpha Pod', 'Beta Pod', 'Gamma Pod', 'Delta Pod'];
    const podSeries = [
        {
            name: 'Submissions',
            data: [120, 150, 90, 110]
        },
        {
            name: 'Interviews',
            data: [45, 60, 30, 40]
        },
        {
            name: 'Placements',
            data: [12, 18, 8, 10]
        }
    ];

    return (
        <Card className="card">
            <CardContent className="card-body p-0">
                <div className="flex items-center justify-between">
                    <h6 className="mb-3 font-semibold text-lg">Pod wise Performance</h6>
                    <CustomSelect
                        placeholder="Last 30 Days"
                        options={["Yearly", "Monthly", "Weekly", "Today"]}
                    />
                </div>

                <div className="apexcharts-tooltip-z-none">
                    <AudienceStatsChart
                        series={podSeries}
                        categories={podCategories}
                        colors={['#487FFF', '#91B9FF', '#FF9F29']}
                        height={330}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default PodPerformanceCard;
