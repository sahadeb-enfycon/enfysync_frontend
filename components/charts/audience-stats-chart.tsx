"use client";

import { ApexOptions } from 'apexcharts';
import dynamic from 'next/dynamic';
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

interface AudienceStatsChartProps {
    series?: ApexAxisChartSeries;
    categories?: string[];
    colors?: string[];
    height?: number;
    columnWidth?: string;
    borderRadius?: number;
}

const AudienceStatsChart = ({
    series,
    categories,
    colors = ['#487FFF', '#FF9F29', '#48AB69'],
    height = 280,
    columnWidth = '50%',
    borderRadius = 2
}: AudienceStatsChartProps) => {

    const chartSeries: ApexAxisChartSeries = series || [{
        name: 'Net Profit',
        data: [44, 100, 40, 56, 30, 58, 50, 44, 100, 40, 56, 30]
    }, {
        name: 'Revenue',
        data: [90, 140, 80, 125, 70, 140, 110, 90, 140, 80, 125, 70]
    }, {
        name: 'Free Cash',
        data: [60, 120, 60, 90, 50, 95, 90, 60, 120, 60, 90, 50]
    }]


    const chartOptions: ApexOptions = {
        colors: colors,
        legend: {
            show: true,
            position: 'top',
            horizontalAlign: 'right',
        },
        chart: {
            type: 'bar',
            height: height,
            toolbar: {
                show: false
            },
        },
        grid: {
            show: true,
            borderColor: '#00000000',
            strokeDashArray: 4,
            position: 'back',
        },
        plotOptions: {
            bar: {
                borderRadius: borderRadius,
                columnWidth: columnWidth,
                borderRadiusApplication: 'end'
            },
        },
        dataLabels: {
            enabled: false
        },
        states: {
            hover: {
                filter: {
                    type: 'none'
                }
            }
        },
        stroke: {
            show: true,
            width: 4,
            colors: ['transparent']
        },
        xaxis: {
            categories: categories || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        },
        yaxis: {
            labels: {
                formatter: function (value: any) {
                    return value;
                },
                style: {
                    fontSize: "14px"
                }
            },
        },
    };

    return (
        <Chart
            options={chartOptions}
            series={chartSeries}
            type="bar"
            height={height}
        />
    );
};

export default AudienceStatsChart;
