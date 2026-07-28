import { ReportDefinition } from "./index";

export const bodyReport: ReportDefinition = {
  type: "body",
  title: "Análisis corporal",
  description: "Análisis de la evolución visual a partir de las fotos corporales.",
  async generate(context, ai) {
    return ai.analyzePhotos(context.photos.map((p) => p.dataUrl));
  },
};
