-- MIGRATION SCRIPT --
-- Run this to fix your existing tables so they work with the new code.

-- 1. Fix 'devices' table
-- Check if 'serial_number' exists, if not, add it.
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'serial_number') THEN
        ALTER TABLE devices ADD COLUMN serial_number TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'device_type') THEN
        ALTER TABLE devices ADD COLUMN device_type TEXT DEFAULT 'Water Flow Meter';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'devices' AND column_name = 'status') THEN
        ALTER TABLE devices ADD COLUMN status TEXT DEFAULT 'Active';
    END IF;
END $$;

-- 2. Fix 'rooms' table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'room_number') THEN
        ALTER TABLE rooms ADD COLUMN room_number TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'occupancy_status') THEN
        ALTER TABLE rooms ADD COLUMN occupancy_status TEXT DEFAULT 'Occupied';
    END IF;
END $$;


-- 3. Ensure other tables exist (Standard creation is fine for new tables)
CREATE TABLE IF NOT EXISTS water_usage_logs (
    id BIGSERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    flow_rate NUMERIC,
    total_usage NUMERIC,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS daily_usage_summary (
    id BIGSERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    daily_usage NUMERIC NOT NULL,
    UNIQUE(device_id, date)
);

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL, 
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- 4. Create the RPC function (essential for Arduino)
create or replace function report_usage(
  p_device_serial text,
  p_flow_rate numeric,
  p_total_usage numeric,
  p_daily_usage numeric
) returns void as $$
declare
  v_device_id int;
  v_date date;
begin
  -- 1. Lookup Device ID from Serial Number
  select id into v_device_id from devices where serial_number = p_device_serial;
  
  if v_device_id is null then
    -- OPTIONAL: Auto-create device if it doesn't exist? 
    -- For now, let's just insert it to unblock you if you are testing.
    -- raise exception 'Device % not found', p_device_serial;
    
    -- FALLBACK: Since you might rely on existing IDs, let's try to infer or just fail.
    raise exception 'Device with Serial Number % not found. Please update the "devices" table with this serial number.', p_device_serial;
  end if;

  -- 2. Insert into High-Frequency Logs
  insert into water_usage_logs (device_id, flow_rate, total_usage)
  values (v_device_id, p_flow_rate, p_total_usage);

  -- 3. Upsert Daily Summary
  v_date := current_date; 
  
  insert into daily_usage_summary (device_id, date, daily_usage)
  values (v_device_id, v_date, p_daily_usage)
  on conflict (device_id, date)
  do update set 
    daily_usage = EXCLUDED.daily_usage;
    
end;
$$ language plpgsql security definer;
