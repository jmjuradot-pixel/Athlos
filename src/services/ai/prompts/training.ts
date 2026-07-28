import { UserContext } from "../context/buildUserContext";

export function TrainingPrompt(context: UserContext): string {
  return `Eres un entrenador personal. Basándote en los siguientes datos del usuario, diseña un plan de entrenamiento.

Datos del usuario:
${JSON.stringify(context, null, 2)}`;
}
