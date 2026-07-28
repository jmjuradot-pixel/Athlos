"use client";

import { FormEvent, ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, LogOut, RefreshCw, Save, SlidersHorizontal, Upload } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";
import { syncLocalStorage } from "@/lib/sync-queue";
import { Goals } from "@/domain/Goals";

const initial: Goals = { targetWeight: 87, targetWaist: 95, targetSteps: 8000, targetStrength: 3, targetAlcohol: 0 };
const fields: { key: keyof Goals; label: string; detail: string; unit: string }[] = [
  { key: "targetWeight", label: "Peso objetivo", detail: "Primer objetivo realista de salud", unit: "kg" },
  { key: "targetWaist", label: "Cintura objetivo", detail: "Medida a la altura del ombligo", unit: "cm" },
  { key: "targetSteps", label: "Pasos diarios", detail: "Media diaria semanal", unit: "pasos" },
  { key: "targetStrength", label: "Sesiones de fuerza", detail: "Objetivo cada semana", unit: "sesiones" },
  { key: "targetAlcohol", label: "Alcohol semanal", detail: "Objetivo con alcohol; 0,0 no cuenta", unit: "ml" },
];

export default function SettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goals>(initial);
  const [saved, setSaved] = useState(false);
  const [imported, setImported] = useState(false);
  const [importError, setImportError] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("athlos-goals");
    if (stored) setGoals(JSON.parse(stored));
  }, []);

  function submit(event: FormEvent) {
    event.preventDefault();
    localStorage.setItem("athlos-goals", JSON.stringify(goals));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function logout() {
    await getSupabase().auth.signOut();
    router.push("/auth");
  }

  function exportData() {
    const backup = {
      exportedAt: new Date().toISOString(),
      goals: JSON.parse(localStorage.getItem("athlos-goals") ?? "{}"),
      checkIns: JSON.parse(localStorage.getItem("athlos-checkins") ?? "[]"),
      labs: JSON.parse(localStorage.getItem("athlos-labs") ?? "[]"),
      zepp: JSON.parse(localStorage.getItem("athlos-zepp-history") ?? "[]"),
      workouts: JSON.parse(localStorage.getItem("athlos-workouts") ?? "[]"),
      activities: JSON.parse(localStorage.getItem("athlos-activities") ?? "[]"),
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `athlos-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importData(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setImportError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.checkIns && !data.labs && !data.goals && !data.zepp && !data.workouts && !data.activities) {
          setImportError("El archivo no tiene el formato de respaldo de Athlos.");
          return;
        }
        if (data.goals && Object.keys(data.goals).length) localStorage.setItem("athlos-goals", JSON.stringify(data.goals));
        if (Array.isArray(data.checkIns)) localStorage.setItem("athlos-checkins", JSON.stringify(data.checkIns));
        if (Array.isArray(data.labs)) localStorage.setItem("athlos-labs", JSON.stringify(data.labs));
        if (Array.isArray(data.zepp)) localStorage.setItem("athlos-zepp-history", JSON.stringify(data.zepp));
        if (Array.isArray(data.workouts)) localStorage.setItem("athlos-workouts", JSON.stringify(data.workouts));
        if (Array.isArray(data.activities)) localStorage.setItem("athlos-activities", JSON.stringify(data.activities));
        setImported(true);
        setTimeout(() => setImported(false), 4000);
        window.location.reload();
      } catch {
        setImportError("No se pudo leer el archivo. Asegurate de que es un JSON válido.");
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function syncToSupabase() {
    if (!user) { setSyncResult("No hay sesión. Inicia sesión para sincronizar."); return; }
    setSyncing(true);
    setSyncResult("Sincronizando...");
    const logs: string[] = [];

    let r = await syncLocalStorage(user.id, "check_ins", "athlos-checkins",
      (item: any) => ({ recorded_at: item.recordedAt ?? item.recorded_at, weekly_weight: item.weeklyWeight ?? item.weekly_weight ?? null, sunday_weight: item.sundayWeight ?? item.sunday_weight ?? null, waist: item.waist ?? null, strength_sessions: item.strengthSessions ?? item.strength_sessions ?? null, cardio_minutes: item.cardioMinutes ?? item.cardio_minutes ?? null, average_steps: item.averageSteps ?? item.average_steps ?? null, alcohol_ml: item.alcoholMl ?? item.alcohol_ml ?? null, energy: item.energy ?? null, hunger: item.hunger ?? null, sleep: item.sleep ?? null, comments: item.comments ?? null }),
      "user_id, recorded_at",
    );
    logs.push(`Check-ins: ${r.synced} sincronizados, ${r.skipped} omitidos, ${r.failed} errores`);

    r = await syncLocalStorage(user.id, "lab_results", "athlos-labs",
      (item: any) => ({ tested_at: item.testedAt ?? item.date, alt: item.alt ?? null, ast: item.ast ?? null, ggt: item.ggt ?? null, ldl: item.ldl ?? null, hdl: item.hdl ?? null, triglycerides: item.triglycerides ?? null, glucose: item.glucose ?? null }),
      "user_id, tested_at",
    );
    logs.push(`Analíticas: ${r.synced} sincronizados, ${r.skipped} omitidos, ${r.failed} errores`);

    r = await syncLocalStorage(user.id, "zepp_metrics", "athlos-zepp-history",
      (item: any) => ({ recorded_at: item.recordedAt ?? item.date, weight: item.weight ?? null, body_fat: item.bodyFat ?? item.body_fat ?? null, muscle_mass: item.muscleMass ?? item.muscle_mass ?? null, water: item.water ?? null, visceral_fat: item.visceralFat ?? item.visceral_fat ?? null, bmr: item.bmr ?? null, sleep_hours: item.sleepHours ?? item.sleep_hours ?? null, sleep_deep: item.sleepDeep ?? item.sleep_deep ?? null, sleep_rem: item.sleepRem ?? item.sleep_rem ?? null, resting_heart_rate: item.restingHeartRate ?? item.resting_heart_rate ?? null, steps: item.steps ?? null }),
      "user_id, recorded_at",
    );
    logs.push(`Zepp: ${r.synced} sincronizados, ${r.skipped} omitidos, ${r.failed} errores`);

    r = await syncLocalStorage(user.id, "workout_sessions", "athlos-workouts",
      (item: any) => ({ recorded_at: item.recordedAt ?? item.date, duration: item.duration ?? null, volume: item.volume ?? null, muscle_groups: item.muscleGroups ?? item.muscle_groups ?? [], exercises: item.exercises ?? null }),
    );
    logs.push(`Entrenamientos: ${r.synced} sincronizados, ${r.skipped} omitidos, ${r.failed} errores`);

    r = await syncLocalStorage(user.id, "activities", "athlos-activities",
      (item: any) => ({ recorded_at: item.recordedAt ?? item.date, activity_type: item.activityType ?? item.type, distance: item.distance ?? null, moving_time: item.movingTime ?? item.moving_time ?? null, elevation: item.elevation ?? null, avg_heart_rate: item.avgHeartRate ?? item.avg_heart_rate ?? null, calories: item.calories ?? null }),
    );
    logs.push(`Actividades: ${r.synced} sincronizadas, ${r.skipped} omitidas, ${r.failed} errores`);

    setSyncResult(logs.join("\n"));
    setSyncing(false);
  }

  return (
    <PageLayout>
      <header className="mb-8">
        <p className="mb-2 text-sm font-semibold text-emerald-700">CONFIGURACIÓN</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">Tus objetivos</h1>
        <p className="mt-2 text-slate-600">Define las referencias que usarán el dashboard y los semáforos.</p>
      </header>

      <form onSubmit={submit}>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SlidersHorizontal className="size-5 text-emerald-700" />Objetivos del proyecto</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 p-5 pt-0 sm:grid-cols-2">
            {fields.map(({ key, label, detail, unit }) => (
              <label key={key}>
                <span className="text-sm font-semibold text-slate-800">{label}</span>
                <span className="mt-1 block text-xs text-slate-500">{detail}</span>
                <span className="relative mt-3 block">
                  <input type="number" min="0" step="any" value={goals[key] ?? ""}
                    onChange={(event) => setGoals({ ...goals, [key]: event.target.value ? Number(event.target.value) : undefined })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" />
                  <span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">{unit}</span>
                </span>
              </label>
            ))}
          </CardContent>
        </Card>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800">
            <Save className="size-4" />Guardar objetivos
          </button>
          {saved && <span className="text-sm font-medium text-emerald-700">Objetivos guardados</span>}
        </div>
      </form>

      <Card className="mt-8 border-slate-200 shadow-sm">
        <CardHeader><CardTitle>Copia de seguridad</CardTitle></CardHeader>
        <CardContent className="space-y-4 p-5 pt-0">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-6 text-slate-600">Descarga tus datos en un único archivo.</p>
            <button type="button" onClick={exportData}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Download className="size-4" />Descargar copia
            </button>
          </div>
          <hr className="border-slate-200" />
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Restaurar datos</p>
              <p className="text-xs text-slate-500">Selecciona un archivo de respaldo.</p>
            </div>
            <input ref={fileRef} type="file" accept=".json" onChange={importData} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Upload className="size-4" />Importar respaldo
            </button>
          </div>
          {importError && <p className="text-sm font-medium text-rose-600">{importError}</p>}
          {imported && <p className="text-sm font-medium text-emerald-700">Datos restaurados. Recargando...</p>}
        </CardContent>
      </Card>

      <Card className="mt-8 border-slate-200 shadow-sm">
        <CardHeader><CardTitle>Sincronizar con Supabase</CardTitle></CardHeader>
        <CardContent className="space-y-4 p-5 pt-0">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-800">Subir datos locales a la nube</p>
              <p className="text-xs text-slate-500">Sincroniza todos los datos guardados en el dispositivo con Supabase.</p>
            </div>
            <button type="button" disabled={syncing} onClick={syncToSupabase}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">
              <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />{syncing ? "Sincronizando..." : "Sincronizar"}
            </button>
          </div>
          {syncResult && <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-xs text-slate-600">{syncResult}</pre>}
        </CardContent>
      </Card>

      <Card className="mt-8 border-slate-200 shadow-sm">
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-semibold text-slate-800">Cerrar sesión</p>
            <p className="text-xs text-slate-500">Desconecta tu cuenta en este dispositivo.</p>
          </div>
          <button type="button" onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50">
            <LogOut className="size-4" />Salir
          </button>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
