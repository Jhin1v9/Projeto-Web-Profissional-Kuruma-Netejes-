import { z } from "zod";
import type { SiteConfig } from "@/types/site-config";
import { TRANSLATIONS, type Language } from "@/lib/i18n";
import {
  DEFAULT_IMAGE_PATHS,
  HERO_BANNER_SETTINGS,
  HERO_BANNER_SLIDES,
  PRICING,
} from "./constants";

const HeroBannerSettingsSchema = z.object({
  autoSlideIntervalMs: z.number().int().min(1000).max(60000),
  imageOpacity: z.number().min(0).max(1),
  overlayDarkness: z.object({
    top: z.number().min(0).max(1),
    middle: z.number().min(0).max(1),
    bottom: z.number().min(0).max(1),
  }),
  bottomFadeStartPercent: z.number().min(0).max(100),
});

const HeroBannerSlideSchema = z.object({
  image: z.string().min(1),
  badge: z.string().min(1),
  title: z.string().min(1),
  highlight: z.string().min(1),
  price: z.union([z.number().min(0), z.string().min(1)]).optional(),
  description: z.string().min(1),
  buttonText: z.string().min(1),
  whatsappMessage: z.string().min(1),
  imageSize: z.string().min(1),
  imagePosition: z.string().min(1),
});

const TextColorsSchema = z.object({
  heroBadge: z.string().min(1),
  heroTitle: z.string().min(1),
  heroHighlight: z.string().min(1),
  heroDescription: z.string().min(1),
  heroButtonText: z.string().min(1),
  servicesTitle: z.string().min(1),
  servicesHighlight: z.string().min(1),
  servicesCardTitle: z.string().min(1),
  servicesCardPrice: z.string().min(1),
  servicesCardDescription: z.string().min(1),
  servicesCardBullet: z.string().min(1),
  ctaTitle: z.string().min(1),
  ctaHighlight: z.string().min(1),
  ctaDescription: z.string().min(1),
  ctaButtonText: z.string().min(1),
});

const LocalizedServiceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  highlights: z.array(z.string().min(1)).min(1),
});

const LocalizedHeroSlideSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  highlight: z.string().min(1),
  description: z.string().min(1),
  buttonText: z.string().min(1),
  whatsappMessage: z.string().min(1),
});

const LocalizedCtaSchema = z.object({
  title: z.string().min(1),
  highlight: z.string().min(1),
  description: z.string().min(1),
  button: z.string().min(1),
  whatsappMessage: z.string().min(1),
});

const LocalizedEstimateSchema = z.object({
  title: z.string().min(1),
  highlight: z.string().min(1),
  subtitle: z.string().min(1),
  helper: z.string().min(1),
  onRequest: z.string().min(1),
  total: z.string().min(1),
  note: z.string().min(1),
  cta: z.string().min(1),
  none: z.string().min(1),
  unknown: z.string().min(1),
});

const LocalizedLanguageSchema = z.object({
  heroSlides: z.array(LocalizedHeroSlideSchema).length(3),
  services: z.record(LocalizedServiceSchema),
  cta: LocalizedCtaSchema,
  estimate: LocalizedEstimateSchema,
});

export const SiteConfigSchema = z.object({
  appearance: z.object({
    brightness: z.number().min(0).max(1),
    overlay: z.number().min(0).max(1),
    showTexture: z.boolean(),
    textureUrl: z.string().min(1),
    cursorMode: z.enum(["realistic", "neon", "off"]),
    textColors: TextColorsSchema.optional(),
  }),
  hero: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    badge: z.string().optional(),
    imageUrl: z.string().min(1),
  }),
  heroBanner: z
    .object({
      settings: HeroBannerSettingsSchema,
      slides: z.array(HeroBannerSlideSchema).length(3),
    })
    .optional(),
  estimate: LocalizedEstimateSchema.optional(),
  i18n: z
    .object({
      ca: LocalizedLanguageSchema.optional(),
      es: LocalizedLanguageSchema.optional(),
      en: LocalizedLanguageSchema.optional(),
    })
    .optional(),
  services: z.array(
    z.object({
      id: z.string().min(1),
      name: z.string().min(1),
      description: z.string().min(1),
      priceFrom: z.union([z.number().min(0), z.string().min(1)]),
      imageUrl: z.string().min(1),
      popular: z.boolean().optional(),
      highlights: z.array(z.string().min(1)).min(1),
    })
  ),
});

export type SiteConfigInput = z.infer<typeof SiteConfigSchema>;

function getDefaultServices(): SiteConfig["services"] {
  return [
    {
      id: "interior",
      name: "Neteja interior",
      description: "Tapisseria, cuir i plastics. Eliminem taques i olors amb extraccio professional.",
      priceFrom: PRICING.interiorFrom,
      imageUrl: DEFAULT_IMAGE_PATHS.serviceBeforeAfter,
      popular: true,
      highlights: ["Extraccio profunda", "Taques i olors", "Acabat real, sense maquillatge"],
    },
    {
      id: "polishing",
      name: "Poliment exterior",
      description: "Correccio de micro-ratllades i acabat mirall amb brillantor real.",
      priceFrom: PRICING.polishingFrom,
      imageUrl: DEFAULT_IMAGE_PATHS.servicePolishing,
      highlights: ["Gloss mirall", "Correccio swirl", "Acabat premium"],
    },
    {
      id: "wash",
      name: "Rentat exterior premium",
      description: "Escuma activa, detall de llandes i assecat sense marques.",
      priceFrom: PRICING.washFrom,
      imageUrl: DEFAULT_IMAGE_PATHS.serviceFoam,
      highlights: ["Escuma activa", "Llandes", "Assecat microfibra"],
    },
    {
      id: "ozone",
      name: "Neteja per ozono",
      description: "Tractament amb ozono orientat a eliminar olor de tabac/cigarro, olor fort d'humitat i altres olors persistents de l'habitacle.",
      priceFrom: PRICING.ozoneFrom,
      imageUrl: DEFAULT_IMAGE_PATHS.serviceOzone,
      highlights: ["Reduccio d'olor a tabac/cigarro", "Combat olors persistents", "Ideal com a extra de neteja interior"],
    },
  ];
}

function getDefaultHeroBanner(): SiteConfig["heroBanner"] {
  return {
    settings: { ...HERO_BANNER_SETTINGS },
    slides: HERO_BANNER_SLIDES.map((slide) => ({ ...slide })),
  };
}

function getDefaultTextColors(): SiteConfig["appearance"]["textColors"] {
  return {
    heroBadge: "#00F0FF",
    heroTitle: "#FFFFFF",
    heroHighlight: "#00F0FF",
    heroDescription: "#D6D9E0",
    heroButtonText: "#0A0A0F",
    servicesTitle: "#FFFFFF",
    servicesHighlight: "#00F0FF",
    servicesCardTitle: "#FFFFFF",
    servicesCardPrice: "#00F0FF",
    servicesCardDescription: "#D6D9E0",
    servicesCardBullet: "#D6D9E0",
    ctaTitle: "#FFFFFF",
    ctaHighlight: "#00F0FF",
    ctaDescription: "#D6D9E0",
    ctaButtonText: "#0A0A0F",
  };
}

function getDefaultI18nLanguage(lang: Language): NonNullable<SiteConfig["i18n"]>[Language] {
  const t = TRANSLATIONS[lang];
  return {
    heroSlides: t.hero.slides.map((slide) => ({ ...slide })),
    services: Object.fromEntries(Object.entries(t.services.items).map(([id, value]) => [id, { ...value, highlights: [...value.highlights] }])),
    cta: { ...t.cta },
    estimate: { ...t.estimate },
  };
}

function getDefaultI18n(): NonNullable<SiteConfig["i18n"]> {
  return {
    es: getDefaultI18nLanguage("es"),
    en: getDefaultI18nLanguage("en"),
  };
}

export function normalizeSiteConfig(input: SiteConfigInput): SiteConfig {
  const heroBanner = input.heroBanner ?? getDefaultHeroBanner();
  const estimate = input.estimate ?? { ...TRANSLATIONS.ca.estimate };
  const textColors = {
    ...getDefaultTextColors(),
    ...(input.appearance.textColors ?? {}),
  };
  const services = input.services.length > 0 ? input.services : getDefaultServices();
  const defaults = getDefaultI18n();

  const i18n: NonNullable<SiteConfig["i18n"]> = {
    es: {
      heroSlides: input.i18n?.es?.heroSlides ?? defaults.es!.heroSlides,
      services: { ...defaults.es!.services, ...(input.i18n?.es?.services ?? {}) },
      cta: { ...defaults.es!.cta, ...(input.i18n?.es?.cta ?? {}) },
      estimate: { ...defaults.es!.estimate, ...(input.i18n?.es?.estimate ?? {}) },
    },
    en: {
      heroSlides: input.i18n?.en?.heroSlides ?? defaults.en!.heroSlides,
      services: { ...defaults.en!.services, ...(input.i18n?.en?.services ?? {}) },
      cta: { ...defaults.en!.cta, ...(input.i18n?.en?.cta ?? {}) },
      estimate: { ...defaults.en!.estimate, ...(input.i18n?.en?.estimate ?? {}) },
    },
  };

  return {
    ...input,
    appearance: {
      ...input.appearance,
      textColors,
    },
    heroBanner,
    estimate,
    i18n,
    services,
  };
}

export function getDefaultConfig(): SiteConfig {
  return {
    appearance: {
      brightness: 0.85,
      overlay: 0.52,
      showTexture: true,
      textureUrl: DEFAULT_IMAGE_PATHS.texture,
      cursorMode: "realistic",
      textColors: getDefaultTextColors(),
    },
    hero: {
      title: "Neteja interior professional des de 120 EUR",
      subtitle: "Resultats visibles des del primer minut. Cuidem el teu vehicle com si fos nostre.",
      badge: "Resultats reals, sense maquillatge",
      imageUrl: DEFAULT_IMAGE_PATHS.hero,
    },
    heroBanner: getDefaultHeroBanner(),
    estimate: { ...TRANSLATIONS.ca.estimate },
    i18n: getDefaultI18n(),
    services: getDefaultServices(),
  };
}

export async function fetchPublishedConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch("/api/site-config", { cache: "no-store" });
    if (!res.ok) throw new Error("bad");
    const data = await res.json();
    const parsed = SiteConfigSchema.safeParse(data);
    return parsed.success ? normalizeSiteConfig(parsed.data) : getDefaultConfig();
  } catch {
    return getDefaultConfig();
  }
}
