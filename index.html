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
