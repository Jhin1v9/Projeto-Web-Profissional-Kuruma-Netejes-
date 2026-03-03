"use client";

import { motion } from "framer-motion";
import { useCursor } from "@/components/providers/CursorProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSiteConfig } from "./useSiteConfig";

export function Process() {
  const { setHover } = useCursor();
  const { language, t } = useLanguage();
  const cfg = useSiteConfig();
  const text = language === "ca" ? cfg.process : cfg.i18n?.[language]?.process ?? t.process;

  return (
    <section id="process" className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black text-white sm:text-5xl">
            {text.title} <span className="text-brand-cyan">{text.highlight}</span>
          </h2>
          <p className="mt-3 text-base text-brand-silver/90 sm:mt-4 sm:text-lg">{text.subtitle}</p>
        </div>

        <div className="mt-10 grid gap-4 sm:mt-14 sm:grid-cols-2 xl:grid-cols-4 xl:gap-6">
          {text.steps.map((s, i) => (
            <motion.div
              key={i}
              className="rounded-3xl border border-white/10 bg-brand-dark2/65 p-5 sm:p-6"
              whileHover={{ y: -6 }}
              onMouseEnter={() => setHover(true, "hover")}
              onMouseLeave={() => setHover(false)}
            >
              <div className="text-brand-cyan font-black text-sm">
                {text.stepLabel} {i + 1}
              </div>
              <div className="mt-2 text-lg font-extrabold sm:text-xl">{s.t}</div>
              <div className="mt-2 text-sm leading-relaxed text-brand-silver/85">{s.d}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
