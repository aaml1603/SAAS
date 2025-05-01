-- Add is_admin column to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Update RLS policies to allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND is_admin = true
  )
);

-- Update the trigger function to set is_admin to false by default
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
    is_admin,
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
    false,
    now(), 
    now()
  );
  return new;
end;
$$ language plpgsql security definer; 