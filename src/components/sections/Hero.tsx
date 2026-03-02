"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { BUSINESS, HERO_BANNER_SETTINGS, HERO_BANNER_SLIDES } from "@/lib/constants";
import { generateWhatsAppLink, scrollToSection } from "@/lib/utils";
import { useCursor } from "@/components/providers/CursorProvider";
import { useSiteConfig } from "./useSiteConfig";

const HERO_LOREM_TEXT = {
  badge: "Lorem ipsum dolor",
  title: "Lorem ipsum dolor sit amet",
  highlight: "consectetur adipiscing",
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  buttonText: "Lorem ipsum",
  whatsappMessage: "Lorem ipsum dolor sit amet",
  seeServices: "Lorem ipsum services",
  address: "Lorem ipsum street, 123",
};

export function Hero() {
  const { setHover } = useCursor();
  const cfg = useSiteConfig();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const bannerSettings = cfg.heroBanner?.settings ?? HERO_BANNER_SETTINGS;
  const slides = cfg.heroBanner?.slides?.length ? cfg.heroBanner.slides : HERO_BANNER_SLIDES;
  const colors = cfg.appearance.textColors;
  const slidesCount = slides.length;
  const activeSlide = slides[activeSlideIndex];
  const slideText = HERO_LOREM_TEXT;

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
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
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
        className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-brand-cyan/18 blur-[120px]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-brand-blue/18 blur-[140px]"
        animate={{ scale: [1.15, 1, 1.15], opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-24">
        <motion.div
          key={`${activeSlideIndex}-badge`}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-sm shadow-glow"
          style={{ color: colors.heroBadge }}
          onMouseEnter={() => setHover(true, "cta")}
          onMouseLeave={() => setHover(false)}
        >
          <Sparkles className="w-4 h-4" />
          <span>{slideText.badge}</span>
        </motion.div>

        <motion.h1
          key={`${activeSlideIndex}-title`}
          className="mt-7 text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight"
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          style={{ textShadow: "0 0 35px rgba(0,240,255,0.18)", color: colors.heroTitle }}
        >
          {slideText.title} <span style={{ color: colors.heroHighlight }}>{slideText.highlight}</span>
        </motion.h1>

        <motion.p
          key={`${activeSlideIndex}-desc`}
          className="mt-6 text-lg sm:text-xl max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ color: colors.heroDescription }}
        >
          {slideText.description}
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <motion.a
            href={generateWhatsAppLink(BUSINESS.whatsapp, slideText.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-brand-cyan text-brand-dark font-black text-lg shadow-glowStrong"
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
            className="px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold hover:border-brand-cyan/60 hover:text-brand-cyan bg-black/10"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onMouseEnter={() => setHover(true, "hover")}
            onMouseLeave={() => setHover(false)}
          >
            {slideText.seeServices}
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
              aria-label={`Lorem ipsum slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="mt-10 text-sm text-brand-silver/70">{slideText.address}</div>
      </div>
    </section>
  );
}
