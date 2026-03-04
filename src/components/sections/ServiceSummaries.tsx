"use client";

import { useMemo, useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { adaptiveThemeColor } from "@/lib/theme-colors";
import { useSiteConfig } from "./useSiteConfig";

function getYouTubeEmbed(url: string): string | null {
  const value = url.trim();
  if (!value) return null;
  const watchMatch = value.match(/[?&]v=([^&]+)/);
  if (watchMatch?.[1]) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  const shortMatch = value.match(/youtu\.be\/([^?&]+)/);
  if (shortMatch?.[1]) return `https://www.youtube.com/embed/${shortMatch[1]}`;
  const embedMatch = value.match(/youtube\.com\/embed\/([^?&]+)/);
  if (embedMatch?.[1]) return value;
  return null;
}

function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|#|$)/i.test(url.trim());
}

export function ServiceSummaries({ sectionId = "service-details" }: { sectionId?: string }) {
  const cfg = useSiteConfig();
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const infoServices = useMemo(
    () => cfg.services.filter((service) => service.infoEnabled !== false),
    [cfg.services]
  );
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);

  const activeService =
    infoServices.find((service) => service.id === (activeServiceId ?? infoServices[0]?.id)) ?? infoServices[0] ?? null;

  const translated = activeService ? cfg.i18n?.[language]?.services?.[activeService.id] ?? t.services.items[activeService.id] : null;
  const serviceName = activeService ? (language === "ca" ? activeService.name : translated?.name ?? activeService.name) : "";
  const serviceDescription = activeService
    ? language === "ca"
      ? activeService.infoSummary?.trim() || activeService.description
      : translated?.infoSummary?.trim() ||
        activeService.infoSummary?.trim() ||
        translated?.description ||
        activeService.description
    : "";
  const serviceFaq =
    language === "ca"
      ? activeService?.faq ?? []
      : translated?.faq?.length
      ? translated.faq
      : activeService?.faq ?? [];
  const mediaImage = activeService?.infoImageUrl?.trim() || activeService?.imageUrl || "";
  const mediaVideo = activeService?.videoUrl?.trim() || "";
  const youtubeEmbed = getYouTubeEmbed(mediaVideo);
  const directVideo = isDirectVideo(mediaVideo);

  const openOzoneFaq = () => {
    const ozoneService = infoServices.find((service) => service.id === "ozone");
    if (!ozoneService) return;
    const ozoneTranslated = cfg.i18n?.[language]?.services?.[ozoneService.id] ?? t.services.items[ozoneService.id];
    const ozoneFaq =
      language === "ca"
        ? ozoneService.faq ?? []
        : ozoneTranslated?.faq?.length
        ? ozoneTranslated.faq
        : ozoneService.faq ?? [];
    const bestIndex =
      ozoneFaq.findIndex((item) => /cigar|tabac|smoke/i.test(`${item.q} ${item.a}`)) >= 0
        ? ozoneFaq.findIndex((item) => /cigar|tabac|smoke/i.test(`${item.q} ${item.a}`))
        : 0;
    setActiveServiceId("ozone");
    setOpenFaqIndex(bestIndex);
  };

  const colors = {
    sectionTitle: adaptiveThemeColor(cfg.appearance.textColors.servicesTitle, theme, "#0F172A"),
    sectionHighlight: adaptiveThemeColor(cfg.appearance.textColors.servicesHighlight, theme, "#0EA5E9"),
    title: adaptiveThemeColor(cfg.appearance.textColors.servicesCardTitle, theme, "#0F172A"),
    text: adaptiveThemeColor(cfg.appearance.textColors.servicesCardDescription, theme, "#334155", 0.38),
  };

  const labels = {
    ca: {
      title: "Informacio completa de",
      highlight: "cada servei",
      subtitle: "Explicacio directa, imagens reals e FAQ por servico.",
      faq: "Preguntes frequents",
      empty: "Sem servicos marcados para infos.",
    },
    es: {
      title: "Informacion completa de",
      highlight: "cada servicio",
      subtitle: "Explicacion directa, imagenes reales y FAQ por servicio.",
      faq: "Preguntas frecuentes",
      empty: "No hay servicios marcados para infos.",
    },
    en: {
      title: "Complete info for",
      highlight: "each service",
      subtitle: "Clear explanation, real visuals and a service-specific FAQ.",
      faq: "Frequently asked questions",
      empty: "No services enabled for info.",
    },
  } as const;
  const copy = labels[language];
  const faqLinkTokenByLanguage: Record<"ca" | "es" | "en", string> = {
    ca: "neutralitzacio d'olor",
    es: "neutralizacion de olor",
    en: "odor neutralization",
  };
  const faqLinkToken = faqLinkTokenByLanguage[language];

  if (!infoServices.length) {
    return (
      <section id={sectionId} className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-brand-silver/80 sm:px-6">{copy.empty}</div>
      </section>
    );
  }

  return (
    <section id={sectionId} className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black sm:text-5xl" style={{ color: colors.sectionTitle }}>
            {copy.title} <span style={{ color: colors.sectionHighlight }}>{copy.highlight}</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base" style={{ color: theme === "light" ? "#334155" : "rgba(192,192,200,0.9)" }}>
            {copy.subtitle}
          </p>
        </div>

        <div className="mt-8 flex flex-wrap gap-2 sm:mt-10">
          {infoServices.map((service) => {
            const local = cfg.i18n?.[language]?.services?.[service.id] ?? t.services.items[service.id];
            const label = language === "ca" ? service.name : local?.name ?? service.name;
            const active = service.id === activeService?.id;
            return (
              <button
                key={`service-tab-${service.id}`}
                type="button"
                onClick={() => {
                  setActiveServiceId(service.id);
                  setOpenFaqIndex(0);
                }}
                className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  active
                    ? "border-brand-cyan/55 bg-brand-cyan/15 text-brand-cyan"
                    : "border-white/10 bg-black/20 text-brand-silver/85 hover:border-brand-cyan/35 hover:text-brand-cyan"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="overflow-hidden rounded-3xl border border-white/10 bg-brand-dark2/65">
            <div className="h-56 overflow-hidden border-b border-white/10 bg-black/20 sm:h-72">
              {youtubeEmbed ? (
                <iframe
                  src={youtubeEmbed}
                  title={`${serviceName} video`}
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="h-full w-full"
                />
              ) : directVideo ? (
                <video src={mediaVideo} controls playsInline className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${mediaImage})` }} />
              )}
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="text-2xl font-black sm:text-3xl" style={{ color: colors.title }}>
                {serviceName}
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed sm:text-base" style={{ color: colors.text }}>
                {serviceDescription}
              </p>
            </div>
          </article>

          <aside className="rounded-3xl border border-white/10 bg-brand-dark2/65 p-4 sm:p-5">
            <div className="inline-flex items-center gap-2 text-sm font-bold text-brand-cyan">
              <HelpCircle className="h-4 w-4" />
              {copy.faq}
            </div>
            <div className="mt-4 space-y-2">
              {serviceFaq.length ? (
                serviceFaq.map((item, index) => {
                  const open = openFaqIndex === index;
                  return (
                    <div key={`faq-item-${index}`} className="rounded-xl border border-white/10 bg-black/20">
                      <button
                        type="button"
                        onClick={() => setOpenFaqIndex((prev) => (prev === index ? -1 : index))}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-white"
                      >
                        <span>{item.q}</span>
                        <ChevronDown className={`h-4 w-4 text-brand-cyan transition ${open ? "rotate-180" : ""}`} />
                      </button>
                      {open ? (
                        <div className="border-t border-white/10 px-4 py-3 text-sm text-brand-silver/85">
                          {item.a.toLowerCase().includes(faqLinkToken.toLowerCase()) ? (
                            <>
                              {item.a.split(new RegExp(`(${faqLinkToken})`, "i")).map((chunk, partIndex) =>
                                chunk.toLowerCase() === faqLinkToken.toLowerCase() ? (
                                  <button
                                    key={`faq-link-${index}-${partIndex}`}
                                    type="button"
                                    onClick={openOzoneFaq}
                                    className="font-semibold text-brand-cyan underline underline-offset-4 transition hover:text-cyan-300"
                                  >
                                    {chunk}
                                  </button>
                                ) : (
                                  <span key={`faq-text-${index}-${partIndex}`}>{chunk}</span>
                                )
                              )}
                            </>
                          ) : (
                            item.a
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-brand-silver/80">
                  FAQ ainda nao configurado para este servico.
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
