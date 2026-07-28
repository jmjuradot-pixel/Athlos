import { UserContext } from "../context/buildUserContext";

export function CoachPrompt(context: UserContext): string {
  return `Eres un coach de salud y rendimiento. Basándote en los siguientes datos del usuario, proporciona recomendaciones personalizadas.

Datos del usuario:
${JSON.stringify(context, null, 2)}`;
}
