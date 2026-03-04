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

const SECTION_TYPES = ["hero", "services", "estimate", "process", "location", "cta", "footer"] as const;

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
  infoSummary: z.string().optional(),
  faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).optional(),
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

const LocalizedNavbarSchema = z.object({
  home: z.string().min(1),
  services: z.string().min(1),
  process: z.string().min(1),
  contact: z.string().min(1),
  whatsappMessage: z.string().min(1),
  mobileContact: z.string().min(1),
});

const LocalizedProcessSchema = z.object({
  title: z.string().min(1),
  highlight: z.string().min(1),
  subtitle: z.string().min(1),
  stepLabel: z.string().min(1),
  steps: z.array(z.object({ t: z.string().min(1), d: z.string().min(1) })).min(1),
});

const LocalizedLocationSchema = z.object({
  title: z.string().min(1),
  intro: z.string().min(1),
  address: z.string().min(1),
  phone: z.string().min(1),
  whatsappButton: z.string().min(1),
  whatsappMessage: z.string().min(1),
});

const LocalizedFooterSchema = z.object({
  reserveMessage: z.string().min(1),
});

const LocalizedLanguageSchema = z.object({
  navbar: LocalizedNavbarSchema,
  heroSlides: z.array(LocalizedHeroSlideSchema).length(3),
  services: z.record(LocalizedServiceSchema),
  process: LocalizedProcessSchema,
  location: LocalizedLocationSchema,
  cta: LocalizedCtaSchema,
  footer: LocalizedFooterSchema,
  estimate: LocalizedEstimateSchema,
});

export const SiteConfigSchema = z.object({
  logoUrl: z.string().optional(),
  appearance: z.object({
    brightness: z.number().min(0).max(1),
    overlay: z.number().min(0).max(1),
    showTexture: z.boolean(),
    textureUrl: z.string().min(1),
    lightTextureUrl: z.string().min(1).optional(),
    textureOpacityDark: z.number().min(0).max(1).optional(),
    textureOpacityLight: z.number().min(0).max(1).optional(),
    cursorMode: z.enum(["realistic", "neon", "off"]),
    textColors: TextColorsSchema.optional(),
  }),
  hero: z.object({
    title: z.string().min(1),
    subtitle: z.string().min(1),
    badge: z.string().optional(),
    imageUrl: z.string().min(1),
  }),
  layout: z
    .object({
      sections: z.array(
        z.object({
          id: z.string().min(1),
          type: z.enum(SECTION_TYPES),
          enabled: z.boolean(),
          mobile: z.boolean(),
          desktop: z.boolean(),
        })
      ),
    })
    .optional(),
  heroBanner: z
    .object({
      settings: HeroBannerSettingsSchema,
      slides: z.array(HeroBannerSlideSchema).length(3),
    })
    .optional(),
  navbar: LocalizedNavbarSchema.optional(),
  process: LocalizedProcessSchema.optional(),
  businessStatusMode: z.enum(["auto", "manual"]).optional(),
  businessStatus: z.enum(["open", "closing", "closed"]).optional(),
  location: LocalizedLocationSchema.optional(),
  cta: LocalizedCtaSchema.optional(),
  footer: LocalizedFooterSchema.optional(),
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
      videoUrl: z.string().optional(),
      infoEnabled: z.boolean().optional(),
      infoSummary: z.string().optional(),
      infoImageUrl: z.string().optional(),
      faq: z.array(z.object({ q: z.string().min(1), a: z.string().min(1) })).optional(),
      popular: z.boolean().optional(),
      estimateEnabled: z.boolean().optional(),
      estimateLabel: z.string().optional(),
      highlights: z.array(z.string().min(1)).min(1),
    })
  ),
});

export type SiteConfigInput = z.infer<typeof SiteConfigSchema>;

function getDefaultLayout(): SiteConfig["layout"] {
  return {
    sections: [
      { id: "hero-main", type: "hero", enabled: true, mobile: true, desktop: true },
      { id: "services-main", type: "services", enabled: true, mobile: true, desktop: true },
      { id: "estimate-main", type: "estimate", enabled: true, mobile: true, desktop: true },
      { id: "process-main", type: "process", enabled: true, mobile: true, desktop: true },
      { id: "location-main", type: "location", enabled: true, mobile: true, desktop: true },
      { id: "cta-main", type: "cta", enabled: true, mobile: true, desktop: true },
      { id: "footer-main", type: "footer", enabled: true, mobile: true, desktop: true },
    ],
  };
}

function normalizeLayout(layout?: SiteConfigInput["layout"]): SiteConfig["layout"] {
  const defaults = getDefaultLayout();
  const source = layout?.sections?.length ? layout.sections : defaults.sections;
  const normalized = source
    .filter((section) => SECTION_TYPES.includes(section.type as (typeof SECTION_TYPES)[number]))
    .map((section) => ({
      id: section.id,
      type: section.type,
      enabled: section.enabled ?? true,
      mobile: section.mobile ?? true,
      desktop: section.desktop ?? true,
    }));

  if (!normalized.length) return defaults;
  return { sections: normalized };
}

function getDefaultServices(): SiteConfig["services"] {
  return [
    {
      id: "interior",
      name: "Neteja interior",
      description: "Tapisseria, cuir i plastics. Eliminem taques i olors amb extraccio professional.",
      priceFrom: PRICING.interiorFrom,
      imageUrl: DEFAULT_IMAGE_PATHS.serviceBeforeAfter,
      infoEnabled: true,
      infoImageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Carinterior.jpg",
      infoSummary:
        "A limpeza interna profissional combina aspiração, extração e descontaminação de superfícies para remover poeira, resíduos orgânicos e odores persistentes. Em detailing, esse processo é feito por zonas (tecidos, plásticos e couro) com produtos específicos para cada material, reduzindo desgaste precoce e melhorando a experiência no habitáculo.",
      faq: [
        {
          q: "A limpeza interna remove cheiro de cigarro?",
          a: "Reduz bastante quando combinamos higienização profunda e neutralização de odor, mas o resultado final depende do tempo de exposição e do estado do estofado.",
        },
        {
          q: "Quanto tempo leva a limpeza interna completa?",
          a: "Normalmente entre 2 e 5 horas, variando conforme tamanho do veículo e nível de sujeira.",
        },
        {
          q: "Vocês limpam couro sem ressecar?",
          a: "Sim. Usamos limpadores de pH adequado e finalizamos com proteção para manter flexibilidade e acabamento.",
        },
      ],
      popular: true,
      estimateEnabled: true,
      highlights: ["Extraccio profunda", "Taques i olors", "Acabat real, sense maquillatge"],
    },
    {
      id: "polishing",
      name: "Poliment exterior",
      description: "Correccio de micro-ratllades i acabat mirall amb brillantor real.",
      priceFrom: PRICING.polishingFrom,
      imageUrl: DEFAULT_IMAGE_PATHS.servicePolishing,
      infoEnabled: true,
      infoImageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Auto_Detailing.jpg",
      infoSummary:
        "O polimento técnico corrige micro-riscos, marcas de lavagem e perda de brilho através de abrasão controlada na camada de verniz. O objetivo é nivelar imperfeições sem exagerar no corte, recuperando profundidade de cor e reflexo. Após a correção, a proteção de superfície ajuda a manter o acabamento por mais tempo.",
      faq: [
        {
          q: "Polimento tira risco profundo?",
          a: "Riscos superficiais e médios costumam melhorar muito. Riscos profundos podem apenas reduzir visibilidade, pois atravessam mais camadas do verniz.",
        },
        {
          q: "Polimento estraga pintura?",
          a: "Quando feito corretamente, não. O processo é controlado e feito com combinação adequada de boina, composto e inspeção visual.",
        },
        {
          q: "Precisa encerar depois do polimento?",
          a: "Sim, recomendamos proteção (selante, cera ou coating) para prolongar brilho e facilitar manutenção.",
        },
      ],
      estimateEnabled: true,
      highlights: ["Gloss mirall", "Correccio swirl", "Acabat premium"],
    },
    {
      id: "wash",
      name: "Rentat exterior premium",
      description: "Escuma activa, detall de llandes i assecat sense marques.",
      priceFrom: PRICING.washFrom,
      imageUrl: DEFAULT_IMAGE_PATHS.serviceFoam,
      infoEnabled: true,
      infoImageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/Touchless_Car_Wash.jpg",
      infoSummary:
        "A lavagem externa premium combina pré-lavagem, espuma ativa, limpeza detalhada de rodas e secagem com microfibra para reduzir marcas e riscos de contato. O processo prioriza menor agressão ao verniz e melhor resultado visual. Boas práticas também evitam descarte inadequado de resíduos para drenagem pluvial.",
      faq: [
        {
          q: "Qual diferença da lavagem premium para a comum?",
          a: "A premium inclui etapas de pré-lavagem, atenção maior em detalhes e secagem correta para reduzir marcas e micro-riscos.",
        },
        {
          q: "Lavagem premium protege a pintura?",
          a: "Ela preserva melhor o verniz por usar técnica menos agressiva. Para proteção prolongada, recomendamos aplicar selante ou cera.",
        },
        {
          q: "Vocês limpam caixa de roda e rodas?",
          a: "Sim. Rodas e áreas de difícil acesso entram no detalhamento do serviço.",
        },
      ],
      estimateEnabled: true,
      highlights: ["Escuma activa", "Llandes", "Assecat microfibra"],
    },
    {
      id: "ozone",
      name: "Neteja per ozono",
      description: "Tractament amb ozono orientat a eliminar olor de tabac/cigarro, olor fort d'humitat i altres olors persistents de l'habitacle.",
      priceFrom: PRICING.ozoneFrom,
      imageUrl: DEFAULT_IMAGE_PATHS.serviceOzone,
      infoEnabled: true,
      infoImageUrl: "https://commons.wikimedia.org/wiki/Special:FilePath/F._J._Horgan_ozone_generator.jpg",
      infoSummary:
        "O tratamento com ozônio é usado como apoio para neutralização de odores persistentes no interior do veículo, atuando por oxidação. Como o ozônio em concentração elevada é irritante para vias respiratórias, a aplicação deve ser feita sem ocupantes e seguida de ventilação adequada antes da entrega do carro.",
      faq: [
        {
          q: "Ozônio é seguro?",
          a: "Sim, quando aplicado com protocolo correto: cabine vazia, tempo controlado e ventilação completa antes do uso do veículo.",
        },
        {
          q: "Resolve qualquer odor para sempre?",
          a: "Ajuda muito na redução de odores, mas a durabilidade depende da origem do problema e dos hábitos de uso posteriores.",
        },
        {
          q: "Posso usar o carro logo após o serviço?",
          a: "Após ventilação adequada indicada pela equipe, sim. Seguimos o tempo seguro antes da liberação.",
        },
      ],
      estimateEnabled: true,
      highlights: ["Reduccio d'olor a tabac/cigarro", "Combat olors persistents", "Ideal com a extra de neteja interior"],
    },
  ];
}

function genericFaqFallback(): Array<{ q: string; a: string }> {
  return [
    {
      q: "Como funciona este servico?",
      a: "A equipe avalia o estado do veiculo e aplica um processo tecnico adequado para garantir resultado consistente.",
    },
    {
      q: "Quanto tempo demora?",
      a: "Depende do estado do veiculo e do nivel de detalhe contratado.",
    },
    {
      q: "Posso combinar com outro servico?",
      a: "Sim. Podemos montar um pacote personalizado conforme sua necessidade.",
    },
  ];
}

function isWeakFaq(faq?: Array<{ q: string; a: string }>): boolean {
  if (!faq?.length || faq.length < 2) return true;
  const genericQuestions = [
    "como funciona este servico?",
    "quanto tempo demora?",
    "posso combinar com outro servico?",
    "how does this service work?",
  ];
  const normalizedQs = faq.map((item) => item.q.trim().toLowerCase());
  const genericHits = normalizedQs.filter((q) => genericQuestions.includes(q)).length;
  const shortAnswers = faq.filter((item) => item.a.trim().length < 50).length;
  return genericHits >= 2 || shortAnswers >= 2;
}

function isWeakSummary(summary?: string): boolean {
  if (!summary?.trim()) return true;
  const text = summary.trim().toLowerCase();
  return text.startsWith("servico profissional executado");
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
    navbar: { ...t.navbar },
    heroSlides: t.hero.slides.map((slide) => ({ ...slide })),
    services: Object.fromEntries(Object.entries(t.services.items).map(([id, value]) => [id, { ...value, highlights: [...value.highlights] }])),
    process: {
      ...t.process,
      steps: t.process.steps.map((step) => ({ ...step })),
    },
    location: { ...t.location },
    cta: { ...t.cta },
    footer: { ...t.footer },
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
  const layout = normalizeLayout(input.layout);
  const heroBanner = input.heroBanner ?? getDefaultHeroBanner();
  const navbar = input.navbar ?? { ...TRANSLATIONS.ca.navbar };
  const process = input.process ?? {
    ...TRANSLATIONS.ca.process,
    steps: TRANSLATIONS.ca.process.steps.map((step) => ({ ...step })),
  };
  const businessStatusMode = input.businessStatusMode ?? "auto";
  const businessStatus = input.businessStatus ?? "open";
  const location = input.location ?? { ...TRANSLATIONS.ca.location };
  const cta = input.cta ?? { ...TRANSLATIONS.ca.cta };
  const footer = input.footer ?? { ...TRANSLATIONS.ca.footer };
  const estimate = input.estimate ?? { ...TRANSLATIONS.ca.estimate };
  const textColors = {
    ...getDefaultTextColors(),
    ...(input.appearance.textColors ?? {}),
  };
  const services = (input.services.length > 0 ? input.services : getDefaultServices()).map((service) => {
    const defaultCaService = TRANSLATIONS.ca.services.items[service.id];
    const defaultSummary =
      defaultCaService?.infoSummary ??
      "Servico profissional executado com processo tecnico, foco em acabamento real e orientacao clara para manutencao posterior.";
    const defaultFaq = defaultCaService?.faq ?? genericFaqFallback();

    return {
      ...service,
      videoUrl: service.videoUrl?.trim() || undefined,
      estimateEnabled: service.estimateEnabled ?? true,
      infoEnabled: service.infoEnabled ?? true,
      infoImageUrl: service.infoImageUrl?.trim() || service.imageUrl,
      infoSummary: isWeakSummary(service.infoSummary) ? defaultSummary : service.infoSummary!.trim(),
      faq: isWeakFaq(service.faq) ? defaultFaq : service.faq!,
    };
  });
  const defaults = getDefaultI18n();

  const i18n: NonNullable<SiteConfig["i18n"]> = {
    es: {
      navbar: { ...defaults.es!.navbar, ...(input.i18n?.es?.navbar ?? {}) },
      heroSlides: input.i18n?.es?.heroSlides ?? defaults.es!.heroSlides,
      services: { ...defaults.es!.services, ...(input.i18n?.es?.services ?? {}) },
      process: {
        ...defaults.es!.process,
        ...(input.i18n?.es?.process ?? {}),
        steps: input.i18n?.es?.process?.steps ?? defaults.es!.process.steps,
      },
      location: { ...defaults.es!.location, ...(input.i18n?.es?.location ?? {}) },
      cta: { ...defaults.es!.cta, ...(input.i18n?.es?.cta ?? {}) },
      footer: { ...defaults.es!.footer, ...(input.i18n?.es?.footer ?? {}) },
      estimate: { ...defaults.es!.estimate, ...(input.i18n?.es?.estimate ?? {}) },
    },
    en: {
      navbar: { ...defaults.en!.navbar, ...(input.i18n?.en?.navbar ?? {}) },
      heroSlides: input.i18n?.en?.heroSlides ?? defaults.en!.heroSlides,
      services: { ...defaults.en!.services, ...(input.i18n?.en?.services ?? {}) },
      process: {
        ...defaults.en!.process,
        ...(input.i18n?.en?.process ?? {}),
        steps: input.i18n?.en?.process?.steps ?? defaults.en!.process.steps,
      },
      location: { ...defaults.en!.location, ...(input.i18n?.en?.location ?? {}) },
      cta: { ...defaults.en!.cta, ...(input.i18n?.en?.cta ?? {}) },
      footer: { ...defaults.en!.footer, ...(input.i18n?.en?.footer ?? {}) },
      estimate: { ...defaults.en!.estimate, ...(input.i18n?.en?.estimate ?? {}) },
    },
  };

  (["es", "en"] as const).forEach((lang) => {
    const langPack = i18n[lang] ?? getDefaultI18nLanguage(lang);
    if (!langPack) return;
    i18n[lang] = langPack;
    services.forEach((service) => {
      const langDefault = TRANSLATIONS[lang].services.items[service.id];
      const current = langPack.services[service.id] ?? {
        name: service.name,
        description: service.description,
        highlights: [...service.highlights],
      };

      langPack.services[service.id] = {
        ...current,
        infoSummary: isWeakSummary(current.infoSummary)
          ? langDefault?.infoSummary ?? service.infoSummary
          : current.infoSummary,
        faq: isWeakFaq(current.faq) ? langDefault?.faq ?? service.faq : current.faq,
      };
    });
  });

  return {
    ...input,
    logoUrl: input.logoUrl?.trim() || undefined,
    appearance: {
      ...input.appearance,
      lightTextureUrl: input.appearance.lightTextureUrl ?? input.appearance.textureUrl,
      textureOpacityDark: input.appearance.textureOpacityDark ?? 0.36,
      textureOpacityLight: input.appearance.textureOpacityLight ?? 0.22,
      textColors,
    },
    layout,
    heroBanner,
    navbar,
    process,
    businessStatusMode,
    businessStatus,
    location,
    cta,
    footer,
    estimate,
    i18n,
    services,
  };
}

export function getDefaultConfig(): SiteConfig {
  return {
    logoUrl: undefined,
    appearance: {
      brightness: 0.85,
      overlay: 0.52,
      showTexture: true,
      textureUrl: DEFAULT_IMAGE_PATHS.texture,
      lightTextureUrl: DEFAULT_IMAGE_PATHS.texture,
      textureOpacityDark: 0.36,
      textureOpacityLight: 0.22,
      cursorMode: "realistic",
      textColors: getDefaultTextColors(),
    },
    hero: {
      title: "Neteja interior professional des de 120 EUR",
      subtitle: "Resultats visibles des del primer minut. Cuidem el teu vehicle com si fos nostre.",
      badge: "Resultats reals, sense maquillatge",
      imageUrl: DEFAULT_IMAGE_PATHS.hero,
    },
    layout: getDefaultLayout(),
    heroBanner: getDefaultHeroBanner(),
    navbar: { ...TRANSLATIONS.ca.navbar },
    process: {
      ...TRANSLATIONS.ca.process,
      steps: TRANSLATIONS.ca.process.steps.map((step) => ({ ...step })),
    },
    businessStatusMode: "auto",
    businessStatus: "open",
    location: { ...TRANSLATIONS.ca.location },
    cta: { ...TRANSLATIONS.ca.cta },
    footer: { ...TRANSLATIONS.ca.footer },
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
