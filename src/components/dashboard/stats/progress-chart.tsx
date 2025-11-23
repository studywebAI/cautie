"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import type { ProgressData } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useDictionary } from "@/contexts/dictionary-context";

const chartConfig = {
  "Study Time": {
    label: "Study Time (min)",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

type ProgressChartProps = {
  progressData: ProgressData[];
};

export function ProgressChart({ progressData }: ProgressChartProps) {
  const { dictionary } = useDictionary();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{dictionary.dashboard.statistics.title}</CardTitle>
        <CardDescription>{dictionary.dashboard.statistics.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart
            data={progressData}
            margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            accessibilityLayer
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
             <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}m`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="Study Time" fill="var(--color-Study Time)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
