"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getPendingCount, getLocalCount, syncTable, syncLocalStorage } from "@/lib/sync-queue";
import { useUser } from "@/hooks/useUser";

export function SyncButton({
  table, label, localStorageKey, transformRecord, onConflict,
}: {
  table: string;
  label: string;
  localStorageKey?: string;
  transformRecord?: (r: any) => Record<string, unknown>;
  onConflict?: string;
}) {
  const { user } = useUser();
  const [pending, setPending] = useState(0);
  const [localPending, setLocalPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(0);

  const check = useCallback(() => {
    setPending(getPendingCount(table));
    if (localStorageKey) setLocalPending(getLocalCount(localStorageKey));
  }, [table, localStorageKey]);

  useEffect(() => {
    check();
    const interval = setInterval(check, 5000);
    window.addEventListener("focus", check);
    window.addEventListener("online", check);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", check);
      window.removeEventListener("online", check);
    };
  }, [check]);

  async function handleSync() {
    if (!user || syncing) return;
    setSyncing(true);

    const queueResult = await syncTable(user.id, table);
    let localResult = { synced: 0, failed: 0 };

    if (localStorageKey && transformRecord) {
      localResult = await syncLocalStorage(user.id, table, localStorageKey, transformRecord, onConflict);
    }

    const total = queueResult.synced + localResult.synced;
    setPending(0);
    setLocalPending(0);
    if (total > 0) setDone(total);
    setSyncing(false);
    setTimeout(() => setDone(0), 4000);
  }

  const total = pending + localPending;
  if (total === 0 && done === 0) return null;

  if (done > 0) {
    return <span className="text-xs font-medium text-emerald-700">{done} {label} sincronizados</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-amber-700">
        {pending > 0 && `${pending} pendientes`}
        {pending > 0 && localPending > 0 && " · "}
        {localPending > 0 && `${localPending} sin subir`}
      </span>
      <button onClick={handleSync} disabled={syncing} className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-200 disabled:opacity-50">
        <RefreshCw className={`size-3 ${syncing ? "animate-spin" : ""}`} />
        Sincronizar
      </button>
    </div>
  );
}
