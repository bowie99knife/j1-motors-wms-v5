create or replace function public.get_booking_availability(requested_date date)
returns jsonb language plpgsql security definer set search_path=public as $$
declare day_count integer; slots jsonb;
begin
  select count(*) into day_count from public.appointments where preferred_date=requested_date and status <> 'Cancelled';
  select jsonb_build_object(
    '08:30',count(*) filter(where preferred_time='08:30'::time),
    '09:30',count(*) filter(where preferred_time='09:30'::time),
    '10:30',count(*) filter(where preferred_time='10:30'::time),
    '11:30',count(*) filter(where preferred_time='11:30'::time),
    '13:30',count(*) filter(where preferred_time='13:30'::time),
    '14:30',count(*) filter(where preferred_time='14:30'::time),
    '15:30',count(*) filter(where preferred_time='15:30'::time)
  ) into slots from public.appointments where preferred_date=requested_date and status <> 'Cancelled';
  return jsonb_build_object('day_count',day_count,'slots',slots);
end$$;

create or replace function public.submit_appointment_with_capacity(payload jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare selected_date date:=(payload->>'preferred_date')::date; selected_time time:=(payload->>'preferred_time')::time; daily_count integer; slot_count integer; slot_limit integer; tracking_ref uuid;
begin
  perform pg_advisory_xact_lock(hashtext(selected_date::text));
  if selected_time not in ('08:30'::time,'09:30'::time,'10:30'::time,'11:30'::time,'13:30'::time,'14:30'::time,'15:30'::time) then raise exception 'Selected time is unavailable'; end if;
  slot_limit:=case when selected_time in ('08:30'::time,'09:30'::time,'10:30'::time) then 2 else 1 end;
  select count(*) into daily_count from public.appointments where preferred_date=selected_date and status <> 'Cancelled';
  if daily_count>=10 then raise exception 'Selected date is unavailable'; end if;
  select count(*) into slot_count from public.appointments where preferred_date=selected_date and preferred_time=selected_time and status <> 'Cancelled';
  if slot_count>=slot_limit then raise exception 'Selected time is unavailable'; end if;
  insert into public.appointments(customer_name,customer_phone,customer_email,rego,make,model,year,odometer,preferred_date,preferred_time,service,description)
  values(payload->>'name',payload->>'phone',nullif(payload->>'email',''),upper(payload->>'rego'),payload->>'make',payload->>'model',nullif(payload->>'year','')::integer,nullif(payload->>'odometer','')::integer,selected_date,selected_time,payload->>'service',payload->>'description') returning tracking_reference into tracking_ref;
  return tracking_ref;
end$$;

grant execute on function public.get_booking_availability(date) to anon,authenticated;
grant execute on function public.submit_appointment_with_capacity(jsonb) to anon,authenticated;
