import { AIReport, ReportType } from "@/domain/AIReport";

const STORAGE_KEY = "athlos-reports";

function getAll(): AIReport[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveAll(reports: AIReport[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export const reportRepository = {
  getAll,

  getByType(type: ReportType): AIReport[] {
    return getAll()
      .filter((r) => r.type === type)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  getById(id: string): AIReport | undefined {
    return getAll().find((r) => r.id === id);
  },

  async save(report: AIReport) {
    const all = getAll();
    const idx = all.findIndex((r) => r.id === report.id);
    if (idx >= 0) {
      all[idx] = report;
    } else {
      all.push(report);
    }
    saveAll(all);
  },

  remove(id: string) {
    saveAll(getAll().filter((r) => r.id !== id));
  },
};
