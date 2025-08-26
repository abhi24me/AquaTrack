
import { AlertTriangle, Droplets, FileText, Gauge, BarChart } from 'lucide-react';

// --- Reusable Data Generation Functions ---
const generateSeries = (
  points: number,
  generator: (i: number) => number,
  leakGenerator?: (i: number) => number | undefined
) => {
  return Array.from({ length: points }, (_, i) => {
    const entry: { [key: string]: any } = {
      name: `Point ${i + 1}`,
      usage: generator(i),
    };
    if (leakGenerator) {
      entry.leaks = leakGenerator(i);
    }
    return entry;
  });
};

const generateDailyData = (base: number) => generateSeries(24, (i) => base + Math.sin(i / 3) * (base / 4) + Math.random() * (base / 10), (i) => (i > 8 && i < 14 ? base / 20 : 0)).map((d, i) => ({ hour: `${i.toString().padStart(2, '0')}:00`, usage: Math.max(0, Math.round(d.usage)) }));
const generateWeeklyData = (base: number) => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({ day, usage: Math.round(base * (7 + Math.sin(i) * 2 + Math.random())) }));
const generateMonthlyData = (base: number) => Array.from({ length: 30 }, (_, i) => ({ day: i + 1, usage: Math.round(base * (30 + Math.sin(i/3) * 10 + Math.random() * 5))}));
const generateYearlyData = (base: number) => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => ({ month, usage: Math.round(base * 365 * (1 + Math.sin(i/2) * 0.2 + Math.random() * 0.1)) }));


// --- Total Usage Data ---
export const totalUsageData = {
  Today: { usage: '1,250', comparison: '5% higher than yesterday' },
  Week: { usage: '8,500', comparison: '2% lower than last week' },
  Month: { usage: '34,200', comparison: '8% higher than last month' },
  Year: { usage: '410,500', comparison: '12% higher than last year' },
};


// --- Quick Stats Data ---
export const quickStatsData = {
    Today: [
        { title: 'Live Flow Rate', value: '2.3 L/min', icon: Gauge, glowing: false },
        { title: "Today's Usage", value: '1,250 L', icon: Droplets, glowing: false },
        { title: 'Avg Daily Flow', value: '0.87 L/min', icon: BarChart, glowing: false },
        { title: 'Active Alerts', value: '2', icon: AlertTriangle, glowing: true },
    ],
    Week: [
        { title: 'Total Leaks', value: '340 L', icon: Gauge, glowing: true },
        { title: "This Week's Usage", value: '8,500 L', icon: Droplets, glowing: false },
        { title: 'Avg Daily Usage', value: '1,214 L', icon: BarChart, glowing: false },
        { title: 'Total Alerts', value: '8', icon: AlertTriangle, glowing: false },
    ],
    Month: [
        { title: 'Total Leaks', value: '1,280 L', icon: Gauge, glowing: true },
        { title: "This Month's Usage", value: '34,200 L', icon: Droplets, glowing: false },
        { title: 'Avg Weekly Usage', value: '8,550 L', icon: BarChart, glowing: false },
        { title: 'Total Alerts', value: '25', icon: AlertTriangle, glowing: false },
    ],
    Year: [
        { title: 'Total Leaks', value: '15,360 L', icon: Gauge, glowing: true },
        { title: "This Year's Usage", value: '410,500 L', icon: Droplets, glowing: false },
        { title: 'Avg Monthly Usage', value: '34,208 L', icon: BarChart, glowing: false },
        { title: 'Total Alerts', value: '180', icon: AlertTriangle, glowing: false },
    ],
};


// --- Room-wise Usage Ranking ---
export const roomUsageData = {
  Today: [
    { name: 'Room 101', usage: 450 },
    { name: 'Kitchen', usage: 320 },
    { name: 'Restroom L1', usage: 210 },
    { name: 'Lobby', usage: 150 },
    { name: 'Gym', usage: 120 },
  ],
  Week: [
    { name: 'Room 101', usage: 3150 },
    { name: 'Kitchen', usage: 2240 },
    { name: 'Restroom L1', usage: 1470 },
    { name: 'Lobby', usage: 1050 },
    { name: 'Gym', usage: 840 },
  ],
  Month: [
    { name: 'Room 101', usage: 12600 },
    { name: 'Kitchen', usage: 8960 },
    { name: 'Restroom L1', usage: 5880 },
    { name: 'Lobby', usage: 4200 },
    { name: 'Gym', usage: 3360 },
  ],
  Year: [
    { name: 'Room 101', usage: 151200 },
    { name: 'Kitchen', usage: 107520 },
    { name: 'Restroom L1', usage: 70560 },
    { name: 'Lobby', usage: 50400 },
    { name: 'Gym', usage: 40320 },
  ],
};

// --- Usage Summary (Highest/Lowest) ---
export const usageSummaryData = {
  Today: { highest: { name: 'Room 101', usage: 450 }, lowest: { name: 'Gym', usage: 120 } },
  Week: { highest: { name: 'Room 101', usage: 3150 }, lowest: { name: 'Gym', usage: 840 } },
  Month: { highest: { name: 'Room 101', usage: 12600 }, lowest: { name: 'Gym', usage: 3360 } },
  Year: { highest: { name: 'Room 101', usage: 151200 }, lowest: { name: 'Gym', usage: 40320 } },
};


// --- Individual Room Data ---
export const roomsData = [
    {
        id: 1,
        name: 'Room 101',
        status: 'Leak Detected',
        flow: 5.1,
        dailyUsage: 450,
        notifications: true,
        historical: {
            Today: generateDailyData(18),
            Week: generateWeeklyData(18*24),
            Month: generateMonthlyData(18*24),
            Year: generateYearlyData(18*24),
        }
    },
    {
        id: 2,
        name: 'Kitchen',
        status: 'OK',
        flow: 0,
        dailyUsage: 320,
        notifications: true,
        historical: {
            Today: generateDailyData(13),
            Week: generateWeeklyData(13*24),
            Month: generateMonthlyData(13*24),
            Year: generateYearlyData(13*24),
        }
    },
    {
        id: 3,
        name: 'Restroom L1',
        status: 'OK',
        flow: 0,
        dailyUsage: 210,
        notifications: false,
        historical: {
            Today: generateDailyData(8),
            Week: generateWeeklyData(8*24),
            Month: generateMonthlyData(8*24),
            Year: generateYearlyData(8*24),
        }
    },
];


// --- Notifications Data (Remains Static for now) ---
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
    description: 'Kitchen has exceeded its daily threshold of 300 L.',
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
    description: 'A tap in Restroom L1 was left open and has been automatically shut off.',
    time: 'Yesterday',
    variant: 'default',
  },
];


// --- Report Preview Data ---

const generateLeakData = (usage: number) => {
    return Math.random() < 0.2 ? Math.round(usage * (0.05 + Math.random() * 0.1)) : 0;
}

const reportTodayBar = Array.from({length: 24}, (_, i) => ({ name: `${i}:00`, usage: Math.round(10 + Math.sin(i/3) * 20 + Math.random() * 15) }));
const reportWeekBar = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({ name: day, usage: Math.round(200 + Math.random() * 150) }));
const reportMonthBar = Array.from({length: 30}, (_, i) => ({ name: `Day ${i+1}`, usage: Math.round(150 + Math.sin(i/5) * 50 + Math.random() * 100) }));
const reportYearBar = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({ name: month, usage: Math.round(5000 + Math.random() * 3000) }));


export const reportPreviewBarData = {
    Today: reportTodayBar,
    Week: reportWeekBar,
    Month: reportMonthBar,
    Year: reportYearBar,
};

export const reportPreviewLineData = {
    Today: reportTodayBar.map(d => ({ hour: d.name, usage: d.usage, leaks: generateLeakData(d.usage) })),
    Week: reportWeekBar.map(d => ({ day: d.name, usage: d.usage, leaks: generateLeakData(d.usage) })),
    Month: reportMonthBar.map(d => ({ day: d.name.split(' ')[1], usage: d.usage, leaks: generateLeakData(d.usage) })),
    Year: reportYearBar.map(d => ({ month: d.name, usage: d.usage, leaks: generateLeakData(d.usage) })),
}
