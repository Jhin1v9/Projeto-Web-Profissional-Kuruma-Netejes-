"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useCursor } from "@/components/providers/CursorProvider";
import { SERVICE_PRICING_BY_ID } from "@/lib/constants";
import { eur } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSiteConfig } from "./useSiteConfig";

export function Services() {
  const { setHover } = useCursor();
  const { language, t } = useLanguage();
  const cfg = useSiteConfig();
  const colors = cfg.appearance.textColors;

  return (
    <section id="services" className="relative py-24 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-5xl font-black" style={{ color: colors.servicesTitle }}>
            {t.services.title} <span style={{ color: colors.servicesHighlight }}>{t.services.highlight}</span>
          </h2>
          <p className="mt-4 text-brand-silver/90 text-lg">{t.services.subtitle}</p>
        </div>

        <div className="mt-14 grid md:grid-cols-2 xl:grid-cols-4 gap-8">
          {cfg.services.map((service) => {
            const translated = cfg.i18n?.[language]?.services?.[service.id] ?? t.services.items[service.id];
            const name = language === "ca" ? service.name : translated?.name ?? service.name;
            const description = language === "ca" ? service.description : translated?.description ?? service.description;
            const highlights = language === "ca" ? service.highlights : translated?.highlights ?? service.highlights;

            return (
              <motion.div
                key={service.id}
                className="relative group"
                whileHover={{ y: -8 }}
                onMouseEnter={() => setHover(true, service.popular ? "cta" : "hover")}
                onMouseLeave={() => setHover(false)}
              >
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-brand-cyan to-brand-blue opacity-0 group-hover:opacity-100 blur transition" />
                <div className="relative rounded-3xl bg-brand-dark2/70 border border-white/10 overflow-hidden">
                  <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${service.imageUrl})` }} />
                  <div className="p-8">
                    {service.popular && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-cyan text-brand-dark text-xs font-black">
                        <Star className="w-3 h-3" fill="currentColor" /> {t.services.mostRequested}
                      </div>
                    )}
                    <h3 className="mt-4 text-2xl font-extrabold" style={{ color: colors.servicesCardTitle }}>
                      {name}
                    </h3>
                    <div className="mt-2 font-black text-lg" style={{ color: colors.servicesCardPrice }}>
                      {t.services.fromLabel} {eur(SERVICE_PRICING_BY_ID[service.id] ?? service.priceFrom)}
                    </div>
                    <p className="mt-4 leading-relaxed" style={{ color: colors.servicesCardDescription }}>
                      {description}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm" style={{ color: colors.servicesCardBullet }}>
                          <Check className="w-5 h-5 text-brand-cyan mt-0.5" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
