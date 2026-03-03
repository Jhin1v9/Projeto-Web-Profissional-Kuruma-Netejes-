"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { BUSINESS, HERO_BANNER_SETTINGS, HERO_BANNER_SLIDES } from "@/lib/constants";
import { TRANSLATIONS } from "@/lib/i18n";
import { eur, generateWhatsAppLink, scrollToSection } from "@/lib/utils";
import { useCursor } from "@/components/providers/CursorProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSiteConfig } from "./useSiteConfig";

export function Hero() {
  const { setHover } = useCursor();
  const cfg = useSiteConfig();
  const { language, t } = useLanguage();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const bannerSettings = cfg.heroBanner?.settings ?? HERO_BANNER_SETTINGS;
  const slides = cfg.heroBanner?.slides?.length ? cfg.heroBanner.slides : HERO_BANNER_SLIDES;
  const colors = cfg.appearance.textColors;
  const slidesCount = slides.length;
  const activeSlide = slides[activeSlideIndex];
  const translatedSlide = cfg.i18n?.[language]?.heroSlides?.[activeSlideIndex] ?? TRANSLATIONS[language].hero.slides[activeSlideIndex];
  const slideText =
    language === "ca" || !translatedSlide
      ? {
          badge: activeSlide.badge,
          title: activeSlide.title,
          highlight: activeSlide.highlight,
          description: activeSlide.description,
          buttonText: activeSlide.buttonText,
          whatsappMessage: activeSlide.whatsappMessage,
        }
      : translatedSlide;

  useEffect(() => {
    if (!slidesCount) return;
    const interval = window.setInterval(() => {
      setActiveSlideIndex((prev) => (prev + 1) % slidesCount);
    }, bannerSettings.autoSlideIntervalMs);

    return () => window.clearInterval(interval);
  }, [bannerSettings.autoSlideIntervalMs, slidesCount]);

  useEffect(() => {
    if (activeSlideIndex >= slidesCount) setActiveSlideIndex(0);
  }, [activeSlideIndex, slidesCount]);

  const overlayGradient = useMemo(() => {
    const { top, middle, bottom } = bannerSettings.overlayDarkness;
    return `linear-gradient(to bottom, rgba(10,10,15,${top}) 0%, rgba(10,10,15,${middle}) 45%, rgba(10,10,15,${bottom}) 100%)`;
  }, [bannerSettings.overlayDarkness]);

  const bottomFadeStart = `${bannerSettings.bottomFadeStartPercent}%`;

  return (
    <section id="hero" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden pt-16 sm:pt-20">
      <div
        className="absolute inset-0"
        style={{
          maskImage: `linear-gradient(to bottom, black 0%, black ${bottomFadeStart}, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to bottom, black 0%, black ${bottomFadeStart}, transparent 100%)`,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.image}
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${activeSlide.image})`,
              backgroundSize: activeSlide.imageSize,
              backgroundPosition: activeSlide.imagePosition,
              opacity: bannerSettings.imageOpacity,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: bannerSettings.imageOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeInOut" }}
          />
        </AnimatePresence>
      </div>

      <div className="absolute inset-0 bg-hero-sheen" />
      <div className="absolute inset-0" style={{ background: overlayGradient }} />

      <motion.div
        className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-brand-cyan/18 blur-[110px] sm:h-80 sm:w-80"
        animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-brand-blue/18 blur-[130px] sm:h-96 sm:w-96"
        animate={{ scale: [1.15, 1, 1.15], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10 text-center sm:px-6 sm:pb-14 md:pb-20">
        <motion.div
          key={`${activeSlideIndex}-badge`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex max-w-full items-center gap-2 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-3 py-1.5 text-xs text-brand-cyan shadow-glow sm:px-4 sm:py-2 sm:text-sm"
          style={{ color: colors.heroBadge }}
          onMouseEnter={() => setHover(true, "cta")}
          onMouseLeave={() => setHover(false)}
        >
          <Sparkles className="w-4 h-4" />
          <span>{slideText.badge}</span>
        </motion.div>

        <motion.h1
          key={`${activeSlideIndex}-title`}
          className="mt-6 text-[clamp(2rem,9vw,4.6rem)] font-black leading-[0.98] tracking-tight"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          style={{ textShadow: "0 0 35px rgba(0,240,255,0.18)", color: colors.heroTitle }}
        >
          {slideText.title} <span style={{ color: colors.heroHighlight }}>{slideText.highlight}</span>
          {activeSlide.price !== undefined ? ` ${eur(activeSlide.price)}` : ""}
        </motion.h1>

        <motion.p
          key={`${activeSlideIndex}-desc`}
          className="mx-auto mt-5 max-w-3xl text-base leading-relaxed sm:mt-6 sm:text-lg lg:text-xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ color: colors.heroDescription }}
        >
          {slideText.description}
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-10 sm:flex-row sm:items-center sm:gap-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.a
            href={generateWhatsAppLink(BUSINESS.whatsapp, slideText.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-cyan px-6 py-3.5 text-base font-black text-brand-dark shadow-glowStrong sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
            style={{ color: colors.heroButtonText }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onMouseEnter={() => setHover(true, "cta")}
            onMouseLeave={() => setHover(false)}
          >
            {slideText.buttonText} <ArrowRight className="w-5 h-5" />
          </motion.a>

          <motion.button
            onClick={() => scrollToSection("services")}
            className="w-full rounded-2xl border border-white/20 bg-black/10 px-6 py-3.5 text-base font-semibold text-white hover:border-brand-cyan/60 hover:text-brand-cyan sm:w-auto sm:px-8 sm:py-4"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onMouseEnter={() => setHover(true, "hover")}
            onMouseLeave={() => setHover(false)}
          >
            {t.hero.seeServices}
          </motion.button>
        </motion.div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {slides.map((slide, index) => (
            <button
              key={`${slide.image}-${index}`}
              type="button"
              onClick={() => setActiveSlideIndex(index)}
              className={`h-2.5 rounded-full transition-all ${
                index === activeSlideIndex ? "w-8 bg-brand-cyan" : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={`Ir para slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="mt-7 text-xs text-brand-silver/75 sm:mt-10 sm:text-sm">{BUSINESS.address.street}</div>
      </div>
    </section>
  );
}
