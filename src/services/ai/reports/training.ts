import { ReportDefinition } from "./index";

export const trainingReport: ReportDefinition = {
  type: "training",
  title: "Recomendación de entrenamiento",
  description: "Propuesta de entrenamiento personalizada según tu historial y objetivos.",
  async generate(context, ai) {
    return ai.analyze(context);
  },
};
