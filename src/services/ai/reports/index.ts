import { UserContext } from "@/services/ai/context/buildUserContext";
import { AIService } from "@/services/ai";
import { ReportType } from "@/domain/AIReport";

export interface ReportDefinition {
  type: ReportType;
  title: string;
  description: string;
  generate(context: UserContext, ai: AIService): Promise<string>;
}

const registry = new Map<ReportType, ReportDefinition>();

export function registerReport(report: ReportDefinition) {
  registry.set(report.type, report);
}

export function getReport(type: ReportType): ReportDefinition | undefined {
  return registry.get(type);
}

export function getAllReports(): ReportDefinition[] {
  return Array.from(registry.values());
}
