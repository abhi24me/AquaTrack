-- Create a stored procedure (RPC) to handle device reporting
-- This allows the Arduino to send data using its Serial Number (UID)
-- and automatically updates both the logs and the daily summary.

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
  
  -- If device doesn't exist, we could error out or auto-register. 
  -- For now, let's error to be safe.
  if v_device_id is null then
    raise exception 'Device with serial % not found', p_device_serial;
  end if;

  -- 2. Insert into High-Frequency Logs
  insert into water_usage_logs (device_id, flow_rate, total_usage)
  values (v_device_id, p_flow_rate, p_total_usage);

  -- 3. Upsert Daily Summary
  -- We trust the device's "daily_usage" calculation (since it handles midnight reset)
  v_date := current_date; 
  
  insert into daily_usage_summary (device_id, date, daily_usage)
  values (v_device_id, v_date, p_daily_usage)
  on conflict (device_id, date)
  do update set 
    daily_usage = EXCLUDED.daily_usage;
    
end;
$$ language plpgsql security definer;
