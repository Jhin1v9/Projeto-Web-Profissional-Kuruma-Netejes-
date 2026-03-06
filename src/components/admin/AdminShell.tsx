"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  ImageIcon,
  Sparkles,
  ListChecks,
  LogOut,
  ExternalLink,
  PenSquare,
  Palette,
  Rocket,
  Globe,
  Link2,
} from "lucide-react";

const links = [
  { href: "/admin", label: "Command", icon: LayoutDashboard, emoji: "📊" },
  { href: "/admin/editor", label: "Editor Visual", icon: PenSquare, emoji: "🛠️" },
  { href: "/admin/hero", label: "Hero Slides", icon: Sparkles, emoji: "✨" },
  { href: "/admin/services", label: "Servicos + FAQ", icon: ListChecks, emoji: "🧩" },
  { href: "/admin/appearance", label: "Aparencia", icon: ImageIcon, emoji: "🎨" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isVisualEditor = pathname === "/admin/editor";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  if (isVisualEditor) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen">
      <div
        className="mx-auto w-full max-w-[1800px] px-4 py-4 sm:px-5 sm:py-6 lg:px-6"
        style={{
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        <div className="grid gap-4 xl:grid-cols-[290px_1fr] xl:gap-8">
          <aside className="h-fit rounded-3xl border border-white/10 bg-brand-dark2/70 p-4 backdrop-blur-xl sm:p-5 xl:sticky xl:top-6">
            <div className="mb-5 flex items-center gap-3 sm:mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue font-black text-brand-dark">
                K
              </div>
              <div>
                <div className="leading-none font-black text-white">Kuruma Admin</div>
                <div className="text-xs text-brand-silver/70">Editor del web</div>
              </div>
            </div>

            <nav className="flex gap-2 overflow-x-auto pb-1 xl:block xl:space-y-1 xl:overflow-visible xl:pb-0">
              {links.map((l) => {
                const active = l.href === "/admin" ? pathname === "/admin" : pathname === l.href || pathname.startsWith(`${l.href}/`);
                const Icon = l.icon;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={[
                      "flex min-w-max items-center gap-2 rounded-2xl border px-3 py-2.5 text-sm font-semibold transition xl:gap-3 xl:px-4 xl:py-3",
                      active
                        ? "border-brand-cyan/30 bg-brand-cyan/12 text-brand-cyan shadow-glow"
                        : "border-transparent text-brand-silver/85 hover:bg-white/5 hover:text-white",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-base leading-none">{l.emoji}</span>
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3 sm:mt-6">
              <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-silver/70">Acesso rapido</div>
              <div className="space-y-2">
                <a
                  href="/#hero"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-xs text-brand-silver/85 hover:border-brand-cyan/35 hover:text-brand-cyan"
                >
                  <span className="inline-flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> Hero no site</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href="/#service-details"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-xs text-brand-silver/85 hover:border-brand-cyan/35 hover:text-brand-cyan"
                >
                  <span className="inline-flex items-center gap-2"><Link2 className="h-3.5 w-3.5" /> Infos + FAQ</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <a
                  href="/#cta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2 text-xs text-brand-silver/85 hover:border-brand-cyan/35 hover:text-brand-cyan"
                >
                  <span className="inline-flex items-center gap-2"><Rocket className="h-3.5 w-3.5" /> CTA final</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-gradient-to-br from-brand-cyan/10 to-brand-blue/10 p-3">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-cyan">
                <Palette className="h-3.5 w-3.5" />
                Tema ativo
              </div>
              <div className="mt-1 text-xs text-brand-silver/80">
                Header, FAQ e cards com layout expandido para usar mais espaco horizontal.
              </div>
            </div>

            <button
              onClick={logout}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-brand-silver/85 hover:border-brand-cyan/30 hover:bg-white/5 hover:text-white sm:mt-8"
            >
              <LogOut className="h-4 w-4" />
              Sortir
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-brand-silver/85 hover:border-brand-cyan/30 hover:bg-white/5 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
              Voltar ao site
            </a>

            <div className="mt-4 text-xs text-brand-silver/60 sm:mt-6">
              Tip: clica <b>Publicar</b> quan estiguis llest.
            </div>
          </aside>

          <section className="rounded-3xl border border-white/10 bg-brand-dark2/55 p-4 backdrop-blur-xl sm:p-5 lg:p-8">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
