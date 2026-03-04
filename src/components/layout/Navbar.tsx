"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { LANGUAGES } from "@/lib/i18n";
import { BUSINESS } from "@/lib/constants";
import { generateWhatsAppLink, scrollToSection } from "@/lib/utils";
import { useCursor } from "@/components/providers/CursorProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSiteConfig } from "@/components/sections/useSiteConfig";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { setHover } = useCursor();
  const { language, setLanguage, t } = useLanguage();
  const cfg = useSiteConfig();
  const navText = language === "ca" ? cfg.navbar : cfg.i18n?.[language]?.navbar ?? t.navbar;

  const nav = [
    { label: navText.home, id: "hero" },
    { label: navText.services, id: "services" },
    { label: navText.process, id: "process" },
    { label: navText.contact, id: "location" },
  ];

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", on);
    return () => window.removeEventListener("scroll", on);
  }, []);

  const go = (id: string) => {
    scrollToSection(id);
    setOpen(false);
  };

  return (
    <>
      <motion.header
        className={[
          "fixed top-0 left-0 right-0 z-50 transition-all",
          scrolled ? "backdrop-blur-xl border-b border-white/10" : "bg-transparent",
        ].join(" ")}
        style={scrolled ? { backgroundColor: "var(--app-header)" } : undefined}
        initial={{ y: -60 }}
        animate={{ y: 0 }}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">
          <button
            onClick={() => go("hero")}
            className="flex items-center gap-3"
            onMouseEnter={() => setHover(true, "cta")}
            onMouseLeave={() => setHover(false)}
          >
            {cfg.logoUrl ? (
              <img src={cfg.logoUrl} alt="Logo" className="h-9 w-9 rounded-xl border border-white/10 object-cover sm:h-10 sm:w-10" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-cyan to-brand-blue text-sm font-black text-brand-dark shadow-glow sm:h-10 sm:w-10">
                K
              </div>
            )}
            <div className="text-left leading-none hidden sm:block">
              <div className="font-black">Kuruma Netejes</div>
              <div className="text-xs text-brand-silver/70">Sabadell</div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {nav.map((n) => (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className="text-sm font-semibold text-brand-silver/85 hover:text-white"
                onMouseEnter={() => setHover(true, "hover")}
                onMouseLeave={() => setHover(false)}
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            <div className="flex items-center gap-1 rounded-xl border border-white/10 px-2 py-1" style={{ backgroundColor: "var(--app-surface-soft)" }}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setLanguage(lang.code)}
                  className={`rounded-md px-2 py-1 text-sm ${language === lang.code ? "bg-white/15" : "hover:bg-white/10"}`}
                  title={lang.label}
                >
                  <img src={lang.flagSrc} alt={lang.label} className="w-5 h-4 rounded-sm object-cover" />
                </button>
              ))}
            </div>
            <a
              href={generateWhatsAppLink(BUSINESS.whatsapp, navText.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl px-4 py-2 bg-brand-cyan text-brand-dark font-extrabold shadow-glow"
              onMouseEnter={() => setHover(true, "cta")}
              onMouseLeave={() => setHover(false)}
            >
              <Phone className="w-4 h-4" />
              WhatsApp
            </a>
          </div>

          <button
            className="rounded-lg p-2 md:hidden"
            onClick={() => setOpen(!open)}
            onMouseEnter={() => setHover(true, "hover")}
            onMouseLeave={() => setHover(false)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-40 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 backdrop-blur-xl" style={{ backgroundColor: "var(--app-mobile-overlay)" }} onClick={() => setOpen(false)} />
            <motion.div className="absolute left-0 right-0 top-16 space-y-3 px-4 pb-6 pt-4 sm:top-20 sm:px-6" initial={{ y: -10 }} animate={{ y: 0 }}>
              <ThemeToggle />
              <div className="flex items-center gap-2 pb-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setLanguage(lang.code)}
                    className={`rounded-md px-3 py-1.5 text-sm ${language === lang.code ? "bg-white/15" : "bg-white/5"}`}
                    title={lang.label}
                  >
                    <img src={lang.flagSrc} alt={lang.label} className="w-5 h-4 rounded-sm object-cover" />
                  </button>
                ))}
              </div>
              {nav.map((n) => (
                <button key={n.id} onClick={() => go(n.id)} className="w-full border-b border-white/10 py-3 text-left text-lg font-black sm:text-xl">
                  {n.label}
                </button>
              ))}
              <a
                href={generateWhatsAppLink(BUSINESS.whatsapp, navText.whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-4 bg-brand-cyan text-brand-dark font-extrabold"
              >
                <Phone className="w-5 h-5" />
                {navText.mobileContact}
              </a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
