import { NextResponse } from "next/server";
import { CoachPrompt } from "@/services/ai/prompts/coach";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MODEL = "gpt-4o";

async function callOpenAI(systemPrompt: string, userContent: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: MODEL,
      input: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userContent },
      ],
      temperature: 0.7,
      max_output_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const text = data.output
    ?.filter((o: any) => o.type === "message")
    ?.flatMap((o: any) => o.content ?? [])
    ?.filter((c: any) => c.type === "output_text")
    ?.map((c: any) => c.text)
    ?.join("\n");

  return text ?? "No se pudo generar respuesta.";
}

export async function POST(request: Request) {
  try {
    const { action, payload } = await request.json();

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY no configurada" }, { status: 500 });
    }

    let result: string;

    switch (action) {
      case "answer": {
        const { question, context } = payload;
        result = await callOpenAI(CoachPrompt(context), question);
        break;
      }
      case "analyze": {
        const { context } = payload;
        result = await callOpenAI(
          `Eres un coach integral de salud y rendimiento deportivo. Analiza todos los datos del usuario y proporciona un informe completo con observaciones, tendencias y recomendaciones.`,
          JSON.stringify(context, null, 2),
        );
        break;
      }
      case "analyzeLabs": {
        const { labs } = payload;
        result = await callOpenAI(
          "Eres un analista clínico especializado en interpretación de resultados de laboratorio. Analiza los siguientes valores y proporciona observaciones detalladas.",
          JSON.stringify(labs, null, 2),
        );
        break;
      }
      case "analyzePhotos":
        result = "El análisis de fotos requiere procesamiento multimodal. Próximamente disponible.";
        break;
      case "summarizeWeek": {
        const { context } = payload;
        result = await callOpenAI(
          `Eres un coach de salud. Genera un resumen semanal personalizado basado en los datos del usuario.`,
          JSON.stringify(context, null, 2),
        );
        break;
      }
      default:
        return NextResponse.json({ error: `Acción desconocida: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error("AI API error:", error);
    return NextResponse.json({ error: error.message ?? "Error interno" }, { status: 500 });
  }
}
