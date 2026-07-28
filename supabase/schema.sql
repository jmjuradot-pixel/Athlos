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
  created_at timestamptz not null default now(),
  unique(user_id, recorded_at)
);

create table public.activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  recorded_at date not null,
  activity_type text not null,
  distance numeric(6,1), moving_time smallint, elevation smallint,
  avg_heart_rate smallint, calories smallint,
  created_at timestamptz not null default now(),
  unique(user_id, recorded_at)
);

-- Athlos es single-user: no se usa autenticacion, RLS deshabilitado
-- El anon key puede leer y escribir directamente.
