"use client";

import { FormEvent, useEffect, useState } from "react";
import { Check, Save } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth-provider";

type CheckIn = { weeklyWeight: string; sundayWeight: string; waist: string; strength: string; cardio: string; steps: string; alcohol: string; energy: string; hunger: string; sleep: string; comments: string };
const initial: CheckIn = { weeklyWeight: "", sundayWeight: "", waist: "", strength: "", cardio: "", steps: "", alcohol: "", energy: "", hunger: "", sleep: "", comments: "" };
const fields: { key: keyof CheckIn; label: string; hint: string; suffix?: string; type?: string }[] = [
  { key: "weeklyWeight", label: "Peso medio semanal", hint: "Media de todos los pesajes", suffix: "kg", type: "number" },
  { key: "sundayWeight", label: "Peso en ayunas", hint: "Domingo, tras ir al baño", suffix: "kg", type: "number" },
  { key: "waist", label: "Cintura", hint: "A la altura del ombligo", suffix: "cm", type: "number" },
  { key: "strength", label: "Sesiones de fuerza", hint: "Entrenamientos completados", type: "number" },
  { key: "cardio", label: "Minutos de cardio", hint: "Bici, cinta u otra actividad", suffix: "min", type: "number" },
  { key: "steps", label: "Pasos medios", hint: "Media diaria de la semana", type: "number" },
  { key: "alcohol", label: "Alcohol", hint: "Cantidad total con alcohol", suffix: "ml", type: "number" },
];

export default function CheckInPage() {
  const { user } = useAuth();
  const [data, setData] = useState<CheckIn>(initial);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const savedCheckIn = localStorage.getItem("athlos-latest-checkin");
    if (savedCheckIn) setData(JSON.parse(savedCheckIn));
    if (user) {
      getSupabase().from("check_ins").select("*").eq("user_id", user.id).order("recorded_at", { ascending: false }).limit(1).then(({ data: rows }: { data: any[] | null }) => {
        if (rows?.[0]) setData({
          weeklyWeight: String(rows[0].weekly_weight ?? ""),
          sundayWeight: String(rows[0].sunday_weight ?? ""),
          waist: String(rows[0].waist ?? ""),
          strength: String(rows[0].strength_sessions ?? ""),
          cardio: String(rows[0].cardio_minutes ?? ""),
          steps: String(rows[0].average_steps ?? ""),
          alcohol: String(rows[0].alcohol_ml ?? ""),
          energy: String(rows[0].energy ?? ""),
          hunger: String(rows[0].hunger ?? ""),
          sleep: String(rows[0].sleep ?? ""),
          comments: rows[0].comments ?? "",
        });
      });
    }
  }, [user]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    const record = { ...data, recordedAt: new Date().toISOString() };
    const history = JSON.parse(localStorage.getItem("athlos-checkins") ?? "[]");
    const nextHistory = [...history.filter((item: { recordedAt?: string }) => item.recordedAt?.slice(0, 10) !== record.recordedAt.slice(0, 10)), record];
    localStorage.setItem("athlos-latest-checkin", JSON.stringify(record));
    localStorage.setItem("athlos-checkins", JSON.stringify(nextHistory));
    if (user) {
      const today = new Date().toISOString().slice(0, 10);
      const { error } = await getSupabase().from("check_ins").upsert({
        user_id: user.id, recorded_at: today,
        weekly_weight: data.weeklyWeight ? Number(data.weeklyWeight) : null,
        sunday_weight: data.sundayWeight ? Number(data.sundayWeight) : null,
        waist: data.waist ? Number(data.waist) : null,
        strength_sessions: data.strength ? Number(data.strength) : null,
        cardio_minutes: data.cardio ? Number(data.cardio) : null,
        average_steps: data.steps ? Number(data.steps) : null,
        alcohol_ml: data.alcohol ? Number(data.alcohol) : null,
        energy: data.energy ? Number(data.energy) : null,
        hunger: data.hunger ? Number(data.hunger) : null,
        sleep: data.sleep ? Number(data.sleep) : null,
        comments: data.comments || null,
      }, { onConflict: "user_id, recorded_at" });
      if (error) console.error("Supabase check_ins error:", error);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return <div className="min-h-screen bg-slate-50"><AppSidebar /><main className="lg:pl-72"><div className="mx-auto max-w-4xl px-4 py-7 sm:px-8 lg:px-10"><header className="mb-8"><p className="mb-2 text-sm font-semibold text-emerald-700">SEMANA 1</p><h1 className="text-3xl font-bold tracking-tight text-slate-950">Check-in semanal</h1><p className="mt-2 text-slate-600">Completa lo esencial. Menos de dos minutos y tendremos una fotografía útil de tu semana.</p></header><form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><div className="grid gap-6 sm:grid-cols-2">{fields.map(({ key, label, hint, suffix, type }) => <label key={key} className="block"><span className="text-sm font-semibold text-slate-800">{label}</span><span className="mt-1 block text-xs text-slate-500">{hint}</span><span className="relative mt-3 block"><input required type={type} min="0" step="any" value={data[key]} onChange={(event) => setData({ ...data, [key]: event.target.value })} className="w-full rounded-xl border border-slate-200 px-3 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /><span className="pointer-events-none absolute right-3 top-3 text-sm text-slate-400">{suffix}</span></span></label>)}</div><div className="mt-7 grid gap-6 sm:grid-cols-3">{(["energy", "hunger", "sleep"] as const).map((key) => <label key={key}><span className="text-sm font-semibold text-slate-800">{key === "energy" ? "Energía" : key === "hunger" ? "Hambre" : "Sueño"} <span className="font-normal text-slate-500">(1–10)</span></span><input required type="number" min="1" max="10" value={data[key]} onChange={(event) => setData({ ...data, [key]: event.target.value })} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" /></label>)}</div><label className="mt-7 block"><span className="text-sm font-semibold text-slate-800">Comentarios</span><textarea value={data.comments} onChange={(event) => setData({ ...data, comments: event.target.value })} className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-3 outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100" rows={3} /></label><div className="mt-7 flex items-center gap-4"><button disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{saving ? "Guardando..." : <><Save className="size-4" />Guardar check-in</>}</button>{saved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700"><Check className="size-4" />Guardado</span>}</div></form></div></main></div>;
}