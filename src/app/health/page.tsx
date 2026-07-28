"use client";

import { HeartPulse, Save } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SyncButton } from "@/components/sync-indicator";
import { useHealth } from "@/hooks/useHealth";

export default function HealthPage() {
  const { data, setData, history, saving, saved, submit, fields } = useHealth();

  return (
    <PageLayout>
      <PageHeader tag="SALUD" title="Salud hepática y analíticas" description="Registra resultados para comparar la evolución con el peso, el alcohol y el entrenamiento." />
      <Card className="mb-6 border-amber-200 bg-amber-50 shadow-none">
        <CardContent className="flex gap-3 p-5">
          <HeartPulse className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <p className="text-sm leading-6 text-amber-950">Esta sección es un registro y no sustituye a tu médico. Consulta cualquier resultado o síntoma con el profesional que te atiende.</p>
        </CardContent>
      </Card>

      <form onSubmit={submit}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Analítica</CardTitle>
            <input aria-label="Fecha de analítica" type="date" value={data.testedAt} onChange={(e) => setData({ ...data, testedAt: e.target.value })} className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </CardHeader>
          <CardContent className="grid gap-5 p-5 pt-0 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map(({ key, label, unit, goal }) => (
              <label key={key}>
                <span className="text-sm font-semibold text-slate-800">{label}</span>
                <span className="block text-xs text-slate-500">{goal}</span>
                <span className="relative mt-3 block">
                  <input type="number" min="0" step="any" value={data[key] ?? ""} onChange={(e) => setData({ ...data, [key]: e.target.value ? Number(e.target.value) : undefined })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
                  <span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">{unit}</span>
                </span>
              </label>
            ))}
          </CardContent>
        </Card>

        <div className="mt-6 flex items-center gap-4">
          <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
            {saving ? "Guardando..." : <><Save className="size-4" />Guardar analítica</>}
          </button>
          {saved && <span className="text-sm font-medium text-emerald-700">✓ Analítica guardada</span>}
          <SyncButton table="lab_results" label="analíticas" localStorageKey="athlos-labs" onConflict="user_id, tested_at" transformRecord={(r: any) => ({ tested_at: r.testedAt, alt: r.alt ?? null, ast: r.ast ?? null, ggt: r.ggt ?? null, ldl: r.ldl ?? null, hdl: r.hdl ?? null, triglycerides: r.triglycerides ?? null, glucose: r.glucose ?? null })} />
        </div>
      </form>

      {history.length > 0 && (
        <Card className="mt-8 border-slate-200 shadow-sm">
          <CardHeader><CardTitle>Historial de analíticas</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead><tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                  <th className="px-5 py-3">Fecha</th>
                  <th className="px-3 py-3">ALT</th><th className="px-3 py-3">AST</th><th className="px-3 py-3">GGT</th>
                  <th className="px-3 py-3">LDL</th><th className="px-3 py-3">HDL</th><th className="px-3 py-3">TG</th><th className="px-3 py-3">Glucosa</th>
                </tr></thead>
                <tbody>{history.toReversed().map((item) => (
                  <tr key={item.testedAt} className="border-b border-slate-100 text-slate-700">
                    <td className="px-5 py-3 font-medium">{new Date(item.testedAt).toLocaleDateString("es-ES")}</td>
                    {(["alt", "ast", "ggt", "ldl", "hdl", "triglycerides", "glucose"] as const).map((k) => (
                      <td key={k} className="px-3 py-3">{item[k] ?? "-"}</td>
                    ))}
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </PageLayout>
  );
}
