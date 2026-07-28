-- Athlos · esquema completo para Supabase
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
  triglycerides numeric, glucose numeric,
  created_at timestamptz not null default now(),
  unique(user_id, tested_at)
);

create table public.zepp_metrics (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recorded_at date not null,
  weight numeric(5,2), body_fat numeric(4,1), muscle_mass numeric(4,1), water numeric(4,1),
  visceral_fat smallint, bmr smallint,
  sleep_hours numeric(3,1), sleep_deep numeric(3,1), sleep_rem numeric(3,1),
  resting_heart_rate smallint, steps integer,
  created_at timestamptz not null default now(),
  unique(user_id, recorded_at)
);

create table public.workout_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recorded_at date not null,
  duration smallint, volume integer,
  muscle_groups jsonb default '[]'::jsonb,
  exercises smallint,
  created_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recorded_at date not null,
  activity_type text not null,
  distance numeric(6,1), moving_time smallint, elevation smallint,
  avg_heart_rate smallint, calories smallint,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.check_ins enable row level security;
alter table public.lab_results enable row level security;
alter table public.zepp_metrics enable row level security;
alter table public.workout_sessions enable row level security;
alter table public.activities enable row level security;

create policy "Users manage own profile" on public.profiles for all
  using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users manage own check-ins" on public.check_ins for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own lab results" on public.lab_results for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own zepp metrics" on public.zepp_metrics for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own workout sessions" on public.workout_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own activities" on public.activities for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Trigger para crear perfil automáticamente al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
