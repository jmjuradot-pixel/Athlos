"use client";

import { Save } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncButton } from "@/components/sync-indicator";
import { useWorkouts } from "@/hooks/useWorkouts";

export default function WorkoutsPage() {
  const { data, setData, history, saving, saved, submit } = useWorkouts();

  return (
    <PageLayout>
      <PageHeader tag="FITBOD" title="Entrenamientos" description="Sesiones de fuerza registradas desde Fitbod." />
      <form onSubmit={submit}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Nueva sesión</CardTitle>
            <input aria-label="Fecha" type="date" value={data.recordedAt} onChange={(e) => setData({ ...data, recordedAt: e.target.value })} className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <label className="block"><span className="text-sm font-semibold text-slate-800">Duración</span><span className="relative mt-2 block"><input type="number" value={data.duration ?? ""} onChange={(e) => setData({ ...data, duration: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">min</span></span></label>
            <label className="block"><span className="text-sm font-semibold text-slate-800">Volumen total</span><span className="relative mt-2 block"><input type="number" value={data.volume ?? ""} onChange={(e) => setData({ ...data, volume: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">kg</span></span></label>
            <label className="block"><span className="text-sm font-semibold text-slate-800">Grupos musculares</span><span className="mt-2 block text-xs text-slate-500">Separados por coma (ej: Pecho, Hombros, Tríceps)</span><input type="text" value={data.muscleGroups?.join(", ") ?? ""} onChange={(e) => setData({ ...data, muscleGroups: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /></label>
            <label className="block"><span className="text-sm font-semibold text-slate-800">Ejercicios</span><input type="number" value={data.exercises ?? ""} onChange={(e) => setData({ ...data, exercises: e.target.value ? Number(e.target.value) : undefined })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /></label>
          </CardContent>
        </Card>
        <div className="mt-6 flex items-center gap-4">
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"><Save className="size-4" />{saving ? "Guardando..." : saved ? "Guardado" : "Guardar"}</button>
          {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">Datos guardados</span>}
          <SyncButton table="workout_sessions" label="entrenamientos" localStorageKey="athlos-workouts" onConflict="user_id, recorded_at" transformRecord={(r: any) => ({ recorded_at: r.recordedAt, duration: r.duration ?? null, volume: r.volume ?? null, muscle_groups: r.muscleGroups ?? [], exercises: r.exercises ?? null })} />
        </div>
      </form>

      {history.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Historial</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Duración</th><th className="px-4 py-3">Volumen</th><th className="px-4 py-3">Grupos</th><th className="px-4 py-3">Ejercicios</th>
              </tr></thead>
              <tbody>{[...history].reverse().map((row) => (
                <tr key={row.recordedAt + (row.duration ?? "")} className="border-b border-slate-100 text-slate-700 last:border-0">
                  <td className="px-4 py-3 font-medium">{row.recordedAt}</td>
                  <td className="px-4 py-3">{row.duration ?? "—"} min</td>
                  <td className="px-4 py-3">{row.volume ?? "—"} kg</td>
                  <td className="px-4 py-3">{row.muscleGroups?.join(", ") ?? "—"}</td>
                  <td className="px-4 py-3">{row.exercises ?? "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
