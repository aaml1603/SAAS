-- Add policy to allow the trigger function to insert new profiles
create policy "Trigger function can insert profiles"
on public.profiles for insert
with check (true);

-- Grant necessary permissions to the trigger function
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, service_role;
grant all privileges on all sequences in schema public to postgres, service_role; 