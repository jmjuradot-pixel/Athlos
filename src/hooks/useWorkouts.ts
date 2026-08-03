"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { Workout } from "@/domain/Workout";
import { workoutRepository } from "@/repositories/workoutRepository";
import { useUser } from "@/hooks/useUser";

const empty: Workout = {
  recordedAt: new Date().toISOString().slice(0, 10),
};

export function useWorkouts() {
  const { user } = useUser();
  const [data, setData] = useState<Workout>(empty);
  const [history, setHistory] = useState<Workout[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.id === "local-user") return;
    setLoading(true);
    const local = workoutRepository.getAll();
    setHistory(local);

    workoutRepository.fetchRemote(user.id).then((remote) => {
      const merged = workoutRepository.merge(local, remote);
      setHistory(merged);
    }).finally(() => setLoading(false));
  }, [user]);

  const submit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    await workoutRepository.save(user.id, data);
    const all = workoutRepository.getAll();
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
  };
}
