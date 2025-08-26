
'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart';


const chartConfig = {
  usage: {
    label: 'Usage (L)',
    color: 'hsl(var(--chart-1))',
  },
  leaks: {
    label: 'Leaks',
    color: 'hsl(var(--destructive))'
  },
  desktop: {
    label: 'Usage',
    color: 'hsl(var(--chart-1))'
  },
  mobile: {
    label: 'Leaks',
    color: 'hsl(var(--destructive))'
  },
} satisfies ChartConfig;

interface OptimizedLineChartProps {
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  showLegend?: boolean;
}

const OptimizedLineChartComponent = ({ 
    data, 
    dataKey, 
    xAxisKey, 
    showLegend = false 
}: OptimizedLineChartProps) => {
    const hasMultipleLines = !!data[0]?.mobile || !!data[0]?.leaks;
    const currentXAxisKey = xAxisKey || (data[0]?.hour ? "hour" : "day");
    
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 10, left: 10, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey={currentXAxisKey}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}L`}
          />
          <ChartTooltip
            content={
              <ChartTooltipContent
                className="border-primary/20 bg-card/80 backdrop-blur-sm"
                indicator="dot"
              />
            }
          />
           {showLegend && hasMultipleLines && <ChartLegend content={<ChartLegendContent />} />}
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={`var(--color-${dataKey})`}
            strokeWidth={2}
            dot={false}
          />
          {hasMultipleLines && (
            <Line
                type="monotone"
                dataKey={data[0]?.mobile ? 'mobile' : 'leaks'}
                stroke="var(--color-mobile)"
                strokeWidth={2}
                dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default React.memo(OptimizedLineChartComponent);
