import { getSupabase } from "@/lib/supabase/client";
import { saveWithQueue } from "@/lib/sync-queue";
import { storage, StorageKeys } from "@/services/storage";
import { eventBus } from "@/events";
import { EventTypes } from "@/events/types";

type ZeppMetrics = {
  recordedAt: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  water?: number;
  visceralFat?: number;
  bmr?: number;
  sleepHours?: number;
  sleepDeep?: number;
  sleepRem?: number;
  restingHeartRate?: number;
  steps?: number;
};

function fromDB(row: any): ZeppMetrics {
  return {
    recordedAt: row.recorded_at,
    weight: row.weight ?? undefined,
    bodyFat: row.body_fat ?? undefined,
    muscleMass: row.muscle_mass ?? undefined,
    water: row.water ?? undefined,
    visceralFat: row.visceral_fat ?? undefined,
    bmr: row.bmr ?? undefined,
    sleepHours: row.sleep_hours ?? undefined,
    sleepDeep: row.sleep_deep ?? undefined,
    sleepRem: row.sleep_rem ?? undefined,
    restingHeartRate: row.resting_heart_rate ?? undefined,
    steps: row.steps ?? undefined,
  };
}

function toDB(data: Partial<ZeppMetrics>): Record<string, unknown> {
  return {
    recorded_at: data.recordedAt,
    weight: data.weight ?? null,
    body_fat: data.bodyFat ?? null,
    muscle_mass: data.muscleMass ?? null,
    water: data.water ?? null,
    visceral_fat: data.visceralFat ?? null,
    bmr: data.bmr ?? null,
    sleep_hours: data.sleepHours ?? null,
    sleep_deep: data.sleepDeep ?? null,
    sleep_rem: data.sleepRem ?? null,
    resting_heart_rate: data.restingHeartRate ?? null,
    steps: data.steps ?? null,
  };
}

export const zeppMetricsRepository = {
  getAll(): ZeppMetrics[] {
    return storage.get<ZeppMetrics[]>(StorageKeys.ZEPP_HISTORY, []);
  },

  async fetchRemote(userId: string): Promise<ZeppMetrics[]> {
    const { data } = await getSupabase()
      .from("zepp_metrics")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false });
    return (data ?? []).map(fromDB);
  },

  async save(userId: string, data: Partial<ZeppMetrics>) {
    const all = this.getAll();
    const next = [...all.filter((z) => z.recordedAt !== data.recordedAt), data as ZeppMetrics]
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    storage.set(StorageKeys.ZEPP_HISTORY, next);
    storage.set(StorageKeys.ZEPP, data);

    await saveWithQueue(userId, "zepp_metrics", toDB(data), "user_id, recorded_at");
    eventBus.emit(EventTypes.ZEPP_SYNCED, data);
  },

  merge(local: ZeppMetrics[], remote: ZeppMetrics[]): ZeppMetrics[] {
    const map = new Map(local.map((z) => [z.recordedAt, z]));
    for (const r of remote) map.set(r.recordedAt, r);
    return [...map.values()].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  },
};
