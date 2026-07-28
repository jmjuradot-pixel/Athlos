-- Añade unique(user_id, recorded_at) a workout_sessions y activities
-- para permitir upsert y evitar duplicados al sincronizar.

-- 1. Eliminar duplicados en workout_sessions (conserva el más reciente)
delete from public.workout_sessions a
using public.workout_sessions b
where a.id < b.id
  and a.user_id = b.user_id
  and a.recorded_at = b.recorded_at;

-- 2. Añadir unique constraint a workout_sessions
alter table public.workout_sessions
  drop constraint if exists workout_sessions_user_id_recorded_at_key,
  add constraint workout_sessions_user_id_recorded_at_key unique (user_id, recorded_at);

-- 3. Eliminar duplicados en activities (conserva el más reciente)
delete from public.activities a
using public.activities b
where a.id < b.id
  and a.user_id = b.user_id
  and a.recorded_at = b.recorded_at;

-- 4. Añadir unique constraint a activities
alter table public.activities
  drop constraint if exists activities_user_id_recorded_at_key,
  add constraint activities_user_id_recorded_at_key unique (user_id, recorded_at);
