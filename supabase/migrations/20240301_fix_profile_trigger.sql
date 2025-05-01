-- Drop the existing trigger and function
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Create the updated function
create or replace function public.handle_new_user() 
returns trigger as $$
declare
  v_first_name text;
  v_last_name text;
  v_full_name text;
begin
  v_first_name := coalesce(new.raw_user_meta_data->>'first_name', '');
  v_last_name := coalesce(new.raw_user_meta_data->>'last_name', '');
  v_full_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    case 
      when v_first_name = '' and v_last_name = '' then new.email
      else concat(v_first_name, ' ', v_last_name)
    end
  );

  insert into public.profiles (
    id, 
    email, 
    first_name,
    last_name,
    full_name,
    avatar_url, 
    created_at, 
    updated_at
  )
  values (
    new.id, 
    new.email, 
    v_first_name,
    v_last_name,
    v_full_name,
    null, 
    now(), 
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate the trigger
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user(); 