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
  infoSummary?: string;
  faq?: Array<{ q: string; a: string }>;
};

export type NavbarText = {
  home: string;
  services: string;
  process: string;
  contact: string;
  whatsappMessage: string;
  mobileContact: string;
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

export type ProcessText = {
  title: string;
  highlight: string;
  subtitle: string;
  stepLabel: string;
  steps: Array<{ t: string; d: string }>;
};

export type LocationText = {
  title: string;
  intro: string;
  address: string;
  phone: string;
  whatsappButton: string;
  whatsappMessage: string;
};

export type FooterText = {
  reserveMessage: string;
};

export type EstimateText = {
  title: string;
  highlight: string;
  subtitle: string;
  helper: string;
  onRequest: string;
  total: string;
  note: string;
  cta: string;
  none: string;
  unknown: string;
};

export type TranslationPack = {
  navbar: NavbarText;
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
  process: ProcessText;
  location: LocationText;
  cta: {
    title: string;
    highlight: string;
    description: string;
    button: string;
    whatsappMessage: string;
  };
  estimate: EstimateText;
  footer: FooterText;
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
          infoSummary:
            "La neteja interior professional combina aspiracio, extraccio i descontaminacio de superfícies per reduir bruticia, residus i olors persistents. El proces es fa per zones (teixits, plastics i cuir) amb productes específics per material per evitar danys i millorar el confort dins l'habitacle.",
          faq: [
            {
              q: "La neteja interior elimina l'olor de tabac?",
              a: "Sol reduir molt l'olor quan es combina higienitzacio profunda amb neutralitzacio. El resultat final depen del temps d'exposicio i de l'estat dels teixits.",
            },
            {
              q: "Quant de temps dura una neteja interior completa?",
              a: "Normalment entre 2 i 5 hores, segons mida del vehicle i nivell de bruticia.",
            },
            {
              q: "Netegeu cuir sense ressecar-lo?",
              a: "Si. S'utilitzen netejadors adequats i proteccio final per mantenir flexibilitat i acabat.",
            },
          ],
        },
        polishing: {
          name: "Poliment exterior",
          description: "Correccio de micro-ratllades i acabat mirall amb brillantor real.",
          highlights: ["Gloss mirall", "Correccio swirl", "Acabat premium"],
          infoSummary:
            "El poliment tecnic corregeix micro-ratllades i marques de rentat amb abrasio controlada sobre el vernís. L'objectiu es recuperar profunditat de color i reflex sense un desgast excessiu. Despres de la correccio, es recomana proteccio de superfície per mantenir el resultat.",
          faq: [
            {
              q: "El poliment elimina ratllades profundes?",
              a: "Les superficials i mitjanes solen millorar molt. Les profundes poden reduir-se visualment, pero no sempre desapareixen del tot.",
            },
            {
              q: "El poliment pot danyar la pintura?",
              a: "Si es fa correctament no. Es treballa amb combinacio adequada de boina, producte i control d'acabat.",
            },
            {
              q: "Cal protegir despres del poliment?",
              a: "Si, es recomana segellant, cera o coating per allargar brillantor i facilitar manteniment.",
            },
          ],
        },
        wash: {
          name: "Rentat exterior premium",
          description: "Escuma activa, detall de llandes i assecat sense marques.",
          highlights: ["Escuma activa", "Llandes", "Assecat microfibra"],
          infoSummary:
            "El rentat premium combina pre-rentat, escuma activa, neteja detallada de llandes i assecat amb microfibra per reduir marques i micro-ratllades. El proces prioritza menys agressio al vernís i millor acabat visual.",
          faq: [
            {
              q: "Quina diferencia hi ha amb un rentat basic?",
              a: "El premium afegeix pre-rentat, mes detall en zones critiques i assecat correcte per minimitzar marques.",
            },
            {
              q: "El rentat premium protegeix la pintura?",
              a: "Ajuda a conservar millor el vernís per tecnica menys agressiva. Per proteccio duradora, millor aplicar segellant o cera.",
            },
            {
              q: "Inclou neteja de llandes?",
              a: "Si, llandes i zones de dificil accés formen part del detall exterior.",
            },
          ],
        },
        ozone: {
          name: "Neteja per ozono",
          description: "Tractament amb ozono orientat a eliminar olor de tabac/cigarro i olors persistents.",
          highlights: ["Reduccio d'olor a tabac", "Combat olors persistents", "Ideal com a extra interior"],
          infoSummary:
            "El tractament amb ozono te com a objectiu principal eliminar males olors de l'habitacle, sobretot olor de tabac/cigarro. Combinat amb neteja de tapisseries i superficies, dona un resultat mes net i estable. Es fa amb protocol segur i ventilacio completa abans de lliurar el vehicle.",
          faq: [
            {
              q: "Retira olor de cigarro?",
              a: "Si. Amb ozono + neteja profunda de tapisseries, l'olor de tabac es retira de forma efectiva en la gran majoria de casos.",
            },
            {
              q: "L'ozono es segur?",
              a: "Si, amb protocol correcte: cabina buida, temps controlat i ventilacio completa abans d'utilitzar el vehicle.",
            },
            {
              q: "Elimina qualsevol olor per sempre?",
              a: "Elimina les olors acumulades en el moment del tractament. Si torna la font d'olor, cal manteniment.",
            },
            {
              q: "Puc conduir just despres del servei?",
              a: "Si, despres del temps de ventilacio indicat per l'equip.",
            },
            {
              q: "Val la pena si vull vendre el cotxe?",
              a: "Si. Un interior sense olor de tabac millora molt la primera impressio i dona mes confianca al comprador.",
            },
            {
              q: "Cal combinar-ho amb neteja interior?",
              a: "Si. Es la combinacio amb millor resultat, perque neutralitza l'olor i elimina residus que la poden fer tornar.",
            },
          ],
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
    estimate: {
      title: "Calcula un",
      highlight: "pressupost orientatiu",
      subtitle: "Selecciona serveis i veu una suma aproximada a l'instant.",
      helper: "Preu estimat",
      onRequest: "Sota consulta",
      total: "Total aproximat",
      note: "Per un preu exacte, escriu-nos per WhatsApp i t'ho confirmem segons l'estat del vehicle.",
      cta: "Demanar preu exacte",
      none: "Selecciona almenys un servei",
      unknown: "Inclou serveis amb preu sota consulta",
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
          infoSummary:
            "La limpieza interior profesional combina aspirado, extraccion y descontaminacion de superficies para reducir suciedad, residuos y olores persistentes. El trabajo se realiza por zonas (tejidos, plasticos y cuero) con productos especificos por material para evitar danos y mejorar el confort del habitaculo.",
          faq: [
            {
              q: "La limpieza interior elimina olor a tabaco?",
              a: "Suele reducirlo mucho cuando se combina higiene profunda y neutralizacion de olor. El resultado final depende del tiempo de exposicion y del estado de los tejidos.",
            },
            {
              q: "Cuanto tarda una limpieza interior completa?",
              a: "Normalmente entre 2 y 5 horas, segun tamano del vehiculo y nivel de suciedad.",
            },
            {
              q: "Limpiais cuero sin resecar?",
              a: "Si. Se usan limpiadores adecuados y proteccion final para mantener flexibilidad y acabado.",
            },
          ],
        },
        polishing: {
          name: "Pulido exterior",
          description: "Correccion de micro-rayas y acabado espejo con brillo real.",
          highlights: ["Brillo espejo", "Correccion swirl", "Acabado premium"],
          infoSummary:
            "El pulido tecnico corrige micro-rayas y marcas de lavado mediante abrasion controlada sobre el barniz. El objetivo es recuperar profundidad de color y reflejo sin desgaste excesivo. Tras la correccion, se recomienda proteccion de superficie para mantener el resultado.",
          faq: [
            {
              q: "El pulido quita rayas profundas?",
              a: "Las superficiales y medias suelen mejorar mucho. Las profundas pueden disimularse, pero no siempre desaparecen por completo.",
            },
            {
              q: "El pulido puede danar la pintura?",
              a: "Si se realiza correctamente, no. Se trabaja con combinacion adecuada de boina, compuesto y control de acabado.",
            },
            {
              q: "Hay que proteger despues del pulido?",
              a: "Si, se recomienda sellante, cera o coating para alargar brillo y facilitar mantenimiento.",
            },
          ],
        },
        wash: {
          name: "Lavado exterior premium",
          description: "Espuma activa, detalle de llantas y secado sin marcas.",
          highlights: ["Espuma activa", "Llantas", "Secado microfibra"],
          infoSummary:
            "El lavado premium combina prelavado, espuma activa, limpieza detallada de llantas y secado con microfibra para reducir marcas y micro-rayas. El proceso prioriza menor agresion al barniz y un acabado visual mas limpio.",
          faq: [
            {
              q: "Que diferencia hay frente a un lavado basico?",
              a: "El premium anade prelavado, mas detalle en zonas criticas y secado correcto para minimizar marcas.",
            },
            {
              q: "El lavado premium protege la pintura?",
              a: "Ayuda a conservar mejor el barniz por tecnica menos agresiva. Para proteccion duradera conviene aplicar sellante o cera.",
            },
            {
              q: "Incluye limpieza de llantas?",
              a: "Si, llantas y zonas de dificil acceso forman parte del detalle exterior.",
            },
          ],
        },
        ozone: {
          name: "Limpieza por ozono",
          description: "Tratamiento orientado a eliminar olor a tabaco/cigarro y olores persistentes.",
          highlights: ["Reduce olor a tabaco", "Combate olores persistentes", "Extra ideal para interior"],
          infoSummary:
            "El tratamiento con ozono esta enfocado en eliminar malos olores del habitaculo, especialmente olor a tabaco/cigarro. Combinado con limpieza profunda de tapiceria y superficies, consigue un resultado mas limpio y estable. Se aplica con protocolo seguro y ventilacion completa antes de entregar el coche.",
          faq: [
            {
              q: "Quita el olor a cigarro?",
              a: "Si. Con ozono + limpieza profunda de tapiceria, el olor a tabaco se elimina de forma efectiva en la mayoria de casos.",
            },
            {
              q: "El ozono es seguro?",
              a: "Si, con protocolo correcto: cabina vacia, tiempo controlado y ventilacion completa antes de usar el vehiculo.",
            },
            {
              q: "Elimina cualquier olor para siempre?",
              a: "Elimina los olores acumulados en el momento del tratamiento. Si vuelve la fuente de olor, hay que hacer mantenimiento.",
            },
            {
              q: "Puedo usar el coche justo despues?",
              a: "Si, despues del tiempo de ventilacion indicado por el equipo.",
            },
            {
              q: "Merece la pena para vender el coche?",
              a: "Si. Un interior sin olor a tabaco mejora la impresion del comprador y ayuda a cerrar la venta.",
            },
            {
              q: "Es mejor combinarlo con limpieza interior?",
              a: "Si. Es la combinacion mas eficaz: neutraliza olor y elimina residuos que pueden reactivar el mal olor.",
            },
          ],
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
    estimate: {
      title: "Calcula un",
      highlight: "presupuesto orientativo",
      subtitle: "Selecciona servicios y mira una suma aproximada al momento.",
      helper: "Precio estimado",
      onRequest: "A consultar",
      total: "Total aproximado",
      note: "Si quieres un precio exacto, escribenos por WhatsApp y lo ajustamos segun el estado del coche.",
      cta: "Pedir precio exacto",
      none: "Selecciona al menos un servicio",
      unknown: "Incluye servicios con precio a consultar",
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
          infoSummary:
            "Professional interior cleaning combines vacuuming, extraction and surface decontamination to reduce dirt, residue and persistent odors. The process is done by zones (fabrics, plastics and leather) using material-specific products to avoid damage and improve cabin comfort.",
          faq: [
            {
              q: "Does interior cleaning remove smoke smell?",
              a: "It usually reduces it significantly when deep cleaning is combined with odor neutralization. Final results depend on exposure time and fabric condition.",
            },
            {
              q: "How long does a full interior clean take?",
              a: "Usually 2 to 5 hours, depending on vehicle size and contamination level.",
            },
            {
              q: "Do you clean leather without drying it out?",
              a: "Yes. Proper leather-safe cleaners and a protective finish are used to preserve flexibility and appearance.",
            },
          ],
        },
        polishing: {
          name: "Exterior polishing",
          description: "Micro-scratch correction and mirror finish with real gloss.",
          highlights: ["Mirror gloss", "Swirl correction", "Premium finish"],
          infoSummary:
            "Technical polishing corrects micro-scratches and wash marks through controlled abrasion on the clear coat. The goal is to recover depth and reflection without excessive removal. After correction, surface protection is recommended to keep the finish longer.",
          faq: [
            {
              q: "Can polishing remove deep scratches?",
              a: "Light and medium scratches usually improve a lot. Deep scratches can often be reduced visually, but not always fully removed.",
            },
            {
              q: "Can polishing damage paint?",
              a: "When performed correctly, no. It relies on the right pad/compound combination and controlled technique.",
            },
            {
              q: "Should I protect the car after polishing?",
              a: "Yes. Sealant, wax or coating is recommended to maintain gloss and simplify maintenance.",
            },
          ],
        },
        wash: {
          name: "Premium exterior wash",
          description: "Active foam, wheel detailing and streak-free drying.",
          highlights: ["Active foam", "Wheels", "Microfiber dry"],
          infoSummary:
            "A premium exterior wash combines pre-wash, active foam, wheel detailing and microfiber drying to reduce marks and micro-marring. The process is designed to be gentler on clear coat while delivering a cleaner finish.",
          faq: [
            {
              q: "What is the difference vs a basic wash?",
              a: "Premium wash adds pre-wash, more detail work and proper drying to minimize marks.",
            },
            {
              q: "Does premium wash protect paint?",
              a: "It helps preserve clear coat by using gentler technique. For lasting protection, apply sealant or wax.",
            },
            {
              q: "Are wheels included?",
              a: "Yes. Wheels and hard-to-reach exterior areas are part of the detailing workflow.",
            },
          ],
        },
        ozone: {
          name: "Ozone cleaning",
          description: "Treatment focused on removing cigarette/tobacco smell and persistent odors.",
          highlights: ["Reduces smoke smell", "Targets persistent odors", "Great interior add-on"],
          infoSummary:
            "Ozone treatment is focused on removing strong cabin odors, especially cigarette/tobacco smell. Combined with deep upholstery and interior cleaning, it delivers a cleaner and more stable result. Application follows a safe protocol with full ventilation before handover.",
          faq: [
            {
              q: "Does it remove cigarette smell?",
              a: "Yes. Ozone combined with deep upholstery cleaning removes cigarette odor effectively in most cases.",
            },
            {
              q: "Is ozone treatment safe?",
              a: "Yes, with proper protocol: empty cabin, controlled timing and full ventilation before use.",
            },
            {
              q: "Does it permanently remove all odors?",
              a: "It removes built-up odor at treatment time. If odor sources return, maintenance is needed.",
            },
            {
              q: "Can I drive immediately after treatment?",
              a: "Yes, after the recommended ventilation period is completed.",
            },
            {
              q: "Is this useful before selling a car?",
              a: "Absolutely. A smoke-free cabin increases buyer confidence and improves first impression.",
            },
            {
              q: "Should I combine ozone with interior cleaning?",
              a: "Yes. That combination is most effective because it neutralizes odor and removes residue that can bring odor back.",
            },
          ],
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
    estimate: {
      title: "Build a quick",
      highlight: "estimate",
      subtitle: "Pick your services and get an instant rough total.",
      helper: "Estimated price",
      onRequest: "On request",
      total: "Approximate total",
      note: "For an exact quote, message us on WhatsApp and we will adjust it to your car condition.",
      cta: "Request exact quote",
      none: "Select at least one service",
      unknown: "Includes services with price on request",
    },
    footer: {
      reserveMessage: "Hi! I want to book an interior cleaning.",
    },
  },
};
