"use client";

import { motion } from "framer-motion";
import { useCursor } from "@/components/providers/CursorProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function Process() {
  const { setHover } = useCursor();
  const { t } = useLanguage();

  return (
    <section id="process" className="relative py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black text-white">
            {t.process.title} <span className="text-brand-cyan">{t.process.highlight}</span>
          </h2>
          <p className="mt-4 text-brand-silver/90 text-lg">{t.process.subtitle}</p>
        </div>

        <div className="mt-14 grid md:grid-cols-4 gap-6">
          {t.process.steps.map((s, i) => (
            <motion.div
              key={i}
              className="rounded-3xl bg-brand-dark2/65 border border-white/10 p-6"
              whileHover={{ y: -6 }}
              onMouseEnter={() => setHover(true, "hover")}
              onMouseLeave={() => setHover(false)}
            >
              <div className="text-brand-cyan font-black text-sm">
                {t.process.stepLabel} {i + 1}
              </div>
              <div className="mt-2 text-xl font-extrabold">{s.t}</div>
              <div className="mt-2 text-sm text-brand-silver/85">{s.d}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
