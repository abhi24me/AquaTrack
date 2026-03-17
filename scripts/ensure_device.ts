
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Use SERVICE KEY to bypass RLS if possible, otherwise rely on Anon
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function ensureDevice() {
    const targetSerial = "SN-101-ABC"; // The one the user wants to use

    // 1. Check if room 101 exists
    let { data: room } = await supabase.from('rooms').select('id').eq('room_number', '101').single();

    if (!room) {
        console.log("Creating Room 101...");
        // Need a building first?
        const { data: b } = await supabase.from('buildings').select('id').limit(1).single();
        let buildId = b?.id;
        if (!buildId) {
            const { data: newB } = await supabase.from('buildings').insert({ name: 'Test Building' }).select().single();
            buildId = newB.id;
        }

        const { data: newR } = await supabase.from('rooms').insert({
            room_number: '101',
            building_id: buildId
        }).select().single();
        room = newR;
    }

    // 2. Upsert Device
    console.log(`Ensuring Device ${targetSerial} exists for Room 101...`);
    const { error } = await supabase.from('devices').upsert({
        room_id: room.id,
        serial_number: targetSerial,
        device_type: 'ESP32 Flow Meter',
        status: 'Active'
    }, { onConflict: 'serial_number' });

    if (error) console.error("Error creating device:", error);
    else console.log("✅ Device Ready!");
}

ensureDevice();
