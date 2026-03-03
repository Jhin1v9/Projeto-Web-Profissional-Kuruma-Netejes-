"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { useCursor } from "@/components/providers/CursorProvider";
import { SERVICE_PRICING_BY_ID } from "@/lib/constants";
import { eur } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { adaptiveThemeColor } from "@/lib/theme-colors";
import { useSiteConfig } from "./useSiteConfig";

export function Services({ sectionId = "services" }: { sectionId?: string }) {
  const { setHover } = useCursor();
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const cfg = useSiteConfig();
  const colors = {
    servicesTitle: adaptiveThemeColor(cfg.appearance.textColors.servicesTitle, theme, "#0F172A"),
    servicesHighlight: adaptiveThemeColor(cfg.appearance.textColors.servicesHighlight, theme, "#0EA5E9"),
    servicesCardTitle: adaptiveThemeColor(cfg.appearance.textColors.servicesCardTitle, theme, "#0F172A"),
    servicesCardPrice: adaptiveThemeColor(cfg.appearance.textColors.servicesCardPrice, theme, "#0284C7"),
    servicesCardDescription: adaptiveThemeColor(cfg.appearance.textColors.servicesCardDescription, theme, "#334155"),
    servicesCardBullet: adaptiveThemeColor(cfg.appearance.textColors.servicesCardBullet, theme, "#334155"),
  };
  const totalServices = cfg.services.length;

  const desktopCols = useMemo(() => {
    if (totalServices <= 1) return 1;
    if (totalServices === 2) return 2;
    if (totalServices === 3) return 3;
    if (totalServices % 4 !== 1) return 4;
    if (totalServices % 3 !== 1) return 3;
    return 2;
  }, [totalServices]);

  const desktopColsClass =
    desktopCols === 1
      ? "xl:grid-cols-1"
      : desktopCols === 2
      ? "xl:grid-cols-2"
      : desktopCols === 3
      ? "xl:grid-cols-3"
      : "xl:grid-cols-4";

  return (
    <section id={sectionId} className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
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

        <div className={`mt-10 grid gap-5 sm:mt-14 sm:grid-cols-2 ${desktopColsClass} xl:gap-7`}>
          {cfg.services.map((service, index) => {
            const translated = cfg.i18n?.[language]?.services?.[service.id] ?? t.services.items[service.id];
            const name = language === "ca" ? service.name : translated?.name ?? service.name;
            const description = language === "ca" ? service.description : translated?.description ?? service.description;
            const highlights = language === "ca" ? service.highlights : translated?.highlights ?? service.highlights;
            const isLast = index === totalServices - 1;
            const isOddOnMobileGrid = totalServices % 2 === 1;
            const shouldCenterLastOnMobile = isLast && isOddOnMobileGrid && totalServices > 1;

            return (
              <motion.div
                key={service.id}
                className={`group relative h-full ${
                  shouldCenterLastOnMobile
                    ? "sm:col-span-2 sm:mx-auto sm:w-full sm:max-w-[420px] xl:col-span-1 xl:mx-0 xl:max-w-none"
                    : ""
                }`}
                whileHover={{ y: -6 }}
                onMouseEnter={() => setHover(true, service.popular ? "cta" : "hover")}
                onMouseLeave={() => setHover(false)}
              >
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-brand-cyan to-brand-blue opacity-0 group-hover:opacity-100 blur transition" />
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-brand-dark2/70">
                  <div className="h-40 bg-cover bg-center sm:h-44" style={{ backgroundImage: `url(${service.imageUrl})` }} />
                  <div className="flex flex-1 flex-col p-5 sm:p-7">
                    {service.popular ? (
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-cyan text-brand-dark text-xs font-black">
                        <Star className="w-3 h-3" fill="currentColor" /> {t.services.mostRequested}
                      </div>
                    ) : (
                      <div className="h-6" />
                    )}
                    <h3 className="mt-3 min-h-[3.2rem] text-xl font-extrabold leading-tight sm:mt-4 sm:min-h-[3.8rem] sm:text-2xl" style={{ color: colors.servicesCardTitle }}>
                      {name}
                    </h3>
                    <div className="mt-2 text-base font-black sm:text-lg" style={{ color: colors.servicesCardPrice }}>
                      {t.services.fromLabel} {eur(service.priceFrom ?? SERVICE_PRICING_BY_ID[service.id])}
                    </div>
                    <p className="mt-3 min-h-[5.4rem] whitespace-pre-line text-sm leading-relaxed sm:mt-4 sm:min-h-[6.2rem] sm:text-base" style={{ color: colors.servicesCardDescription }}>
                      {description}
                    </p>
                    <ul className="mt-4 flex-1 space-y-2.5 sm:mt-6 sm:space-y-3">
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
