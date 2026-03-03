import type { HeroBannerSlide, PriceValue } from "@/lib/constants";
import type {
  Language,
  SlideText,
  ServiceText,
  CtaText,
  EstimateText,
  NavbarText,
  ProcessText,
  LocationText,
  FooterText,
} from "@/lib/i18n";

export type CursorMode = "realistic" | "neon" | "off";
export type BusinessStatus = "open" | "closing" | "closed";
export type SectionType = "hero" | "services" | "estimate" | "process" | "location" | "cta" | "footer";

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
    lightTextureUrl?: string;
    textureOpacityDark?: number;
    textureOpacityLight?: number;
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
  layout: {
    sections: Array<{
      id: string;
      type: SectionType;
      enabled: boolean;
      mobile: boolean;
      desktop: boolean;
    }>;
  };
  heroBanner: {
    settings: HeroBannerSettings;
    slides: HeroBannerSlide[];
  };
  navbar: NavbarText;
  process: ProcessText;
  businessStatus: BusinessStatus;
  location: LocationText;
  cta: CtaText;
  footer: FooterText;
  estimate: EstimateText;
  i18n?: Partial<
    Record<
      Language,
      {
        navbar: NavbarText;
        heroSlides: SlideText[];
        services: Record<string, ServiceText>;
        process: ProcessText;
        location: LocationText;
        cta: CtaText;
        footer: FooterText;
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
