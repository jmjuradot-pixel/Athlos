import { Activity } from "@/domain/Activity";
import { getSupabase } from "@/lib/supabase/client";
import { saveWithQueue } from "@/lib/sync-queue";
import { storage, StorageKeys } from "@/services/storage";
import { eventBus } from "@/events";
import { EventTypes } from "@/events/types";

function fromDB(row: any): Activity {
  return {
    recordedAt: row.recorded_at,
    activityType: row.activity_type,
    distance: row.distance ?? undefined,
    movingTime: row.moving_time ?? undefined,
    elevation: row.elevation ?? undefined,
    avgHeartRate: row.avg_heart_rate ?? undefined,
    calories: row.calories ?? undefined,
  };
}

function toDB(data: Partial<Activity>): Record<string, unknown> {
  return {
    recorded_at: data.recordedAt,
    activity_type: data.activityType,
    distance: data.distance ?? null,
    moving_time: data.movingTime ?? null,
    elevation: data.elevation ?? null,
    avg_heart_rate: data.avgHeartRate ?? null,
    calories: data.calories ?? null,
  };
}

export const activityRepository = {
  getAll(): Activity[] {
    return storage.get<Activity[]>(StorageKeys.ACTIVITIES, []);
  },

  async fetchRemote(userId: string): Promise<Activity[]> {
    const { data } = await getSupabase()
      .from("activities")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false });
    return (data ?? []).map(fromDB);
  },

  async save(userId: string, data: Partial<Activity>) {
    const all = this.getAll();
    const next = [...all.filter((a) => a.recordedAt !== data.recordedAt), data as Activity]
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    storage.set(StorageKeys.ACTIVITIES, next);

    await saveWithQueue(userId, "activities", toDB(data));
    eventBus.emit(EventTypes.ACTIVITY_ADDED, data);
  },

  merge(local: Activity[], remote: Activity[]): Activity[] {
    const map = new Map(local.map((a) => [a.recordedAt, a]));
    for (const r of remote) map.set(r.recordedAt, r);
    return [...map.values()].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  },
};
