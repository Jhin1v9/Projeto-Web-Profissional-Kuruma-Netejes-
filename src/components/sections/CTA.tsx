"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { generateWhatsAppLink } from "@/lib/utils";
import { useCursor } from "@/components/providers/CursorProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSiteConfig } from "./useSiteConfig";

export function CTA({ sectionId = "cta" }: { sectionId?: string }) {
  const { setHover } = useCursor();
  const { language, t } = useLanguage();
  const cfg = useSiteConfig();
  const colors = cfg.appearance.textColors;
  const displayCta = language === "ca" ? cfg.cta : cfg.i18n?.[language]?.cta ?? t.cta;

  return (
    <section id={sectionId} className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-3xl font-black sm:text-5xl lg:text-6xl" style={{ color: colors.ctaTitle }}>
            {displayCta.title} <span style={{ color: colors.ctaHighlight }}>{displayCta.highlight}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base sm:mt-5 sm:text-lg" style={{ color: colors.ctaDescription }}>
            {displayCta.description}
          </p>
          <a
            href={generateWhatsAppLink(BUSINESS.whatsapp, displayCta.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-cyan px-7 py-3.5 text-base font-black text-brand-dark shadow-glowStrong sm:mt-10 sm:w-auto sm:px-10 sm:py-5 sm:text-xl"
            style={{ color: colors.ctaButtonText }}
            onMouseEnter={() => setHover(true, "cta")}
            onMouseLeave={() => setHover(false)}
          >
            {displayCta.button} <ArrowRight className="w-6 h-6" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
