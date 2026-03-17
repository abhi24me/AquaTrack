
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
  total_usage: number;
  status: 'OK' | 'Leak Detected';
  history: { date: string, usage: number }[];
}

export default function RoomsPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    setLoading(true);
    // 1. Fetch all rooms
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('id, room_number, buildings(name)');

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
    const deviceIds = devicesData.map(d => d.id);

    // 3. Fetch today's usage summary
    const localDate = new Date();
    const today = `${localDate.getFullYear()}-${String(localDate.getMonth() + 1).padStart(2, '0')}-${String(localDate.getDate()).padStart(2, '0')}`;

    const { data: summaryData, error: summaryError } = await supabase
      .from('daily_usage_summary')
      .select('device_id, daily_usage, date')
      .in('device_id', deviceIds)
      .eq('date', today);

    if (summaryError) {
      console.error('Error fetching usage summary:', summaryError.message);
      setLoading(false);
      return;
    }

    // 4. Fetch the latest total_usage for each device from water_usage_logs
    const { data: latestLogs, error: logsError } = await supabase
      .from('water_usage_logs')
      .select('device_id, total_usage')
      .in('device_id', deviceIds)
      .order('timestamp', { ascending: false });

    if (logsError) {
      console.error('Error fetching latest usage logs:', logsError.message);
      setLoading(false);
      return;
    }

    // 5. Fetch Historical Data (Last 30 days for now, to support the graph)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromStr = thirtyDaysAgo.toISOString().split('T')[0];

    const { data: historyData } = await supabase
      .from('daily_usage_summary')
      .select('device_id, daily_usage, date')
      .in('device_id', deviceIds)
      .gte('date', fromStr)
      .order('date', { ascending: true });


    // 6. Combine the data
    const deviceDailyUsageMap = new Map<number, number>();
    summaryData?.forEach(s => deviceDailyUsageMap.set(s.device_id, s.daily_usage));

    const deviceTotalUsageMap = new Map<number, number>();
    if (latestLogs) {
      // Since logs are ordered by timestamp desc, the first occurrence is the latest
      for (const log of latestLogs) {
        if (!deviceTotalUsageMap.has(log.device_id)) {
          deviceTotalUsageMap.set(log.device_id, log.total_usage);
        }
      }
    }

    // Group history by room
    const historyByRoom = new Map<number, Map<string, number>>(); // room_id -> (date -> usage)

    historyData?.forEach(row => {
      const device = devicesData.find(d => d.id === row.device_id);
      if (device) {
        if (!historyByRoom.has(device.room_id)) {
          historyByRoom.set(device.room_id, new Map());
        }
        const roomHistory = historyByRoom.get(device.room_id)!;
        const current = roomHistory.get(row.date) || 0;
        roomHistory.set(row.date, current + row.daily_usage);
      }
    });

    // NEW: Fetch active alerts to determine room status
    const { data: alertsData } = await supabase
      .from('alerts')
      .select('room_id')
      .eq('status', 'Active');

    const leakingRoomIds = new Set(alertsData?.map(a => a.room_id) || []);

    const processedRooms: Room[] = roomsData.map(room => {
      const devicesInRoom = devicesData.filter(d => d.room_id === room.id);

      const dailyUsage = devicesInRoom.reduce((acc, device) => {
        return acc + (deviceDailyUsageMap.get(device.id) || 0);
      }, 0);

      const totalUsage = devicesInRoom.reduce((acc, device) => {
        return acc + (deviceTotalUsageMap.get(device.id) || 0);
      }, 0);

      // Flatten history map to array
      const roomHistoryMap = historyByRoom.get(room.id) || new Map();
      const history = Array.from(roomHistoryMap.entries()).map(([date, usage]) => ({ date, usage }));

      const buildingName = (room.buildings as any)?.name || 'Unknown';

      return {
        id: room.id,
        room_number: `${buildingName} - ${room.room_number}`,
        daily_usage: dailyUsage,
        total_usage: totalUsage,
        status: leakingRoomIds.has(room.id) ? 'Leak Detected' : 'OK',
        history
      }
    });

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
          console.log('Rooms: Realtime update (daily_usage_summary):', payload);
          fetchRooms();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'water_usage_logs' },
        (payload) => {
          console.log('Rooms: Realtime update (water_usage_logs):', payload);
          fetchRooms();
        }
      )
      .subscribe((status) => {
        console.log('Rooms: Realtime subscription status:', status);
      });

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
                    <p className="text-2xl font-bold">{room.total_usage.toFixed(2)} L</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Usage</p>
                    <p className="text-2xl font-bold">{room.daily_usage.toFixed(2)} L</p>
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
                        {room.history && room.history.length > 0 ? (
                          <OptimizedLineChart data={room.history} dataKey="usage" />
                        ) : (
                          <p className="text-muted-foreground text-center text-sm pt-20">No data available.</p>
                        )}
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

