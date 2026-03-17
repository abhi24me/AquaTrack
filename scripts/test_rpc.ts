
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Mimic what the ESP32 does: HTTP POST to the RPC URL
// Only difference is we use 'fetch' here instead of HTTPClient
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const RPC_URL = `${SUPABASE_URL}/rest/v1/rpc/report_usage`;

// Data matching the user's log
const PAYLOAD = {
    p_device_serial: "SN-101-ABC",
    p_flow_rate: 3.46,
    p_total_usage: 44.18,
    p_daily_usage: 0.05
};

async function testRPC() {
    console.log(`Sending POST to: ${RPC_URL}`);
    console.log(`Payload:`, JSON.stringify(PAYLOAD));

    try {
        const response = await fetch(RPC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify(PAYLOAD)
        });

        if (response.ok) {
            console.log("✅ Success! Server responded with:", response.status);
            // If valid JSON, print it, else valid void
            const text = await response.text();
            console.log("Response Body:", text);
        } else {
            console.error("❌ Failed! Status:", response.status);
            const text = await response.text();
            console.error("Response Error:", text);
        }
    } catch (err) {
        console.error("❌ Network Error:", err);
    }
}

testRPC();
