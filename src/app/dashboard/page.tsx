
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

import {
  quickStatsData,
  roomUsageData,
  usageSummaryData,
  totalUsageData,
} from '@/lib/data';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const OptimizedBarChart = dynamic(
  () => import('@/components/charts/optimized-bar-chart'),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
  }
);

type Timeframe = 'Today' | 'Week' | 'Month' | 'Year';

export default function Home() {
  const [timeframe, setTimeframe] = useState<Timeframe>('Today');

  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
  };

  const currentTotalUsage = totalUsageData[timeframe];
  const currentQuickStats = quickStatsData[timeframe];
  const currentRoomUsage = roomUsageData[timeframe];
  const currentSummary = usageSummaryData[timeframe];

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:space-y-6 md:p-6 lg:p-8">
      {/* Top Banner */}
      <div className="elevated-card p-5">
        <div className="flex flex-col items-start">
          <p className="text-sm font-medium text-muted-foreground">
            Total Water Used ({timeframe})
          </p>
          <p className="my-2 text-3xl font-bold text-primary md:text-4xl">
            {currentTotalUsage.usage} L
          </p>
          <div className="flex items-center rounded-full bg-green-500/10 px-2 py-1 text-sm text-green-500">
            <TrendingUp className="mr-1.5 h-4 w-4" />
            <span>{currentTotalUsage.comparison}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {currentQuickStats.map((stat, index) => (
          <div
            key={index}
            className={cn(
              'elevated-card flex h-32 flex-col justify-between p-4 md:h-36',
              stat.glowing
                ? 'border-destructive/50 shadow-[0_0_24px_hsl(var(--destructive)_/_0.35)]'
                : ''
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full',
                stat.glowing ? 'bg-destructive/10' : 'bg-primary/10'
              )}
            >
              <stat.icon
                className={cn(
                  'h-5 w-5',
                  stat.glowing ? 'text-destructive' : 'text-primary'
                )}
              />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground md:text-2xl">
                {stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.title}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
        {/* Graph Section */}
        <Card className="elevated-card lg:col-span-2">
          <CardHeader className="p-4 md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-lg font-semibold text-foreground">
                Room-wise Usage
              </CardTitle>
              <div className="flex items-center gap-1 self-start rounded-full bg-muted/50 p-1 sm:self-center">
                {(['Today', 'Week', 'Month', 'Year'] as Timeframe[]).map(
                  (period) => (
                    <Button
                      key={period}
                      size="sm"
                      onClick={() => handleTimeframeChange(period)}
                      className={cn(
                        'h-7 rounded-full px-3 text-xs transition-colors',
                        timeframe === period
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-transparent text-muted-foreground hover:bg-secondary'
                      )}
                    >
                      {period}
                    </Button>
                  )
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
            <div className="h-[300px] w-full">
              <OptimizedBarChart data={currentRoomUsage} layout="vertical" />
            </div>
          </CardContent>
        </Card>

        {/* List Section */}
        <div className="space-y-4 lg:space-y-6">
          <div className="elevated-card flex h-full flex-col justify-between p-4 text-sm md:p-6">
            <div className="w-full">
              <p className="mb-4 font-semibold text-foreground">
                Usage Summary ({timeframe})
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Highest Usage</p>
                    <p className="font-semibold text-foreground">
                      {currentSummary.highest.name}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {currentSummary.highest.usage} L
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Lowest Usage</p>
                    <p className="font-semibold text-foreground">
                      {currentSummary.lowest.name}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-green-500">
                    {currentSummary.lowest.usage} L
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
