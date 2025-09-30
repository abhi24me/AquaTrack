'use client';
import { useState, useEffect, useMemo } from 'react';
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
import { History, Mic, Search } from 'lucide-react';
import { roomsData } from '@/lib/data';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';

const OptimizedLineChart = dynamic(
  () => import('@/components/charts/optimized-line-chart'),
  {
    loading: () => <Skeleton className="h-48 w-full" />,
    ssr: false,
  }
);

type Timeframe = 'Today' | 'Week' | 'Month' | 'Year';

// SpeechRecognition API might not be available on all browsers/environments
let SpeechRecognition: any;
if (typeof window !== 'undefined') {
  SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
}

export default function RoomsPage() {
  const [timeframe, setTimeframe] = useState<Timeframe>('Today');
  const [searchQuery, setSearchQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognition = useMemo(
    () => (SpeechRecognition ? new SpeechRecognition() : null),
    []
  );

  useEffect(() => {
    if (!recognition) return;

    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  }, [recognition]);

  const handleVoiceSearch = () => {
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      recognition?.start();
      setIsListening(true);
    }
  };

  const filteredRooms = useMemo(() => {
    if (!searchQuery) return roomsData;
    return roomsData.filter((room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:space-y-6 md:p-8">
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
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
      <div className="relative w-full max-w-lg">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search rooms..."
          className="w-full rounded-full bg-muted pl-10 pr-12 h-11"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {recognition && (
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full',
              isListening && 'bg-destructive/20 text-destructive'
            )}
            onClick={handleVoiceSearch}
          >
            <Mic className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {filteredRooms.map((room) => (
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
                      <OptimizedLineChart
                        dataKey="usage"
                        data={room.historical[timeframe]}
                      />
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
      {filteredRooms.length === 0 && (
        <div className="text-center py-10">
          <p className="text-lg font-semibold text-muted-foreground">
            No rooms found for &quot;{searchQuery}&quot;
          </p>
        </div>
      )}
    </div>
  );
}
