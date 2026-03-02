export const BUSINESS = {
  name: "Kuruma Netejes",
  description: "Neteja professional d'interiors i detailing de vehicles a Sabadell. Resultats reals, sense maquillatge.",
  url: "https://kurumanetejes.cat",
  phone: "+34 685 093 192",
  whatsapp: "34685093192",
  email: "info@kurumanetejes.cat",
  address: {
    street: "Carrer d'Alfons Sala, 57, 08202 Sabadell",
    city: "Sabadell",
    region: "Barcelona",
    country: "ES",
  },
} as const;

export type PriceValue = string | number;

export type HeroBannerSlide = {
  image: string;
  badge: string;
  title: string;
  highlight: string;
  price?: PriceValue;
  description: string;
  buttonText: string;
  whatsappMessage: string;
  imageSize: string;
  imagePosition: string;
};

export const PRICING = {
  interiorFrom: 120 as PriceValue,
  polishingFrom: 150 as PriceValue,
  washFrom: 60 as PriceValue,
  ozoneFrom: 45 as PriceValue,
} as const;

export const SERVICE_PRICING_BY_ID: Record<string, PriceValue> = {
  interior: PRICING.interiorFrom,
  polishing: PRICING.polishingFrom,
  wash: PRICING.washFrom,
  ozone: PRICING.ozoneFrom,
};

export const HERO_BANNER_SETTINGS = {
  autoSlideIntervalMs: 5000,
  imageOpacity: 0.45,
  overlayDarkness: {
    top: 0.25,
    middle: 0.55,
    bottom: 1,
  },
  bottomFadeStartPercent: 72,
} as const;

export const HERO_BANNER_SLIDES: HeroBannerSlide[] = [
  {
    image: "/images/hero.webp",
    badge: "Resultats reals, sense maquillatge",
    title: "Interior net de veritat",
    highlight: "Des de",
    price: PRICING.interiorFrom,
    description: "Neteja profunda de tapisseria, cuir i plastics amb acabat professional.",
    buttonText: "Demanar pressupost",
    whatsappMessage: "Hola! Vull un pressupost per neteja interior.",
    imageSize: "cover",
    imagePosition: "center",
  },
  {
    image: "/images/service-polishing.webp",
    badge: "Brillantor premium",
    title: "Poliment exterior",
    highlight: "Acabat mirall",
    price: PRICING.polishingFrom,
    description: "Correccio de micro-ratllades i brillantor real per tornar vida a la pintura.",
    buttonText: "Reservar poliment",
    whatsappMessage: "Hola! M'interessa reservar un poliment exterior.",
    imageSize: "cover",
    imagePosition: "center",
  },
  {
    image: "/images/service-foam.webp",
    badge: "Manteniment complet",
    title: "Rentat exterior premium",
    highlight: "Des de",
    price: PRICING.washFrom,
    description: "Escuma activa, detall de llandes i assecat acurat sense marques.",
    buttonText: "Vull aquest servei",
    whatsappMessage: "Hola! Vull informacio del rentat exterior premium.",
    imageSize: "cover",
    imagePosition: "center",
  },
];

export const SEO_DEFAULTS = {
  title: "Kuruma Netejes | Neteja interior i detailing a Sabadell",
  description: "Neteja interior professional des de 120€. Tapisseria i cuir. Resultats visibles des del primer minut. Sabadell.",
  keywords: [
    "neteja interior cotxe sabadell",
    "limpieza tapiceria coche sabadell",
    "detailing sabadell",
    "neteja cuir cotxe",
    "poliment exterior sabadell",
    "rentat exterior premium",
    "neteja amb ozono cotxe",
    "desinfeccio ozono vehicle",
    "eliminar olor tabac cotxe",
    "eliminar cheiro cigarro carro",
    "tirar cheiro de cigarro do carro",
  ],
} as const;

export const DEFAULT_IMAGE_PATHS = {
  hero: "/images/hero.webp",
  texture: "/images/texture.webp",
  serviceBeforeAfter: "/images/antes-dps.png",
  servicePolishing: "/images/service-polishing.webp",
  serviceFoam: "/images/service-foam.webp",
  serviceOzone: "/images/ozonio.png",
} as const;
