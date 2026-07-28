import { Workout } from "@/domain/Workout";
import { getSupabase } from "@/lib/supabase/client";
import { saveWithQueue } from "@/lib/sync-queue";
import { storage, StorageKeys } from "@/services/storage";
import { eventBus } from "@/events";
import { EventTypes } from "@/events/types";

function fromDB(row: any): Workout {
  return {
    recordedAt: row.recorded_at,
    duration: row.duration ?? undefined,
    volume: row.volume ?? undefined,
    muscleGroups: Array.isArray(row.muscle_groups) ? row.muscle_groups : [],
    exercises: row.exercises ?? undefined,
  };
}

function toDB(data: Partial<Workout>): Record<string, unknown> {
  return {
    recorded_at: data.recordedAt,
    duration: data.duration ?? null,
    volume: data.volume ?? null,
    muscle_groups: data.muscleGroups ?? [],
    exercises: data.exercises ?? null,
  };
}

export const workoutRepository = {
  getAll(): Workout[] {
    return storage.get<Workout[]>(StorageKeys.WORKOUTS, []);
  },

  async fetchRemote(userId: string): Promise<Workout[]> {
    const { data } = await getSupabase()
      .from("workout_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false });
    return (data ?? []).map(fromDB);
  },

  async save(userId: string, data: Partial<Workout>) {
    const all = this.getAll();
    const next = [...all.filter((w) => w.recordedAt !== data.recordedAt), data as Workout]
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    storage.set(StorageKeys.WORKOUTS, next);

    await saveWithQueue(userId, "workout_sessions", toDB(data), "user_id, recorded_at");
    eventBus.emit(EventTypes.WORKOUT_IMPORTED, data);
  },

  merge(local: Workout[], remote: Workout[]): Workout[] {
    const map = new Map(local.map((w) => [w.recordedAt, w]));
    for (const r of remote) map.set(r.recordedAt, r);
    return [...map.values()].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  },
};
