
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function finalVerify() {
    console.log("=== FINAL VERIFICATION ===");

    // 1. Dashboard Data: Daily Summary
    const { data: summary, error: err1 } = await supabase.from('daily_usage_summary').select('daily_usage').limit(5);
    if (err1) console.error("Summary Error:", err1);
    else {
        const total = summary?.reduce((a, b) => a + b.daily_usage, 0) || 0;
        console.log(`✅ Daily Summary: Found ${summary?.length} records. Sample Total: ${total.toFixed(2)} L`);
    }

    // 2. Rooms Data: Devices & Logs
    const { data: devices, error: err2 } = await supabase.from('devices').select('serial_number, room_id').limit(5);
    if (err2) console.error("Devices Error:", err2);
    else console.log(`✅ Devices: Found ${devices?.length} devices. Sample: ${devices?.[0]?.serial_number}`);

    // 3. Reports Data: Historical
    const { count, error: err3 } = await supabase.from('daily_usage_summary').select('*', { count: 'exact', head: true });
    if (err3) console.error("History Error:", err3);
    else console.log(`✅ History: Found ${count} total records in daily_usage_summary.`);

    // 4. Notifications: Alerts
    const { data: alerts, error: err4 } = await supabase.from('alerts').select('*').limit(3);
    if (err4) console.error("Alerts Error:", err4);
    else console.log(`✅ Alerts: Found ${alerts?.length} alerts. Sample: "${alerts?.[0]?.message}"`);

    console.log("=== VERIFICATION COMPLETE ===");
}

finalVerify();
