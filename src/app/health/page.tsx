"use client";

import { FormEvent, useEffect, useState } from "react";
import { HeartPulse, Save } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { saveWithQueue } from "@/lib/sync-queue";
import { SyncButton } from "@/components/sync-indicator";

type Labs = { alt: string; ast: string; ggt: string; ldl: string; hdl: string; triglycerides: string; glucose: string; date: string };
const initial: Labs = { alt: "", ast: "", ggt: "", ldl: "", hdl: "", triglycerides: "", glucose: "", date: new Date().toISOString().slice(0, 10) };
const fields: { key: keyof Omit<Labs, "date">; label: string; unit: string; goal: string }[] = [
  { key: "alt", label: "ALT / GPT", unit: "U/L", goal: "Objetivo: < 40" },
  { key: "ast", label: "AST / GOT", unit: "U/L", goal: "Objetivo: < 40" },
  { key: "ggt", label: "GGT", unit: "U/L", goal: "Según laboratorio" },
  { key: "ldl", label: "LDL", unit: "mg/dL", goal: "Objetivo: < 130" },
  { key: "hdl", label: "HDL", unit: "mg/dL", goal: "Deseable: > 40" },
  { key: "triglycerides", label: "Triglicéridos", unit: "mg/dL", goal: "Objetivo: < 150" },
  { key: "glucose", label: "Glucosa", unit: "mg/dL", goal: "Objetivo: 70-99" },
];

export default function HealthPage() {
  const { user } = useAuth();
  const [labs, setLabs] = useState<Labs>(initial);
  const [history, setHistory] = useState<Labs[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const existing = localStorage.getItem("athlos-latest-labs");
    const savedHistory = localStorage.getItem("athlos-labs");
    if (existing) setLabs(JSON.parse(existing));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (user) {
      getSupabase().from("lab_results").select("*").eq("user_id", user.id).order("tested_at", { ascending: false }).then(({ data: rows }: { data: any[] | null }) => {
        if (rows?.length) {
          const latest = rows[0];
          setLabs({
            alt: String(latest.alt ?? ""), ast: String(latest.ast ?? ""), ggt: String(latest.ggt ?? ""),
            ldl: String(latest.ldl ?? ""), hdl: String(latest.hdl ?? ""), triglycerides: String(latest.triglycerides ?? ""),
            glucose: String(latest.glucose ?? ""), date: latest.tested_at,
          });
          setHistory(rows.map((r) => ({
            alt: String(r.alt ?? ""), ast: String(r.ast ?? ""), ggt: String(r.ggt ?? ""),
            ldl: String(r.ldl ?? ""), hdl: String(r.hdl ?? ""), triglycerides: String(r.triglycerides ?? ""),
            glucose: String(r.glucose ?? ""), date: r.tested_at,
          })));
        }
      });
    }
  }, [user]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const next = [...history.filter((item) => item.date !== labs.date), labs].sort((a, b) => a.date.localeCompare(b.date));
    setHistory(next);
    localStorage.setItem("athlos-latest-labs", JSON.stringify(labs));
    localStorage.setItem("athlos-labs", JSON.stringify(next));
    if (user) {
      const result = await saveWithQueue(user.id, "lab_results", {
        tested_at: labs.date,
        alt: labs.alt ? Number(labs.alt) : null, ast: labs.ast ? Number(labs.ast) : null,
        ggt: labs.ggt ? Number(labs.ggt) : null, ldl: labs.ldl ? Number(labs.ldl) : null,
        hdl: labs.hdl ? Number(labs.hdl) : null, triglycerides: labs.triglycerides ? Number(labs.triglycerides) : null,
        glucose: labs.glucose ? Number(labs.glucose) : null,
      }, "user_id, tested_at");
      if (result.queued) console.log("Analítica encolada offline");
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return <PageLayout><PageHeader tag="SALUD" title="Salud hepática y analíticas" description="Registra resultados para comparar la evolución con el peso, el alcohol y el entrenamiento." /><Card className="mb-6 border-amber-200 bg-amber-50 shadow-none"><CardContent className="flex gap-3 p-5"><HeartPulse className="mt-0.5 size-5 shrink-0 text-amber-700"/><p className="text-sm leading-6 text-amber-950">Esta sección es un registro y no sustituye a tu médico. Consulta cualquier resultado o síntoma con el profesional que te atiende.</p></CardContent></Card><form onSubmit={submit}><Card className="border-slate-200 shadow-sm"><CardHeader><CardTitle>Analítica</CardTitle><input aria-label="Fecha de analítica" type="date" value={labs.date} onChange={(event) => setLabs({ ...labs, date: event.target.value })} className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-sm"/></CardHeader><CardContent className="grid gap-5 p-5 pt-0 sm:grid-cols-2 lg:grid-cols-3">{fields.map(({ key, label, unit, goal }) => <label key={key}><span className="text-sm font-semibold text-slate-800">{label}</span><span className="block text-xs text-slate-500">{goal}</span><span className="relative mt-3 block"><input type="number" min="0" step="any" value={labs[key]} onChange={(event) => setLabs({ ...labs, [key]: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"/><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">{unit}</span></span></label>)}</CardContent></Card><div className="mt-6 flex items-center gap-4"><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{saving ? "Guardando..." : <><Save className="size-4" />Guardar analítica</>}</button>{saved && <span className="text-sm font-medium text-emerald-700">✓ Analítica guardada</span>}<SyncButton table="lab_results" label="analíticas" localStorageKey="athlos-labs" onConflict="user_id, tested_at" transformRecord={(r: any) => ({ tested_at: r.date, alt: r.alt ? Number(r.alt) : null, ast: r.ast ? Number(r.ast) : null, ggt: r.ggt ? Number(r.ggt) : null, ldl: r.ldl ? Number(r.ldl) : null, hdl: r.hdl ? Number(r.hdl) : null, triglycerides: r.triglycerides ? Number(r.triglycerides) : null, glucose: r.glucose ? Number(r.glucose) : null })} /></div></form>{history.length > 0 && <Card className="mt-8 border-slate-200 shadow-sm"><CardHeader><CardTitle>Historial de analíticas</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase"><th className="px-5 py-3">Fecha</th><th className="px-3 py-3">ALT</th><th className="px-3 py-3">AST</th><th className="px-3 py-3">GGT</th><th className="px-3 py-3">LDL</th><th className="px-3 py-3">HDL</th><th className="px-3 py-3">TG</th><th className="px-3 py-3">Glucosa</th></tr></thead><tbody>{history.toReversed().map((item) => <tr key={item.date} className="border-b border-slate-100 text-slate-700"><td className="px-5 py-3 font-medium">{new Date(item.date).toLocaleDateString("es-ES")}</td>{(["alt", "ast", "ggt", "ldl", "hdl", "triglycerides", "glucose"] as const).map((k) => <td key={k} className="px-3 py-3">{item[k] || "—"}</td>)}</tr>)}</tbody></table></div></CardContent></Card>}</PageLayout>;
}