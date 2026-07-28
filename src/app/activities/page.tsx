"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";

type Activity = { date: string; type: string; distance: string; movingTime: string; elevation: string; avgHeartRate: string; calories: string };
const activityTypes = ["Carrera", "Bici", "Natación", "Paseo", "Sesión", "Caminata", "Ruta", "Otro"];
const initial: Activity = { date: new Date().toISOString().slice(0, 10), type: "Bici", distance: "", movingTime: "", elevation: "", avgHeartRate: "", calories: "" };

export default function ActivitiesPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Activity>(initial);
  const [history, setHistory] = useState<Activity[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem("athlos-activities");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (user) {
      getSupabase().from("activities").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).then(({ data: rows }: any) => {
        if (rows?.length) {
          setHistory(rows.map((r: any) => ({
            date: r.recorded_at, type: r.activity_type, distance: String(r.distance ?? ""),
            movingTime: String(r.moving_time ?? ""), elevation: String(r.elevation ?? ""),
            avgHeartRate: String(r.avg_heart_rate ?? ""), calories: String(r.calories ?? ""),
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
    localStorage.setItem("athlos-activities", JSON.stringify(next));
    if (user) {
      const { error } = await getSupabase().from("activities").upsert({
        user_id: user.id, recorded_at: data.date,
        activity_type: data.type,
        distance: data.distance ? Number(data.distance) : null,
        moving_time: data.movingTime ? Number(data.movingTime) : null,
        elevation: data.elevation ? Number(data.elevation) : null,
        avg_heart_rate: data.avgHeartRate ? Number(data.avgHeartRate) : null,
        calories: data.calories ? Number(data.calories) : null,
      }, { onConflict: "user_id, recorded_at" });
      if (error) console.error("Supabase activities error:", error);
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
            <p className="mb-2 text-sm font-semibold text-emerald-700">STRAVA</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Actividades</h1>
            <p className="mt-2 text-slate-600">Cardio, rutas y actividades al aire libre desde Strava.</p>
          </header>

          <form onSubmit={submit}>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Nueva actividad</CardTitle>
                <input aria-label="Fecha" type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <label className="block"><span className="text-sm font-semibold text-slate-800">Tipo</span><select value={data.type} onChange={(e) => setData({ ...data, type: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100">{activityTypes.map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
                <label className="block"><span className="text-sm font-semibold text-slate-800">Distancia</span><span className="relative mt-2 block"><input type="number" step="any" value={data.distance} onChange={(e) => setData({ ...data, distance: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">km</span></span></label>
                <label className="block"><span className="text-sm font-semibold text-slate-800">Tiempo en movimiento</span><span className="relative mt-2 block"><input type="number" value={data.movingTime} onChange={(e) => setData({ ...data, movingTime: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">min</span></span></label>
                <label className="block"><span className="text-sm font-semibold text-slate-800">Desnivel</span><span className="relative mt-2 block"><input type="number" value={data.elevation} onChange={(e) => setData({ ...data, elevation: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">m</span></span></label>
                <label className="block"><span className="text-sm font-semibold text-slate-800">Frecuencia cardíaca media</span><span className="relative mt-2 block"><input type="number" value={data.avgHeartRate} onChange={(e) => setData({ ...data, avgHeartRate: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">lpm</span></span></label>
                <label className="block"><span className="text-sm font-semibold text-slate-800">Calorías</span><span className="relative mt-2 block"><input type="number" value={data.calories} onChange={(e) => setData({ ...data, calories: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">kcal</span></span></label>
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
                    <th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Distancia</th><th className="px-4 py-3">Tiempo</th><th className="px-4 py-3">Desnivel</th><th className="px-4 py-3">HR media</th><th className="px-4 py-3">Calorías</th>
                  </tr></thead>
                  <tbody>{[...history].reverse().map((row, i) => (
                    <tr key={row.date + i} className="border-b border-slate-100 text-slate-700 last:border-0">
                      <td className="px-4 py-3 font-medium">{row.date}</td>
                      <td className="px-4 py-3">{row.type}</td>
                      <td className="px-4 py-3">{row.distance || "—"} km</td>
                      <td className="px-4 py-3">{row.movingTime || "—"} min</td>
                      <td className="px-4 py-3">{row.elevation || "—"} m</td>
                      <td className="px-4 py-3">{row.avgHeartRate || "—"}</td>
                      <td className="px-4 py-3">{row.calories || "—"}</td>
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
