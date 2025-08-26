
'use client';

import * as React from 'react';
import { format, subDays } from 'date-fns';
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
import { reportPreviewBarData, reportPreviewLineData } from '@/lib/data';
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
    from: subDays(new Date(), 6),
    to: new Date(),
  });
  const [activeFilter, setActiveFilter] = React.useState<'Today' | 'Week' | 'Month' | 'Year'>('Week');

  const handleFilterClick = (filter: 'Today' | 'Week' | 'Month' | 'Year') => {
    setActiveFilter(filter);
    const today = new Date();
    switch (filter) {
        case 'Today':
            setDate({ from: today, to: today });
            break;
        case 'Week':
            setDate({ from: subDays(today, 6), to: today });
            break;
        case 'Month':
            setDate({ from: subDays(today, 29), to: today });
            break;
        case 'Year':
            setDate({ from: subDays(today, 364), to: today });
            break;
    }
  }

  const currentBarData = reportPreviewBarData[activeFilter];
  const currentLineData = reportPreviewLineData[activeFilter];

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
        <CardContent className="flex flex-col gap-4">
            <div className="flex items-center gap-1 self-start rounded-full bg-muted/50 p-1 sm:self-start">
                {(['Today', 'Week', 'Month', 'Year'] as const).map(
                  (period) => (
                    <Button
                      key={period}
                      size="sm"
                      onClick={() => handleFilterClick(period)}
                      className={cn(
                        'h-7 rounded-full px-3 text-xs transition-colors',
                        activeFilter === period
                          ? 'bg-primary text-primary-foreground shadow-lg'
                          : 'bg-transparent text-muted-foreground hover:bg-secondary'
                      )}
                    >
                      {period}
                    </Button>
                  )
                )}
              </div>
          <div className="flex flex-wrap flex-col md:flex-row md:items-center gap-4">
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
          </div>
        </CardContent>
      </Card>

      <Card className="elevated-card">
        <CardHeader>
          <CardTitle>Report Preview</CardTitle>
          <CardDescription>
            A preview of the data for the selected period.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">
              Usage Breakdown
            </h3>
            <div className="h-[300px] w-full">
              <OptimizedBarChart data={currentBarData} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold">Usage vs. Leaks</h3>
            <div className="h-[300px] w-full">
                <OptimizedLineChart data={currentLineData} dataKey="usage" showLegend={true} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
