"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase/client";
import { LogIn, UserPlus } from "lucide-react";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const { error: authError } = isLogin
      ? await getSupabase().auth.signInWithPassword({ email, password })
      : await getSupabase().auth.signUp({ email, password, options: { emailRedirectTo: "https://athlos-kohl.vercel.app/auth/callback" } });
    setLoading(false);
    if (authError) {
      if (authError.message.includes("Email not confirmed") || authError.message.includes("sign_up")) {
        setMessage("Te hemos enviado un enlace de confirmación. Revisa tu correo.");
      } else {
        setError(authError.message === "Invalid login credentials" ? "Email o contraseña incorrectos" : authError.message);
      }
    } else if (isLogin) {
      router.push("/");
    } else {
      setMessage("Cuenta creada. Revisa tu correo para confirmar el email.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="Athlos" width={56} height={56} className="mx-auto mb-4 size-14 rounded-2xl" priority/>
          <h1 className="text-2xl font-bold text-slate-950">Athlos</h1>
          <p className="mt-1 text-sm text-slate-500">{isLogin ? "Inicia sesión" : "Crea tu cuenta"}</p>
        </div>
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="block"><span className="text-sm font-semibold text-slate-800">Email</span><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"/></label>
          <label className="mt-4 block"><span className="text-sm font-semibold text-slate-800">Contraseña</span><input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100"/></label>
          {error && <p className="mt-3 text-sm font-medium text-rose-600">{error}</p>}
          {message && <p className="mt-3 text-sm font-medium text-emerald-700">{message}</p>}
          <button disabled={loading} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-50">{loading ? "..." : <>{isLogin ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}{isLogin ? "Entrar" : "Crear cuenta"}</>}</button>
          <p className="mt-4 text-center text-sm text-slate-500">
            {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(""); setMessage(""); }} className="font-semibold text-emerald-700 hover:underline">{isLogin ? "Regístrate" : "Inicia sesión"}</button>
          </p>
        </form>
      </div>
    </div>
  );
}
