-- NOTE: This migration is no longer used as the Trading Journal feature has been removed
-- First, create the set_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create journal entries table
create table public.journal_entries (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references public.profiles(id) on delete cascade not null,
    entry_date date not null,
    pre_market_notes text,
    post_market_notes text,
    mistakes text[],
    improvements text[],
    watchlist jsonb,
    trade_plan text,
    lessons_learned text,
    mood text,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null
);

-- Add RLS policies
alter table public.journal_entries enable row level security;

create policy "Users can view their own journal entries"
    on public.journal_entries for select
    using (auth.uid() = user_id);

create policy "Users can insert their own journal entries"
    on public.journal_entries for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own journal entries"
    on public.journal_entries for update
    using (auth.uid() = user_id);

create policy "Users can delete their own journal entries"
    on public.journal_entries for delete
    using (auth.uid() = user_id);

-- Add updated_at trigger
create trigger set_journal_timestamp
    before update on public.journal_entries
    for each row
    execute function public.set_updated_at();

