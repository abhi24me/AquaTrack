
'use client';

import * as React from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon, Download, Loader2 } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

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
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';

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

interface ReportDataPoint {
  date: string;
  usage: number;
}

interface RoomOption {
  id: string; // Use string for Select value
  name: string;
}

export default function ReportsPage() {
  const [date, setDate] = React.useState<DateRange | undefined>(undefined);
  const [activeFilter, setActiveFilter] = React.useState<'Today' | 'Week' | 'Month' | 'Year'>('Week');
  const [scope, setScope] = React.useState<string>('all');
  const [loading, setLoading] = React.useState(false);
  const [reportData, setReportData] = React.useState<ReportDataPoint[]>([]);
  const [rooms, setRooms] = React.useState<RoomOption[]>([]);

  // Fetch available rooms for the scope selector
  React.useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase.from('rooms').select('id, room_number');
      if (data) {
        setRooms(data.map(r => ({ id: r.id.toString(), name: r.room_number })));
      }
    };
    fetchRooms();
  }, []);

  // Initialize date range
  React.useEffect(() => {
    setDate({
      from: subDays(new Date(), 6),
      to: new Date(),
    });
  }, []);

  const handleFilterClick = (filter: 'Today' | 'Week' | 'Month' | 'Year') => {
    setActiveFilter(filter);
    const today = new Date();
    let from = today;

    switch (filter) {
      case 'Today': from = today; break;
      case 'Week': from = subDays(today, 6); break;
      case 'Month': from = subDays(today, 29); break;
      case 'Year': from = subDays(today, 364); break;
    }
    setDate({ from, to: today });
  };

  // Fetch Report Data when dependencies change
  React.useEffect(() => {
    const fetchData = async () => {
      if (!date?.from || !date?.to) return;
      setLoading(true);

      const fromStr = format(date.from, 'yyyy-MM-dd');
      const toStr = format(date.to, 'yyyy-MM-dd');

      let query = supabase
        .from('daily_usage_summary')
        .select(`
          date,
          daily_usage,
          devices!inner (
            room_id
          )
        `)
        .gte('date', fromStr)
        .lte('date', toStr);

      if (scope !== 'all') {
        const roomId = parseInt(scope);
        // Filter by room_id via the joined devices table
        query = query.eq('devices.room_id', roomId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching report data:', error);
        setLoading(false);
        return;
      }

      // Aggregate data by date
      const aggregated = new Map<string, number>();

      data?.forEach((row: any) => {
        const dateKey = row.date; // already YYYY-MM-DD
        const current = aggregated.get(dateKey) || 0;
        aggregated.set(dateKey, current + row.daily_usage);
      });

      // Convert to array and sort
      const chartData: ReportDataPoint[] = Array.from(aggregated.entries())
        .map(([key, val]) => ({ date: key, usage: val }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Fill gaps with 0? Optional, but good for charts
      // ... skipping gap filling for brevity, keeping it simple

      setReportData(chartData);
      setLoading(false);
    };

    fetchData();
  }, [date, scope]);


  const downloadPDF = () => {
    const doc = new jsPDF();

    doc.text('Water Usage Report', 14, 20);
    doc.setFontSize(10);
    doc.text(`Period: ${date?.from ? format(date.from, 'yyyy-MM-dd') : ''} to ${date?.to ? format(date.to, 'yyyy-MM-dd') : ''}`, 14, 30);
    doc.text(`Scope: ${scope === 'all' ? 'All Rooms' : rooms.find(r => r.id === scope)?.name || scope}`, 14, 35);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 40);

    const tableHeaders = [['Date', 'Total Usage (L)']];
    const tableData = reportData.map(d => [d.date, d.usage.toFixed(2)]);

    const totalUsage = reportData.reduce((acc, curr) => acc + curr.usage, 0);
    tableData.push(['Total', totalUsage.toFixed(2)]);

    autoTable(doc, {
      startY: 50,
      head: tableHeaders,
      body: tableData,
    });

    doc.save('water_usage_report.pdf');
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, "water_usage_report.xlsx");
  };

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
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Select Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {rooms.map(room => (
                  <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="primary-button" onClick={downloadPDF} disabled={loading || reportData.length === 0}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
              Download PDF
            </Button>
            <Button variant="secondary" onClick={downloadExcel} disabled={loading || reportData.length === 0}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
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
          {loading ? (
            <div className="flex h-[300px] w-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : reportData.length === 0 ? (
            <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground col-span-2">
              No data available for the selected range.
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">
                  Usage Breakdown
                </h3>
                <div className="h-[300px] w-full">
                  {/* Transforming data for the bar chart expecting a 'name' prop */}
                  <OptimizedBarChart
                    data={reportData.map(d => ({ name: d.date, usage: d.usage }))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Usage Trend</h3>
                <div className="h-[300px] w-full">
                  <OptimizedLineChart
                    data={reportData.map(d => ({ date: d.date, usage: d.usage }))}
                    dataKey="usage"
                    showLegend={true}
                  />
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
