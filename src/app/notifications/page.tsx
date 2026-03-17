
'use client';

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, AlertCircle, AlertTriangle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

interface AlertItem {
  id: number;
  room_number: string | null;
  message: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  alert_type: string;
  created_at: string;
  status: string;
  rooms?: { room_number: string };
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('alerts')
      .select('*, rooms(room_number)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching alerts:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch notifications.',
        variant: 'destructive',
      });
    } else {
      const formatted = data.map((item: any) => ({
        ...item,
        room_number: item.rooms?.room_number || 'General'
      }));
      setAlerts(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();

    // Realtime subscription
    const channel = supabase
      .channel('realtime-notifications')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        (payload) => {
          console.log('New Alert:', payload);
          toast({
            title: 'New Alert',
            description: payload.new.message,
          });
          fetchAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'Critical': return AlertTriangle;
      case 'High': return AlertTriangle;
      case 'Medium': return AlertCircle;
      default: return CheckCircle;
    }
  };

  const getVariant = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'destructive';
      case 'High': return 'destructive';
      default: return 'default';
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Notification Rule</DialogTitle>
              <DialogDescription>
                Get alerted when specific conditions are met.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scope" className="text-right">
                  Room
                </Label>
                <Select defaultValue="all">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Room</SelectItem>
                    <SelectItem value="room101">Room 101</SelectItem>
                    <SelectItem value="room102">Room 102</SelectItem>
                    <SelectItem value="room103">Room 103</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="condition" className="text-right">
                  Condition
                </Label>
                <Select defaultValue="usage">
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usage">Daily Usage Exceeds</SelectItem>
                    <SelectItem value="flow">Continuous Flow For</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="value" className="text-right">
                  Value
                </Label>
                <Input id="value" defaultValue="500" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button
                  type="submit"
                  onClick={() => {
                    toast({
                      title: 'Rule Created',
                      description: 'Your new notification rule has been saved.',
                    });
                  }}
                >
                  Create Rule
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="elevated-card">
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
          <CardDescription>
            Here are the latest events from your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-sm">Loading alerts...</p>
            ) : alerts.length === 0 ? (
              <p className="text-muted-foreground text-sm">No recent alerts.</p>
            ) : (
              alerts.map((notification) => {
                const Icon = getIcon(notification.severity);
                return (
                  <Alert
                    key={notification.id}
                    variant={getVariant(notification.severity) as 'default' | 'destructive'}
                  >
                    <Icon className="h-4 w-4" />
                    <div className="flex justify-between w-full">
                      <div>
                        <AlertTitle>{notification.alert_type} - {notification.room_number}</AlertTitle>
                        <AlertDescription>
                          {notification.message}
                        </AlertDescription>
                      </div>
                      <p className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                  </Alert>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
