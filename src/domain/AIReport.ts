export type ReportType = "weekly" | "monthly" | "labs" | "body" | "training";

export interface ReportContext {
  weight?: number;
  waist?: number;
  weightTrend?: string;
  labsCount?: number;
  workoutsCount?: number;
  activitiesCount?: number;
  checkinsCount?: number;
  targetWeight?: number;
}

export interface AIReport {
  id: string;
  type: ReportType;
  title: string;
  report: string;
  createdAt: string;
  context: ReportContext;
}
