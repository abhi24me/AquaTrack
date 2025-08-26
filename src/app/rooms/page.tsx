
'use client';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { History } from 'lucide-react';
import { roomsData } from '@/lib/data';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const OptimizedLineChart = dynamic(
  () => import('@/components/charts/optimized-line-chart'),
  {
    loading: () => <Skeleton className="h-48 w-full" />,
    ssr: false,
  }
);

type Timeframe = 'Today' | 'Week' | 'Month' | 'Year';

export default function RoomsPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('Today');
  
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:space-y-6 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <h2 className="text-3xl font-bold tracking-tight">Room Monitoring</h2>
        <div className="flex items-center gap-1 self-start rounded-full bg-muted/50 p-1 sm:self-center">
          {(['Today', 'Week', 'Month', 'Year'] as Timeframe[]).map((period) => (
            <Button
              key={period}
              size="sm"
              onClick={() => setTimeframe(period)}
              className={cn(
                'h-7 rounded-full px-3 text-xs transition-colors',
                timeframe === period
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'bg-transparent text-muted-foreground hover:bg-secondary'
              )}
            >
              {period}
            </Button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {roomsData.map((room) => (
          <Card key={room.id} className="elevated-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{room.name}</CardTitle>
                <Badge
                  variant={room.status === 'OK' ? 'secondary' : 'destructive'}
                  className={cn(
                    room.status === 'OK' && 'border-green-500/50 text-green-600'
                  )}
                >
                  {room.status}
                </Badge>
              </div>
              <CardDescription>Live water usage and controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-around text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Live Flow</p>
                  <p className="text-2xl font-bold">{room.flow} L/min</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Usage</p>
                  <p className="text-2xl font-bold">{room.dailyUsage} L</p>
                </div>
              </div>

              <Accordion type="single" collapsible>
                <AccordionItem value="item-1">
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <History className="h-4 w-4" />
                      Historical Data ({timeframe})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="relative h-48 w-full">
                       <OptimizedLineChart dataKey="usage" data={room.historical[timeframe]} />
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <Label htmlFor={`notif-switch-${room.id}`}>
                  Notifications
                </Label>
                <Switch
                  id={`notif-switch-${room.id}`}
                  defaultChecked={room.notifications}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
