"use client";
import Link from "next/link";
import { BarChart3, Camera, HeartPulse, LayoutDashboard, Menu, Settings, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

const links = [{ label: "Dashboard", icon: LayoutDashboard, href: "/" }, { label: "Check-in semanal", icon: BarChart3, href: "/check-in" }, { label: "Progreso", icon: BarChart3, href: "/progress" }, { label: "Salud", icon: HeartPulse, href: "/health" }, { label: "Fotos", icon: Camera, href: "/photos" }, { label: "Ajustes", icon: Settings, href: "/settings" }];
export function AppSidebar() {
 const [open, setOpen] = useState(false);
 const pathname = usePathname();
 return <><button onClick={() => setOpen(!open)} className="fixed right-4 top-4 z-30 grid size-10 place-items-center rounded-xl border bg-white lg:hidden" aria-label="Abrir menú">{open ? <X className="size-5" /> : <Menu className="size-5" />}</button><aside className={`fixed inset-y-0 left-0 z-20 flex w-72 flex-col border-r border-slate-200 bg-white px-4 py-6 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}><Link href="/" className="mb-10 flex items-center gap-3 px-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-700 text-lg font-bold text-white">A</span><span><strong className="block text-lg tracking-tight text-slate-950">Athlos</strong><small className="text-xs text-slate-500">Salud y rendimiento</small></span></Link><nav className="space-y-1">{links.map(({ label, icon: Icon, href }) => <Link key={label} href={href} onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${pathname === href ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}><Icon className="size-4" />{label}</Link>)}</nav><div className="mt-auto rounded-2xl bg-emerald-50 p-4"><p className="text-sm font-semibold text-emerald-900">Proyecto Hígado Sano</p><p className="mt-1 text-xs leading-5 text-emerald-800">Semana 1 · Constancia antes que velocidad.</p></div></aside>{open && <button onClick={() => setOpen(false)} aria-label="Cerrar menú" className="fixed inset-0 z-10 bg-slate-950/30 lg:hidden" />}</>;
}
