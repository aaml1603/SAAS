-- Remove admin column from profiles table
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS is_admin;

-- Drop the admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Update the trigger function to remove admin field
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
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