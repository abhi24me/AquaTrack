
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function checkLogs() {
    console.log('Checking latest water usage logs...');
    const { data, error } = await supabase
        .from('water_usage_logs')
        .select('*, devices(serial_number)')
        .order('timestamp', { ascending: false }) // or timestamp
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Latest Logs:', data);

    const { data: daily } = await supabase
        .from('daily_usage_summary')
        .select('*')
        .order('date', { ascending: false })
        .limit(5);

    console.log('Daily Summary:', daily);
}

checkLogs();
