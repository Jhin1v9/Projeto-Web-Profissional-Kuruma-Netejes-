"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ImageIcon, Sparkles, ListChecks, LogOut, ExternalLink } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hero", label: "Hero", icon: Sparkles },
  { href: "/admin/services", label: "Serveis", icon: ListChecks },
  { href: "/admin/appearance", label: "Aparenca", icon: ImageIcon },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto w-[98vw] max-w-[1800px] px-2 py-4 sm:px-3 sm:py-6 lg:px-6">
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
                    {l.label}
                  </Link>
                );
              })}
            </nav>

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
