export const EventTypes = {
  CHECKIN_CREATED: "CHECKIN_CREATED",
  WORKOUT_IMPORTED: "WORKOUT_IMPORTED",
  ACTIVITY_ADDED: "ACTIVITY_ADDED",
  PHOTO_ADDED: "PHOTO_ADDED",
  LABS_UPDATED: "LABS_UPDATED",
  GOAL_CHANGED: "GOAL_CHANGED",
  ZEPP_SYNCED: "ZEPP_SYNCED",
  DATA_IMPORTED: "DATA_IMPORTED",
} as const;

export type AthlosEvent = {
  type: keyof typeof EventTypes;
  timestamp: number;
  payload?: unknown;
};
