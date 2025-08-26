import { AlertTriangle, Droplets, FileText } from 'lucide-react';

export const weeklyUsageData = [
  { day: 'Mon', desktop: 186, mobile: 160 },
  { day: 'Tue', desktop: 305, mobile: 280 },
  { day: 'Wed', desktop: 237, mobile: 220 },
  { day: 'Thu', desktop: 273, mobile: 250 },
  { day: 'Fri', desktop: 209, mobile: 190 },
  { day: 'Sat', desktop: 214, mobile: 200 },
  { day: 'Sun', desktop: 342, mobile: 310 },
];

export const leakData = [
    { day: 'Mon', desktop: 186, mobile: 10 },
    { day: 'Tue', desktop: 305, mobile: 10 },
    { day: 'Wed', desktop: 237, mobile: 12 },
    { day: 'Thu', desktop: 273, mobile: 12 },
    { day: 'Fri', desktop: 209, mobile: 15 },
    { day: 'Sat', desktop: 214, mobile: 15 },
    { day: 'Sun', desktop: 342, mobile: 15 },
]

export const roomUsageRanking = [
  { name: 'Room 101', usage: 450, percentage: 90 },
  { name: 'Room 102', usage: 320, percentage: 65 },
  { name: 'Room 103', usage: 210, percentage: 40 },
];

export const roomsData = [
    {
        id: 1,
        name: 'Room 101',
        status: 'Leak Detected',
        flow: 5.1,
        dailyUsage: 450,
        notifications: true,
        historical: [
            { hour: '00:00', usage: 5 }, { hour: '01:00', usage: 5 }, { hour: '02:00', usage: 5 },
            { hour: '03:00', usage: 5 }, { hour: '04:00', usage: 5 }, { hour: '05:00', usage: 5 },
            { hour: '06:00', usage: 15 }, { hour: '07:00', usage: 30 }, { hour: '08:00', usage: 45 },
            { hour: '09:00', usage: 20 }, { hour: '10:00', usage: 15 }, { hour: '11:00', usage: 10 },
            { hour: '12:00', usage: 50 }, { hour: '13:00', usage: 40 },
        ]
    },
    {
        id: 2,
        name: 'Room 102',
        status: 'OK',
        flow: 0,
        dailyUsage: 320,
        notifications: true,
        historical: [
            { hour: '06:00', usage: 5 }, { hour: '07:00', usage: 10 }, { hour: '08:00', usage: 25 },
            { hour: '09:00', usage: 30 }, { hour: '10:00', usage: 20 }, { hour: '11:00', usage: 25 },
            { hour: '12:00', usage: 40 }, { hour: '13:00', usage: 35 },
        ]
    },
    {
        id: 3,
        name: 'Room 103',
        status: 'OK',
        flow: 0,
        dailyUsage: 210,
        notifications: false,
        historical: [
             { hour: '06:00', usage: 10 }, { hour: '07:00', usage: 20 }, { hour: '08:00', usage: 55 },
            { hour: '09:00', usage: 60 }, { hour: '10:00', usage: 40 }, { hour: '11:00', usage: 55 },
            { hour: '12:00', usage: 90 }, { hour: '13:00', usage: 110 },
        ]
    },
];

export const notificationsData = [
  {
    id: 1,
    icon: AlertTriangle,
    title: 'Leak Detected',
    description: 'Continuous flow of 5.1 L/hr in Room 101.',
    time: '5 mins ago',
    variant: 'destructive',
  },
  {
    id: 2,
    icon: Droplets,
    title: 'High Usage Alert',
    description: 'Room 102 has exceeded its daily threshold of 300 L.',
    time: '1 hour ago',
    variant: 'default',
  },
  {
    id: 3,
    icon: FileText,
    title: 'Report Ready',
    description: 'Your weekly summary report is ready for download.',
    time: '8 hours ago',
    variant: 'default',
  },
  {
    id: 4,
    icon: AlertTriangle,
    title: 'Tap Left Open',
    description: 'A tap in Room 103 was left open and has been automatically shut off.',
    time: 'Yesterday',
    variant: 'default',
  },
];
