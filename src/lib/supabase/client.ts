import { createBrowserClient } from "@supabase/ssr";

let _client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabase() {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Supabase: faltan las variables de entorno");
  _client = createBrowserClient(url, key, {
    cookies: {
      getAll() {
        if (typeof document === "undefined") return [];
        return document.cookie.split("; ").map((c) => {
          const i = c.indexOf("=");
          return { name: c.slice(0, i), value: c.slice(i + 1) };
        }).filter((c) => c.name);
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          document.cookie = `${name}=${value}; path=/; max-age=${options?.maxAge ?? 31536000}; SameSite=Lax`;
        });
      },
    },
  });
  return _client;
}
