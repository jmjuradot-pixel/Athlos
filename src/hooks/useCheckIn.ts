"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { CheckIn } from "@/domain/CheckIn";
import { checkInRepository } from "@/repositories/checkInRepository";
import { useUser } from "@/hooks/useUser";

const empty: CheckIn = {
  recordedAt: new Date().toISOString().slice(0, 10),
};

const fields: { key: keyof CheckIn; label: string; hint: string; suffix?: string; number?: boolean }[] = [
  { key: "weeklyWeight", label: "Peso medio semanal", hint: "Media de todos los pesajes", suffix: "kg", number: true },
  { key: "sundayWeight", label: "Peso en ayunas", hint: "Domingo, tras ir al baño", suffix: "kg", number: true },
  { key: "waist", label: "Cintura", hint: "A la altura del ombligo", suffix: "cm", number: true },
  { key: "strengthSessions", label: "Sesiones de fuerza", hint: "Entrenamientos completados", number: true },
  { key: "cardioMinutes", label: "Minutos de cardio", hint: "Bici, cinta u otra actividad", suffix: "min", number: true },
  { key: "averageSteps", label: "Pasos medios", hint: "Media diaria de la semana", number: true },
  { key: "alcoholMl", label: "Alcohol", hint: "Cantidad total con alcohol", suffix: "ml", number: true },
];

const ratingFields: { key: "energy" | "hunger" | "sleep"; label: string }[] = [
  { key: "energy", label: "Energía" },
  { key: "hunger", label: "Hambre" },
  { key: "sleep", label: "Sueño" },
];

export function useCheckIn() {
  const { user } = useUser();
  const [data, setData] = useState<CheckIn>(empty);
  const [history, setHistory] = useState<CheckIn[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const local = checkInRepository.getAll();
    setHistory(local);

    const latest = localStorage.getItem("athlos-latest-checkin");
    if (latest) {
      try { setData(JSON.parse(latest)); } catch { /* ignore */ }
    }

    checkInRepository.fetchRemote(user.id).then((remote) => {
      const merged = checkInRepository.merge(local, remote);
      setHistory(merged);
    }).finally(() => setLoading(false));
  }, [user]);

  const submit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    const record: CheckIn = {
      recordedAt: new Date().toISOString().slice(0, 10),
      ...Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== "" && v !== undefined),
      ),
    };
    await checkInRepository.save(user.id, record);
    const all = checkInRepository.getAll();
    setHistory(all);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }, [user, data]);

  return {
    data, setData,
    history, setHistory,
    saving, saved, loading,
    submit,
    fields,
    ratingFields,
  };
}
