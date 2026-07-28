import { User } from "@/domain/User";
import { Goals } from "@/domain/Goals";
import { CheckIn } from "@/domain/CheckIn";
import { LabResult } from "@/domain/LabResult";
import { Workout } from "@/domain/Workout";
import { Activity } from "@/domain/Activity";
import { BodyPhoto } from "@/domain/BodyPhoto";
import { checkInRepository } from "@/repositories/checkInRepository";
import { labsRepository } from "@/repositories/labsRepository";
import { zeppMetricsRepository } from "@/repositories/zeppMetricsRepository";
import { workoutRepository } from "@/repositories/workoutRepository";
import { activityRepository } from "@/repositories/activityRepository";
import { photoRepository } from "@/repositories/photoRepository";
import { getSupabase } from "@/lib/supabase/client";

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

export async function buildUserContext(userId: string): Promise<UserContext> {
  const { data: profile } = await getSupabase()
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  const user: User = {
    id: userId,
    email: profile?.email ?? "",
    name: profile?.name ?? undefined,
    avatar: profile?.avatar_url ?? undefined,
    createdAt: profile?.created_at ?? new Date().toISOString(),
  };

  let goals: Goals | undefined;
  try {
    const stored = localStorage.getItem("athlos-goals");
    if (stored) goals = JSON.parse(stored);
  } catch { /* ignore */ }

  const [checkIns, labs, _zepp, workouts, activities, photos] = await Promise.all([
    checkInRepository.fetchRemote(userId),
    labsRepository.fetchRemote(userId),
    zeppMetricsRepository.fetchRemote(userId),
    workoutRepository.fetchRemote(userId),
    activityRepository.fetchRemote(userId),
    photoRepository.getAll().catch(() => [] as BodyPhoto[]),
  ]);
  void _zepp;

  return {
    user,
    goals,
    checkIns,
    labs: labs as LabResult[],
    workouts: workouts as Workout[],
    activities: activities as Activity[],
    photos,
  };
}
