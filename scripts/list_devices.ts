
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function listDevices() {
    const { data, error } = await supabase
        .from('devices')
        .select('id, serial_number, rooms(room_number)')
        .limit(5);

    if (error) {
        console.error(error);
    } else {
        console.log('Valid Devices for Testing:');
        console.table(data.map(d => ({
            ID: d.id,
            Serial: d.serial_number,
            Room: d.rooms?.room_number
        })));
    }
}

listDevices();
