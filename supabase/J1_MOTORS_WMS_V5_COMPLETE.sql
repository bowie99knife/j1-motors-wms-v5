-- =============================================================
-- J1 MOTORS WMS V5 — COMPLETE SUPABASE SETUP
-- Run this file once in Supabase SQL Editor on a NEW project.
-- It creates the database, security policies, booking capacity,
-- customer tracking, staff roles, and upload storage.
-- =============================================================

begin;


-- ===== BEGIN 001_v4_schema.sql =====

create extension if not exists pgcrypto;

create type public.staff_role as enum ('admin','workshop_manager','mechanic','apprentice');
create type public.job_status as enum ('Booked','Checked In','Diagnosing','Waiting Approval','Repair In Progress','Waiting Parts','Quality Check','Completed','Collected','Cancelled');

create table public.profiles(
  id uuid primary key references auth.users(id) on delete cascade,
  staff_id text not null unique,
  full_name text not null,
  role public.staff_role not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.appointments(
  id uuid primary key default gen_random_uuid(),
  tracking_reference uuid not null default gen_random_uuid() unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  rego text not null,
  make text not null,
  model text not null,
  year integer,
  odometer integer,
  preferred_date date not null,
  preferred_time time not null,
  service text not null,
  description text not null,
  status text not null default 'Pending',
  created_at timestamptz not null default now()
);

create table public.quote_requests(
  id uuid primary key default gen_random_uuid(),
  tracking_reference uuid not null default gen_random_uuid() unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  rego text not null,
  make text not null,
  model text not null,
  year integer,
  odometer integer,
  description text not null,
  status text not null default 'New',
  created_at timestamptz not null default now()
);

create sequence public.job_number_seq start 1001;

create table public.job_cards(
  id uuid primary key default gen_random_uuid(),
  job_number text not null unique default ('J1-'||extract(year from now())::text||'-'||lpad(nextval('public.job_number_seq')::text,5,'0')),
  tracking_reference uuid not null default gen_random_uuid() unique,
  status public.job_status not null default 'Booked',
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  rego text not null,
  make text not null,
  model text not null,
  year integer,
  odometer integer,
  engine_code text,
  transmission text,
  customer_concern text,
  findings text,
  fault_codes text,
  diagnosis text,
  rectification text,
  recommendations text,
  assigned_to uuid references public.profiles(id),
  estimated_completion timestamptz,
  created_by uuid not null default auth.uid() references public.profiles(id),
  updated_by uuid default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.job_photos(
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_cards(id) on delete cascade,
  storage_path text not null,
  caption text,
  uploaded_by uuid not null default auth.uid() references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Financial data is isolated from job cards so non-admin staff cannot read it.
create table public.job_financials(
  job_id uuid primary key references public.job_cards(id) on delete cascade,
  parts_total_cents integer not null default 0,
  labour_total_cents integer not null default 0,
  discount_cents integer not null default 0,
  gst_cents integer not null default 0,
  total_cents integer not null default 0,
  updated_by uuid default auth.uid() references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table public.audit_log(
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles(id),
  entity_type text not null,
  entity_id uuid,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.is_active_staff()
returns boolean language sql stable security definer set search_path=public
as $$select exists(select 1 from public.profiles where id=auth.uid() and active=true)$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public
as $$select exists(select 1 from public.profiles where id=auth.uid() and active=true and role='admin')$$;

create or replace function public.touch_job()
returns trigger language plpgsql as $$
begin new.updated_at=now();new.updated_by=auth.uid();return new;end$$;

create trigger job_touch before update on public.job_cards for each row execute function public.touch_job();

create or replace function public.audit_job_change()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.audit_log(actor_id,entity_type,entity_id,action,details)
  values(auth.uid(),'job_card',coalesce(new.id,old.id),tg_op,
    jsonb_build_object('old',to_jsonb(old),'new',to_jsonb(new)));
  return coalesce(new,old);
end$$;

create trigger audit_job after insert or update or delete on public.job_cards
for each row execute function public.audit_job_change();

create or replace function public.submit_appointment(payload jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare ref uuid;
begin
  insert into public.appointments(customer_name,customer_phone,customer_email,rego,make,model,year,odometer,preferred_date,preferred_time,service,description)
  values(payload->>'name',payload->>'phone',nullif(payload->>'email',''),upper(payload->>'rego'),payload->>'make',payload->>'model',
  nullif(payload->>'year','')::integer,nullif(payload->>'odometer','')::integer,(payload->>'preferred_date')::date,(payload->>'preferred_time')::time,payload->>'service',payload->>'description')
  returning tracking_reference into ref;return ref;
end$$;

create or replace function public.submit_quote_request(payload jsonb)
returns uuid language plpgsql security definer set search_path=public as $$
declare ref uuid;
begin
  insert into public.quote_requests(customer_name,customer_phone,customer_email,rego,make,model,year,odometer,description)
  values(payload->>'name',payload->>'phone',nullif(payload->>'email',''),upper(payload->>'rego'),payload->>'make',payload->>'model',
  nullif(payload->>'year','')::integer,nullif(payload->>'odometer','')::integer,payload->>'description')
  returning tracking_reference into ref;return ref;
end$$;

create or replace function public.track_customer_record(tracking_reference text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare ref uuid:=tracking_reference::uuid;declare result jsonb;
begin
 select jsonb_build_object('type','job','job_number',job_number,'status',status,'rego',rego,'make',make,'model',model,'estimated_completion',estimated_completion,'recommendations',recommendations)
 into result from public.job_cards where job_cards.tracking_reference=ref;
 if result is not null then return result;end if;
 select jsonb_build_object('type','appointment','status',status,'rego',rego,'make',make,'model',model,'preferred_date',preferred_date,'preferred_time',preferred_time)
 into result from public.appointments where appointments.tracking_reference=ref;
 if result is not null then return result;end if;
 select jsonb_build_object('type','quotation','status',status,'rego',rego,'make',make,'model',model)
 into result from public.quote_requests where quote_requests.tracking_reference=ref;
 return result;
exception when invalid_text_representation then return null;
end$$;

create or replace function public.admin_revenue_stats()
returns jsonb language sql stable security definer set search_path=public as $$
select case when public.is_admin() then jsonb_build_object(
  'today_revenue',coalesce(sum(total_cents) filter(where updated_at::date=current_date),0)/100.0,
  'month_revenue',coalesce(sum(total_cents) filter(where date_trunc('month',updated_at)=date_trunc('month',now())),0)/100.0,
  'all_time_revenue',coalesce(sum(total_cents),0)/100.0,
  'paid_jobs',count(*)
) else '{}'::jsonb end from public.job_financials;
$$;

alter table public.profiles enable row level security;
alter table public.appointments enable row level security;
alter table public.quote_requests enable row level security;
alter table public.job_cards enable row level security;
alter table public.job_photos enable row level security;
alter table public.job_financials enable row level security;
alter table public.audit_log enable row level security;

create policy "staff read own profile or admin all" on public.profiles
for select to authenticated using(id=auth.uid() or public.is_admin());

create policy "admin manages profiles" on public.profiles
for all to authenticated using(public.is_admin()) with check(public.is_admin());

create policy "all staff read bookings" on public.appointments
for select to authenticated using(public.is_active_staff());

create policy "all staff update bookings" on public.appointments
for update to authenticated using(public.is_active_staff()) with check(public.is_active_staff());

create policy "admin only reads quote requests" on public.quote_requests
for select to authenticated using(public.is_admin());

create policy "admin updates quote requests" on public.quote_requests
for update to authenticated using(public.is_admin()) with check(public.is_admin());

create policy "all staff read jobs" on public.job_cards
for select to authenticated using(public.is_active_staff());

create policy "all staff create jobs" on public.job_cards
for insert to authenticated with check(public.is_active_staff());

create policy "all staff update jobs" on public.job_cards
for update to authenticated using(public.is_active_staff()) with check(public.is_active_staff());

create policy "admin deletes jobs" on public.job_cards
for delete to authenticated using(public.is_admin());

create policy "all staff read job photos" on public.job_photos
for select to authenticated using(public.is_active_staff());

create policy "all staff add job photos" on public.job_photos
for insert to authenticated with check(public.is_active_staff());

create policy "all staff update job photos" on public.job_photos
for update to authenticated using(public.is_active_staff()) with check(public.is_active_staff());

create policy "admin deletes job photos" on public.job_photos
for delete to authenticated using(public.is_admin());

create policy "admin only financials" on public.job_financials
for all to authenticated using(public.is_admin()) with check(public.is_admin());

create policy "staff read audit own actions admin all" on public.audit_log
for select to authenticated using(actor_id=auth.uid() or public.is_admin());

grant execute on function public.submit_appointment(jsonb) to anon,authenticated;
grant execute on function public.submit_quote_request(jsonb) to anon,authenticated;
grant execute on function public.track_customer_record(text) to anon,authenticated;
grant execute on function public.admin_revenue_stats() to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('job-photos','job-photos',false,10485760,array['image/jpeg','image/png','image/webp'])
on conflict(id) do nothing;

create policy "all staff view storage photos" on storage.objects
for select to authenticated using(bucket_id='job-photos' and public.is_active_staff());

create policy "all staff upload storage photos" on storage.objects
for insert to authenticated with check(bucket_id='job-photos' and public.is_active_staff());

create policy "all staff update storage photos" on storage.objects
for update to authenticated using(bucket_id='job-photos' and public.is_active_staff());

create policy "admin delete storage photos" on storage.objects
for delete to authenticated using(bucket_id='job-photos' and public.is_admin());


-- ===== END 001_v4_schema.sql =====


-- ===== BEGIN 002_profile_trigger.sql =====

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,staff_id,full_name,role,active)
  values(
    new.id,
    upper(coalesce(new.raw_user_meta_data->>'staff_id','UNASSIGNED')),
    coalesce(new.raw_user_meta_data->>'full_name',new.email),
    coalesce((new.raw_user_meta_data->>'role')::public.staff_role,'mechanic'),
    true
  );
  return new;
end$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();


-- ===== END 002_profile_trigger.sql =====


-- ===== BEGIN 003_track_by_rego_phone.sql =====

create or replace function public.track_vehicle_by_rego_phone(
  registration_input text,
  phone_input text
)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  normalized_rego text := upper(trim(registration_input));
  normalized_phone text := regexp_replace(phone_input, '\s+', '', 'g');
  result jsonb;
begin
  select jsonb_build_object(
    'type','job',
    'job_number',job_number,
    'status',status,
    'rego',rego,
    'make',make,
    'model',model,
    'estimated_completion',estimated_completion,
    'recommendations',recommendations
  )
  into result
  from public.job_cards
  where upper(trim(rego))=normalized_rego
    and regexp_replace(customer_phone, '\s+', '', 'g')=normalized_phone
  order by updated_at desc
  limit 1;

  if result is not null then return result; end if;

  select jsonb_build_object(
    'type','appointment',
    'status',status,
    'rego',rego,
    'make',make,
    'model',model,
    'preferred_date',preferred_date,
    'preferred_time',preferred_time
  )
  into result
  from public.appointments
  where upper(trim(rego))=normalized_rego
    and regexp_replace(customer_phone, '\s+', '', 'g')=normalized_phone
  order by created_at desc
  limit 1;

  if result is not null then return result; end if;

  select jsonb_build_object(
    'type','quotation',
    'status',status,
    'rego',rego,
    'make',make,
    'model',model
  )
  into result
  from public.quote_requests
  where upper(trim(rego))=normalized_rego
    and regexp_replace(customer_phone, '\s+', '', 'g')=normalized_phone
  order by created_at desc
  limit 1;

  return result;
end
$$;

grant execute on function public.track_vehicle_by_rego_phone(text,text)
to anon, authenticated;


-- ===== END 003_track_by_rego_phone.sql =====


-- ===== BEGIN 004_quote_file_upload.sql =====

create table if not exists public.quote_request_files(
  id uuid primary key default gen_random_uuid(),
  quote_request_id uuid not null references public.quote_requests(id) on delete cascade,
  storage_path text not null unique,
  original_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

alter table public.quote_request_files enable row level security;

create policy "admin reads quote files" on public.quote_request_files
for select to authenticated using(public.is_admin());

create policy "public records uploaded quote files" on public.quote_request_files
for insert to anon,authenticated with check(true);

create policy "admin deletes quote files" on public.quote_request_files
for delete to authenticated using(public.is_admin());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values(
  'quote-request-files','quote-request-files',false,20971520,
  array['image/jpeg','image/png','image/webp','video/mp4','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
on conflict(id) do nothing;

create policy "public uploads quote request files" on storage.objects
for insert to anon,authenticated
with check(bucket_id='quote-request-files');

create policy "admin reads quote request files" on storage.objects
for select to authenticated
using(bucket_id='quote-request-files' and public.is_admin());

create policy "admin deletes quote request files" on storage.objects
for delete to authenticated
using(bucket_id='quote-request-files' and public.is_admin());

create or replace function public.submit_quote_request_v2(payload jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare request_id uuid; ref uuid;
begin
  insert into public.quote_requests(
    customer_name,customer_phone,customer_email,rego,make,model,year,odometer,description
  ) values(
    payload->>'name',payload->>'phone',nullif(payload->>'email',''),upper(payload->>'rego'),
    payload->>'make',payload->>'model',nullif(payload->>'year','')::integer,
    nullif(payload->>'odometer','')::integer,payload->>'description'
  ) returning id,tracking_reference into request_id,ref;
  return jsonb_build_object('request_id',request_id,'tracking_reference',ref);
end$$;

grant execute on function public.submit_quote_request_v2(jsonb) to anon,authenticated;


-- ===== END 004_quote_file_upload.sql =====


-- ===== BEGIN 005_booking_capacity.sql =====

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


-- ===== END 005_booking_capacity.sql =====


-- =============================================================
-- V5 CUSTOMER + VEHICLE HISTORY LAYER
-- =============================================================

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(phone)
);

create table if not exists public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  rego text not null,
  make text not null,
  model text not null,
  year integer,
  engine_code text,
  transmission text,
  latest_odometer integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(rego)
);

alter table public.customers enable row level security;
alter table public.vehicles enable row level security;

create policy "active staff read customers"
on public.customers for select to authenticated
using(public.is_active_staff());

create policy "active staff manage customers"
on public.customers for all to authenticated
using(public.is_active_staff())
with check(public.is_active_staff());

create policy "active staff read vehicles"
on public.vehicles for select to authenticated
using(public.is_active_staff());

create policy "active staff manage vehicles"
on public.vehicles for all to authenticated
using(public.is_active_staff())
with check(public.is_active_staff());

create or replace function public.sync_customer_vehicle(
  p_name text,
  p_phone text,
  p_email text,
  p_rego text,
  p_make text,
  p_model text,
  p_year integer,
  p_odometer integer,
  p_engine_code text default null,
  p_transmission text default null
)
returns uuid
language plpgsql
security definer
set search_path=public
as $$
declare
  customer_uuid uuid;
  vehicle_uuid uuid;
begin
  insert into public.customers(full_name,phone,email)
  values(trim(p_name),trim(p_phone),nullif(trim(coalesce(p_email,'')),''))
  on conflict(phone) do update set
    full_name=excluded.full_name,
    email=coalesce(excluded.email,public.customers.email),
    updated_at=now()
  returning id into customer_uuid;

  insert into public.vehicles(
    customer_id,rego,make,model,year,latest_odometer,engine_code,transmission
  )
  values(
    customer_uuid,upper(trim(p_rego)),trim(p_make),trim(p_model),p_year,
    p_odometer,nullif(trim(coalesce(p_engine_code,'')),''),
    nullif(trim(coalesce(p_transmission,'')),'')
  )
  on conflict(rego) do update set
    customer_id=excluded.customer_id,
    make=excluded.make,
    model=excluded.model,
    year=coalesce(excluded.year,public.vehicles.year),
    latest_odometer=greatest(
      coalesce(public.vehicles.latest_odometer,0),
      coalesce(excluded.latest_odometer,0)
    ),
    engine_code=coalesce(excluded.engine_code,public.vehicles.engine_code),
    transmission=coalesce(excluded.transmission,public.vehicles.transmission),
    updated_at=now()
  returning id into vehicle_uuid;

  return vehicle_uuid;
end
$$;

create or replace function public.sync_job_customer_vehicle()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  perform public.sync_customer_vehicle(
    new.customer_name,new.customer_phone,new.customer_email,new.rego,
    new.make,new.model,new.year,new.odometer,new.engine_code,new.transmission
  );
  return new;
end
$$;

drop trigger if exists sync_job_customer_vehicle_trigger on public.job_cards;
create trigger sync_job_customer_vehicle_trigger
after insert or update on public.job_cards
for each row execute function public.sync_job_customer_vehicle();

create or replace function public.sync_appointment_customer_vehicle()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
begin
  perform public.sync_customer_vehicle(
    new.customer_name,new.customer_phone,new.customer_email,new.rego,
    new.make,new.model,new.year,new.odometer,null,null
  );
  return new;
end
$$;

drop trigger if exists sync_appointment_customer_vehicle_trigger on public.appointments;
create trigger sync_appointment_customer_vehicle_trigger
after insert or update on public.appointments
for each row execute function public.sync_appointment_customer_vehicle();

create or replace view public.vehicle_service_history as
select
  v.id as vehicle_id,
  v.rego,
  v.make,
  v.model,
  v.year,
  v.latest_odometer,
  c.id as customer_id,
  c.full_name as customer_name,
  c.phone as customer_phone,
  j.id as job_id,
  j.job_number,
  j.status,
  j.customer_concern,
  j.diagnosis,
  j.rectification,
  j.recommendations,
  j.created_at,
  j.updated_at
from public.vehicles v
left join public.customers c on c.id=v.customer_id
left join public.job_cards j on upper(j.rego)=upper(v.rego);

grant select on public.vehicle_service_history to authenticated;

-- Admin-only revenue is kept separate from general job-card access.
-- Quote requests remain admin-only; bookings and job cards are visible
-- to all active workshop staff as requested.

commit;
