-- Athlos · esquema inicial de Supabase
-- Ejecuta este archivo en el SQL Editor de tu proyecto Supabase cuando conectemos la cuenta.
create extension if not exists "uuid-ossp";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

create table public.check_ins (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recorded_at date not null,
  weekly_weight numeric(5,2), sunday_weight numeric(5,2), waist numeric(5,2),
  strength_sessions integer, cardio_minutes integer, average_steps integer, alcohol_ml integer,
  energy smallint check (energy between 1 and 10), hunger smallint check (hunger between 1 and 10),
  sleep smallint check (sleep between 1 and 10), comments text,
  created_at timestamptz not null default now(),
  unique(user_id, recorded_at)
);

create table public.lab_results (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  tested_at date not null, alt numeric, ast numeric, ggt numeric, ldl numeric, hdl numeric,
  triglycerides numeric, glucose numeric, created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.check_ins enable row level security;
alter table public.lab_results enable row level security;
create policy "Users manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users manage own check-ins" on public.check_ins for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own lab results" on public.lab_results for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
