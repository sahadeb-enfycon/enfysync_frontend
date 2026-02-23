"use client";

import { Card, CardContent } from '@/components/ui/card';
import dynamic from 'next/dynamic';
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const JobAgingChart = () => {
    const chartOptions: ApexOptions = {
        chart: {
            type: 'donut',
        },
        labels: ['0-7 Days (New)', '8-15 Days (Active)', '16-30 Days (Aging)', '30+ Days (Critical)'],
        colors: ['#10B981', '#487FFF', '#F59E0B', '#EF4444'],
        dataLabels: {
            enabled: true,
            formatter: function (val: number) {
                return Math.round(val) + "%";
            }
        },
        legend: {
            position: 'bottom',
            fontSize: '13px',
            fontFamily: 'Inter, sans-serif',
            labels: {
                colors: '#64748b'
            },
            markers: {
                size: 5
            },
            itemMargin: {
                horizontal: 10,
                vertical: 5
            }
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '65%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#64748b',
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '20px',
                            fontWeight: 700,
                            color: '#0f172a',
                            offsetY: 10,
                            formatter: function (val) {
                                return val;
                            }
                        },
                        total: {
                            show: true,
                            label: 'Total Jobs',
                            color: '#64748b',
                            formatter: function (w) {
                                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
                            }
                        }
                    }
                }
            }
        },
        tooltip: {
            enabled: true,
        }
    };

    const chartSeries = [35, 25, 20, 15]; // Mock percentages or counts

    return (
        <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 rounded-md shadow-none h-full">
            <CardContent className="p-6">
                <h6 className="font-semibold text-lg text-neutral-900 dark:text-white mb-6">Job Aging Distribution</h6>
                <div className="flex justify-center flex-grow">
                    <Chart
                        options={chartOptions}
                        series={chartSeries}
                        type="donut"
                        height={320}
                        width="100%"
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default JobAgingChart;
