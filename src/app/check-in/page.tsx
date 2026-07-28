"use client";

import { Check, Save } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { SyncButton } from "@/components/sync-indicator";
import { useCheckIn } from "@/hooks/useCheckIn";

export default function CheckInPage() {
  const { data, setData, saving, saved, submit, fields, ratingFields } = useCheckIn();

  return (
    <PageLayout>
      <PageHeader tag="CHECK-IN" title="Check-in semanal" description="Completa lo esencial. Menos de dos minutos y tendremos una fotografía útil de tu semana." />
      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="grid gap-6 sm:grid-cols-2">
          {fields.map(({ key, label, hint, suffix }) => (
            <label key={key} className="block">
              <span className="text-sm font-semibold text-slate-800">{label}</span>
              <span className="mt-1 block text-xs text-slate-500">{hint}</span>
              <span className="relative mt-3 block">
                <input type="number" min="0" step="any" value={data[key] ?? ""} onChange={(e) => setData({ ...data, [key]: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
                {suffix && <span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">{suffix}</span>}
              </span>
            </label>
          ))}
        </div>

        <div className="mt-7 grid gap-6 sm:grid-cols-3">
          {ratingFields.map(({ key, label }) => (
            <label key={key}>
              <span className="text-sm font-semibold text-slate-800">{label} <span className="font-normal text-slate-500">(1–10)</span></span>
              <input type="number" min="1" max="10" value={data[key] ?? ""} onChange={(e) => setData({ ...data, [key]: e.target.value ? Number(e.target.value) : undefined })} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
            </label>
          ))}
        </div>

        <label className="mt-7 block">
          <span className="text-sm font-semibold text-slate-800">Comentarios</span>
          <textarea value={data.comments ?? ""} onChange={(e) => setData({ ...data, comments: e.target.value })} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" rows={3} />
        </label>

        <div className="mt-7 flex items-center gap-4">
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
            {saving ? "Guardando..." : <><Save className="size-4" />Guardar check-in</>}
          </button>
          {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700"><Check className="size-4" />Guardado</span>}
          <SyncButton table="check_ins" label="check-ins" localStorageKey="athlos-checkins" onConflict="user_id, recorded_at" transformRecord={(r: any) => ({ recorded_at: r.recordedAt, weekly_weight: r.weeklyWeight ?? null, sunday_weight: r.sundayWeight ?? null, waist: r.waist ?? null, strength_sessions: r.strengthSessions ?? null, cardio_minutes: r.cardioMinutes ?? null, average_steps: r.averageSteps ?? null, alcohol_ml: r.alcoholMl ?? null, energy: r.energy ?? null, hunger: r.hunger ?? null, sleep: r.sleep ?? null, comments: r.comments ?? null })} />
        </div>
      </form>
    </PageLayout>
  );
}
