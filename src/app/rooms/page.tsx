
'use client';
import { useState, useMemo, useEffect } from 'react';
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
import { History, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';

const OptimizedLineChart = dynamic(
  () => import('@/components/charts/optimized-line-chart'),
  {
    loading: () => <Skeleton className="h-48 w-full" />,
    ssr: false,
  }
);

type Timeframe = 'Today' | 'Week' | 'Month' | 'Year';

interface Room {
  id: number;
  room_number: string;
  daily_usage: number;
  total_usage: number; // This might need to come from a different query or be calculated over time
  status: 'OK' | 'Leak Detected';
}

export default function RoomsPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    // This query is a bit complex for Supabase client-side library due to multiple joins and aggregations.
    // A database function (RPC) would be more efficient here.
    // For now, we'll fetch data and join it in the application code.

    // 1. Fetch all rooms
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('id, room_number');

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError.message);
      setLoading(false);
      return;
    }

    // 2. Fetch all devices
    const { data: devicesData, error: devicesError } = await supabase
      .from('devices')
      .select('id, room_id');

    if (devicesError) {
      console.error('Error fetching devices:', devicesError.message);
      setLoading(false);
      return;
    }

    // 3. Fetch today's usage summary
    const localDate = new Date();
    const today = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;
    
    const { data: summaryData, error: summaryError } = await supabase
      .from('daily_usage_summary')
      .select('device_id, daily_usage')
      .eq('date', today);

    if (summaryError) {
      console.error('Error fetching usage summary:', summaryError.message);
      setLoading(false);
      return;
    }

    // 4. Combine the data
    const deviceUsageMap = new Map<number, number>();
    for (const summary of summaryData) {
      deviceUsageMap.set(summary.device_id, summary.daily_usage);
    }
    
    const roomUsageMap = new Map<number, number>();
    for (const device of devicesData) {
        const usage = deviceUsageMap.get(device.id) || 0;
        const currentRoomUsage = roomUsageMap.get(device.room_id) || 0;
        roomUsageMap.set(device.room_id, currentRoomUsage + usage);
    }

    const processedRooms: Room[] = roomsData.map(room => ({
        id: room.id,
        room_number: room.room_number,
        daily_usage: roomUsageMap.get(room.id) || 0,
        total_usage: 0, // This needs a separate query on water_usage_logs, setting to 0 for now.
        status: 'OK' // Leak detection logic would need a query on water_usage_logs
    }));

    setRooms(processedRooms);
    setLoading(false);
  };
  
  useEffect(() => {
    fetchRooms();

    const channel = supabase
      .channel('realtime-rooms')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_usage_summary' },
        (payload) => {
          console.log('Change received!', payload);
          fetchRooms(); // Refetch all data on any change
        }
      )
      .subscribe();
      
    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredRooms = useMemo(() => {
    if (!searchQuery) return rooms;
    return rooms.filter((room) =>
      room.room_number.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, rooms]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:space-y-6 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div className="w-full">
          <h2 className="text-3xl font-bold tracking-tight">Room Monitoring</h2>
          <p className="text-muted-foreground">
            Search, view, and manage all your rooms.
          </p>
        </div>
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
      <div className="relative w-full max-w-full md:max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search rooms..."
          className="w-full rounded-full bg-muted pl-10 h-11"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="elevated-card">
                    <CardHeader>
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-4 w-3/4" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                </Card>
            ))}
         </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="elevated-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{room.room_number}</CardTitle>
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
                    <p className="text-sm text-muted-foreground">Total Usage</p>
                    <p className="text-2xl font-bold">{room.total_usage} L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Usage</p>
                    <p className="text-2xl font-bold">{room.daily_usage} L</p>
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
                        <p className="text-muted-foreground text-center text-sm">Historical data not yet available from database.</p>
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
                    defaultChecked={true}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!loading && filteredRooms.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg font-semibold text-muted-foreground">
            {searchQuery ? `No rooms found for "${searchQuery}"` : "No rooms found in the database."}
          </p>
        </div>
      )}
    </div>
  );
}
