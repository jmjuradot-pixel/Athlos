export interface Activity {
  recordedAt: string;
  activityType: string;
  distance?: number;
  movingTime?: number;
  elevation?: number;
  avgHeartRate?: number;
  calories?: number;
}
