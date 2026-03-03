import type { HeroBannerSlide, PriceValue } from "@/lib/constants";
import type { Language, SlideText, ServiceText, CtaText, EstimateText } from "@/lib/i18n";

export type CursorMode = "realistic" | "neon" | "off";

export type HeroBannerSettings = {
  autoSlideIntervalMs: number;
  imageOpacity: number;
  overlayDarkness: {
    top: number;
    middle: number;
    bottom: number;
  };
  bottomFadeStartPercent: number;
};

export type SiteConfig = {
  appearance: {
    brightness: number;
    overlay: number;
    showTexture: boolean;
    textureUrl: string;
    cursorMode: CursorMode;
    textColors: {
      heroBadge: string;
      heroTitle: string;
      heroHighlight: string;
      heroDescription: string;
      heroButtonText: string;
      servicesTitle: string;
      servicesHighlight: string;
      servicesCardTitle: string;
      servicesCardPrice: string;
      servicesCardDescription: string;
      servicesCardBullet: string;
      ctaTitle: string;
      ctaHighlight: string;
      ctaDescription: string;
      ctaButtonText: string;
    };
  };
  hero: {
    title: string;
    subtitle: string;
    badge?: string;
    imageUrl: string;
  };
  heroBanner: {
    settings: HeroBannerSettings;
    slides: HeroBannerSlide[];
  };
  estimate: EstimateText;
  i18n?: Partial<
    Record<
      Language,
      {
        heroSlides: SlideText[];
        services: Record<string, ServiceText>;
        cta: CtaText;
        estimate: EstimateText;
      }
    >
  >;
  services: Array<{
    id: string;
    name: string;
    description: string;
    priceFrom: PriceValue;
    imageUrl: string;
    popular?: boolean;
    estimateEnabled?: boolean;
    estimateLabel?: string;
    highlights: string[];
  }>;
};
