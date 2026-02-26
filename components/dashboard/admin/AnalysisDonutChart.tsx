"use client";

import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface AnalysisDonutChartProps {
  title: string;
  labels: string[];
  series: number[];
  colors?: string[];
  totalLabel?: string;
}

export default function AnalysisDonutChart({
  title,
  labels,
  series,
  colors = ["#10B981", "#487FFF", "#F59E0B", "#EF4444", "#8B5CF6"],
  totalLabel = "Total",
}: AnalysisDonutChartProps) {
  const chartOptions: ApexOptions = {
    chart: { type: "donut" },
    labels,
    colors,
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`,
    },
    legend: {
      position: "bottom",
      fontSize: "12px",
      labels: { colors: "#64748b" },
      itemMargin: { horizontal: 10, vertical: 5 },
    },
    stroke: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "66%",
          labels: {
            show: true,
            total: {
              show: true,
              label: totalLabel,
              formatter: (w) =>
                String(
                  w.globals.seriesTotals.reduce(
                    (a: number, b: number) => a + b,
                    0
                  )
                ),
            },
          },
        },
      },
    },
  };

  return (
    <Card className="border border-gray-200 dark:border-neutral-700 bg-white dark:bg-slate-800 rounded-md shadow-none h-full">
      <CardContent className="p-6">
        <h6 className="font-semibold text-lg text-neutral-900 dark:text-white mb-6">
          {title}
        </h6>
        <Chart options={chartOptions} series={series} type="donut" height={320} />
      </CardContent>
    </Card>
  );
}

