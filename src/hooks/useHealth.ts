"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LabResult } from "@/domain/LabResult";
import { labsRepository } from "@/repositories/labsRepository";
import { useUser } from "@/hooks/useUser";

const empty: LabResult = {
  testedAt: new Date().toISOString().slice(0, 10),
};

const fields: { key: keyof Omit<LabResult, "testedAt">; label: string; unit: string; goal: string }[] = [
  { key: "alt", label: "ALT / GPT", unit: "U/L", goal: "Objetivo: < 40" },
  { key: "ast", label: "AST / GOT", unit: "U/L", goal: "Objetivo: < 40" },
  { key: "ggt", label: "GGT", unit: "U/L", goal: "Según laboratorio" },
  { key: "ldl", label: "LDL", unit: "mg/dL", goal: "Objetivo: < 130" },
  { key: "hdl", label: "HDL", unit: "mg/dL", goal: "Deseable: > 40" },
  { key: "triglycerides", label: "Triglicéridos", unit: "mg/dL", goal: "Objetivo: < 150" },
  { key: "glucose", label: "Glucosa", unit: "mg/dL", goal: "Objetivo: 70-99" },
];

export function useHealth() {
  const { user } = useUser();
  const [data, setData] = useState<LabResult>(empty);
  const [history, setHistory] = useState<LabResult[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.id === "local-user") return;
    setLoading(true);
    const local = labsRepository.getAll();
    setHistory(local);

    const latest = localStorage.getItem("athlos-latest-labs");
    if (latest) {
      try { setData(JSON.parse(latest)); } catch { /* ignore */ }
    }

    labsRepository.fetchRemote(user.id).then((remote) => {
      const merged = labsRepository.merge(local, remote);
      setHistory(merged);
    }).finally(() => setLoading(false));
  }, [user]);

  const submit = useCallback(async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    setSaving(true);
    await labsRepository.save(user.id, data);
    const all = labsRepository.getAll();
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
