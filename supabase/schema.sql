-- Real Estate Brokerage Break-Even Analyzer Database Schema

-- Create the break_even_records table
create table if not exists public.break_even_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  inputs jsonb not null,
  results jsonb not null,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table public.break_even_records enable row level security;

-- RLS Policies

-- Users can read their own records
create policy "read own" on public.break_even_records
  for select using (auth.uid() = user_id);

-- Users can insert their own records
create policy "insert own" on public.break_even_records
  for insert with check (auth.uid() = user_id);

-- Users can delete their own records
create policy "delete own" on public.break_even_records
  for delete using (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists break_even_records_user_id_idx 
  on public.break_even_records(user_id);

create index if not exists break_even_records_created_at_idx 
  on public.break_even_records(created_at desc);

-- Comments for documentation
comment on table public.break_even_records is 
  'Stores saved break-even analysis scenarios for authenticated users';

comment on column public.break_even_records.inputs is 
  'JSON object containing all input parameters for the calculation';

comment on column public.break_even_records.results is 
  'JSON object containing all calculated results and breakdown steps';

