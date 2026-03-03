"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, X } from "lucide-react";
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
  const [openServiceId, setOpenServiceId] = useState<string | null>(null);
  const colors = {
    title: adaptiveThemeColor(cfg.appearance.textColors.servicesTitle, theme, "#0F172A"),
    highlight: adaptiveThemeColor(cfg.appearance.textColors.servicesHighlight, theme, "#0EA5E9"),
    cardTitle: adaptiveThemeColor(cfg.appearance.textColors.servicesCardTitle, theme, "#0F172A"),
    cardDescription: adaptiveThemeColor(cfg.appearance.textColors.servicesCardDescription, theme, "#334155", 0.38),
    bullet: adaptiveThemeColor(cfg.appearance.textColors.servicesCardBullet, theme, "#334155", 0.38),
  };

  const labels = {
    ca: {
      title: "Resum de cada",
      highlight: "servei",
      subtitle: "Detalls clars de cada servei en un format visual consistent.",
      readMore: "Llegir mes",
      close: "Tancar",
      modalTitle: "Detalls complets",
    },
    es: {
      title: "Resumen de cada",
      highlight: "servicio",
      subtitle: "Detalles claros de cada servicio en un formato visual consistente.",
      readMore: "Leer mas",
      close: "Cerrar",
      modalTitle: "Detalles completos",
    },
    en: {
      title: "Summary of each",
      highlight: "service",
      subtitle: "Clear details for each service in a consistent visual format.",
      readMore: "Read more",
      close: "Close",
      modalTitle: "Full details",
    },
  } as const;
  const copy = labels[language];

  const activeService = openServiceId
    ? cfg.services.find((service) => service.id === openServiceId) ?? null
    : null;

  const activeTranslated = activeService
    ? cfg.i18n?.[language]?.services?.[activeService.id] ?? t.services.items[activeService.id]
    : null;

  const activeName = activeService
    ? language === "ca"
      ? activeService.name
      : activeTranslated?.name ?? activeService.name
    : "";
  const activeDescription = activeService
    ? language === "ca"
      ? activeService.description
      : activeTranslated?.description ?? activeService.description
    : "";
  const activeHighlights = activeService
    ? language === "ca"
      ? activeService.highlights
      : activeTranslated?.highlights ?? activeService.highlights
    : [];

  return (
    <section id={sectionId} className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black sm:text-5xl" style={{ color: colors.title }}>
            {copy.title} <span style={{ color: colors.highlight }}>{copy.highlight}</span>
          </h2>
          <p className="mt-3 text-sm sm:text-base" style={{ color: theme === "light" ? "#334155" : "rgba(192,192,200,0.9)" }}>
            {copy.subtitle}
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-7">
          {cfg.services.map((service, index) => {
            const translated = cfg.i18n?.[language]?.services?.[service.id] ?? t.services.items[service.id];
            const name = language === "ca" ? service.name : translated?.name ?? service.name;
            const description = language === "ca" ? service.description : translated?.description ?? service.description;
            const highlights = language === "ca" ? service.highlights : translated?.highlights ?? service.highlights;
            const showReadMore = description.length > 130;
            const videoUrl = (service.videoUrl ?? "").trim();
            const youtubeEmbed = getYouTubeEmbed(videoUrl);
            const directVideo = isDirectVideo(videoUrl);

            return (
              <motion.article
                key={`service-summary-${service.id}`}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.08, 0.32) }}
                className="group relative h-full"
              >
                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-r from-brand-cyan/50 to-brand-blue/40 opacity-0 blur transition group-hover:opacity-70" />
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-brand-dark2/70">
                  <div className="h-44 overflow-hidden border-b border-white/10 bg-black/20">
                    {youtubeEmbed ? (
                      <iframe
                        src={youtubeEmbed}
                        title={`${name} video`}
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    ) : directVideo ? (
                      <video
                        src={videoUrl}
                        muted
                        loop
                        autoPlay
                        playsInline
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${service.imageUrl})` }} />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="min-h-[3.2rem] text-xl font-black leading-tight" style={{ color: colors.cardTitle }}>
                      {name}
                    </h3>
                    <p
                      className="mt-3 min-h-[4.4rem] whitespace-pre-line text-sm leading-relaxed"
                      style={{
                        color: colors.cardDescription,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {description}
                    </p>
                    {showReadMore ? (
                      <button
                        type="button"
                        onClick={() => setOpenServiceId(service.id)}
                        className="mt-3 inline-flex w-fit rounded-lg border border-brand-cyan/35 bg-brand-cyan/10 px-3 py-1.5 text-xs font-semibold text-brand-cyan hover:bg-brand-cyan/15"
                      >
                        {copy.readMore}
                      </button>
                    ) : null}
                    <ul className="mt-4 space-y-2.5">
                      {highlights.slice(0, 3).map((item, i) => (
                        <li key={`${service.id}-summary-bullet-${i}`} className="flex items-start gap-2.5 text-sm sm:text-base" style={{ color: colors.bullet }}>
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan sm:h-5 sm:w-5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>

      {activeService ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpenServiceId(null)}
            aria-label={copy.close}
          />
          <div className="relative z-[71] w-full max-w-2xl rounded-3xl border border-white/10 bg-brand-dark2 p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.08em] text-brand-cyan">{copy.modalTitle}</div>
                <h3 className="mt-1 text-2xl font-black text-white">{activeName}</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpenServiceId(null)}
                className="rounded-lg border border-white/15 p-2 text-brand-silver/80 hover:border-brand-cyan/45 hover:text-brand-cyan"
                aria-label={copy.close}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {(() => {
              const modalVideoUrl = (activeService.videoUrl ?? "").trim();
              const modalYouTube = getYouTubeEmbed(modalVideoUrl);
              const modalDirectVideo = isDirectVideo(modalVideoUrl);
              if (!modalYouTube && !modalDirectVideo) return null;
              return (
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
                  {modalYouTube ? (
                    <iframe
                      src={modalYouTube}
                      title={`${activeName} video`}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="h-56 w-full sm:h-72"
                    />
                  ) : (
                    <video
                      src={modalVideoUrl}
                      controls
                      playsInline
                      className="h-56 w-full object-cover sm:h-72"
                    />
                  )}
                </div>
              );
            })()}
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-brand-silver/90 sm:text-base">{activeDescription}</p>
            <ul className="mt-5 space-y-2.5">
              {activeHighlights.map((item, i) => (
                <li key={`modal-highlight-${i}`} className="flex items-start gap-2.5 text-sm text-brand-silver/90 sm:text-base">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-cyan sm:h-5 sm:w-5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </section>
  );
}
