import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
    const { data: rooms, error } = await supabase.from('rooms').select('*, buildings(*)').limit(1);
    console.log('Rooms schema:', JSON.stringify(rooms, null, 2));
    if (error) console.error('Error:', error);

    const { data: buildings, error: bError } = await supabase.from('buildings').select('*').limit(1);
    console.log('Buildings schema:', JSON.stringify(buildings, null, 2));
    if (bError) console.error('Buildings Error:', bError);
}

main();
