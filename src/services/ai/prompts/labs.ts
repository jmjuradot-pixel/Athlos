import { UserContext } from "../context/buildUserContext";

export function LabsPrompt(context: UserContext): string {
  return `Eres un analista clínico. Basándote en los siguientes resultados de laboratorio, proporciona un análisis detallado.

Datos del usuario:
${JSON.stringify(context, null, 2)}`;
}
