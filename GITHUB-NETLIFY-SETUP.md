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
