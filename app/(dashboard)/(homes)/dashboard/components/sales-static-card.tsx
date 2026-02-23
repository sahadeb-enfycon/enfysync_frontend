"use client";

import SalesStaticChart from "@/components/charts/sales-static-chart";
import CustomSelect from "@/components/shared/custom-select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp } from "lucide-react";

const SalesStaticCard = ({
  title = "Sales Statistic",
  value = "$27,200",
  subtitle = "+ $1400 Per Day",
  percentage = "10%"
}: {
  title?: string,
  value?: string,
  subtitle?: string,
  percentage?: string
}) => {
  return (
    <Card className="card">
      <CardContent className="px-0">
        <div className="flex flex-wrap items-center justify-between">
          <h6 className="text-lg mb-0">{title}</h6>
          <CustomSelect
            placeholder="Yearly"
            options={["Yearly", "Monthly", "Weekly", "Today"]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <h6 className="mb-0">{value}</h6>
          <span className="text-sm font-semibold rounded-full bg-green-100 dark:bg-green-600/25 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-600/50 px-2 py-1.5 flex items-center gap-1">
            {percentage} <ArrowUp width={14} height={14} />
          </span>
          <span className="text-xs font-medium">{subtitle}</span>
        </div>

        <div className="apexcharts-tooltip-style-1 mt-7">
          <SalesStaticChart />
        </div>
      </CardContent>
    </Card>
  );
};

export default SalesStaticCard;
