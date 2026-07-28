"use client";

import { Save } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncButton } from "@/components/sync-indicator";
import { useZepp } from "@/hooks/useZepp";

export default function ZeppPage() {
  const { data, setData, history, saving, saved, submit, fields } = useZepp();

  return (
    <PageLayout>
      <PageHeader tag="ZEPP" title="Métricas corporales" description="Composición corporal, sueño y actividad diaria desde Zepp / Mi Fitness." />
      <form onSubmit={submit}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Registro diario</CardTitle>
            <input aria-label="Fecha" type="date" value={data.recordedAt} onChange={(e) => setData({ ...data, recordedAt: e.target.value })} className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {fields.map(({ key, label, unit }) => (
                <label key={key} className="block">
                  <span className="text-sm font-semibold text-slate-800">{label}</span>
                  <span className="relative mt-2 block">
                    <input type="number" step="any" value={data[key] ?? ""} onChange={(e) => setData({ ...data, [key]: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
                    {unit && <span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">{unit}</span>}
                  </span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="mt-6 flex items-center gap-4">
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"><Save className="size-4" />{saving ? "Guardando..." : saved ? "Guardado" : "Guardar"}</button>
          {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">Datos guardados</span>}
          <SyncButton table="zepp_metrics" label="métricas" localStorageKey="athlos-zepp-history" onConflict="user_id, recorded_at" transformRecord={(r: any) => ({ recorded_at: r.recordedAt, weight: r.weight ?? null, body_fat: r.bodyFat ?? null, muscle_mass: r.muscleMass ?? null, water: r.water ?? null, visceral_fat: r.visceralFat ?? null, bmr: r.bmr ?? null, sleep_hours: r.sleepHours ?? null, sleep_deep: r.sleepDeep ?? null, sleep_rem: r.sleepRem ?? null, resting_heart_rate: r.restingHeartRate ?? null, steps: r.steps ?? null })} />
        </div>
      </form>

      {history.length > 0 && (
        <section className="mt-10">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">Historial</h2>
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Peso</th><th className="px-4 py-3">Grasa</th><th className="px-4 py-3">Músculo</th><th className="px-4 py-3">Agua</th><th className="px-4 py-3">G.Visceral</th><th className="px-4 py-3">Sueño</th><th className="px-4 py-3">HR</th><th className="px-4 py-3">Pasos</th>
              </tr></thead>
              <tbody>{[...history].reverse().map((row) => (
                <tr key={row.recordedAt} className="border-b border-slate-100 text-slate-700 last:border-0">
                  <td className="px-4 py-3 font-medium">{row.recordedAt}</td>
                  <td className="px-4 py-3">{row.weight ?? "—"}</td>
                  <td className="px-4 py-3">{row.bodyFat ?? "—"}</td>
                  <td className="px-4 py-3">{row.muscleMass ?? "—"}</td>
                  <td className="px-4 py-3">{row.water ?? "—"}</td>
                  <td className="px-4 py-3">{row.visceralFat ?? "—"}</td>
                  <td className="px-4 py-3">{row.sleepHours ?? "—"}</td>
                  <td className="px-4 py-3">{row.restingHeartRate ?? "—"}</td>
                  <td className="px-4 py-3">{row.steps ?? "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      )}
    </PageLayout>
  );
}
