"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";

type ZeppData = { date: string; weight: string; bodyFat: string; muscleMass: string; water: string; visceralFat: string; bmr: string; sleepHours: string; sleepDeep: string; sleepRem: string; restingHeartRate: string; steps: string };
const initial: ZeppData = { date: new Date().toISOString().slice(0, 10), weight: "", bodyFat: "", muscleMass: "", water: "", visceralFat: "", bmr: "", sleepHours: "", sleepDeep: "", sleepRem: "", restingHeartRate: "", steps: "" };

export default function ZeppPage() {
  const { user } = useAuth();
  const [data, setData] = useState<ZeppData>(initial);
  const [history, setHistory] = useState<ZeppData[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("athlos-zepp");
    if (saved) {
      const parsed = JSON.parse(saved);
      setData(parsed);
    }
    const savedHistory = localStorage.getItem("athlos-zepp-history");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (user) {
      getSupabase().from("zepp_metrics").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).then(({ data: rows }: any) => {
        if (rows?.length) {
          const latest = rows[0];
          setData({
            date: latest.recorded_at, weight: String(latest.weight ?? ""), bodyFat: String(latest.body_fat ?? ""),
            muscleMass: String(latest.muscle_mass ?? ""), water: String(latest.water ?? ""),
            visceralFat: String(latest.visceral_fat ?? ""), bmr: String(latest.bmr ?? ""),
            sleepHours: String(latest.sleep_hours ?? ""), sleepDeep: String(latest.sleep_deep ?? ""),
            sleepRem: String(latest.sleep_rem ?? ""), restingHeartRate: String(latest.resting_heart_rate ?? ""),
            steps: String(latest.steps ?? ""),
          });
          setHistory(rows.map((r: any) => ({
            date: r.recorded_at, weight: String(r.weight ?? ""), bodyFat: String(r.body_fat ?? ""),
            muscleMass: String(r.muscle_mass ?? ""), water: String(r.water ?? ""),
            visceralFat: String(r.visceral_fat ?? ""), bmr: String(r.bmr ?? ""),
            sleepHours: String(r.sleep_hours ?? ""), sleepDeep: String(r.sleep_deep ?? ""),
            sleepRem: String(r.sleep_rem ?? ""), restingHeartRate: String(r.resting_heart_rate ?? ""),
            steps: String(r.steps ?? ""),
          })));
        }
      });
    }
  }, [user]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const next = [...history.filter((item) => item.date !== data.date), data].sort((a, b) => a.date.localeCompare(b.date));
    setHistory(next);
    localStorage.setItem("athlos-zepp", JSON.stringify(data));
    localStorage.setItem("athlos-zepp-history", JSON.stringify(next));
    if (user) {
      const { error } = await getSupabase().from("zepp_metrics").upsert({
        user_id: user.id, recorded_at: data.date,
        weight: data.weight ? Number(data.weight) : null,
        body_fat: data.bodyFat ? Number(data.bodyFat) : null,
        muscle_mass: data.muscleMass ? Number(data.muscleMass) : null,
        water: data.water ? Number(data.water) : null,
        visceral_fat: data.visceralFat ? Number(data.visceralFat) : null,
        bmr: data.bmr ? Number(data.bmr) : null,
        sleep_hours: data.sleepHours ? Number(data.sleepHours) : null,
        sleep_deep: data.sleepDeep ? Number(data.sleepDeep) : null,
        sleep_rem: data.sleepRem ? Number(data.sleepRem) : null,
        resting_heart_rate: data.restingHeartRate ? Number(data.restingHeartRate) : null,
        steps: data.steps ? Number(data.steps) : null,
      }, { onConflict: "user_id, recorded_at" });
      if (error) console.error("Supabase zepp_metrics error:", error);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="min-h-screen bg-slate-50"><AppSidebar />
      <main className="lg:pl-72">
        <div className="mx-auto max-w-5xl px-4 py-7 sm:px-8 lg:px-10">
          <header className="mb-8">
            <p className="mb-2 text-sm font-semibold text-emerald-700">ZEPP</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Métricas corporales</h1>
            <p className="mt-2 text-slate-600">Composición corporal, sueño y actividad diaria desde Zepp / Mi Fitness.</p>
          </header>

          <form onSubmit={submit}>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Registro diario</CardTitle>
                <input aria-label="Fecha" type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </CardHeader>
              <CardContent>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <label className="block"><span className="text-sm font-semibold text-slate-800">Peso</span><span className="relative mt-2 block"><input type="number" step="any" value={data.weight} onChange={(e) => setData({ ...data, weight: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">kg</span></span></label>
                  <label className="block"><span className="text-sm font-semibold text-slate-800">Grasa corporal</span><span className="relative mt-2 block"><input type="number" step="any" value={data.bodyFat} onChange={(e) => setData({ ...data, bodyFat: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">%</span></span></label>
                  <label className="block"><span className="text-sm font-semibold text-slate-800">Masa muscular</span><span className="relative mt-2 block"><input type="number" step="any" value={data.muscleMass} onChange={(e) => setData({ ...data, muscleMass: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">kg</span></span></label>
                  <label className="block"><span className="text-sm font-semibold text-slate-800">Agua corporal</span><span className="relative mt-2 block"><input type="number" step="any" value={data.water} onChange={(e) => setData({ ...data, water: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">%</span></span></label>
                  <label className="block"><span className="text-sm font-semibold text-slate-800">Grasa visceral</span><span className="relative mt-2 block"><input type="number" value={data.visceralFat} onChange={(e) => setData({ ...data, visceralFat: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">nivel</span></span></label>
                  <label className="block"><span className="text-sm font-semibold text-slate-800">TMB</span><span className="relative mt-2 block"><input type="number" value={data.bmr} onChange={(e) => setData({ ...data, bmr: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">kcal</span></span></label>
                  <label className="block"><span className="text-sm font-semibold text-slate-800">Sueño total</span><span className="relative mt-2 block"><input type="number" step="any" value={data.sleepHours} onChange={(e) => setData({ ...data, sleepHours: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">h</span></span></label>
                  <label className="block"><span className="text-sm font-semibold text-slate-800">Sueño profundo</span><span className="relative mt-2 block"><input type="number" step="any" value={data.sleepDeep} onChange={(e) => setData({ ...data, sleepDeep: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">h</span></span></label>
                  <label className="block"><span className="text-sm font-semibold text-slate-800">Sueño REM</span><span className="relative mt-2 block"><input type="number" step="any" value={data.sleepRem} onChange={(e) => setData({ ...data, sleepRem: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">h</span></span></label>
                  <label className="block"><span className="text-sm font-semibold text-slate-800">HR en reposo</span><span className="relative mt-2 block"><input type="number" value={data.restingHeartRate} onChange={(e) => setData({ ...data, restingHeartRate: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">lpm</span></span></label>
                  <label className="block"><span className="text-sm font-semibold text-slate-800">Pasos</span><span className="relative mt-2 block"><input type="number" value={data.steps} onChange={(e) => setData({ ...data, steps: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /></span></label>
                </div>
              </CardContent>
            </Card>
            <div className="mt-6 flex items-center gap-4">
              <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"><Save className="size-4" />{saving ? "Guardando..." : saved ? "Guardado" : "Guardar"}</button>
              {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">Datos guardados</span>}
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
                    <tr key={row.date} className="border-b border-slate-100 text-slate-700 last:border-0">
                      <td className="px-4 py-3 font-medium">{row.date}</td>
                      <td className="px-4 py-3">{row.weight || "—"}</td>
                      <td className="px-4 py-3">{row.bodyFat || "—"}</td>
                      <td className="px-4 py-3">{row.muscleMass || "—"}</td>
                      <td className="px-4 py-3">{row.water || "—"}</td>
                      <td className="px-4 py-3">{row.visceralFat || "—"}</td>
                      <td className="px-4 py-3">{row.sleepHours || "—"}</td>
                      <td className="px-4 py-3">{row.restingHeartRate || "—"}</td>
                      <td className="px-4 py-3">{row.steps || "—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
