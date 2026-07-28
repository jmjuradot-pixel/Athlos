import { LabResult } from "@/domain/LabResult";
import { getSupabase } from "@/lib/supabase/client";
import { saveWithQueue } from "@/lib/sync-queue";
import { storage, StorageKeys } from "@/services/storage";
import { eventBus } from "@/events";
import { EventTypes } from "@/events/types";

function fromDB(row: any): LabResult {
  return {
    testedAt: row.tested_at,
    alt: row.alt ?? undefined,
    ast: row.ast ?? undefined,
    ggt: row.ggt ?? undefined,
    ldl: row.ldl ?? undefined,
    hdl: row.hdl ?? undefined,
    triglycerides: row.triglycerides ?? undefined,
    glucose: row.glucose ?? undefined,
  };
}

function toDB(data: Partial<LabResult>): Record<string, unknown> {
  return {
    tested_at: data.testedAt,
    alt: data.alt ?? null,
    ast: data.ast ?? null,
    ggt: data.ggt ?? null,
    ldl: data.ldl ?? null,
    hdl: data.hdl ?? null,
    triglycerides: data.triglycerides ?? null,
    glucose: data.glucose ?? null,
  };
}

export const labsRepository = {
  getAll(): LabResult[] {
    return storage.get<LabResult[]>(StorageKeys.LABS, []);
  },

  async fetchRemote(userId: string): Promise<LabResult[]> {
    const { data } = await getSupabase()
      .from("lab_results")
      .select("*")
      .eq("user_id", userId)
      .order("tested_at", { ascending: false });
    return (data ?? []).map(fromDB);
  },

  async save(userId: string, data: Partial<LabResult>) {
    const all = this.getAll();
    const next = [...all.filter((l) => l.testedAt !== data.testedAt), data as LabResult]
      .sort((a, b) => a.testedAt.localeCompare(b.testedAt));
    storage.set(StorageKeys.LABS, next);
    storage.set(StorageKeys.LATEST_LABS, data);

    await saveWithQueue(userId, "lab_results", toDB(data), "user_id, tested_at");
    eventBus.emit(EventTypes.LABS_UPDATED, data);
  },

  merge(local: LabResult[], remote: LabResult[]): LabResult[] {
    const map = new Map(local.map((l) => [l.testedAt, l]));
    for (const r of remote) map.set(r.testedAt, r);
    return [...map.values()].sort((a, b) => a.testedAt.localeCompare(b.testedAt));
  },
};
