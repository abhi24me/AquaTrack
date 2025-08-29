
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { notificationsData } from '@/lib/data';
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
import { PlusCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export default function NotificationsPage() {
  const { toast } = useToast();

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
            {notificationsData.map((notification) => (
              <Alert
                key={notification.id}
                variant={notification.variant as 'default' | 'destructive'}
              >
                <notification.icon className="h-4 w-4" />
                <div className="flex justify-between w-full">
                  <div>
                    <AlertTitle>{notification.title}</AlertTitle>
                    <AlertDescription>
                      {notification.description}
                    </AlertDescription>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {notification.time}
                  </p>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
