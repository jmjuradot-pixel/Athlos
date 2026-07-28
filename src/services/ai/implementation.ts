import { AIService } from "./index";
import { UserContext } from "./context/buildUserContext";
import { LabResult } from "@/domain/LabResult";

function latest<T extends { recordedAt?: string; testedAt?: string }>(items: T[]): T | undefined {
  return [...items].sort((a, b) => {
    const da = a.recordedAt ?? a.testedAt ?? "";
    const db = b.recordedAt ?? b.testedAt ?? "";
    return db.localeCompare(da);
  })[0];
}

function trend<T extends { recordedAt?: string; testedAt?: string; weight?: number }>(items: T[]): string {
  if (items.length < 2) return "insuficientes datos";
  const sorted = [...items].sort((a, b) => {
    const da = a.recordedAt ?? a.testedAt ?? "";
    const db = b.recordedAt ?? b.testedAt ?? "";
    return da.localeCompare(db);
  });
  const first = sorted[0].weight;
  const last = sorted[sorted.length - 1].weight;
  if (first == null || last == null) return "insuficientes datos";
  const diff = last - first;
  if (Math.abs(diff) < 0.1) return "estable";
  return diff < 0 ? `descenso de ${Math.abs(diff).toFixed(1)} kg` : `aumento de ${diff.toFixed(1)} kg`;
}

export class MockAIService implements AIService {
  async analyze(context: UserContext): Promise<string> {
    const last = latest(context.checkIns);
    const weightTrend = trend(context.checkIns.map((c) => ({ ...c, recordedAt: c.recordedAt, weight: c.weeklyWeight })));
    const workoutCount = context.workouts.length;
    const activityCount = context.activities.length;

    return `📊 **Análisis completo de ${context.user.name ?? "usuario"}**

**Resumen general**
- Progreso de peso: ${weightTrend}
- Check-ins registrados: ${context.checkIns.length}
- Entrenamientos: ${workoutCount}
- Actividades cardio: ${activityCount}
- Analíticas: ${context.labs.length}

**Último check-in**
${last ? `- Peso semanal: ${last.weeklyWeight ?? "—"} kg
- Cintura: ${last.waist ?? "—"} cm
- Energía: ${last.energy ?? "—"}/10
- Sueño: ${last.sleep ?? "—"}/10` : "—"}

${context.goals ? `**Objetivos vs realidad**
- Peso objetivo: ${context.goals.targetWeight ?? "—"} kg
- Pasos objetivo: ${context.goals.targetSteps ?? "—"}
- Alcohol objetivo: ${context.goals.targetAlcohol ?? "—"} ml` : ""}

**Recomendaciones**
1. Mantén la constancia en los check-ins semanales
2. Revisa la tendencia de peso en la sección de Progreso
3. Si tienes dudas sobre analíticas, consulta con tu médico
4. Sigue registrando entrenamientos y actividades para un análisis más completo`;
  }

  async analyzePhotos(_images: string[]): Promise<string> {
    void _images;
    return `📸 **Análisis de fotos de progreso**

No es posible analizar imágenes en esta versión. Próximamente con IA visual podrás obtener:
- Comparativa mes a mes
- Detección de cambios en composición corporal
- Estimación de porcentaje graso`;
  }

  async analyzeLabs(labs: LabResult[]): Promise<string> {
    if (labs.length === 0) return "No hay analíticas registradas para analizar.";
    const last = latest(labs);
    if (!last) return "No hay datos suficientes.";

    const flags: string[] = [];
    if (last.alt != null && last.alt > 40) flags.push(`ALT elevado (${last.alt} U/L). Objetivo: < 40`);
    if (last.ast != null && last.ast > 40) flags.push(`AST elevado (${last.ast} U/L). Objetivo: < 40`);
    if (last.ggt != null && last.ggt > 40) flags.push(`GGT elevado (${last.ggt} U/L). Objetivo: < 40`);
    if (last.ldl != null && last.ldl > 130) flags.push(`LDL elevado (${last.ldl} mg/dL). Objetivo: < 130`);
    if (last.glucose != null && (last.glucose < 70 || last.glucose > 99)) flags.push(`Glucosa fuera de rango (${last.glucose} mg/dL). Rango: 70-99`);

    return `🔬 **Análisis de laboratorio** (${last.testedAt})

**Resultados:**
- ALT: ${last.alt ?? "—"} U/L
- AST: ${last.ast ?? "—"} U/L
- GGT: ${last.ggt ?? "—"} U/L
- LDL: ${last.ldl ?? "—"} mg/dL
- HDL: ${last.hdl ?? "—"} mg/dL
- Triglicéridos: ${last.triglycerides ?? "—"} mg/dL
- Glucosa: ${last.glucose ?? "—"} mg/dL

${flags.length > 0 ? `⚠️ **A tener en cuenta:**\n- ${flags.join("\n- ")}` : "✅ Todos los marcadores están en rangos normales."}

*Este análisis es orientativo. Consulta los resultados con tu médico.*`;
  }

  async answer(question: string, context: UserContext): Promise<string> {
    const q = question.toLowerCase();
    if (q.includes("peso") || q.includes("evolución")) {
      return `Basándome en tus ${context.checkIns.length} check-ins registrados, tu evolución de peso es: ${trend(context.checkIns.map((c) => ({ ...c, recordedAt: c.recordedAt, weight: c.weeklyWeight })))}. ${context.goals?.targetWeight ? `Tu objetivo es ${context.goals.targetWeight} kg.` : ""}`;
    }
    if (q.includes("entreno") || q.includes("fuerza")) {
      return `Has registrado ${context.workouts.length} entrenamientos de fuerza. ${context.workouts.length > 0 ? `El volumen total acumulado es de ${context.workouts.reduce((s, w) => s + (w.volume ?? 0), 0)} kg.` : "¡Empieza a registrar tus sesiones para ver tu progreso!"}`;
    }
    if (q.includes("analítica") || q.includes("laboratorio") || q.includes("sangre")) {
      return this.analyzeLabs(context.labs);
    }
    if (q.includes("actividad") || q.includes("cardio") || q.includes("strava")) {
      return `Has realizado ${context.activities.length} actividades. ${context.activities.length > 0 ? `Distancia total: ${context.activities.reduce((s, a) => s + (a.distance ?? 0), 0).toFixed(0)} km.` : "Registra tus actividades para ver estadísticas."}`;
    }
    return `He recibido tu pregunta: "${question}". En esta versión las respuestas son simuladas. Próximamente con IA real podré darte análisis personalizados.`;
  }

  async summarizeWeek(context: UserContext): Promise<string> {
    const last = latest(context.checkIns);
    const weekWorkouts = context.workouts.filter((w) => {
      const d = new Date(w.recordedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    });
    const weekActivities = context.activities.filter((a) => {
      const d = new Date(a.recordedAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    });

    return `📅 **Resumen semanal**

**Check-in**
${last ? `- Peso: ${last.weeklyWeight ?? "—"} kg
- Cintura: ${last.waist ?? "—"} cm
- Energía: ${last.energy ?? "—"}/10 · Sueño: ${last.sleep ?? "—"}/10` : "No hay check-in esta semana"}

**Entrenamiento**
- Sesiones de fuerza: ${weekWorkouts.length}
${weekWorkouts.length > 0 ? `- Volumen total: ${weekWorkouts.reduce((s, w) => s + (w.volume ?? 0), 0)} kg` : ""}

**Cardio**
- Actividades: ${weekActivities.length}
${weekActivities.length > 0 ? `- Distancia total: ${weekActivities.reduce((s, a) => s + (a.distance ?? 0), 0).toFixed(1)} km` : ""}

**Objetivo de la próxima semana:** Mantén la constancia. Cada check-in es un paso adelante. 💪`;
  }
}
