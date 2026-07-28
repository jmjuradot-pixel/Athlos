"use client";

import { useEffect, useState } from "react";
import { User } from "@/domain/User";

const STORAGE_KEY = "athlos-user-id";
const LOCAL_USER: User = { id: "local-user", email: "local@athlos.app", name: "Usuario" };

function getLocalId(): string {
  const existing = localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}

export function useUser() {
  const [user, setUser] = useState<User>(LOCAL_USER);

  useEffect(() => {
    setUser({ ...LOCAL_USER, id: getLocalId() });
  }, []);

  return { user, loading: false };
}
