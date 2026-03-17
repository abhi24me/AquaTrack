-- Create tables for the AquaTrack application

-- 1. Buildings / PGs (To handle multiple locations as requested)
CREATE TABLE IF NOT EXISTS buildings (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT
);

-- 2. Rooms (Linked to Buildings)
CREATE TABLE IF NOT EXISTS rooms (
    id SERIAL PRIMARY KEY,
    building_id INTEGER REFERENCES buildings(id) ON DELETE CASCADE,
    room_number TEXT NOT NULL,
    floor INTEGER,
    occupancy_status TEXT DEFAULT 'Occupied', -- Occupied, Vacant, Maintenance
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Devices (IoT Sensors)
CREATE TABLE IF NOT EXISTS devices (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    device_type TEXT DEFAULT 'Water Flow Meter',
    serial_number TEXT UNIQUE,
    status TEXT DEFAULT 'Active', -- Active, Offline, Maintenance
    last_ping TIMESTAMP WITH TIME ZONE
);

-- 4. Water Usage Logs (High frequency data - e.g., every 15-60 mins)
-- This table can grow large, so in a real app, it might be partitioned.
CREATE TABLE IF NOT EXISTS water_usage_logs (
    id BIGSERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    flow_rate NUMERIC, -- Liters per minute
    total_usage NUMERIC, -- Cumulative reading from the device
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Daily Usage Summary (Aggregated for performance)
CREATE TABLE IF NOT EXISTS daily_usage_summary (
    id BIGSERIAL PRIMARY KEY,
    device_id INTEGER REFERENCES devices(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    daily_usage NUMERIC NOT NULL, -- Total usage for that specific day
    UNIQUE(device_id, date)
);

-- 6. Alerts
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    room_id INTEGER REFERENCES rooms(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL, -- Leak, High Usage, Device Offline
    severity TEXT NOT NULL, -- Low, Medium, High, Critical
    message TEXT NOT NULL,
    status TEXT DEFAULT 'Active', -- Active, Resolved, Ignored
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);
