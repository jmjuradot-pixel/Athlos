import { User } from "@/domain/User";
import { Goals } from "@/domain/Goals";
import { CheckIn } from "@/domain/CheckIn";
import { LabResult } from "@/domain/LabResult";
import { Workout } from "@/domain/Workout";
import { Activity } from "@/domain/Activity";
import { BodyPhoto } from "@/domain/BodyPhoto";

export interface UserContext {
  user: User;
  goals?: Goals;
  checkIns: CheckIn[];
  labs: LabResult[];
  workouts: Workout[];
  activities: Activity[];
  photos: BodyPhoto[];
  conversations?: string[];
}

export async function buildUserContext(_userId: string): Promise<UserContext> {
  void _userId;
  throw new Error("buildUserContext not implemented yet");
}
