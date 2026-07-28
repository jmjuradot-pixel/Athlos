"use client";

import { FormEvent, useEffect, useState } from "react";
import { Save } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { saveWithQueue } from "@/lib/sync-queue";
import { SyncButton } from "@/components/sync-indicator";

type Workout = { date: string; duration: string; volume: string; muscleGroups: string; exercises: string };
const initial: Workout = { date: new Date().toISOString().slice(0, 10), duration: "", volume: "", muscleGroups: "", exercises: "" };

export default function WorkoutsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Workout>(initial);
  const [history, setHistory] = useState<Workout[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem("athlos-workouts");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (user) {
      getSupabase().from("workout_sessions").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).then(({ data: rows }: any) => {
        if (rows?.length) {
          setHistory(rows.map((r: any) => ({
            date: r.recorded_at, duration: String(r.duration ?? ""), volume: String(r.volume ?? ""),
            muscleGroups: Array.isArray(r.muscle_groups) ? r.muscle_groups.join(", ") : "",
            exercises: String(r.exercises ?? ""),
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
    localStorage.setItem("athlos-workouts", JSON.stringify(next));
    if (user) {
      const groups = data.muscleGroups ? data.muscleGroups.split(",").map((s) => s.trim()).filter(Boolean) : [];
      const result = await saveWithQueue(user.id, "workout_sessions", {
        recorded_at: data.date,
        duration: data.duration ? Number(data.duration) : null,
        volume: data.volume ? Number(data.volume) : null,
        muscle_groups: groups,
        exercises: data.exercises ? Number(data.exercises) : null,
      });
      if (result.queued) console.log("Workout encolado offline");
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <PageLayout>
      <PageHeader tag="FITBOD" title="Entrenamientos" description="Sesiones de fuerza registradas desde Fitbod." />

          <form onSubmit={submit}>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle>Nueva sesión</CardTitle>
                <input aria-label="Fecha" type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} className="mt-4 rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">
                <label className="block"><span className="text-sm font-semibold text-slate-800">Duración</span><span className="relative mt-2 block"><input type="number" value={data.duration} onChange={(e) => setData({ ...data, duration: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">min</span></span></label>
                <label className="block"><span className="text-sm font-semibold text-slate-800">Volumen total</span><span className="relative mt-2 block"><input type="number" value={data.volume} onChange={(e) => setData({ ...data, volume: e.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">kg</span></span></label>
                <label className="block"><span className="text-sm font-semibold text-slate-800">Grupos musculares</span><span className="mt-2 block text-xs text-slate-500">Separados por coma (ej: Pecho, Hombros, Tríceps)</span><input type="text" value={data.muscleGroups} onChange={(e) => setData({ ...data, muscleGroups: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /></label>
                <label className="block"><span className="text-sm font-semibold text-slate-800">Ejercicios</span><input type="number" value={data.exercises} onChange={(e) => setData({ ...data, exercises: e.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /></label>
              </CardContent>
            </Card>
            <div className="mt-6 flex items-center gap-4">
              <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"><Save className="size-4" />{saving ? "Guardando..." : saved ? "Guardado" : "Guardar"}</button>
              {saved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">Datos guardados</span>}<SyncButton table="workout_sessions" label="entrenamientos" localStorageKey="athlos-workouts" transformRecord={(r: any) => ({ recorded_at: r.date, duration: r.duration ? Number(r.duration) : null, volume: r.volume ? Number(r.volume) : null, muscle_groups: r.muscleGroups ? r.muscleGroups.split(",").map((s: string) => s.trim()).filter(Boolean) : [], exercises: r.exercises ? Number(r.exercises) : null })} />
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
                    <tr key={row.date + row.duration} className="border-b border-slate-100 text-slate-700 last:border-0">
                      <td className="px-4 py-3 font-medium">{row.date}</td>
                      <td className="px-4 py-3">{row.duration || "—"} min</td>
                      <td className="px-4 py-3">{row.volume || "—"} kg</td>
                      <td className="px-4 py-3">{row.muscleGroups || "—"}</td>
                      <td className="px-4 py-3">{row.exercises || "—"}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </section>
          )}
    </PageLayout>
  );
}
