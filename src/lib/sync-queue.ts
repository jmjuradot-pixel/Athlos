"use client";

import { getSupabase } from "./supabase/client";

type QueueItem = {
  table: string;
  data: Record<string, unknown>;
  onConflict?: string;
  timestamp: number;
};

const QUEUE_KEY = "athlos-sync-queue";

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
