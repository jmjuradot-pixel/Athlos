import { JournalEntry } from "@/domain/JournalEntry";

const STORAGE_KEY = "athlos-journal";

function getAll(): JournalEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAll(entries: JournalEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export const journalRepository = {
  getAll,

  add(entry: JournalEntry) {
    const all = getAll();
    all.push(entry);
    saveAll(all);
  },

  getRecent(limit = 50): JournalEntry[] {
    return getAll()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, limit);
  },
};
