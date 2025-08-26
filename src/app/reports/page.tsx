
'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Download } from 'lucide-react';
import type { DateRange } from 'react-day-picker';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { weeklyUsageData, leakData } from '@/lib/data';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const OptimizedBarChart = dynamic(
  () => import('@/components/charts/optimized-bar-chart'),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
  }
);
const OptimizedLineChart = dynamic(
  () => import('@/components/charts/optimized-line-chart'),
  {
    loading: () => <Skeleton className="h-[300px] w-full" />,
    ssr: false,
  }
);


export default function ReportsPage() {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2024, 0, 20),
    to: new Date(2024, 0, 27),
  });

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:space-y-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Download Reports</h2>
      </div>

      <Card className="elevated-card">
        <CardHeader>
          <CardTitle>Report Generation</CardTitle>
          <CardDescription>
            Select your desired parameters to generate a report.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap flex-col md:flex-row md:items-center gap-4">
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal md:w-[300px]',
                    !date && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, 'LLL dd, y')} -{' '}
                        {format(date.to, 'LLL dd, y')}
                      </>
                    ) : (
                      format(date.from, 'LLL dd, y')
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
          <Select defaultValue="all">
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Select Scope" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              <SelectItem value="room101">Room 101</SelectItem>
              <SelectItem value="room102">Room 102</SelectItem>
              <SelectItem value="room103">Room 103</SelectItem>
            </SelectContent>
          </Select>
          <Button className="primary-button">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Download Excel
          </Button>
        </CardContent>
      </Card>

      <Card className="elevated-card">
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
          <CardDescription>
            A preview of the data for the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-lg font-semibold">
              Daily Usage Breakdown
            </h3>
            <div className="relative h-[300px] w-full">
              <OptimizedBarChart data={weeklyUsageData} />
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-lg font-semibold">Usage vs. Leaks</h3>
            <div className="relative h-[300px] w-full">
                <OptimizedLineChart data={leakData} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
