"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";

function LoginContent() {
  const [email, setEmail] = useState("abnerr2002@icloud.com");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const sp = useSearchParams();
  const router = useRouter();
  const next = sp.get("next") || "/admin";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setErr(j?.error || "Error al iniciar sesion");
      return;
    }
    router.push(next);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-10 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,240,255,0.18),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(50,120,255,0.16),transparent_42%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-5xl rounded-[28px] border border-white/10 bg-brand-dark2/70 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] overflow-hidden grid lg:grid-cols-[1.05fr_1fr]"
      >
        <div className="p-8 lg:p-12 border-b lg:border-b-0 lg:border-r border-white/10 bg-gradient-to-br from-black/10 to-black/30">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/35 bg-brand-cyan/10 px-4 py-2 text-xs font-semibold text-brand-cyan">
            <ShieldCheck className="w-4 h-4" />
            Area protegida
          </div>
          <h1 className="mt-6 text-4xl lg:text-5xl font-black leading-tight">
            Kuruma <span className="text-brand-cyan">Admin</span>
          </h1>
          <p className="mt-4 text-brand-silver/85 text-base lg:text-lg">
            Gestiona hero, serveis, aparenca, precos i contingut publicat amb control de rascunho.
          </p>
          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-brand-silver/80">
            Inicia sesion con tu email y password para continuar.
          </div>
        </div>

        <div className="p-8 lg:p-12">
          <form onSubmit={onSubmit} className="space-y-5">
            <label className="block">
              <span className="text-sm text-brand-silver/80">Email</span>
              <div className="mt-1 relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-silver/60" />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-black/30 border border-white/10 pl-11 pr-4 py-3 outline-none focus:border-brand-cyan/60"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="text-sm text-brand-silver/80">Password</span>
              <div className="mt-1 relative">
                <LockKeyhole className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-brand-silver/60" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl bg-black/30 border border-white/10 pl-11 pr-4 py-3 outline-none focus:border-brand-cyan/60"
                  required
                />
              </div>
            </label>

            {err && <div className="text-sm text-red-300">{err}</div>}

            <button
              disabled={loading}
              className="w-full rounded-2xl bg-brand-cyan text-brand-dark font-extrabold py-3 shadow-glowStrong disabled:opacity-60"
            >
              {loading ? "Entrando..." : "Entrar no painel"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-dark" />}>
      <LoginContent />
    </Suspense>
  );
}
