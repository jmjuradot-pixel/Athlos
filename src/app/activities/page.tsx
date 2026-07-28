"use client";

import { Save } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncButton } from "@/components/sync-indicator";
import { useActivities } from "@/hooks/useActivities";

export default function ActivitiesPage() {
  const { data, setData, history, saving, saved, submit, activityTypes } = useActivities();

  return (
    <PageLayout>
      <PageHeader tag="STRAVA" title="Actividades" description="Cardio, rutas y actividades al aire libre desde Strava." />
      <form onSubmit={submit}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Nueva actividad</CardTitle>
            <input aria-label="Fecha" type="date" value={data.recordedAt} onChange={(e) => setData({ ...data, recordedAt: e.target.value })} className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <label className="block"><span className="text-sm font-semibold text-slate-800">Tipo</span><select value={data.activityType} onChange={(e) => setData({ ...data, activityType: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100">{activityTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
            <label className="block"><span className="text-sm font-semibold text-slate-800">Distancia</span><span className="relative mt-2 block"><input type="number" step="any" value={data.distance ?? ""} onChange={(e) => setData({ ...data, distance: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">km</span></span></label>
            <label className="block"><span className="text-sm font-semibold text-slate-800">Tiempo en movimiento</span><span className="relative mt-2 block"><input type="number" value={data.movingTime ?? ""} onChange={(e) => setData({ ...data, movingTime: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">min</span></span></label>
            <label className="block"><span className="text-sm font-semibold text-slate-800">Desnivel</span><span className="relative mt-2 block"><input type="number" value={data.elevation ?? ""} onChange={(e) => setData({ ...data, elevation: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">m</span></span></label>
            <label className="block"><span className="text-sm font-semibold text-slate-800">Frecuencia cardíaca media</span><span className="relative mt-2 block"><input type="number" value={data.avgHeartRate ?? ""} onChange={(e) => setData({ ...data, avgHeartRate: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">lpm</span></span></label>
            <label className="block"><span className="text-sm font-semibold text-slate-800">Calorías</span><span className="relative mt-2 block"><input type="number" value={data.calories ?? ""} onChange={(e) => setData({ ...data, calories: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">kcal</span></span></label>
          </CardContent>
        </Card>
        <div className="mt-6 flex items-center gap-4">
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"><Save className="size-4" />{saving ? "Guardando..." : saved ? "Guardado" : "Guardar"}</button>
          {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">Datos guardados</span>}
          <SyncButton table="activities" label="actividades" localStorageKey="athlos-activities" onConflict="user_id, recorded_at" transformRecord={(r: any) => ({ recorded_at: r.recordedAt, activity_type: r.activityType, distance: r.distance ?? null, moving_time: r.movingTime ?? null, elevation: r.elevation ?? null, avg_heart_rate: r.avgHeartRate ?? null, calories: r.calories ?? null })} />
        </div>
      </form>

      {history.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Historial</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Distancia</th><th className="px-4 py-3">Tiempo</th><th className="px-4 py-3">Desnivel</th><th className="px-4 py-3">HR media</th><th className="px-4 py-3">Calorías</th>
              </tr></thead>
              <tbody>{[...history].reverse().map((row, i) => (
                <tr key={row.recordedAt + i} className="border-b border-slate-100 text-slate-700 last:border-0">
                  <td className="px-4 py-3 font-medium">{row.recordedAt}</td>
                  <td className="px-4 py-3">{row.activityType}</td>
                  <td className="px-4 py-3">{row.distance ?? "—"} km</td>
                  <td className="px-4 py-3">{row.movingTime ?? "—"} min</td>
                  <td className="px-4 py-3">{row.elevation ?? "—"} m</td>
                  <td className="px-4 py-3">{row.avgHeartRate ?? "—"}</td>
                  <td className="px-4 py-3">{row.calories ?? "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
