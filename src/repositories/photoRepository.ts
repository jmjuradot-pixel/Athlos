import { BodyPhoto } from "@/domain/BodyPhoto";
import { eventBus } from "@/events";
import { EventTypes } from "@/events/types";

const DB_NAME = "athlos-photos";
const STORE_NAME = "photos";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const photoRepository = {
  async getAll(): Promise<BodyPhoto[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => {
        const entries = (req.result ?? []) as { date: string; dataUrl: string }[];
        resolve(entries.map((e) => ({ date: e.date, dataUrl: e.dataUrl })));
      };
      req.onerror = () => reject(req.error);
    });
  },

  async save(photo: BodyPhoto) {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(photo, photo.date);
      tx.oncomplete = () => {
        eventBus.emit(EventTypes.PHOTO_ADDED, photo);
        resolve();
      };
      tx.onerror = () => reject(tx.error);
    });
  },
};
