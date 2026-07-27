"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const AuthCtx = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true });
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    getSupabase().auth.getSession().then(({ data: { session } }: any) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-slate-50"><span className="grid size-14 place-items-center rounded-2xl bg-emerald-700 text-2xl font-bold text-white">A</span></div>;

  if (!user && pathname !== "/auth") {
    router.push("/auth");
    return null;
  }

  return <AuthCtx.Provider value={{ user, loading }}>{children}</AuthCtx.Provider>;
}
