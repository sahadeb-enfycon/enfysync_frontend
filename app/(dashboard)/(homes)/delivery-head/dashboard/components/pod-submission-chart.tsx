"use client";

import AudienceStatsChart from '@/components/charts/audience-stats-chart';
import CustomSelect from '@/components/shared/custom-select';
import { Card, CardContent } from '@/components/ui/card';

const PodSubmissionChart = () => {
    const podCategories = ['Alpha Pod', 'Beta Pod', 'Gamma Pod', 'Delta Pod', 'Epsilon Pod'];
    const podSeries = [
        {
            name: 'Submissions',
            data: [120, 150, 90, 110, 130]
        },
        {
            name: 'Interviews',
            data: [45, 60, 30, 40, 55]
        },
        {
            name: 'Placements',
            data: [12, 18, 8, 10, 15]
        }
    ];

    return (
        <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 rounded-md shadow-none h-full">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h6 className="font-semibold text-lg text-neutral-900 dark:text-white">Pod Performance Overview</h6>
                    <CustomSelect
                        placeholder="Current Quarter"
                        options={["Current Quarter", "Last Quarter", "Year to Date", "All Time"]}
                    />
                </div>

                <div className="apexcharts-tooltip-z-none">
                    <AudienceStatsChart
                        series={podSeries}
                        categories={podCategories}
                        colors={['#487FFF', '#91B9FF', '#10B981']}
                        height={350}
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default PodSubmissionChart;
