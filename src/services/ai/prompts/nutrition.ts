import { UserContext } from "../context/buildUserContext";

export function NutritionPrompt(context: UserContext): string {
  return `Eres un nutricionista. Basándote en los siguientes datos del usuario, proporciona recomendaciones nutricionales.

Datos del usuario:
${JSON.stringify(context, null, 2)}`;
}
