-- Athlos es single-user: deshabilitamos RLS en tablas de datos
-- para que el anon key pueda escribir sin autenticacion.
-- auth.uid() ya no existe porque eliminamos el sistema de login.

alter table public.check_ins disable row level security;
alter table public.lab_results disable row level security;
alter table public.zepp_metrics disable row level security;
alter table public.workout_sessions disable row level security;
alter table public.activities disable row level security;

-- Limpiamos las policies ya que no se usaran
drop policy if exists "Users manage own check-ins" on public.check_ins;
drop policy if exists "Users manage own lab results" on public.lab_results;
drop policy if exists "Users manage own zepp metrics" on public.zepp_metrics;
drop policy if exists "Users manage own workout sessions" on public.workout_sessions;
drop policy if exists "Users manage own activities" on public.activities;
