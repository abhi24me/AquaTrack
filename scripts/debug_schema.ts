
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function inspectTable() {
    console.log('Inspecting "devices" table...');
    // Try to fetch * to see what columns come back
    const { data, error } = await supabase
        .from('devices')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Supabase Error:', error);
        return;
    }

    if (data && data.length > 0) {
        console.log('Row keys (Columns):', Object.keys(data[0]));
        console.log('Sample Row:', data[0]);
    } else {
        console.log('Table exists but is empty. Cannot determine columns from data.');
    }
}

inspectTable();
