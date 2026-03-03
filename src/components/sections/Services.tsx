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
    <section id="services" className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black sm:text-5xl" style={{ color: colors.servicesTitle }}>
            {t.services.title} <span style={{ color: colors.servicesHighlight }}>{t.services.highlight}</span>
          </h2>
          <p className="mt-3 text-base text-brand-silver/90 sm:mt-4 sm:text-lg">{t.services.subtitle}</p>
        </div>

        <div className="mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 xl:grid-cols-4 xl:gap-7">
          {cfg.services.map((service) => {
            const translated = cfg.i18n?.[language]?.services?.[service.id] ?? t.services.items[service.id];
            const name = language === "ca" ? service.name : translated?.name ?? service.name;
            const description = language === "ca" ? service.description : translated?.description ?? service.description;
            const highlights = language === "ca" ? service.highlights : translated?.highlights ?? service.highlights;

            return (
              <motion.div
                key={service.id}
                className="relative group"
                whileHover={{ y: -6 }}
                onMouseEnter={() => setHover(true, service.popular ? "cta" : "hover")}
                onMouseLeave={() => setHover(false)}
              >
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-brand-cyan to-brand-blue opacity-0 group-hover:opacity-100 blur transition" />
                <div className="relative rounded-3xl bg-brand-dark2/70 border border-white/10 overflow-hidden">
                  <div className="h-40 bg-cover bg-center sm:h-44" style={{ backgroundImage: `url(${service.imageUrl})` }} />
                  <div className="p-5 sm:p-7">
                    {service.popular && (
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-cyan text-brand-dark text-xs font-black">
                        <Star className="w-3 h-3" fill="currentColor" /> {t.services.mostRequested}
                      </div>
                    )}
                    <h3 className="mt-3 text-xl font-extrabold sm:mt-4 sm:text-2xl" style={{ color: colors.servicesCardTitle }}>
                      {name}
                    </h3>
                    <div className="mt-2 text-base font-black sm:text-lg" style={{ color: colors.servicesCardPrice }}>
                      {t.services.fromLabel} {eur(SERVICE_PRICING_BY_ID[service.id] ?? service.priceFrom)}
                    </div>
                    <p className="mt-3 text-sm leading-relaxed sm:mt-4 sm:text-base" style={{ color: colors.servicesCardDescription }}>
                      {description}
                    </p>
                    <ul className="mt-4 space-y-2.5 sm:mt-6 sm:space-y-3">
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
