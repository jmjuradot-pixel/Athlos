import { ReportDefinition } from "./index";

export const weeklyReport: ReportDefinition = {
  type: "weekly",
  title: "Informe semanal",
  description: "Resumen de la semana: check-in, entrenos, actividades y objetivos.",
  async generate(context, ai) {
    return ai.summarizeWeek(context);
  },
};
