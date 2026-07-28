import { ReportDefinition } from "./index";

export const monthlyReport: ReportDefinition = {
  type: "monthly",
  title: "Informe mensual",
  description: "Análisis mensual: tendencias, evolución y comparativa respecto al mes anterior.",
  async generate(context, ai) {
    return ai.analyze(context);
  },
};
