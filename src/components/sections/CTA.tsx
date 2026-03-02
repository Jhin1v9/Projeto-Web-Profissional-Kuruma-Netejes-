"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { generateWhatsAppLink } from "@/lib/utils";
import { useCursor } from "@/components/providers/CursorProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSiteConfig } from "./useSiteConfig";

export function CTA() {
  const { setHover } = useCursor();
  const { language, t } = useLanguage();
  const cfg = useSiteConfig();
  const colors = cfg.appearance.textColors;
  const ctaText = cfg.i18n?.[language]?.cta;
  const displayCta = ctaText ?? t.cta;

  return (
    <section className="relative py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl sm:text-6xl font-black" style={{ color: colors.ctaTitle }}>
            {displayCta.title} <span style={{ color: colors.ctaHighlight }}>{displayCta.highlight}</span>
          </h2>
          <p className="mt-5 text-lg" style={{ color: colors.ctaDescription }}>
            {displayCta.description}
          </p>
          <a
            href={generateWhatsAppLink(BUSINESS.whatsapp, displayCta.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-10 inline-flex items-center gap-2 rounded-2xl px-10 py-5 bg-brand-cyan text-brand-dark font-black text-xl shadow-glowStrong"
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
