"use client";

import { useEffect } from "react";
import { eventBus } from "@/events";
import { EventTypes } from "@/events/types";
import { journalRepository } from "@/repositories/journalRepository";
import { JournalEntry } from "@/domain/JournalEntry";

function addEntry(type: string, title: string, summary: string, metadata?: Record<string, unknown>) {
  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    type,
    date: new Date().toISOString(),
    title,
    summary,
    metadata,
  };
  journalRepository.add(entry);
}

export function JournalInit() {
  useEffect(() => {
    const unsubs = [
      eventBus.on(EventTypes.CHECKIN_CREATED, (e) => {
        const p = e.payload as any;
        const date = p?.recordedAt ?? new Date().toISOString().slice(0, 10);
        addEntry("checkin", `Check-in: semana del ${date}`, `Peso: ${p?.weeklyWeight ?? "—"} kg · Cintura: ${p?.waist ?? "—"} cm`, { recordedAt: date, weeklyWeight: p?.weeklyWeight });
      }),

      eventBus.on(EventTypes.LABS_UPDATED, (e) => {
        const p = e.payload as any;
        const date = p?.testedAt ?? new Date().toISOString().slice(0, 10);
        addEntry("labs", `Analítica: ${date}`, `ALT: ${p?.alt ?? "—"} · LDL: ${p?.ldl ?? "—"} · Glucosa: ${p?.glucose ?? "—"}`, { testedAt: date, alt: p?.alt, ldl: p?.ldl });
      }),

      eventBus.on(EventTypes.PHOTO_ADDED, () => {
        const today = new Date().toISOString().slice(0, 10);
        addEntry("photo", `Foto corporal: ${today}`, "Nueva foto de progreso registrada.", { date: today });
      }),

      eventBus.on(EventTypes.WORKOUT_IMPORTED, (e) => {
        const p = e.payload as any;
        const date = p?.recordedAt ?? new Date().toISOString().slice(0, 10);
        const groups = Array.isArray(p?.muscleGroups) ? p.muscleGroups.join(", ") : "";
        addEntry("workout", `Entrenamiento: ${date}`, `Duración: ${p?.duration ?? "—"} min · Volumen: ${p?.volume ?? "—"} kg${groups ? ` · Grupos: ${groups}` : ""}`, { recordedAt: date, duration: p?.duration, volume: p?.volume, muscleGroups: p?.muscleGroups });
      }),

      eventBus.on(EventTypes.ACTIVITY_ADDED, (e) => {
        const p = e.payload as any;
        const date = p?.recordedAt ?? new Date().toISOString().slice(0, 10);
        addEntry("activity", `Actividad: ${p?.activityType ?? "desconocida"}`, `${p?.distance ? `Distancia: ${p.distance} km · ` : ""}Tiempo: ${p?.movingTime ?? "—"} min`, { recordedAt: date, activityType: p?.activityType, distance: p?.distance });
      }),

      eventBus.on(EventTypes.GOAL_CHANGED, (e) => {
        const p = e.payload as any;
        addEntry("goal", "Objetivos actualizados", `Peso: ${p?.targetWeight ?? "—"} kg · Pasos: ${p?.targetSteps ?? "—"} · Alcohol: ${p?.targetAlcohol ?? "—"} ml`, { targetWeight: p?.targetWeight, targetSteps: p?.targetSteps, targetAlcohol: p?.targetAlcohol });
      }),

      eventBus.on(EventTypes.DATA_IMPORTED, (e) => {
        const p = e.payload as any;
        addEntry("import", "Datos importados", `Se importaron datos de ${p?.source ?? "origen externo"} (${p?.count ?? "?"} registros).`, { source: p?.source, count: p?.count });
      }),

      eventBus.on(EventTypes.ZEPP_SYNCED, (e) => {
        const p = e.payload as any;
        addEntry("zepp", "Zepp sincronizado", `Peso: ${p?.weight ?? "—"} kg · Grasa: ${p?.bodyFat ?? "—"}% · Sueño: ${p?.sleepHours ?? "—"} h`, { weight: p?.weight, bodyFat: p?.bodyFat, sleepHours: p?.sleepHours });
      }),
    ];

    return () => unsubs.forEach((u) => u());
  }, []);

  return null;
}
