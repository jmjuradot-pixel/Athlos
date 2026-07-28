import { UserContext } from "./context/buildUserContext";
import { LabResult } from "@/domain/LabResult";

export interface AIService {
  analyze(context: UserContext): Promise<string>;
  analyzePhotos(images: string[]): Promise<string>;
  analyzeLabs(labs: LabResult[]): Promise<string>;
  answer(question: string, context: UserContext): Promise<string>;
  summarizeWeek(context: UserContext): Promise<string>;
}
