"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { PageLayout, PageHeader } from "@/components/layout/page-layout";
import { usePhotos } from "@/hooks/usePhotos";

export default function PhotosPage() {
  const { photos, addPhoto } = usePhotos();
  const [selected, setSelected] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const months = [...new Set(photos.map((p) => p.date.slice(0, 7)))].sort().reverse();

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(file);
    });
    const date = new Date().toISOString().slice(0, 10);
    await addPhoto({ date, dataUrl });
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <PageLayout>
      <PageHeader tag="FOTOS" title="Fotos de progreso" description="Mensualmente, misma postura, misma luz. La foto más honesta." />
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFile} className="hidden" />
      <button onClick={() => fileRef.current?.click()} className="mb-8 flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-white p-8 text-slate-500 transition hover:border-emerald-400 hover:text-emerald-700">
        <Camera className="size-6" />
        <span className="text-sm font-semibold">Hacer foto o subir desde galería</span>
      </button>

      {months.map((month) => {
        const monthPhotos = photos.filter((p) => p.date.startsWith(month));
        const monthName = new Date(month + "-01").toLocaleDateString("es-ES", { month: "long", year: "numeric" });
        return (
          <section key={month} className="mb-8">
            <h2 className="mb-3 text-lg font-semibold capitalize text-slate-900">{monthName}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {monthPhotos.map((photo) => (
                <button key={photo.date} onClick={() => setSelected(photo.dataUrl)} className="group relative aspect-[3/4] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm transition hover:shadow-md">
                  <img src={photo.dataUrl} alt={`Foto ${photo.date}`} className="size-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <p className="text-xs font-medium text-white">{new Date(photo.date).toLocaleDateString("es-ES")}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        );
      })}

      {photos.length === 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <Camera className="mx-auto mb-4 size-10 text-slate-300" />
          <p className="text-sm font-medium text-slate-500">Aún no has añadido ninguna foto</p>
          <p className="mt-1 text-xs text-slate-400">Haz una foto cada mes para ver tu evolución</p>
        </div>
      )}

      {selected && (
        <div onClick={() => setSelected(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <img src={selected} alt="Foto ampliada" className="max-h-[90vh] max-w-full rounded-2xl object-contain" />
        </div>
      )}
    </PageLayout>
  );
}
