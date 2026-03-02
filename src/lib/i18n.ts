export type Language = "ca" | "es" | "en";

export const LANGUAGES: Array<{ code: Language; label: string; flagSrc: string }> = [
  { code: "es", label: "Castellano", flagSrc: "/flags/es.svg" },
  { code: "ca", label: "Catala", flagSrc: "/flags/ca.svg" },
  { code: "en", label: "English", flagSrc: "/flags/en.svg" },
];

export type ServiceText = {
  name: string;
  description: string;
  highlights: string[];
};

export type SlideText = {
  badge: string;
  title: string;
  highlight: string;
  description: string;
  buttonText: string;
  whatsappMessage: string;
};

export type CtaText = {
  title: string;
  highlight: string;
  description: string;
  button: string;
  whatsappMessage: string;
};

export type TranslationPack = {
  navbar: {
    home: string;
    services: string;
    process: string;
    contact: string;
    whatsappMessage: string;
    mobileContact: string;
  };
  hero: {
    seeServices: string;
    slides: SlideText[];
  };
  services: {
    title: string;
    highlight: string;
    subtitle: string;
    mostRequested: string;
    fromLabel: string;
    items: Record<string, ServiceText>;
  };
  process: {
    title: string;
    highlight: string;
    subtitle: string;
    stepLabel: string;
    steps: Array<{ t: string; d: string }>;
  };
  location: {
    title: string;
    intro: string;
    address: string;
    phone: string;
    whatsappButton: string;
    whatsappMessage: string;
  };
  cta: {
    title: string;
    highlight: string;
    description: string;
    button: string;
    whatsappMessage: string;
  };
  footer: {
    reserveMessage: string;
  };
};

export const TRANSLATIONS: Record<Language, TranslationPack> = {
  ca: {
    navbar: {
      home: "Inici",
      services: "Serveis",
      process: "Proces",
      contact: "Contacte",
      whatsappMessage: "Hola! Vull informacio sobre neteja interior.",
      mobileContact: "Contactar",
    },
    hero: {
      seeServices: "Veure serveis",
      slides: [
        {
          badge: "Resultats reals, sense maquillatge",
          title: "Interior net de veritat",
          highlight: "Des de",
          description: "Neteja profunda de tapisseria, cuir i plastics amb acabat professional.",
          buttonText: "Demanar pressupost",
          whatsappMessage: "Hola! Vull un pressupost per neteja interior.",
        },
        {
          badge: "Brillantor premium",
          title: "Poliment exterior",
          highlight: "Acabat mirall",
          description: "Correccio de micro-ratllades i brillantor real per tornar vida a la pintura.",
          buttonText: "Reservar poliment",
          whatsappMessage: "Hola! M'interessa reservar un poliment exterior.",
        },
        {
          badge: "Manteniment complet",
          title: "Rentat exterior premium",
          highlight: "Des de",
          description: "Escuma activa, detall de llandes i assecat acurat sense marques.",
          buttonText: "Vull aquest servei",
          whatsappMessage: "Hola! Vull informacio del rentat exterior premium.",
        },
      ],
    },
    services: {
      title: "Serveis",
      highlight: "premium",
      subtitle: "Preus orientatius i feina ben feta.",
      mostRequested: "MES DEMANAT",
      fromLabel: "Des de",
      items: {
        interior: {
          name: "Neteja interior",
          description: "Tapisseria, cuir i plastics. Eliminem taques i olors amb extraccio professional.",
          highlights: ["Extraccio profunda", "Taques i olors", "Acabat real, sense maquillatge"],
        },
        polishing: {
          name: "Poliment exterior",
          description: "Correccio de micro-ratllades i acabat mirall amb brillantor real.",
          highlights: ["Gloss mirall", "Correccio swirl", "Acabat premium"],
        },
        wash: {
          name: "Rentat exterior premium",
          description: "Escuma activa, detall de llandes i assecat sense marques.",
          highlights: ["Escuma activa", "Llandes", "Assecat microfibra"],
        },
        ozone: {
          name: "Neteja per ozono",
          description: "Tractament amb ozono orientat a eliminar olor de tabac/cigarro i olors persistents.",
          highlights: ["Reduccio d'olor a tabac", "Combat olors persistents", "Ideal com a extra interior"],
        },
      },
    },
    process: {
      title: "Proces",
      highlight: "clar",
      subtitle: "Senzill, net i efectiu.",
      stepLabel: "PAS",
      steps: [
        { t: "Avaluacio rapida", d: "Mirem taques, olor i material (tapisseria o cuir)." },
        { t: "Producte correcte", d: "Apliquem el producte adequat segons el material." },
        { t: "Extraccio", d: "Injeccio-extraccio per treure bruticia real." },
        { t: "Acabat final", d: "Microfibra, detalls i revisio final." },
      ],
    },
    location: {
      title: "On som",
      intro: "Si ens envies WhatsApp abans, t'atenem mes rapid.",
      address: "Adreca",
      phone: "Telefon",
      whatsappButton: "Confirmar per WhatsApp",
      whatsappMessage: "Hola! Estic pensant passar avui. Hi ha disponibilitat?",
    },
    cta: {
      title: "Deixa el cotxe",
      highlight: "com nou",
      description: "Ens dius si es tapisseria o cuir i et diem el millor cami.",
      button: "Escriure ara",
      whatsappMessage: "Hola! Vull neteja interior. Tapisseria o cuir?",
    },
    footer: {
      reserveMessage: "Hola! Vull reservar una neteja interior.",
    },
  },
  es: {
    navbar: {
      home: "Inicio",
      services: "Servicios",
      process: "Proceso",
      contact: "Contacto",
      whatsappMessage: "Hola! Quiero informacion sobre limpieza interior.",
      mobileContact: "Contactar",
    },
    hero: {
      seeServices: "Ver servicios",
      slides: [
        {
          badge: "Resultados reales, sin maquillaje",
          title: "Interior limpio de verdad",
          highlight: "Desde",
          description: "Limpieza profunda de tapiceria, cuero y plasticos con acabado profesional.",
          buttonText: "Pedir presupuesto",
          whatsappMessage: "Hola! Quiero presupuesto para limpieza interior.",
        },
        {
          badge: "Brillo premium",
          title: "Pulido exterior",
          highlight: "Acabado espejo",
          description: "Correccion de micro-rayas y brillo real para recuperar la pintura.",
          buttonText: "Reservar pulido",
          whatsappMessage: "Hola! Me interesa reservar un pulido exterior.",
        },
        {
          badge: "Mantenimiento completo",
          title: "Lavado exterior premium",
          highlight: "Desde",
          description: "Espuma activa, detalle de llantas y secado cuidadoso sin marcas.",
          buttonText: "Quiero este servicio",
          whatsappMessage: "Hola! Quiero informacion del lavado exterior premium.",
        },
      ],
    },
    services: {
      title: "Servicios",
      highlight: "premium",
      subtitle: "Precios orientativos y trabajo bien hecho.",
      mostRequested: "MAS SOLICITADO",
      fromLabel: "Desde",
      items: {
        interior: {
          name: "Limpieza interior",
          description: "Tapiceria, cuero y plasticos. Eliminamos manchas y olores con extraccion profesional.",
          highlights: ["Extraccion profunda", "Manchas y olores", "Acabado real sin maquillaje"],
        },
        polishing: {
          name: "Pulido exterior",
          description: "Correccion de micro-rayas y acabado espejo con brillo real.",
          highlights: ["Brillo espejo", "Correccion swirl", "Acabado premium"],
        },
        wash: {
          name: "Lavado exterior premium",
          description: "Espuma activa, detalle de llantas y secado sin marcas.",
          highlights: ["Espuma activa", "Llantas", "Secado microfibra"],
        },
        ozone: {
          name: "Limpieza por ozono",
          description: "Tratamiento orientado a eliminar olor a tabaco/cigarro y olores persistentes.",
          highlights: ["Reduce olor a tabaco", "Combate olores persistentes", "Extra ideal para interior"],
        },
      },
    },
    process: {
      title: "Proceso",
      highlight: "claro",
      subtitle: "Simple, limpio y efectivo.",
      stepLabel: "PASO",
      steps: [
        { t: "Evaluacion rapida", d: "Revisamos manchas, olor y material (tapiceria o cuero)." },
        { t: "Producto correcto", d: "Aplicamos el producto adecuado segun el material." },
        { t: "Extraccion", d: "Inyeccion-extraccion para sacar suciedad real." },
        { t: "Acabado final", d: "Microfibra, detalles y revision final." },
      ],
    },
    location: {
      title: "Donde estamos",
      intro: "Si nos escribes por WhatsApp antes, te atendemos mas rapido.",
      address: "Direccion",
      phone: "Telefono",
      whatsappButton: "Confirmar por WhatsApp",
      whatsappMessage: "Hola! Estoy pensando pasar hoy. Hay disponibilidad?",
    },
    cta: {
      title: "Deja tu coche",
      highlight: "como nuevo",
      description: "Dinos si es tapiceria o cuero y te recomendamos la mejor opcion.",
      button: "Escribir ahora",
      whatsappMessage: "Hola! Quiero limpieza interior. Tapiceria o cuero?",
    },
    footer: {
      reserveMessage: "Hola! Quiero reservar una limpieza interior.",
    },
  },
  en: {
    navbar: {
      home: "Home",
      services: "Services",
      process: "Process",
      contact: "Contact",
      whatsappMessage: "Hi! I want information about interior cleaning.",
      mobileContact: "Contact",
    },
    hero: {
      seeServices: "See services",
      slides: [
        {
          badge: "Real results, no cover-ups",
          title: "Truly clean interior",
          highlight: "From",
          description: "Deep cleaning for upholstery, leather and plastics with a professional finish.",
          buttonText: "Request quote",
          whatsappMessage: "Hi! I want a quote for interior cleaning.",
        },
        {
          badge: "Premium shine",
          title: "Exterior polishing",
          highlight: "Mirror finish",
          description: "Micro-scratch correction and real shine to restore your paint.",
          buttonText: "Book polishing",
          whatsappMessage: "Hi! I want to book exterior polishing.",
        },
        {
          badge: "Full maintenance",
          title: "Premium exterior wash",
          highlight: "From",
          description: "Active foam, wheel detailing and careful streak-free drying.",
          buttonText: "I want this service",
          whatsappMessage: "Hi! I want info about premium exterior wash.",
        },
      ],
    },
    services: {
      title: "Premium",
      highlight: "services",
      subtitle: "Indicative pricing and high-quality work.",
      mostRequested: "MOST REQUESTED",
      fromLabel: "From",
      items: {
        interior: {
          name: "Interior cleaning",
          description: "Upholstery, leather and plastics. We remove stains and odors with professional extraction.",
          highlights: ["Deep extraction", "Stains and odors", "Real finish, no cover-ups"],
        },
        polishing: {
          name: "Exterior polishing",
          description: "Micro-scratch correction and mirror finish with real gloss.",
          highlights: ["Mirror gloss", "Swirl correction", "Premium finish"],
        },
        wash: {
          name: "Premium exterior wash",
          description: "Active foam, wheel detailing and streak-free drying.",
          highlights: ["Active foam", "Wheels", "Microfiber dry"],
        },
        ozone: {
          name: "Ozone cleaning",
          description: "Treatment focused on removing cigarette/tobacco smell and persistent odors.",
          highlights: ["Reduces smoke smell", "Targets persistent odors", "Great interior add-on"],
        },
      },
    },
    process: {
      title: "Clear",
      highlight: "process",
      subtitle: "Simple, clean and effective.",
      stepLabel: "STEP",
      steps: [
        { t: "Quick assessment", d: "We check stains, odor and material (upholstery or leather)." },
        { t: "Right product", d: "We apply the right product for each material." },
        { t: "Extraction", d: "Injection-extraction to remove real dirt." },
        { t: "Final finish", d: "Microfiber, detailing and final inspection." },
      ],
    },
    location: {
      title: "Where we are",
      intro: "If you message us on WhatsApp first, we can assist you faster.",
      address: "Address",
      phone: "Phone",
      whatsappButton: "Confirm on WhatsApp",
      whatsappMessage: "Hi! I might come by today. Do you have availability?",
    },
    cta: {
      title: "Leave your car",
      highlight: "like new",
      description: "Tell us if it's upholstery or leather and we'll recommend the best option.",
      button: "Message now",
      whatsappMessage: "Hi! I want interior cleaning. Upholstery or leather?",
    },
    footer: {
      reserveMessage: "Hi! I want to book an interior cleaning.",
    },
  },
};
