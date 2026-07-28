import { AIService } from "./index";
import { UserContext } from "./context/buildUserContext";
import { LabResult } from "@/domain/LabResult";

async function callAPI(action: string, payload: any): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, payload }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Error de conexión" }));
    throw new Error(err.error ?? `Error ${res.status}`);
  }

  const data = await res.json();
  return data.result;
}

export class OpenAIResponsesService implements AIService {
  async analyze(context: UserContext): Promise<string> {
    return callAPI("analyze", { context });
  }

  async analyzePhotos(_images: string[]): Promise<string> {
    void _images;
    return callAPI("analyzePhotos", {});
  }

  async analyzeLabs(labs: LabResult[]): Promise<string> {
    return callAPI("analyzeLabs", { labs });
  }

  async answer(question: string, context: UserContext): Promise<string> {
    return callAPI("answer", { question, context });
  }

  async summarizeWeek(context: UserContext): Promise<string> {
    return callAPI("summarizeWeek", { context });
  }
}
