"use client";

import { useEffect, useMemo, useState } from "react";
import { Save, Rocket, RefreshCw, ImagePlus, Loader2 } from "lucide-react";
import type { SiteConfig } from "@/types/site-config";
import { getDefaultConfig, normalizeSiteConfig, SiteConfigSchema } from "@/lib/site-config";
import type { PriceValue } from "@/lib/constants";
import { LANGUAGES, TRANSLATIONS, type CtaText, type Language, type ServiceText, type SlideText } from "@/lib/i18n";
import { LivePreview } from "./LivePreview";

export type AdminSection = "dashboard" | "hero" | "services" | "appearance";

type Props = {
  section?: AdminSection;
};

function normalizeHexColor(value: string, fallback: string): string {
  const v = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toUpperCase();
  return fallback;
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="text-xs text-brand-silver/70 mb-2">{label}</div>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={normalizeHexColor(value, "#FFFFFF")}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-10 w-10 rounded-md border border-white/20 bg-transparent p-1"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => onChange(normalizeHexColor(e.target.value, value))}
          placeholder="#FFFFFF"
          className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm uppercase outline-none focus:border-brand-cyan/60"
        />
      </div>
    </div>
  );
}

function ImageUrlInput({
  label,
  value,
  folder,
  onChange,
  onError,
}: {
  label: string;
  value: string;
  folder: string;
  onChange: (next: string) => void;
  onError: (message: string) => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.set("file", file);
    form.set("folder", folder);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        onError(payload?.error ?? "Erro ao enviar imagem.");
        return;
      }
      if (payload?.url) onChange(payload.url as string);
    } catch {
      onError("Falha de rede no upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  return (
    <label className="block">
      <div className="mb-1 text-xs text-brand-silver/70">{label}</div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60"
        />
        <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-brand-cyan/35 bg-brand-cyan/10 px-3 py-2.5 text-sm font-semibold text-brand-cyan hover:bg-brand-cyan/15 sm:min-w-[160px]">
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {uploading ? "A enviar..." : "Subir imagem"}
          <input type="file" accept="image/*" className="hidden" onChange={onFileSelect} disabled={uploading} />
        </label>
      </div>
      {value && (
        <div className="mt-2 overflow-hidden rounded-lg border border-white/10 bg-black/20 p-1">
          {/* Preview helps validate mobile-first layouts quickly in admin */}
          <img src={value} alt="Preview" className="h-24 w-full rounded-md object-cover" />
        </div>
      )}
    </label>
  );
}

function toNumberInRange(value: string, fallback: number, min: number, max: number) {
  const n = Number(value);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function parsePriceInput(value: string): PriceValue {
  const trimmed = value.trim();
  const normalized = trimmed.replace(",", ".");
  if (/^-?\d+(\.\d+)?$/.test(normalized)) return Number(normalized);
  return trimmed;
}

function createPlaceholderService(index: number): SiteConfig["services"][number] {
  return {
    id: `service-${Date.now()}-${index}`,
    name: `Service ${index + 1}`,
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt.",
    priceFrom: "XXX",
    imageUrl: "/images/hero.webp",
    highlights: [
      "Lorem ipsum dolor",
      "Sit amet consectetur",
      "Adipiscing elit sed",
    ],
  };
}

export function AdminDashboard({ section = "dashboard" }: Props) {
  const [cfg, setCfg] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [draggingServiceIndex, setDraggingServiceIndex] = useState<number | null>(null);
  const [heroTextLang, setHeroTextLang] = useState<Language>("ca");
  const [serviceTextLang, setServiceTextLang] = useState<Language>("ca");
  const [ctaTextLang, setCtaTextLang] = useState<Language>("ca");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6000);

    (async () => {
      try {
        const res = await fetch("/api/site-config?view=draft", { cache: "no-store", signal: controller.signal });
        const json = await res.json().catch(() => getDefaultConfig());
        const parsed = SiteConfigSchema.safeParse(json);
        setCfg(parsed.success ? normalizeSiteConfig(parsed.data) : getDefaultConfig());
      } catch {
        setCfg(getDefaultConfig());
      } finally {
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  const can = useMemo(() => !!cfg, [cfg]);

  async function save() {
    if (!cfg) return;
    setSaving(true);
    setMsg(null);
    const res = await fetch("/api/site-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    const payload = await res.json().catch(() => null);
    setSaving(false);
    setMsg(res.ok ? "Rascunho guardado. So muda no site apos Publicar." : payload?.error ?? "Erro ao guardar.");
  }

  async function publish() {
    setPublishing(true);
    setMsg(null);
    const res = await fetch("/api/site-config", { method: "POST" });
    const payload = await res.json().catch(() => null);
    setPublishing(false);
    setMsg(res.ok ? "Publicado com sucesso no site." : payload?.error ?? "Erro ao publicar.");
  }

  function reset() {
    setCfg(getDefaultConfig());
    setMsg("Valores restaurados no editor. Guarde e publique para aplicar.");
  }

  function updateSlide(index: number, patch: Partial<SiteConfig["heroBanner"]["slides"][number]>) {
    if (!cfg) return;
    const slides = cfg.heroBanner.slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide));
    setCfg({ ...cfg, heroBanner: { ...cfg.heroBanner, slides } });
  }

  function updateLocalizedHeroSlide(lang: Language, index: number, patch: Partial<SlideText>) {
    if (!cfg || lang === "ca") return;
    const currentSlides = cfg.i18n?.[lang]?.heroSlides ?? TRANSLATIONS[lang].hero.slides;
    const heroSlides = currentSlides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide));
    setCfg({
      ...cfg,
      i18n: {
        ...(cfg.i18n ?? {}),
        [lang]: {
          ...(cfg.i18n?.[lang] ?? {
            heroSlides: TRANSLATIONS[lang].hero.slides,
            services: TRANSLATIONS[lang].services.items,
            cta: TRANSLATIONS[lang].cta,
          }),
          heroSlides,
        },
      },
    });
  }

  function updateService(index: number, patch: Partial<SiteConfig["services"][number]>) {
    if (!cfg) return;
    const services = cfg.services.map((service, i) => (i === index ? { ...service, ...patch } : service));
    setCfg({ ...cfg, services });
  }

  function updateLocalizedService(lang: Language, serviceId: string, patch: Partial<ServiceText>) {
    if (!cfg || lang === "ca") return;
    const fallbackService = TRANSLATIONS[lang].services.items[serviceId];
    if (!fallbackService) return;
    const currentServices = cfg.i18n?.[lang]?.services ?? TRANSLATIONS[lang].services.items;
    const nextService = { ...(currentServices[serviceId] ?? fallbackService), ...patch };
    setCfg({
      ...cfg,
      i18n: {
        ...(cfg.i18n ?? {}),
        [lang]: {
          ...(cfg.i18n?.[lang] ?? {
            heroSlides: TRANSLATIONS[lang].hero.slides,
            services: TRANSLATIONS[lang].services.items,
            cta: TRANSLATIONS[lang].cta,
          }),
          services: {
            ...currentServices,
            [serviceId]: nextService,
          },
        },
      },
    });
  }

  function updateLocalizedCta(lang: Language, patch: Partial<CtaText>) {
    if (!cfg || lang === "ca") return;
    const currentCta = cfg.i18n?.[lang]?.cta ?? TRANSLATIONS[lang].cta;
    setCfg({
      ...cfg,
      i18n: {
        ...(cfg.i18n ?? {}),
        [lang]: {
          ...(cfg.i18n?.[lang] ?? {
            heroSlides: TRANSLATIONS[lang].hero.slides,
            services: TRANSLATIONS[lang].services.items,
            cta: TRANSLATIONS[lang].cta,
          }),
          cta: { ...currentCta, ...patch },
        },
      },
    });
  }

  function addService() {
    if (!cfg) return;
    const next = createPlaceholderService(cfg.services.length);
    setCfg({ ...cfg, services: [...cfg.services, next] });
  }

  function removeService(index: number) {
    if (!cfg) return;
    const service = cfg.services[index];
    const ok = window.confirm(`Remover o service "${service?.name ?? "Service"}"?`);
    if (!ok) return;
    const services = cfg.services.filter((_, i) => i !== index);
    setCfg({ ...cfg, services });
  }

  function duplicateService(index: number) {
    if (!cfg) return;
    const current = cfg.services[index];
    if (!current) return;

    const copy: SiteConfig["services"][number] = {
      ...current,
      id: `${current.id}-copy-${Date.now()}`,
      name: `${current.name} (copy)`,
    };

    const services = [...cfg.services];
    services.splice(index + 1, 0, copy);
    setCfg({ ...cfg, services });
  }

  function moveService(fromIndex: number, toIndex: number) {
    if (!cfg) return;
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0) return;
    if (fromIndex >= cfg.services.length || toIndex >= cfg.services.length) return;

    const services = [...cfg.services];
    const [moved] = services.splice(fromIndex, 1);
    services.splice(toIndex, 0, moved);
    setCfg({ ...cfg, services });
  }

  if (!cfg) return <div className="text-brand-silver/80">Carregando...</div>;

  const sectionTitles: Record<AdminSection, string> = {
    dashboard: "Dashboard",
    hero: "Hero",
    services: "Serveis",
    appearance: "Aparenca",
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">{sectionTitles[section]}</h1>
          <p className="text-brand-silver/80 mt-2">Guardar cria rascunho. Publicar aplica no site.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 border border-white/10 hover:border-brand-cyan/30 hover:bg-white/5"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            disabled={!can || saving}
            onClick={save}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 bg-brand-cyan text-brand-dark font-extrabold shadow-glowStrong disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <button
            disabled={publishing}
            onClick={publish}
            className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 border border-brand-cyan/40 text-brand-cyan font-extrabold hover:bg-brand-cyan/10"
          >
            <Rocket className="w-4 h-4" />
            {publishing ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>

      {msg && <div className="mt-4 text-sm text-brand-silver/85">{msg}</div>}

      {section === "dashboard" && (
        <div className="mt-8 space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-xs text-brand-silver/70">Slides Hero</div>
              <div className="text-3xl font-black mt-1">{cfg.heroBanner.slides.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-xs text-brand-silver/70">Servicos</div>
              <div className="text-3xl font-black mt-1">{cfg.services.length}</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-xs text-brand-silver/70">Intervalo do carrossel</div>
              <div className="text-3xl font-black mt-1">{cfg.heroBanner.settings.autoSlideIntervalMs}ms</div>
            </div>
          </div>
          <LivePreview cfg={cfg} />
        </div>
      )}

      {section === "hero" && (
        <div className="mt-8 grid xl:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <div className="font-extrabold text-white mb-4">Carousel do Hero</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-xs text-brand-silver/70 mb-1">Intervalo de troca (ms)</div>
                  <input
                    type="number"
                    min={1000}
                    max={60000}
                    value={cfg.heroBanner.settings.autoSlideIntervalMs}
                    onChange={(e) =>
                      setCfg({
                        ...cfg,
                        heroBanner: {
                          ...cfg.heroBanner,
                          settings: {
                            ...cfg.heroBanner.settings,
                            autoSlideIntervalMs: toNumberInRange(e.target.value, cfg.heroBanner.settings.autoSlideIntervalMs, 1000, 60000),
                          },
                        },
                      })
                    }
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60"
                  />
                </label>
                <label className="block">
                  <div className="text-xs text-brand-silver/70 mb-1">Opacidade da imagem (0-1)</div>
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.01}
                    value={cfg.heroBanner.settings.imageOpacity}
                    onChange={(e) =>
                      setCfg({
                        ...cfg,
                        heroBanner: {
                          ...cfg.heroBanner,
                          settings: {
                            ...cfg.heroBanner.settings,
                            imageOpacity: toNumberInRange(e.target.value, cfg.heroBanner.settings.imageOpacity, 0, 1),
                          },
                        },
                      })
                    }
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs text-brand-silver/70 mb-2">Idioma dos textos do Hero</div>
              <div className="flex items-center gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={`hero-lang-${lang.code}`}
                    type="button"
                    onClick={() => setHeroTextLang(lang.code)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      heroTextLang === lang.code ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40" : "bg-black/20 border border-white/10 text-brand-silver/80"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {cfg.heroBanner.slides.map((slide, index) => {
              const langSlide =
                heroTextLang === "ca"
                  ? null
                  : cfg.i18n?.[heroTextLang]?.heroSlides?.[index] ?? TRANSLATIONS[heroTextLang].hero.slides[index];
              const textSource = langSlide ?? slide;

              return (
                <div key={`banner-${index}`} className="rounded-3xl border border-white/10 bg-black/20 p-6">
                  <div className="font-extrabold text-white mb-4">{`Banner ${index + 1}`}</div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <ImageUrlInput
                        label="Imagem (URL)"
                        value={slide.image}
                        folder={`hero/slide-${index + 1}`}
                        onChange={(next) => updateSlide(index, { image: next })}
                        onError={setMsg}
                      />
                    </div>
                    <label className="block">
                      <div className="text-xs text-brand-silver/70 mb-1">Badge</div>
                      <input
                        value={textSource.badge}
                        onChange={(e) => (heroTextLang === "ca" ? updateSlide(index, { badge: e.target.value }) : updateLocalizedHeroSlide(heroTextLang, index, { badge: e.target.value }))}
                        className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60"
                      />
                    </label>
                    <label className="block">
                      <div className="text-xs text-brand-silver/70 mb-1">Titulo</div>
                      <input
                        value={textSource.title}
                        onChange={(e) => (heroTextLang === "ca" ? updateSlide(index, { title: e.target.value }) : updateLocalizedHeroSlide(heroTextLang, index, { title: e.target.value }))}
                        className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60"
                      />
                    </label>
                    <label className="block">
                      <div className="text-xs text-brand-silver/70 mb-1">Highlight</div>
                      <input
                        value={textSource.highlight}
                        onChange={(e) => (heroTextLang === "ca" ? updateSlide(index, { highlight: e.target.value }) : updateLocalizedHeroSlide(heroTextLang, index, { highlight: e.target.value }))}
                        className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60"
                      />
                    </label>
                    <label className="block">
                      <div className="text-xs text-brand-silver/70 mb-1">Preco (numero ou texto)</div>
                      <input value={slide.price ?? ""} onChange={(e) => updateSlide(index, { price: parsePriceInput(e.target.value) })} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60" />
                    </label>
                    <label className="block sm:col-span-2">
                      <div className="text-xs text-brand-silver/70 mb-1">Descricao</div>
                      <textarea
                        rows={3}
                        value={textSource.description}
                        onChange={(e) => (heroTextLang === "ca" ? updateSlide(index, { description: e.target.value }) : updateLocalizedHeroSlide(heroTextLang, index, { description: e.target.value }))}
                        className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60"
                      />
                    </label>
                    <label className="block">
                      <div className="text-xs text-brand-silver/70 mb-1">Texto do botao</div>
                      <input
                        value={textSource.buttonText}
                        onChange={(e) => (heroTextLang === "ca" ? updateSlide(index, { buttonText: e.target.value }) : updateLocalizedHeroSlide(heroTextLang, index, { buttonText: e.target.value }))}
                        className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60"
                      />
                    </label>
                    <label className="block">
                      <div className="text-xs text-brand-silver/70 mb-1">Mensagem WhatsApp</div>
                      <input
                        value={textSource.whatsappMessage}
                        onChange={(e) => (heroTextLang === "ca" ? updateSlide(index, { whatsappMessage: e.target.value }) : updateLocalizedHeroSlide(heroTextLang, index, { whatsappMessage: e.target.value }))}
                        className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60"
                      />
                    </label>
                    <label className="block">
                      <div className="text-xs text-brand-silver/70 mb-1">imageSize</div>
                      <input value={slide.imageSize} onChange={(e) => updateSlide(index, { imageSize: e.target.value })} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60" />
                    </label>
                    <label className="block">
                      <div className="text-xs text-brand-silver/70 mb-1">imagePosition</div>
                      <input value={slide.imagePosition} onChange={(e) => updateSlide(index, { imagePosition: e.target.value })} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60" />
                    </label>
                  </div>
                </div>
              );
            })}

            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <div className="font-extrabold text-white mb-3">CTA por idioma</div>
              <div className="flex items-center gap-2 mb-4">
                {LANGUAGES.map((lang) => (
                  <button
                    key={`cta-lang-${lang.code}`}
                    type="button"
                    onClick={() => setCtaTextLang(lang.code)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      ctaTextLang === lang.code ? "bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/40" : "bg-black/20 border border-white/10 text-brand-silver/80"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
              {(() => {
                const source = ctaTextLang === "ca" ? TRANSLATIONS.ca.cta : cfg.i18n?.[ctaTextLang]?.cta ?? TRANSLATIONS[ctaTextLang].cta;
                return (
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="block">
                      <div className="text-xs text-brand-silver/70 mb-1">Titulo</div>
                      <input value={source.title} onChange={(e) => ctaTextLang !== "ca" && updateLocalizedCta(ctaTextLang, { title: e.target.value })} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60" />
                    </label>
                    <label className="block">
                      <div className="text-xs text-brand-silver/70 mb-1">Highlight</div>
                      <input value={source.highlight} onChange={(e) => ctaTextLang !== "ca" && updateLocalizedCta(ctaTextLang, { highlight: e.target.value })} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60" />
                    </label>
                    <label className="block sm:col-span-2">
                      <div className="text-xs text-brand-silver/70 mb-1">Descricao</div>
                      <textarea rows={3} value={source.description} onChange={(e) => ctaTextLang !== "ca" && updateLocalizedCta(ctaTextLang, { description: e.target.value })} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60" />
                    </label>
                    <label className="block">
                      <div className="text-xs text-brand-silver/70 mb-1">Texto do botao</div>
                      <input value={source.button} onChange={(e) => ctaTextLang !== "ca" && updateLocalizedCta(ctaTextLang, { button: e.target.value })} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60" />
                    </label>
                    <label className="block">
                      <div className="text-xs text-brand-silver/70 mb-1">Mensagem WhatsApp</div>
                      <input value={source.whatsappMessage} onChange={(e) => ctaTextLang !== "ca" && updateLocalizedCta(ctaTextLang, { whatsappMessage: e.target.value })} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60" />
                    </label>
                  </div>
                );
              })()}
              {ctaTextLang === "ca" && <div className="mt-3 text-xs text-brand-silver/60">Para CA, os textos continuam no dicionario base.</div>}
            </div>
          </div>
          <LivePreview cfg={cfg} />
        </div>
      )}

      {section === "services" && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-brand-silver/75">Gerencie os servicos exibidos no site.</div>
            <button
              type="button"
              onClick={addService}
              className="rounded-xl border border-brand-cyan/40 text-brand-cyan px-4 py-2 text-sm font-semibold hover:bg-brand-cyan/10"
            >
              + Add service
            </button>
          </div>
          {cfg.services.map((service, index) => (
            <div
              key={service.id}
              draggable
              onDragStart={() => setDraggingServiceIndex(index)}
              onDragEnd={() => setDraggingServiceIndex(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (draggingServiceIndex === null) return;
                moveService(draggingServiceIndex, index);
                setDraggingServiceIndex(null);
              }}
              className={`rounded-3xl border bg-black/20 p-6 transition ${
                draggingServiceIndex === index ? "border-brand-cyan/50 opacity-70" : "border-white/10"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="cursor-move select-none text-brand-silver/60" title="Arraste para reordenar">⋮⋮</span>
                  <div className="font-extrabold text-white">{service.name}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => duplicateService(index)}
                    className="rounded-lg border border-brand-cyan/40 px-3 py-1.5 text-xs font-semibold text-brand-cyan hover:bg-brand-cyan/10"
                  >
                    Duplicar
                  </button>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="rounded-lg border border-red-400/40 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10"
                  >
                    Remover
                  </button>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-xs text-brand-silver/70 mb-1">Nome</div>
                  <input value={service.name} onChange={(e) => updateService(index, { name: e.target.value })} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60" />
                </label>
                <label className="block">
                  <div className="text-xs text-brand-silver/70 mb-1">Preco base</div>
                  <input value={String(service.priceFrom)} onChange={(e) => updateService(index, { priceFrom: parsePriceInput(e.target.value) })} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60" />
                </label>
                <label className="block sm:col-span-2">
                  <div className="text-xs text-brand-silver/70 mb-1">Descricao</div>
                  <textarea rows={3} value={service.description} onChange={(e) => updateService(index, { description: e.target.value })} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60" />
                </label>
                <div className="sm:col-span-2">
                  <ImageUrlInput
                    label="Imagem (URL)"
                    value={service.imageUrl}
                    folder={`services/${service.id}`}
                    onChange={(next) => updateService(index, { imageUrl: next })}
                    onError={setMsg}
                  />
                </div>
                <label className="block sm:col-span-2">
                  <div className="text-xs text-brand-silver/70 mb-1">Highlights (uma linha por item)</div>
                  <textarea
                    rows={4}
                    value={service.highlights.join("\n")}
                    onChange={(e) =>
                      updateService(index, {
                        highlights: e.target.value
                          .split("\n")
                          .map((x) => x.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}

      {section === "appearance" && (
        <div className="mt-8 grid xl:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <div className="font-extrabold text-white mb-4">Aparencia global</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="block">
                  <div className="text-xs text-brand-silver/70 mb-1">Brightness ({cfg.appearance.brightness.toFixed(2)})</div>
                  <input type="range" min={0} max={1} step={0.01} value={cfg.appearance.brightness} onChange={(e) => setCfg({ ...cfg, appearance: { ...cfg.appearance, brightness: Number(e.target.value) } })} className="w-full" />
                </label>
                <label className="block">
                  <div className="text-xs text-brand-silver/70 mb-1">Overlay ({cfg.appearance.overlay.toFixed(2)})</div>
                  <input type="range" min={0} max={1} step={0.01} value={cfg.appearance.overlay} onChange={(e) => setCfg({ ...cfg, appearance: { ...cfg.appearance, overlay: Number(e.target.value) } })} className="w-full" />
                </label>
                <div className="sm:col-span-2">
                  <ImageUrlInput
                    label="Texture URL"
                    value={cfg.appearance.textureUrl}
                    folder="appearance/texture"
                    onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textureUrl: next } })}
                    onError={setMsg}
                  />
                </div>
                <label className="block">
                  <div className="text-xs text-brand-silver/70 mb-1">Cursor mode</div>
                  <select value={cfg.appearance.cursorMode} onChange={(e) => setCfg({ ...cfg, appearance: { ...cfg.appearance, cursorMode: e.target.value as SiteConfig["appearance"]["cursorMode"] } })} className="w-full rounded-xl bg-black/30 border border-white/10 px-4 py-3 outline-none focus:border-brand-cyan/60">
                    <option value="realistic">realistic</option>
                    <option value="neon">neon</option>
                    <option value="off">off</option>
                  </select>
                </label>
                <label className="flex items-center gap-3 mt-6">
                  <input type="checkbox" checked={cfg.appearance.showTexture} onChange={(e) => setCfg({ ...cfg, appearance: { ...cfg.appearance, showTexture: e.target.checked } })} />
                  <span className="text-sm text-brand-silver/85">Mostrar textura</span>
                </label>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-black/20 p-6">
              <div className="font-extrabold text-white mb-4">Cores dos textos (paleta + hexadecimal)</div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <div className="font-bold text-white">Hero</div>
                  <div className="text-xs text-brand-silver/70 mt-1 mb-3">Cores usadas no badge, titulo, destaque e botao do Hero.</div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <ColorInput label="Badge" value={cfg.appearance.textColors.heroBadge} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, heroBadge: next } } })} />
                    <ColorInput label="Titulo" value={cfg.appearance.textColors.heroTitle} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, heroTitle: next } } })} />
                    <ColorInput label="Highlight" value={cfg.appearance.textColors.heroHighlight} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, heroHighlight: next } } })} />
                    <ColorInput label="Descricao" value={cfg.appearance.textColors.heroDescription} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, heroDescription: next } } })} />
                    <ColorInput label="Texto botao" value={cfg.appearance.textColors.heroButtonText} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, heroButtonText: next } } })} />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <div className="font-bold text-white">Services</div>
                  <div className="text-xs text-brand-silver/70 mt-1 mb-3">Cores do titulo da secao e dos textos dos cards de servico.</div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <ColorInput label="Titulo secao" value={cfg.appearance.textColors.servicesTitle} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, servicesTitle: next } } })} />
                    <ColorInput label="Highlight secao" value={cfg.appearance.textColors.servicesHighlight} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, servicesHighlight: next } } })} />
                    <ColorInput label="Titulo card" value={cfg.appearance.textColors.servicesCardTitle} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, servicesCardTitle: next } } })} />
                    <ColorInput label="Preco card" value={cfg.appearance.textColors.servicesCardPrice} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, servicesCardPrice: next } } })} />
                    <ColorInput label="Descricao card" value={cfg.appearance.textColors.servicesCardDescription} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, servicesCardDescription: next } } })} />
                    <ColorInput label="Bullet card" value={cfg.appearance.textColors.servicesCardBullet} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, servicesCardBullet: next } } })} />
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
                  <div className="font-bold text-white">CTA</div>
                  <div className="text-xs text-brand-silver/70 mt-1 mb-3">Cores do bloco final de chamada para contacto.</div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <ColorInput label="Titulo" value={cfg.appearance.textColors.ctaTitle} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, ctaTitle: next } } })} />
                    <ColorInput label="Highlight" value={cfg.appearance.textColors.ctaHighlight} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, ctaHighlight: next } } })} />
                    <ColorInput label="Descricao" value={cfg.appearance.textColors.ctaDescription} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, ctaDescription: next } } })} />
                    <ColorInput label="Texto botao" value={cfg.appearance.textColors.ctaButtonText} onChange={(next) => setCfg({ ...cfg, appearance: { ...cfg.appearance, textColors: { ...cfg.appearance.textColors, ctaButtonText: next } } })} />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <LivePreview cfg={cfg} />
        </div>
      )}
    </div>
  );
}
