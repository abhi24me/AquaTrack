
'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  quickStatsData,
  usageSummaryData,
  totalUsageData,
  activeAlerts,
} from '@/lib/data';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Gauge } from '@/components/charts/gauge';

const OptimizedBarChart = dynamic(
  () => import('@/components/charts/optimized-bar-chart'),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
  }
);

type Timeframe = 'Today' | 'Week' | 'Month' | 'Year';

interface RoomData {
  name: string;
  usage: number;
}

export default function Home() {
  const [timeframe, setTimeframe] = useState<Timeframe>('Today');
  const [flowRate, setFlowRate] = useState(2.3);
  const [roomUsage, setRoomUsage] = useState<RoomData[]>([]);
  const [totalUsage, setTotalUsage] = useState(0);
  const [loading, setLoading] = useState(true);

  const animationFrameId = useRef<number | null>(null);
  const lastUpdateTime = useRef(Date.now());
  const targetFlowRate = useRef(2.3);

  useEffect(() => {
    const animateFlowRate = () => {
      const now = Date.now();
      const timeSinceLastUpdate = now - lastUpdateTime.current;

      if (timeSinceLastUpdate > 2000) {
        const randomChange = (Math.random() - 0.5) * 1.5;
        targetFlowRate.current = Math.max(0.5, Math.min(targetFlowRate.current + randomChange, 4.5));
        lastUpdateTime.current = now;
      }
      
      setFlowRate(currentFlowRate => {
        const difference = targetFlowRate.current - currentFlowRate;
        const easing = 0.05;
        const newFlowRate = currentFlowRate + difference * easing;
        const drift = Math.sin(now / 1000) * 0.05;
        const finalFlowRate = newFlowRate + drift;
        return parseFloat(Math.max(0.5, Math.min(finalFlowRate, 4.5)).toFixed(2));
      });
      
      animationFrameId.current = requestAnimationFrame(animateFlowRate);
    };
    animationFrameId.current = requestAnimationFrame(animateFlowRate);
    return () => {
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, []);

  useEffect(() => {
    const fetchUsageData = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:5000/usage");
        const results = await response.json();

        if (!Array.isArray(results)) {
          throw new Error("Invalid data format from server");
        }

        const total = results.reduce(
          (acc, room) => acc + (room.dailyUsage?.usage || 0),
          0
        );
        setTotalUsage(total);

        const usageData = results
          .map((room) => ({
            name: room.room,
            usage: room.dailyUsage?.usage || 0,
          }))
          .sort((a, b) => b.usage - a.usage);

        setRoomUsage(usageData);
      } catch (error) {
        console.error("Failed to fetch usage data:", error);
        // fallback in case of API error
        setRoomUsage([
          { name: "Room 101", usage: 0 },
          { name: "Kitchen", usage: 0 },
          { name: "Restroom L1", usage: 0 },
        ]);
        setTotalUsage(0);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageData();
  }, []);


  const handleTimeframeChange = (newTimeframe: Timeframe) => {
    setTimeframe(newTimeframe);
  };

  const currentTotalUsage = totalUsageData[timeframe];
  const currentQuickStats = quickStatsData[timeframe];
  const currentSummary = usageSummaryData[timeframe];
  
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:space-y-6 md:p-6 lg:p-8">
      <div className="elevated-card p-5">
        <div className="flex flex-col items-start">
          <p className="text-sm font-medium text-muted-foreground">
            Total Water Used ({timeframe})
          </p>
          {loading ? <Skeleton className="h-10 w-48 my-2" /> :
            <p className="my-2 text-3xl font-bold text-primary md:text-4xl">
              {totalUsage.toLocaleString()} L
            </p>
          }
          <div className="flex items-center rounded-full bg-green-500/10 px-2 py-1 text-sm text-green-500">
            <TrendingUp className="mr-1.5 h-4 w-4" />
            <span>{currentTotalUsage.comparison}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        <div className="elevated-card flex h-full flex-col items-center justify-start p-4">
          <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
            Live Flow Rate
          </p>
          <div className="flex-grow w-full h-full">
            <Gauge value={flowRate} />
          </div>
        </div>

        {currentQuickStats.map((stat, index) => (
          <div
            key={index}
            className="elevated-card flex h-32 flex-col justify-between p-4 md:h-36"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <stat.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground md:text-2xl">
                {stat.title.includes("Today's Usage") ? `${totalUsage.toLocaleString()} L` : stat.value}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {stat.title}
              </p>
            </div>
          </div>
        ))}
        
        <div className="elevated-card flex h-32 flex-col justify-between border-destructive/50 p-4 shadow-[0_0_24px_hsl(var(--destructive)_/_0.35)] md:h-36">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-xl font-bold text-foreground md:text-2xl">
              {activeAlerts.length}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Active Alerts</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                size="sm"
                className="mt-2 h-auto py-1 text-xs"
              >
                Check
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Active Alerts</DialogTitle>
                <DialogDescription>
                  The following rooms have active alerts that require your
                  attention.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 space-y-3">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.room}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-semibold">{alert.room}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.message}
                      </p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-6">
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
               {loading ? <Skeleton className="h-[300px] w-full" /> : <OptimizedBarChart data={roomUsage} layout="vertical" />}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4 lg:space-y-6">
          <div className="elevated-card flex h-full flex-col justify-between p-4 text-sm md:p-6">
            <div className="w-full">
              <p className="mb-4 font-semibold text-foreground">
                Usage Summary ({timeframe})
              </p>
              {loading ? <Skeleton className="h-24 w-full" /> : 
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Highest Usage</p>
                    <p className="font-semibold text-foreground">
                      {roomUsage[0]?.name || 'N/A'}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-primary">
                    {roomUsage[0]?.usage.toLocaleString() || 'N/A'} L
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Lowest Usage</p>
                    <p className="font-semibold text-foreground">
                      {roomUsage[roomUsage.length - 1]?.name || 'N/A'}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-green-500">
                    {roomUsage[roomUsage.length - 1]?.usage.toLocaleString() || 'N/A'} L
                  </p>
                </div>
              </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
