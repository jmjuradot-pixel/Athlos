export const StorageKeys = {
  CHECKINS: "athlos-checkins",
  LATEST_CHECKIN: "athlos-latest-checkin",
  LABS: "athlos-labs",
  LATEST_LABS: "athlos-latest-labs",
  ZEPP: "athlos-zepp",
  ZEPP_HISTORY: "athlos-zepp-history",
  WORKOUTS: "athlos-workouts",
  ACTIVITIES: "athlos-activities",
  GOALS: "athlos-goals",
} as const;

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const storage = {
  get,
  set,
};
