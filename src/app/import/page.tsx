"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";

export default function ImportPage() {
  const { user } = useAuth();
  const [json, setJson] = useState("");
  const [result, setResult] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setResult("");

    try {
      const parsed = JSON.parse(json);
      const logs: string[] = [];

      if (parsed.zepp) {
        const record = {
          date: parsed.zepp.date || new Date().toISOString().slice(0, 10),
          weight: String(parsed.zepp.weight ?? ""),
          bodyFat: String(parsed.zepp.bodyFat ?? ""),
          muscleMass: String(parsed.zepp.muscleMass ?? ""),
          water: String(parsed.zepp.water ?? ""),
          visceralFat: String(parsed.zepp.visceralFat ?? ""),
          bmr: String(parsed.zepp.bmr ?? ""),
          sleepHours: String(parsed.zepp.sleep?.hours ?? ""),
          sleepDeep: String(parsed.zepp.sleep?.deep ?? ""),
          sleepRem: String(parsed.zepp.sleep?.rem ?? ""),
          restingHeartRate: String(parsed.zepp.restingHeartRate ?? ""),
          steps: String(parsed.zepp.steps ?? ""),
        };
        localStorage.setItem("athlos-zepp", JSON.stringify(record));
        const history = JSON.parse(localStorage.getItem("athlos-zepp-history") ?? "[]");
        const next = [...history.filter((h: any) => h.date !== record.date), record];
        localStorage.setItem("athlos-zepp-history", JSON.stringify(next));
        logs.push("Zepp: importado");

        if (user) {
          const { error } = await getSupabase().from("zepp_metrics").upsert({
            user_id: user.id, recorded_at: record.date,
            weight: parsed.zepp.weight ?? null,
            body_fat: parsed.zepp.bodyFat ?? null,
            muscle_mass: parsed.zepp.muscleMass ?? null,
            water: parsed.zepp.water ?? null,
            visceral_fat: parsed.zepp.visceralFat ?? null,
            bmr: parsed.zepp.bmr ?? null,
            sleep_hours: parsed.zepp.sleep?.hours ?? null,
            sleep_deep: parsed.zepp.sleep?.deep ?? null,
            sleep_rem: parsed.zepp.sleep?.rem ?? null,
            resting_heart_rate: parsed.zepp.restingHeartRate ?? null,
            steps: parsed.zepp.steps ?? null,
          }, { onConflict: "user_id, recorded_at" });
          if (error) logs.push("Zepp Supabase error: " + error.message);
          else logs.push("Zepp: sincronizado con Supabase");
        }
      }

      if (parsed.fitbod?.sessions) {
        for (const session of parsed.fitbod.sessions) {
          const record = {
            date: session.date, duration: String(session.duration ?? ""),
            volume: String(session.volume ?? ""),
            muscleGroups: Array.isArray(session.muscleGroups) ? session.muscleGroups.join(", ") : "",
            exercises: String(session.exercises ?? ""),
          };
          const history = JSON.parse(localStorage.getItem("athlos-workouts") ?? "[]");
          const next = [...history.filter((h: any) => h.date !== record.date), record];
          localStorage.setItem("athlos-workouts", JSON.stringify(next));

          if (user) {
            const { error } = await getSupabase().from("workout_sessions").insert({
              user_id: user.id, recorded_at: session.date,
              duration: session.duration ?? null,
              volume: session.volume ?? null,
              muscle_groups: session.muscleGroups ?? [],
              exercises: session.exercises ?? null,
            });
            if (error) logs.push("Fitbod Supabase error: " + error.message);
          }
        }
        logs.push("Fitbod: " + parsed.fitbod.sessions.length + " sesiones importadas");
      }

      if (parsed.strava?.activities) {
        for (const activity of parsed.strava.activities) {
          const record = {
            date: activity.date, type: activity.type,
            distance: String(activity.distance ?? ""),
            movingTime: String(activity.movingTime ?? ""),
            elevation: String(activity.elevation ?? ""),
            avgHeartRate: String(activity.avgHeartRate ?? ""),
            calories: String(activity.calories ?? ""),
          };
          const history = JSON.parse(localStorage.getItem("athlos-activities") ?? "[]");
          const next = [...history.filter((h: any) => h.date !== record.date), record];
          localStorage.setItem("athlos-activities", JSON.stringify(next));

          if (user) {
            const { error } = await getSupabase().from("activities").upsert({
              user_id: user.id, recorded_at: activity.date,
              activity_type: activity.type,
              distance: activity.distance ?? null,
              moving_time: activity.movingTime ?? null,
              elevation: activity.elevation ?? null,
              avg_heart_rate: activity.avgHeartRate ?? null,
              calories: activity.calories ?? null,
            }, { onConflict: "user_id, recorded_at" });
            if (error) logs.push("Strava Supabase error: " + error.message);
          }
        }
        logs.push("Strava: " + parsed.strava.activities.length + " actividades importadas");
      }

      setResult(logs.length ? logs.join("\n") : "No se encontraron datos de Zepp, Fitbod o Strava en el JSON.");
    } catch {
      setResult("Error: JSON inválido. Revisa el formato.");
    }

    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-slate-50"><AppSidebar />
      <main className="lg:pl-72">
        <div className="mx-auto max-w-4xl px-4 py-7 sm:px-8 lg:px-10">
          <header className="mb-8">
            <p className="mb-2 text-sm font-semibold text-emerald-700">IMPORTAR</p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">Importar datos</h1>
            <p className="mt-2 text-slate-600">Pega el JSON de Zepp, Fitbod o Strava para importar los datos automáticamente.</p>
          </header>

          <form onSubmit={submit}>
            <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle>JSON</CardTitle></CardHeader>
              <CardContent>
                <textarea rows={12} value={json} onChange={(e) => setJson(e.target.value)} placeholder='Pega aqu&#237; el JSON con los datos...' className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
              </CardContent>
            </Card>
            <div className="mt-6 flex items-center gap-4">
              <button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"><Save className="size-4" />{saving ? "Importando..." : "Importar"}</button>
            </div>
            {result && <pre className="mt-6 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">{result}</pre>}
          </form>
        </div>
      </main>
    </div>
  );
}
