import { AIService } from "./index";

let _instance: AIService | null = null;

export function getAI(): AIService {
  if (!_instance) throw new Error("AIService not configured. Call configureAI() first.");
  return _instance;
}

export function configureAI(service: AIService) {
  _instance = service;
}
