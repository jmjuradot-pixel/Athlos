import type { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/80">
      <AppSidebar />
      <main className="lg:pl-72">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}

export function PageHeader({ tag, title, description }: { tag: string; title: string; description?: string }) {
  return (
    <header className="mb-9">
      <p className="mb-2 text-xs font-semibold tracking-widest uppercase text-emerald-600">{tag}</p>
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-500">{description}</p>}
    </header>
  );
}
