import { UserContext } from "../context/buildUserContext";

export function BodyAnalysisPrompt(context: UserContext): string {
  return `Eres un analista de composición corporal. Basándote en los siguientes datos, proporciona un análisis de la evolución física del usuario.

Datos del usuario:
${JSON.stringify(context, null, 2)}`;
}
