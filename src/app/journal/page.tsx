"use client";

import { useEffect, useState } from "react";
import { Activity, BarChart3, Camera, Dumbbell, Goal, HeartPulse, Import, Scale } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { JournalEntry } from "@/domain/JournalEntry";
import { journalRepository } from "@/repositories/journalRepository";

const typeMeta: Record<string, { icon: any; color: string; bg: string }> = {
  checkin: { icon: BarChart3, color: "text-emerald-700", bg: "bg-emerald-50" },
  labs: { icon: HeartPulse, color: "text-rose-700", bg: "bg-rose-50" },
  photo: { icon: Camera, color: "text-violet-700", bg: "bg-violet-50" },
  workout: { icon: Dumbbell, color: "text-amber-700", bg: "bg-amber-50" },
  activity: { icon: Activity, color: "text-sky-700", bg: "bg-sky-50" },
  goal: { icon: Goal, color: "text-indigo-700", bg: "bg-indigo-50" },
  import: { icon: Import, color: "text-slate-700", bg: "bg-slate-100" },
  zepp: { icon: Scale, color: "text-cyan-700", bg: "bg-cyan-50" },
};

function TypeIcon({ type }: { type: string }) {
  const meta = typeMeta[type] ?? { icon: Activity, color: "text-slate-600", bg: "bg-slate-100" };
  const Icon = meta.icon;
  return (
    <div className={`flex size-9 shrink-0 items-center justify-center rounded-full ${meta.bg} ${meta.color}`}>
      <Icon className="size-4" />
    </div>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function groupByDate(entries: JournalEntry[]): Map<string, JournalEntry[]> {
  const groups = new Map<string, JournalEntry[]>();
  for (const entry of entries) {
    const day = entry.date.slice(0, 10);
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push(entry);
  }
  return groups;
}

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEntries(journalRepository.getRecent(100));
    setLoading(false);
  }, []);

  const groups = groupByDate(entries);

  return (
    <PageLayout>
      <PageHeader tag="HISTORIAL" title="Línea de tiempo" description="Todos los eventos importantes registrados cronológicamente." />
      {loading && <p className="text-sm text-slate-500">Cargando...</p>}
      {!loading && entries.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-500">Aún no hay eventos registrados.</p>
          <p className="mt-1 text-xs text-slate-400">Completa un check-in, sube una analítica o registra un entrenamiento para verlo aquí.</p>
        </div>
      )}
      {[...groups.entries()].map(([day, dayEntries]) => (
        <div key={day} className="mb-8">
          <p className="mb-4 text-xs font-semibold tracking-widest uppercase text-slate-400">
            {new Date(day + "T00:00:00").toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
          <div className="space-y-3">
            {dayEntries.map((entry) => {
              return (
                <div key={entry.id} className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <TypeIcon type={entry.type} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{entry.title}</p>
                    <p className="mt-0.5 text-sm text-slate-500">{entry.summary}</p>
                    <p className="mt-1 text-xs text-slate-400">{formatDate(entry.date)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </PageLayout>
  );
}
