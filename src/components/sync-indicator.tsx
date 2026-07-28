"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getPendingCount, syncTable } from "@/lib/sync-queue";
import { useAuth } from "@/components/auth-provider";

export function SyncButton({ table, label }: { table: string; label: string }) {
  const { user } = useAuth();
  const [pending, setPending] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [done, setDone] = useState(0);

  const checkPending = useCallback(() => setPending(getPendingCount(table)), [table]);

  useEffect(() => {
    checkPending();
    const interval = setInterval(checkPending, 5000);
    window.addEventListener("focus", checkPending);
    window.addEventListener("online", checkPending);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", checkPending);
      window.removeEventListener("online", checkPending);
    };
  }, [checkPending]);

  async function handleSync() {
    if (!user || syncing) return;
    setSyncing(true);
    const result = await syncTable(user.id, table);
    setPending(0);
    if (result.synced > 0) setDone(result.synced);
    setSyncing(false);
    setTimeout(() => setDone(0), 3000);
  }

  if (pending === 0 && done === 0) return null;

  if (done > 0) {
    return <span className="text-xs text-emerald-700 font-medium">{done} {label} sincronizados</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-amber-700 font-medium">{pending} {label} pendientes</span>
      <button onClick={handleSync} disabled={syncing} className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-200 disabled:opacity-50">
        <RefreshCw className={`size-3 ${syncing ? "animate-spin" : ""}`} />
        Sincronizar
      </button>
    </div>
  );
}
