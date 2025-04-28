-- Create tables for the options trading tracker

-- Enable RLS (Row Level Security)
alter default privileges revoke execute on functions from public;

-- Create profiles table
create table public.profiles (
id uuid references auth.users on delete cascade not null primary key,
email text not null,
first_name text not null,
last_name text not null,
full_name text not null,
avatar_url text,
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);

-- Create trades table
create table public.trades (
id uuid default gen_random_uuid() primary key,
user_id uuid references public.profiles(id) on delete cascade not null,
symbol text not null,
strategy text not null,
option_type text not null check (option_type in ('call', 'put')),
direction text not null check (direction in ('long', 'short')),
strike_price numeric not null,
entry_price numeric not null,
exit_price numeric,
expiry_date date not null,
entry_date date not null,
exit_date date,
contracts integer not null,
profit numeric,
status text not null check (status in ('open', 'closed')),
created_at timestamp with time zone default now() not null,
updated_at timestamp with time zone default now() not null
);

-- Add notes and image_url columns to trades table
ALTER TABLE public.trades 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create watchlist table
create table public.watchlist (
id uuid default gen_random_uuid() primary key,
user_id uuid references public.profiles(id) on delete cascade not null,
symbol text not null,
created_at timestamp with time zone default now() not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.trades enable row level security;
alter table public.watchlist enable row level security;

-- Create policies
create policy "Users can view their own profile" 
on public.profiles for select 
using (auth.uid() = id);

create policy "Users can update their own profile" 
on public.profiles for update 
using (auth.uid() = id);

create policy "Users can view their own trades" 
on public.trades for select 
using (auth.uid() = user_id);

create policy "Users can insert their own trades" 
on public.trades for insert 
with check (auth.uid() = user_id);

create policy "Users can update their own trades" 
on public.trades for update 
using (auth.uid() = user_id);

create policy "Users can delete their own trades" 
on public.trades for delete 
using (auth.uid() = user_id);

create policy "Users can view their own watchlist" 
on public.watchlist for select 
using (auth.uid() = user_id);

create policy "Users can insert into their own watchlist" 
on public.watchlist for insert 
with check (auth.uid() = user_id);

create policy "Users can delete from their own watchlist" 
on public.watchlist for delete 
using (auth.uid() = user_id);

-- Create function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
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
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    null, 
    now(), 
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user signup
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Create function to update the updated_at timestamp
create or replace function public.set_updated_at()
returns trigger as $$
begin
new.updated_at = now();
return new;
end;
$$ language plpgsql security definer;

-- Create triggers for updated_at
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger set_trades_updated_at
before update on public.trades
for each row execute procedure public.set_updated_at();

