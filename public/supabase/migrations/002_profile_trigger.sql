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
