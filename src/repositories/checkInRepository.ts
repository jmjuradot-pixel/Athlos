import { CheckIn } from "@/domain/CheckIn";
import { getSupabase } from "@/lib/supabase/client";
import { saveWithQueue } from "@/lib/sync-queue";
import { storage, StorageKeys } from "@/services/storage";
import { eventBus } from "@/events";
import { EventTypes } from "@/events/types";

function fromDB(row: any): CheckIn {
  return {
    recordedAt: row.recorded_at,
    weeklyWeight: row.weekly_weight ?? undefined,
    sundayWeight: row.sunday_weight ?? undefined,
    waist: row.waist ?? undefined,
    strengthSessions: row.strength_sessions ?? undefined,
    cardioMinutes: row.cardio_minutes ?? undefined,
    averageSteps: row.average_steps ?? undefined,
    alcoholMl: row.alcohol_ml ?? undefined,
    energy: row.energy ?? undefined,
    hunger: row.hunger ?? undefined,
    sleep: row.sleep ?? undefined,
    comments: row.comments ?? undefined,
  };
}

function toDB(data: Partial<CheckIn>): Record<string, unknown> {
  return {
    recorded_at: data.recordedAt,
    weekly_weight: data.weeklyWeight ?? null,
    sunday_weight: data.sundayWeight ?? null,
    waist: data.waist ?? null,
    strength_sessions: data.strengthSessions ?? null,
    cardio_minutes: data.cardioMinutes ?? null,
    average_steps: data.averageSteps ?? null,
    alcohol_ml: data.alcoholMl ?? null,
    energy: data.energy ?? null,
    hunger: data.hunger ?? null,
    sleep: data.sleep ?? null,
    comments: data.comments ?? null,
  };
}

export const checkInRepository = {
  getAll(): CheckIn[] {
    return storage.get<CheckIn[]>(StorageKeys.CHECKINS, []);
  },

  async fetchRemote(userId: string): Promise<CheckIn[]> {
    const { data } = await getSupabase()
      .from("check_ins")
      .select("*")
      .eq("user_id", userId)
      .order("recorded_at", { ascending: false });
    return (data ?? []).map(fromDB);
  },

  async save(userId: string, data: Partial<CheckIn>) {
    const all = this.getAll();
    const next = [...all.filter((c) => c.recordedAt !== data.recordedAt), data as CheckIn]
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
    storage.set(StorageKeys.CHECKINS, next);
    storage.set(StorageKeys.LATEST_CHECKIN, data);

    await saveWithQueue(userId, "check_ins", toDB(data), "user_id, recorded_at");
    eventBus.emit(EventTypes.CHECKIN_CREATED, data);
  },

  merge(local: CheckIn[], remote: CheckIn[]): CheckIn[] {
    const map = new Map(local.map((c) => [c.recordedAt, c]));
    for (const r of remote) map.set(r.recordedAt, r);
    return [...map.values()].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  },
};
