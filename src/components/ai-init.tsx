"use client";

import { useEffect } from "react";
import { configureAI } from "@/services/ai/provider";
import { OpenAIResponsesService } from "@/services/ai/openai-service";
import { registerReport } from "@/services/ai/reports";
import { weeklyReport } from "@/services/ai/reports/weekly";
import { monthlyReport } from "@/services/ai/reports/monthly";
import { labsReport } from "@/services/ai/reports/labs";
import { bodyReport } from "@/services/ai/reports/body";
import { trainingReport } from "@/services/ai/reports/training";

export function AIInit() {
  useEffect(() => {
    try {
      configureAI(new OpenAIResponsesService());
    } catch {
      // Sin API key — la IA no está disponible, la app funciona igual
    }

    registerReport(weeklyReport);
    registerReport(monthlyReport);
    registerReport(labsReport);
    registerReport(bodyReport);
    registerReport(trainingReport);
  }, []);
  return null;
}
