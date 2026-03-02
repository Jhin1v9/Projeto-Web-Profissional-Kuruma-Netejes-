"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ImageIcon, Sparkles, ListChecks, LogOut } from "lucide-react";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/hero", label: "Hero", icon: Sparkles },
  { href: "/admin/services", label: "Serveis", icon: ListChecks },
  { href: "/admin/appearance", label: "Aparença", icon: ImageIcon },
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
      <div className="mx-auto w-[98vw] max-w-[1800px] px-3 py-6 lg:px-6">
        <div className="grid lg:grid-cols-[300px_1fr] gap-6 lg:gap-8">
          <aside className="rounded-3xl bg-brand-dark2/70 border border-white/10 backdrop-blur-xl p-5 h-fit sticky top-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue flex items-center justify-center text-brand-dark font-black">
                K
              </div>
              <div>
                <div className="font-black text-white leading-none">Kuruma Admin</div>
                <div className="text-xs text-brand-silver/70">Editor del web</div>
              </div>
            </div>

            <nav className="space-y-1">
              {links.map((l) => {
                const active = l.href === "/admin" ? pathname === "/admin" : pathname === l.href || pathname.startsWith(`${l.href}/`);
                const Icon = l.icon;
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={[
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "bg-brand-cyan/12 text-brand-cyan border border-brand-cyan/30 shadow-glow"
                        : "text-brand-silver/85 hover:text-white hover:bg-white/5 border border-transparent",
                    ].join(" ")}
                  >
                    <Icon className="w-4 h-4" />
                    {l.label}
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={logout}
              className="mt-8 w-full flex items-center justify-center gap-2 rounded-2xl px-4 py-3 border border-white/10 text-brand-silver/85 hover:text-white hover:border-brand-cyan/30 hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
              Sortir
            </button>

            <div className="mt-6 text-xs text-brand-silver/60">
              Tip: clica <b>Publicar</b> quan estiguis llest.
            </div>
          </aside>

          <section className="rounded-3xl bg-brand-dark2/55 border border-white/10 backdrop-blur-xl p-5 lg:p-8">
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
