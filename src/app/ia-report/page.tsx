"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, ChevronDown, FileText, Scale, Sparkles, Target, Activity, HeartPulse, Camera, Dumbbell } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { getAllReports } from "@/services/ai/reports";
import { getAI } from "@/services/ai/provider";
import { reportRepository } from "@/repositories/reportRepository";
import { AIReport, ReportContext, ReportType } from "@/domain/AIReport";
import { useUser } from "@/hooks/useUser";
import { checkInRepository } from "@/repositories/checkInRepository";
import { labsRepository } from "@/repositories/labsRepository";
import { workoutRepository } from "@/repositories/workoutRepository";
import { activityRepository } from "@/repositories/activityRepository";
import { UserContext } from "@/services/ai/context/buildUserContext";

const reportMeta: Record<ReportType, { label: string; icon: any; color: string }> = {
  weekly: { label: "Semanal", icon: Activity, color: "text-emerald-700" },
  monthly: { label: "Mensual", icon: Scale, color: "text-sky-700" },
  labs: { label: "Analítica", icon: HeartPulse, color: "text-rose-700" },
  body: { label: "Corporal", icon: Camera, color: "text-violet-700" },
  training: { label: "Entrenamiento", icon: Dumbbell, color: "text-amber-700" },
};

const reportLabels: Record<ReportType, string> = {
  weekly: "Informe semanal",
  monthly: "Informe mensual",
  labs: "Análisis de analíticas",
  body: "Análisis corporal",
  training: "Recomendación de entrenamiento",
};

function buildContext(user: any): UserContext {
  return {
    user,
    goals: JSON.parse(localStorage.getItem("athlos-goals") ?? "null") ?? undefined,
    checkIns: checkInRepository.getAll(),
    labs: labsRepository.getAll(),
    workouts: workoutRepository.getAll(),
    activities: activityRepository.getAll(),
    photos: [],
  };
}

function captureContext(): ReportContext {
  const all = checkInRepository.getAll();
  const last = all[all.length - 1];
  const weights = all.map((c) => c.weeklyWeight).filter(Boolean);
  const trend = weights.length >= 2
    ? (Number(weights[weights.length - 1]) - Number(weights[0])).toFixed(1)
    : null;
  const goals = JSON.parse(localStorage.getItem("athlos-goals") ?? "null");
  return {
    weight: last?.weeklyWeight,
    waist: last?.waist,
    weightTrend: trend ? (Number(trend) < 0 ? `${Math.abs(Number(trend))} kg ↓` : `${trend} kg ↑`) : undefined,
    labsCount: labsRepository.getAll().length,
    workoutsCount: workoutRepository.getAll().length,
    activitiesCount: activityRepository.getAll().length,
    checkinsCount: all.length,
    targetWeight: goals?.targetWeight,
  };
}

function groupReports(reports: AIReport[]): { type: ReportType; label: string; icon: any; color: string; items: AIReport[] }[] {
  return (["weekly", "monthly", "labs", "body", "training"] as ReportType[])
    .map((type) => {
      const items = reports.filter((r) => r.type === type).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const meta = reportMeta[type];
      return { type, label: meta.label, icon: meta.icon, color: meta.color, items };
    })
    .filter((g) => g.items.length > 0);
}

export default function IAReportPage() {
  const { user } = useUser();
  const [reports, setReports] = useState<AIReport[]>([]);
  const [selected, setSelected] = useState<AIReport | null>(null);
  const [generating, setGenerating] = useState<ReportType | null>(null);
  const [error, setError] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setReports(reportRepository.getAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, []);

  async function generate(type: ReportType) {
    setShowMenu(false);
    setGenerating(type);
    setError("");

    try {
      const ai = getAI();
      const context = buildContext(user);
      const def = getAllReports().find((r) => r.type === type);
      if (!def) throw new Error("Tipo de informe no encontrado");

      const content = await def.generate(context, ai);
      const report: AIReport = {
        id: crypto.randomUUID(),
        type,
        title: reportLabels[type],
        report: content,
        createdAt: new Date().toISOString(),
        context: captureContext(),
      };

      await reportRepository.save(report);
      setReports((prev) => [report, ...prev]);
      setSelected(report);
    } catch (err: any) {
      if (err.message === "AI_SERVICE_NOT_CONFIGURED") {
        setError("IA no disponible. Configura OPENAI_API_KEY en el archivo .env.local.");
      } else {
        setError(err.message ?? "Error al generar el informe.");
      }
    }

    setGenerating(null);
  }

  const groups = useMemo(() => groupReports(reports), [reports]);
  const definitions = getAllReports();

  return (
    <PageLayout>
      <PageHeader tag="INFORME IA" title="Generar informe" description="Cada informe guarda el contexto de ese momento. Puedes consultarlos sin volver a usar la IA." />

      <div className="relative mb-8">
        <button
          onClick={() => setShowMenu(!showMenu)}
          disabled={!!generating}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50"
        >
          <Sparkles className="size-4" />
          {generating ? `Generando...` : "Generar análisis"}
          <ChevronDown className="size-4" />
        </button>

        {showMenu && (
          <div className="absolute left-0 top-full z-10 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            {definitions.map((def) => (
              <button
                key={def.type}
                onClick={() => generate(def.type)}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
              >
                {(() => {
                  const Icon = reportMeta[def.type].icon;
                  return <Icon className="size-4 shrink-0 text-slate-400" />;
                })()}
                <div>
                  <span className="block">{def.title}</span>
                  <span className="block text-xs font-normal text-slate-400">{def.description}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-800">{error}</div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          {groups.length === 0 && (
            <p className="pt-2 text-sm text-slate-500">Aún no has generado ningún informe.</p>
          )}
          {groups.map((group) => (
            <div key={group.type}>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-slate-400">
                <group.icon className={`size-3.5 ${group.color}`} />
                {group.label}
              </p>
              <div className="space-y-1.5">
                {group.items.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      selected?.id === r.id
                        ? "border-emerald-300 bg-emerald-50"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      <Bot className="size-3.5 text-emerald-600" />
                      {new Date(r.createdAt).toLocaleDateString("es-ES", { day: "numeric", month: "long" })}
                    </p>
                    {r.context?.weight && (
                      <p className="mt-0.5 text-xs text-slate-400">{r.context.weight} kg{r.context.waist ? ` · ${r.context.waist} cm` : ""}</p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div>
          {selected ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-4">
                <Bot className="size-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{selected.title}</p>
                  <p className="text-xs text-slate-400">{new Date(selected.createdAt).toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>

              {selected.context && (
                <div className="mb-4 flex flex-wrap gap-3">
                  {selected.context.weight != null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                      <Scale className="size-3" />{selected.context.weight} kg
                    </span>
                  )}
                  {selected.context.waist != null && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700">
                      <Target className="size-3" />{selected.context.waist} cm
                    </span>
                  )}
                  {selected.context.weightTrend && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Tendencia: {selected.context.weightTrend}
                    </span>
                  )}
                </div>
              )}

              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {selected.report}
              </div>

              {selected.context && (
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <p className="mb-2 text-xs font-semibold tracking-widest uppercase text-slate-400">Contexto de la generación</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                    {selected.context.checkinsCount != null && <p>Check-ins: {selected.context.checkinsCount}</p>}
                    {selected.context.labsCount != null && <p>Analíticas: {selected.context.labsCount}</p>}
                    {selected.context.workoutsCount != null && <p>Entrenos: {selected.context.workoutsCount}</p>}
                    {selected.context.activitiesCount != null && <p>Actividades: {selected.context.activitiesCount}</p>}
                    {selected.context.targetWeight != null && <p>Objetivo peso: {selected.context.targetWeight} kg</p>}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
              <FileText className="mb-4 size-10 text-slate-300" />
              <p className="text-sm font-medium text-slate-500">Selecciona un informe o genera uno nuevo</p>
              <p className="mt-1 text-xs text-slate-400">Los informes se almacenan localmente con el contexto de ese momento. Consulta el histórico sin usar IA.</p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
