"use client";

import { getSupabase } from "./supabase/client";

type QueueItem = {
  table: string;
  data: Record<string, unknown>;
  onConflict?: string;
  timestamp: number;
};

const QUEUE_KEY = "athlos-sync-queue";

// Migración única: limpia onConflict de items antiguos en cola
if (typeof window !== "undefined") {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    if (raw) {
      const queue = JSON.parse(raw);
      const next = queue.map((item: any) => {
        // Workouts y activities deben usar upsert con user_id, recorded_at
        if (item.table === "workout_sessions" || item.table === "activities") {
          return { ...item, onConflict: "user_id, recorded_at" };
        }
        return item;
      });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(next));
    }
  } catch { /* ignore */ }
}

function getQueue(): QueueItem[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveQueue(queue: QueueItem[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function addToQueue(table: string, data: Record<string, unknown>, onConflict?: string) {
  const queue = getQueue();
  queue.push({ table, data, onConflict, timestamp: Date.now() });
  saveQueue(queue);
}

export function getPendingCount(table?: string): number {
  const queue = getQueue();
  if (table) return queue.filter((item) => item.table === table).length;
  return queue.length;
}

export function clearQueue(table?: string) {
  if (table) {
    saveQueue(getQueue().filter((item) => item.table !== table));
  } else {
    saveQueue([]);
  }
}

export async function saveWithQueue(
  userId: string,
  table: string,
  data: Record<string, unknown>,
  onConflict?: string,
): Promise<{ queued: boolean }> {
  const payload = { ...data, user_id: userId };

  if (!navigator.onLine) {
    addToQueue(table, payload, onConflict);
    return { queued: true };
  }

  const supabase = getSupabase();
  const operation = onConflict
    ? supabase.from(table).upsert(payload, { onConflict })
    : supabase.from(table).insert(payload);

  const { error } = await operation;

  if (!error) return { queued: false };

  if (!navigator.onLine) {
    addToQueue(table, payload, onConflict);
    return { queued: true };
  }

  console.error(`Supabase ${table} error:`, error);
  return { queued: false };
}

export async function syncTable(userId: string, table: string): Promise<{ synced: number; failed: number }> {
  const queue = getQueue();
  const items = queue.filter((item) => item.table === table);
  if (items.length === 0) return { synced: 0, failed: 0 };

  const supabase = getSupabase();
  let synced = 0;
  let failed = 0;

  for (const item of items) {
    const payload = { ...item.data, user_id: userId };
    const operation = item.onConflict
      ? supabase.from(item.table).upsert(payload, { onConflict: item.onConflict })
      : supabase.from(item.table).insert(payload);

    const { error } = await operation;
    if (error) {
      console.error(`Sync ${table} error:`, error);
      failed++;
    } else {
      synced++;
    }
  }

  saveQueue(queue.filter((item) => item.table !== table));
  return { synced, failed };
}

export function getLocalCount(storageKey: string): number {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.length : 1;
  } catch {
    return 0;
  }
}

export async function syncLocalStorage(
  userId: string,
  table: string,
  storageKey: string,
  transformRecord: (record: any) => Record<string, unknown>,
  onConflict?: string,
): Promise<{ synced: number; failed: number; skipped: number }> {
  const raw = localStorage.getItem(storageKey);
  if (!raw) return { synced: 0, failed: 0, skipped: 0 };

  let records: any[];
  try { records = JSON.parse(raw); } catch { return { synced: 0, failed: 0, skipped: 0 }; }
  if (!Array.isArray(records)) records = [records];
  if (records.length === 0) return { synced: 0, failed: 0, skipped: 0 };

  const supabase = getSupabase();

  const existingDates = new Set<string>();
  if (!onConflict) {
    const { data: existing } = await supabase
      .from(table)
      .select("recorded_at, tested_at")
      .eq("user_id", userId);
    if (existing) {
      for (const row of existing) {
        if (row.recorded_at) existingDates.add(String(row.recorded_at));
        if (row.tested_at) existingDates.add(String(row.tested_at));
      }
    }
  }

  let synced = 0;
  let failed = 0;
  let skipped = 0;

  for (const record of records) {
    const payload = { ...transformRecord(record), user_id: userId };
    const dateKey = (payload as any).recorded_at ?? (payload as any).tested_at;
    if (!onConflict && dateKey && existingDates.has(String(dateKey))) {
      skipped++;
      continue;
    }

    const operation = onConflict
      ? supabase.from(table).upsert(payload, { onConflict })
      : supabase.from(table).insert(payload);

    const { error } = await operation;
    if (error) {
      console.error(`Sync local ${table} error:`, error);
      failed++;
    } else {
      synced++;
      if (!onConflict && dateKey) existingDates.add(String(dateKey));
    }
  }

  return { synced, failed, skipped };
}
