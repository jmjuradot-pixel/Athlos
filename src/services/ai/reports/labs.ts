import { ReportDefinition } from "./index";

export const labsReport: ReportDefinition = {
  type: "labs",
  title: "Análisis de analíticas",
  description: "Interpretación de los últimos resultados de laboratorio.",
  async generate(context, ai) {
    return ai.analyzeLabs(context.labs);
  },
};
