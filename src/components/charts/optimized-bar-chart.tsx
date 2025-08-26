
'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

const chartConfig = {
  usage: {
    label: 'Usage (L)',
    color: 'hsl(var(--primary))',
  },
  desktop: {
     label: 'Usage',
     color: 'hsl(var(--chart-1))'
  },
} satisfies ChartConfig;

interface OptimizedBarChartProps {
  data: any[];
  layout?: 'horizontal' | 'vertical';
}

const OptimizedBarChartComponent = ({
  data,
  layout = 'horizontal',
}: OptimizedBarChartProps) => {
  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={layout}
          margin={
            layout === 'vertical'
              ? { left: 0, right: 10, top: 0, bottom: 0 }
              : { top: 5, right: 10, left: 10, bottom: 0 }
          }
           barCategoryGap={layout === 'vertical' ? '20%' : undefined}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={layout === 'horizontal'}
            horizontal={layout === 'vertical'}
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          {layout === 'horizontal' ? (
             <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
          ) : (
            <XAxis type="number" hide />
          )}

          {layout === 'vertical' ? (
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{
                fill: 'hsl(var(--muted-foreground))',
                fontSize: 13,
                fontWeight: 500,
              }}
              width={80}
              style={{ transform: 'translateX(-10px)' }}
            />
          ) : (
            <YAxis />
          )}

          <ChartTooltip
            cursor={{ fill: 'hsla(var(--primary), 0.1)' }}
            content={
              <ChartTooltipContent
                className="border-primary/20 bg-card/80 backdrop-blur-sm"
                labelClassName="font-bold text-foreground"
                indicator="dot"
              />
            }
          />
          <Bar
            dataKey={data[0]?.usage ? "usage" : "desktop"}
            fill="var(--color-usage)"
            radius={layout === 'vertical' ? [0, 8, 8, 0] : [4, 4, 0, 0]}
            background={layout === 'vertical' ? { fill: 'hsl(var(--muted) / 0.5)', radius: 8 } : false}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default React.memo(OptimizedBarChartComponent);
