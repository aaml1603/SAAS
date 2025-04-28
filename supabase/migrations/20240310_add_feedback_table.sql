-- Create feedback table
create table public.feedback (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  feedback_type text not null check (feedback_type in ('feature', 'bug', 'improvement')),
  feedback_text text not null,
  status text not null check (status in ('new', 'in-progress', 'completed', 'declined')),
  admin_notes text,
  discord_message_id text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Add RLS policies
alter table public.feedback enable row level security;

create policy "Users can view their own feedback"
  on public.feedback for select
  using (auth.uid() = user_id);

create policy "Users can insert their own feedback"
  on public.feedback for insert
  with check (auth.uid() = user_id);

-- Add updated_at trigger
create trigger set_feedback_timestamp
  before update on public.feedback
  for each row
  execute function public.set_updated_at();

-- Add discord_message_id column to feedback table if it doesn't exist
ALTER TABLE public.feedback 
ADD COLUMN IF NOT EXISTS discord_message_id text;

