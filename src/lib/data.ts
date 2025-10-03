import { Droplets, BarChart } from 'lucide-react';
import { AlertTriangle, FileText } from 'lucide-react';

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


// Note: Most mock data below is no longer used and is superseded by live data from Supabase in the components.
// It is kept here for the pages that have not been migrated yet (e.g., Reports).

export const activeAlerts = [
  { room: 'Room 101', message: 'Continuous flow of 5.1 L/hr detected.' },
  { room: 'Room 102', message: 'Daily usage threshold of 300L exceeded.' },
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
