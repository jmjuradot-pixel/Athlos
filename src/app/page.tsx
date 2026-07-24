"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Activity, ArrowDownRight, ArrowUpRight, Bike, ChevronRight, Dumbbell, Footprints, HeartPulse, Scale, Target, Wine } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";

const fallbackMetrics = [
  { label: "Peso", value: "—", unit: "kg", detail: "Sin datos aún", icon: Scale, tone: "bg-emerald-50 text-emerald-700", positive: null },
  { label: "Cintura", value: "—", unit: "cm", detail: "Sin datos aún", icon: Target, tone: "bg-sky-50 text-sky-700", positive: null },
  { label: "Entrenamientos", value: "—", unit: "/ —", detail: "Sin datos aún", icon: Dumbbell, tone: "bg-violet-50 text-violet-700", positive: null },
  { label: "Pasos", value: "—", unit: "media diaria", detail: "Sin datos aún", icon: Footprints, tone: "bg-amber-50 text-amber-700", positive: null },
  { label: "Alcohol", value: "—", unit: "ml", detail: "Sin datos aún", icon: Wine, tone: "bg-orange-50 text-orange-700", positive: null },
  { label: "Salud hepática", value: "—", unit: "—", detail: "Sin datos aún", icon: HeartPulse, tone: "bg-rose-50 text-rose-700", positive: null },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(fallbackMetrics);

  useEffect(() => {
    async function load() {
      const checkIn = JSON.parse(localStorage.getItem("athlos-latest-checkin") ?? "null");
      const labs = JSON.parse(localStorage.getItem("athlos-latest-labs") ?? "null");
      const goals = JSON.parse(localStorage.getItem("athlos-goals") ?? "null");
      let checkInData = checkIn;
      let labsData = labs;

      if (user) {
        const [checkinsRes, labsRes] = await Promise.all([
          supabase.from("check_ins").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(1),
          supabase.from("lab_results").select("*").eq("user_id", user.id).order("tested_at", { ascending: false }).limit(1),
        ]);
        if (checkinsRes.data?.[0]) checkInData = checkinsRes.data[0];
        if (labsRes.data?.[0]) labsData = labsRes.data[0];
      }

      setMetrics([
        { ...fallbackMetrics[0], value: checkInData?.weekly_weight ?? checkInData?.weeklyWeight ?? fallbackMetrics[0].value, detail: checkInData ? "Último check-in" : fallbackMetrics[0].detail },
        { ...fallbackMetrics[1], value: checkInData?.waist ?? fallbackMetrics[1].value, detail: goals?.targetWaist ? `Objetivo: ${goals.targetWaist} cm` : fallbackMetrics[1].detail },
        { ...fallbackMetrics[2], value: checkInData?.strength_sessions ?? checkInData?.strength ?? fallbackMetrics[2].value, unit: goals?.targetStrength ? `/ ${goals.targetStrength}` : fallbackMetrics[2].unit, detail: checkInData ? "Último check-in" : fallbackMetrics[2].detail },
        { ...fallbackMetrics[3], value: checkInData?.average_steps ?? checkInData?.steps ? Number(checkInData?.average_steps ?? checkInData?.steps).toLocaleString("es-ES") : fallbackMetrics[3].value, detail: goals?.targetSteps ? `Objetivo: ${Number(goals.targetSteps).toLocaleString("es-ES")} pasos` : fallbackMetrics[3].detail },
        { ...fallbackMetrics[4], value: checkInData?.alcohol_ml ?? checkInData?.alcohol ?? fallbackMetrics[4].value, detail: goals?.targetAlcohol !== undefined ? `Objetivo: ${goals.targetAlcohol} ml por semana` : fallbackMetrics[4].detail },
        { ...fallbackMetrics[5], value: labsData?.alt ?? fallbackMetrics[5].value, unit: labsData ? "ALT / GPT" : fallbackMetrics[5].unit, detail: labsData?.tested_at ? `Analítica: ${new Date(labsData.tested_at).toLocaleDateString("es-ES")}` : labsData?.date ? `Analítica: ${new Date(labsData.date).toLocaleDateString("es-ES")}` : fallbackMetrics[5].detail },
      ]);
    }
    load();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <AppSidebar />
      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-7 sm:px-8 lg:px-10">
          <header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold text-emerald-700">SEMANA 1 · PROYECTO HÍGADO SANO</p>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Buenos días, José Mari</h1>
              <p className="mt-2 text-slate-600">Tu progreso se construye con las semanas cumplidas, no con un único pesaje.</p>
            </div>
            <Link href="/check-in" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800">
              Completar check-in <ChevronRight className="size-4" />
            </Link>
          </header>

          <section aria-label="Indicadores principales" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map(({ label, value, unit, detail, icon: Icon, tone, positive }) => (
              <Card key={label} className="border-slate-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{label}</p>
                      <div className="mt-2 flex items-baseline gap-1">
                        <span className="text-3xl font-bold tracking-tight text-slate-950">{value}</span>
                        <span className="text-sm font-medium text-slate-500">{unit}</span>
                      </div>
                    </div>
                    <span className={`grid size-10 place-items-center rounded-xl ${tone}`}><Icon className="size-5" /></span>
                  </div>
                  <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                    {positive === true && <ArrowDownRight className="size-3.5 text-emerald-600" />}
                    {positive === false && <ArrowUpRight className="size-3.5 text-rose-600" />}
                    {detail}
                  </p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="mt-7 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Evolución del peso</CardTitle>
                  <p className="mt-1 text-sm text-slate-500">Media semanal · últimos 8 registros</p>
                </div>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Objetivo: 87 kg</span>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="relative h-56 w-full">
                  <svg viewBox="0 0 640 220" className="h-full w-full" role="img" aria-label="Tendencia del peso">
                    {[40, 90, 140, 190].map((y) => <line key={y} x1="0" x2="640" y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 6" />)}
                    <path d="M0 36 C72 40 82 58 145 58 S242 95 305 88 S390 112 450 110 S548 143 640 154 L640 220 L0 220 Z" fill="#d1fae5" opacity=".65" />
                    <path d="M0 36 C72 40 82 58 145 58 S242 95 305 88 S390 112 450 110 S548 143 640 154" fill="none" stroke="#047857" strokeWidth="4" strokeLinecap="round" />
                    {[ [0,36], [145,58], [305,88], [450,110], [640,154] ].map(([cx, cy]) => <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill="#fff" stroke="#047857" strokeWidth="3" />)}
                  </svg>
                  <div className="absolute bottom-0 flex w-full justify-between text-xs text-slate-400"><span>Sem. 1</span><span>Sem. 3</span><span>Sem. 5</span><span>Hoy</span></div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Tu foco esta semana</CardTitle><p className="mt-1 text-sm text-slate-500">Pequeñas acciones, gran impacto.</p></CardHeader>
              <CardContent className="space-y-4">
                <FocusItem icon={Dumbbell} title="Fuerza" text="3 de 3 sesiones realizadas" state="Completado" />
                <FocusItem icon={Bike} title="Cardio" text="1 salida bici + 2 caminatas" state="En marcha" />
                <FocusItem icon={Wine} title="Alcohol" text="Sustituir por cerveza 0,0" state="Prioridad" warning />
              </CardContent>
            </Card>
          </section>

          <section className="mt-7 grid gap-6 lg:grid-cols-2">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader><CardTitle>Semáforo semanal</CardTitle></CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <Status label="Entrenamiento" text="Excelente" color="bg-emerald-500" />
                <Status label="Pasos" text="En objetivo" color="bg-emerald-500" />
                <Status label="Alcohol" text="A vigilar" color="bg-amber-400" />
                <Status label="Sueño" text="Sin datos" color="bg-slate-300" />
              </CardContent>
            </Card>
            <Card className="border-slate-200 bg-slate-900 text-white shadow-sm">
              <CardContent className="p-6">
                <Activity className="mb-4 size-6 text-emerald-400" />
                <p className="text-lg font-semibold">Tu plan está funcionando.</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-300">El primer kilo tras las vacaciones es, sobre todo, recuperación de rutina. Mantén el plan y evalúa la tendencia, no el peso de mañana.</p>
                <button className="mt-5 text-sm font-semibold text-emerald-300 hover:text-emerald-200">Ver progreso completo →</button>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}

function FocusItem({ icon: Icon, title, text, state, warning = false }: { icon: typeof Bike; title: string; text: string; state: string; warning?: boolean }) {
  return <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><span className="grid size-9 place-items-center rounded-lg bg-slate-100 text-slate-700"><Icon className="size-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{title}</p><p className="truncate text-xs text-slate-500">{text}</p></div><span className={`text-xs font-semibold ${warning ? "text-amber-700" : "text-emerald-700"}`}>{state}</span></div>;
}

function Status({ label, text, color }: { label: string; text: string; color: string }) { return <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span className="text-sm font-medium text-slate-700">{label}</span><span className="flex items-center gap-2 text-xs text-slate-500"><i className={`size-2 rounded-full ${color}`} />{text}</span></div>; }
