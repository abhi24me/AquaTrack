
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; // Prefer service role for admin tasks

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
    console.log('🌱 Starting database seed...');

    // 1. Validating connection
    const { error: authError } = await supabase.from('rooms').select('count').single();
    if (authError && authError.code !== 'PGRST116') { // PGRST116 is just "no rows", which is fine
        console.log("Create tables first if they assume they don't exist. This script assumes tables are created via SQL Editor running supabase/schema.sql");
    }

    // --- CLEANUP (Optional: Comment out if you want to append) ---
    console.log('🧹 Cleaning up old data...');
    await supabase.from('alerts').delete().neq('id', 0);
    await supabase.from('daily_usage_summary').delete().neq('id', 0);
    await supabase.from('water_usage_logs').delete().neq('id', 0);
    await supabase.from('devices').delete().neq('id', 0);
    await supabase.from('rooms').delete().neq('id', 0);
    await supabase.from('buildings').delete().neq('id', 0);

    // --- BUILDINGS ---
    console.log('... Creating Buildings');
    const buildingsData = [
        { name: 'Sunrise PG', address: '12th Main, Indiranagar' },
        { name: 'Green Valley Apts', address: 'Green Glen Layout' },
        { name: 'Tech Park Hostels', address: 'Electronic City Ph 1' }
    ];
    const { data: buildings, error: buildErr } = await supabase.from('buildings').insert(buildingsData).select();
    if (buildErr) throw buildErr;

    // --- ROOMS ---
    console.log('... Creating Rooms');
    const roomsData = [];

    // Helper to generate rooms for a building
    const generateRooms = (buildingId: number, count: number, startNum: number) => {
        for (let i = 0; i < count; i++) {
            roomsData.push({
                building_id: buildingId,
                room_number: `${startNum + i}`,
                floor: Math.floor(i / 5) + 1,
                occupancy_status: Math.random() > 0.1 ? 'Occupied' : 'Vacant'
            });
        }
    };

    buildings!.forEach((b, idx) => {
        // Different number of rooms per building
        const count = idx === 0 ? 10 : (idx === 1 ? 15 : 8);
        generateRooms(b.id, count, 101);
    });

    const { data: rooms, error: roomErr } = await supabase.from('rooms').insert(roomsData).select();
    if (roomErr) throw roomErr;

    // --- DEVICES ---
    console.log('... Installing Devices');
    const devicesData = rooms!.map(r => ({
        room_id: r.id,
        device_type: 'Flow Meter V2',
        serial_number: `SN-${r.id}-${Math.random().toString(36).substring(7).toUpperCase()}`,
        status: 'Active'
    }));

    const { data: devices, error: devErr } = await supabase.from('devices').insert(devicesData).select();
    if (devErr) throw devErr;

    // --- HISTORY & REALTIME ---
    console.log('... Generating 30 Days of History');
    const dailySummaryData: any[] = [];
    const realtimeLogsData: any[] = [];

    const today = new Date();

    for (const device of devices!) {
        const room = rooms!.find(r => r.id === device.room_id);
        const isVacant = room?.occupancy_status === 'Vacant';
        const isLeaking = Math.random() > 0.9; // 10% chance of a leak problem in history

        // Generate 30 days back
        for (let d = 30; d >= 0; d--) {
            const date = new Date(today);
            date.setDate(date.getDate() - d);
            const dateStr = date.toISOString().split('T')[0];

            let baseUsage = isVacant ? 5 : (Math.random() * 300 + 100); // 100-400L for occupied
            if (isLeaking) baseUsage += 500; // Leak adds significant usage

            // Add a trend (weekends higher usage)
            const dayOfWeek = date.getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) baseUsage *= 1.2;

            dailySummaryData.push({
                device_id: device.id,
                date: dateStr,
                daily_usage: parseFloat(baseUsage.toFixed(2))
            });

            // If it's TODAY, generate detailed logs for charts
            if (d === 0) {
                // Generate hourly data points
                let currentTotal = 0;
                for (let h = 0; h < 24; h++) {
                    // Usage curve: peaks in morning (7-9) and evening (18-21)
                    let hourlyFlow = 0;
                    if ((h >= 6 && h <= 9) || (h >= 18 && h <= 21)) {
                        hourlyFlow = isVacant ? 0.1 : (Math.random() * 20 + 10); // High usage hours
                    } else {
                        hourlyFlow = isVacant ? 0 : (Math.random() * 5); // Low usage
                    }

                    if (isLeaking) hourlyFlow += 2; // Constant leak

                    currentTotal += hourlyFlow;

                    // Log every hour
                    const logTime = new Date(date);
                    logTime.setHours(h, 0, 0, 0);

                    // Only add log if it's in the past relative to execution time
                    if (logTime <= new Date()) {
                        realtimeLogsData.push({
                            device_id: device.id,
                            flow_rate: parseFloat(hourlyFlow.toFixed(2)),
                            total_usage: parseFloat(currentTotal.toFixed(2)), // Cumulative for the day simulation
                            timestamp: logTime.toISOString()
                        });
                    }
                }
            }
        }
    }

    // Insert in chunks to avoid request limits
    const chunkSize = 100;
    for (let i = 0; i < dailySummaryData.length; i += chunkSize) {
        const chunk = dailySummaryData.slice(i, i + chunkSize);
        const { error } = await supabase.from('daily_usage_summary').insert(chunk);
        if (error) console.error('Error inserting daily summary:', error);
    }

    for (let i = 0; i < realtimeLogsData.length; i += chunkSize) {
        const chunk = realtimeLogsData.slice(i, i + chunkSize);
        const { error } = await supabase.from('water_usage_logs').insert(chunk);
        if (error) console.error('Error inserting logs:', error);
    }

    // --- ALERTS ---
    console.log('... Creating Alerts');
    const alertsData: any[] = [];

    // Find a leaking room
    const leakingDevices = devices!.slice(0, 3); // Just pick first 3 for demo

    leakingDevices.forEach(d => {
        alertsData.push({
            room_id: d.room_id,
            alert_type: 'Leak',
            severity: 'High',
            message: 'Continuous flow detected for > 2 hours',
            status: 'Active'
        });
    });

    if (alertsData.length > 0) {
        await supabase.from('alerts').insert(alertsData);
    }

    console.log('✅ Seed completed successfully!');
}

seed().catch(e => console.error(e));
