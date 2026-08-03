"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { zeppMetricsRepository } from "@/repositories/zeppMetricsRepository";
import { useUser } from "@/hooks/useUser";

type ZeppMetrics = {
  recordedAt: string;
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  water?: number;
  visceralFat?: number;
  bmr?: number;
  sleepHours?: number;
  sleepDeep?: number;
  sleepRem?: number;
  restingHeartRate?: number;
  steps?: number;
};

const empty: ZeppMetrics = {
  recordedAt: new Date().toISOString().slice(0, 10),
};

const fields: { key: keyof Omit<ZeppMetrics, "recordedAt">; label: string; unit?: string }[] = [
  { key: "weight", label: "Peso", unit: "kg" },
  { key: "bodyFat", label: "Grasa corporal", unit: "%" },
  { key: "muscleMass", label: "Masa muscular", unit: "kg" },
  { key: "water", label: "Agua corporal", unit: "%" },
  { key: "visceralFat", label: "Grasa visceral", unit: "nivel" },
  { key: "bmr", label: "TMB", unit: "kcal" },
  { key: "sleepHours", label: "Sueño total", unit: "h" },
  { key: "sleepDeep", label: "Sueño profundo", unit: "h" },
  { key: "sleepRem", label: "Sueño REM", unit: "h" },
  { key: "restingHeartRate", label: "HR en reposo", unit: "lpm" },
  { key: "steps", label: "Pasos" },
];

export function useZepp() {
  const { user } = useUser();
  const [data, setData] = useState<ZeppMetrics>(empty);
  const [history, setHistory] = useState<ZeppMetrics[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.id === "local-user") return;
    setLoading(true);
    const local = zeppMetricsRepository.getAll();
    setHistory(local);

    const savedData = localStorage.getItem("athlos-zepp");
    if (savedData) {
      try { setData(JSON.parse(savedData)); } catch { /* ignore */ }
    }

    zeppMetricsRepository.fetchRemote(user.id).then((remote) => {
      const merged = zeppMetricsRepository.merge(local, remote);
      setHistory(merged);
    }).finally(() => setLoading(false));
  }, [user]);

  const submit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    await zeppMetricsRepository.save(user.id, data);
    const all = zeppMetricsRepository.getAll();
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
  };
}
