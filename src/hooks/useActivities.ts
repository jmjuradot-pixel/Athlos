"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Activity } from "@/domain/Activity";
import { activityRepository } from "@/repositories/activityRepository";
import { useAuth } from "@/components/auth-provider";

const activityTypes = ["Carrera", "Bici", "Natación", "Paseo", "Sesión", "Caminata", "Ruta", "Otro"];

const empty: Activity = {
  recordedAt: new Date().toISOString().slice(0, 10),
  activityType: "Bici",
};

export function useActivities() {
  const { user } = useAuth();
  const [data, setData] = useState<Activity>(empty);
  const [history, setHistory] = useState<Activity[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    const local = activityRepository.getAll();
    setHistory(local);

    activityRepository.fetchRemote(user.id).then((remote) => {
      const merged = activityRepository.merge(local, remote);
      setHistory(merged);
    }).finally(() => setLoading(false));
  }, [user]);

  const submit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    await activityRepository.save(user.id, data);
    const all = activityRepository.getAll();
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
    activityTypes,
  };
}
