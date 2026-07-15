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
