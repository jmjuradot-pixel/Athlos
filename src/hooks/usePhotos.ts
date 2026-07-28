"use client";

import { useCallback, useEffect, useState } from "react";
import { BodyPhoto } from "@/domain/BodyPhoto";
import { photoRepository } from "@/repositories/photoRepository";

export function usePhotos() {
  const [photos, setPhotos] = useState<BodyPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    photoRepository.getAll().then((all) => {
      setPhotos(all);
    }).finally(() => setLoading(false));
  }, []);

  const addPhoto = useCallback(async (photo: BodyPhoto) => {
    await photoRepository.save(photo);
    const all = await photoRepository.getAll();
    setPhotos(all);
  }, []);

  return {
    photos,
    loading,
    addPhoto,
  };
}
