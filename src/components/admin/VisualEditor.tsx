"use client";

import { useEffect, useRef, useState } from "react";
import { GripVertical, Pencil, Save, Rocket, RefreshCw, ImagePlus, Move, Check, Undo2, Redo2, Copy, Trash2 } from "lucide-react";
import type { SectionType, SiteConfig } from "@/types/site-config";
import { getDefaultConfig, normalizeSiteConfig, SiteConfigSchema } from "@/lib/site-config";
import { BUSINESS, SERVICE_PRICING_BY_ID, type PriceValue } from "@/lib/constants";
import { TRANSLATIONS, type Language } from "@/lib/i18n";
import { eur } from "@/lib/utils";

function parsePriceInput(value: string): PriceValue {
  const trimmed = value.trim();
  const normalized = trimmed.replace(",", ".");
  if (/^-?\d+(\.\d+)?$/.test(normalized)) return Number(normalized);
  return trimmed;
}

function numberPrice(value: PriceValue): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const v = Number(String(value).replace(",", ".").trim());
  return Number.isFinite(v) ? v : null;
}

function EditableText({
  value,
  onSave,
  className,
  multiline = false,
}: {
  value: string;
  onSave: (next: string) => void;
  className?: string;
  multiline?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  function commit() {
    onSave(draft);
    setEditing(false);
  }

  useEffect(() => {
    setDraft(value);
  }, [value]);

  if (editing) {
    return (
      <div className="group relative">
        {multiline ? (
          <textarea
            autoFocus
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setDraft(value);
                setEditing(false);
              }
            }}
            className="w-full rounded-xl border border-brand-cyan/40 bg-black/40 px-3 py-2 text-inherit outline-none"
          />
        ) : (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commit();
              }
              if (e.key === "Escape") {
                e.preventDefault();
                setDraft(value);
                setEditing(false);
              }
            }}
            className="w-full rounded-xl border border-brand-cyan/40 bg-black/40 px-3 py-2 text-inherit outline-none"
          />
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      className={`group relative w-full text-left ${className ?? ""}`}
      title="Clique para editar"
    >
      <span>{value}</span>
      <span className="pointer-events-none absolute -right-2 -top-2 rounded-full border border-brand-cyan/30 bg-brand-dark/80 p-1 opacity-0 transition group-hover:opacity-100">
        <Pencil className="h-3.5 w-3.5 text-brand-cyan" />
      </span>
    </button>
  );
}

function ImageTool({
  label,
  value,
  folder,
  onChange,
}: {
  label: string;
  value: string;
  folder: string;
  onChange: (next: string) => void;
}) {
  async function upload(file: File) {
    const form = new FormData();
    form.set("file", file);
    form.set("folder", folder);
    const res = await fetch("/api/upload", { method: "POST", body: form });
    const payload = await res.json().catch(() => null);
    if (res.ok && payload?.url) onChange(payload.url);
  }

  return (
    <details className="group relative">
      <summary className="cursor-pointer list-none rounded-full border border-brand-cyan/35 bg-brand-dark/75 p-2 text-brand-cyan hover:bg-brand-cyan/15">
        <Move className="h-4 w-4 rotate-90" />
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-white/10 bg-brand-dark2/95 p-3 shadow-xl backdrop-blur">
        <div className="text-xs font-bold text-brand-silver/80">{label}</div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-brand-cyan/50"
        />
        <label className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-brand-cyan/35 bg-brand-cyan/10 px-3 py-2 text-sm font-semibold text-brand-cyan">
          <ImagePlus className="h-4 w-4" />
          Subir imagem
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.currentTarget.value = "";
            }}
          />
        </label>
      </div>
    </details>
  );
}

export function VisualEditor() {
  const [cfg, setCfg] = useState<SiteConfig | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [language, setLanguage] = useState<Language>("ca");
  const [heroSlide, setHeroSlide] = useState(0);
  const [dragService, setDragService] = useState<number | null>(null);
  const [dragStep, setDragStep] = useState<number | null>(null);
  const [dragSection, setDragSection] = useState<number | null>(null);
  const [estimateSelection, setEstimateSelection] = useState<Record<string, boolean>>({});
  const [selectedSectionType, setSelectedSectionType] = useState<SectionType | null>(null);
  const [selectedLayoutSectionId, setSelectedLayoutSectionId] = useState<string | null>(null);
  const [history, setHistory] = useState<SiteConfig[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const historyLock = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/site-config?view=draft", { cache: "no-store" });
        const json = await res.json().catch(() => getDefaultConfig());
        const parsed = SiteConfigSchema.safeParse(json);
        setCfg(parsed.success ? normalizeSiteConfig(parsed.data) : getDefaultConfig());
      } catch {
        setCfg(getDefaultConfig());
      }
    })();
  }, []);

  useEffect(() => {
    if (!cfg) return;
    if (historyLock.current) {
      historyLock.current = false;
      return;
    }
    const current = history[historyIndex];
    const same = current && JSON.stringify(current) === JSON.stringify(cfg);
    if (same) return;
    const next = history.slice(0, historyIndex + 1);
    next.push(cfg);
    setHistory(next.slice(-40));
    setHistoryIndex((idx) => Math.min(idx + 1, 39));
  }, [cfg]);

  function langPack(lang: Language) {
    return TRANSLATIONS[lang];
  }

  function ensureI18nLang(current: SiteConfig, lang: Language) {
    const t = langPack(lang);
    const fallbackServices = Object.fromEntries(
      current.services.map((s) => [s.id, t.services.items[s.id] ?? { name: s.name, description: s.description, highlights: [...s.highlights] }])
    );
    return {
      navbar: { ...t.navbar },
      heroSlides: t.hero.slides.map((x) => ({ ...x })),
      services: fallbackServices,
      process: { ...t.process, steps: t.process.steps.map((x) => ({ ...x })) },
      location: { ...t.location },
      cta: { ...t.cta },
      footer: { ...t.footer },
      estimate: { ...t.estimate },
      ...(current.i18n?.[lang] ?? {}),
    };
  }

  function setLocalized(
    key: "navbar" | "heroSlides" | "services" | "process" | "location" | "cta" | "footer" | "estimate",
    updater: (current: any) => any
  ) {
    if (!cfg || language === "ca") return;
    const ensured = ensureI18nLang(cfg, language);
    const next = updater(ensured[key]);
    setCfg({
      ...cfg,
      i18n: {
        ...(cfg.i18n ?? {}),
        [language]: {
          ...ensured,
          [key]: next,
        },
      },
    });
  }

  function moveService(from: number, to: number) {
    if (!cfg || from === to) return;
    const services = [...cfg.services];
    const [m] = services.splice(from, 1);
    services.splice(to, 0, m);
    setCfg({ ...cfg, services });
  }

  function moveProcessStep(from: number, to: number) {
    if (!cfg || from === to) return;
    const source = language === "ca" ? cfg.process.steps : cfg.i18n?.[language]?.process?.steps ?? TRANSLATIONS[language].process.steps;
    const steps = source.map((x) => ({ ...x }));
    const [m] = steps.splice(from, 1);
    steps.splice(to, 0, m);
    if (language === "ca") {
      setCfg({ ...cfg, process: { ...cfg.process, steps } });
    } else {
      setLocalized("process", (p: any) => ({ ...p, steps }));
    }
  }

  async function save() {
    if (!cfg) return;
    setSaving(true);
    const res = await fetch("/api/site-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cfg),
    });
    setSaving(false);
    setMsg(res.ok ? "Rascunho guardado." : "Falha ao guardar.");
  }

  async function publish() {
    setPublishing(true);
    const res = await fetch("/api/site-config", { method: "POST" });
    setPublishing(false);
    setMsg(res.ok ? "Publicado no site." : "Falha ao publicar.");
  }

  if (!cfg) return <div className="p-8 text-brand-silver">Carregando editor visual...</div>;

  function undo() {
    if (historyIndex <= 0) return;
    historyLock.current = true;
    setHistoryIndex(historyIndex - 1);
    setCfg(history[historyIndex - 1]);
    setMsg("Undo aplicado.");
  }

  function redo() {
    if (historyIndex >= history.length - 1) return;
    historyLock.current = true;
    setHistoryIndex(historyIndex + 1);
    setCfg(history[historyIndex + 1]);
    setMsg("Redo aplicado.");
  }

  function visibleByType(type: SectionType): boolean {
    return !!cfg && cfg.layout.sections.some((section) => section.type === type && section.enabled);
  }

  function sectionCount(type: SectionType): number {
    return cfg ? cfg.layout.sections.filter((section) => section.type === type && section.enabled).length : 0;
  }

  function moveLayoutSection(from: number, to: number) {
    if (!cfg) return;
    if (from === to) return;
    const sections = [...cfg.layout.sections];
    const [moved] = sections.splice(from, 1);
    sections.splice(to, 0, moved);
    setCfg({ ...cfg, layout: { ...cfg.layout, sections } });
  }

  function duplicateLayoutSection(index: number) {
    if (!cfg) return;
    const source = cfg.layout.sections[index];
    if (!source) return;
    const clone = { ...source, id: `${source.type}-${Date.now()}` };
    const sections = [...cfg.layout.sections];
    sections.splice(index + 1, 0, clone);
    setCfg({ ...cfg, layout: { ...cfg.layout, sections } });
  }

  function removeLayoutSection(index: number) {
    if (!cfg) return;
    const sections = cfg.layout.sections.filter((_, i) => i !== index);
    setCfg({ ...cfg, layout: { ...cfg.layout, sections: sections.length ? sections : cfg.layout.sections } });
  }

  function syncSelectedType(type: SectionType) {
    if (!cfg) return;
    setSelectedSectionType(type);
    const first = cfg.layout.sections.find((s) => s.type === type);
    if (first) setSelectedLayoutSectionId(first.id);
  }

  const isCa = language === "ca";
  const t = TRANSLATIONS[language];
  const nav = isCa ? cfg.navbar : cfg.i18n?.[language]?.navbar ?? t.navbar;
  const heroText = isCa
    ? cfg.heroBanner.slides[heroSlide]
    : cfg.i18n?.[language]?.heroSlides?.[heroSlide] ?? t.hero.slides[heroSlide];
  const processText = isCa ? cfg.process : cfg.i18n?.[language]?.process ?? t.process;
  const locationText = isCa ? cfg.location : cfg.i18n?.[language]?.location ?? t.location;
  const ctaText = isCa ? cfg.cta : cfg.i18n?.[language]?.cta ?? t.cta;
  const footerText = isCa ? cfg.footer : cfg.i18n?.[language]?.footer ?? t.footer;
  const estimateText = isCa ? cfg.estimate : cfg.i18n?.[language]?.estimate ?? t.estimate;

  const estimateOptions = cfg.services.filter((s) => s.estimateEnabled !== false).map((s) => {
    const tr = cfg.i18n?.[language]?.services?.[s.id] ?? t.services.items[s.id];
    const name = s.estimateLabel?.trim() || (isCa ? s.name : tr?.name ?? s.name);
    const price = s.priceFrom ?? SERVICE_PRICING_BY_ID[s.id];
    return { id: s.id, name, price, numeric: numberPrice(price) };
  });
  const total = estimateOptions
    .filter((o) => estimateSelection[o.id])
    .reduce((acc, o) => acc + (o.numeric ?? 0), 0);

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <div className="sticky top-0 z-40 border-b border-white/10 bg-brand-dark/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1700px] flex-wrap items-center gap-3 px-4 py-3">
          <div className="text-sm font-black tracking-[0.08em] text-brand-cyan">MODO CONSTRUCAO</div>
          <div className="ml-auto flex flex-wrap gap-2">
            {(["ca", "es", "en"] as Language[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLanguage(l)}
                className={`rounded-xl border px-3 py-2 text-xs font-bold uppercase ${
                  language === l ? "border-brand-cyan/50 bg-brand-cyan/15 text-brand-cyan" : "border-white/10 text-brand-silver/85"
                }`}
              >
                {l}
              </button>
            ))}
            <button onClick={() => { setCfg(getDefaultConfig()); setMsg("Resetado no editor."); }} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold hover:border-brand-cyan/30">
              <RefreshCw className="h-4 w-4" /> Reset
            </button>
            <button onClick={undo} disabled={historyIndex <= 0} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold disabled:opacity-50">
              <Undo2 className="h-4 w-4" /> Undo
            </button>
            <button onClick={redo} disabled={historyIndex >= history.length - 1} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold disabled:opacity-50">
              <Redo2 className="h-4 w-4" /> Redo
            </button>
            <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-brand-cyan px-4 py-2 text-sm font-black text-brand-dark disabled:opacity-60">
              <Save className="h-4 w-4" /> {saving ? "Guardando" : "Guardar"}
            </button>
            <button onClick={publish} disabled={publishing} className="inline-flex items-center gap-2 rounded-xl border border-brand-cyan/50 px-4 py-2 text-sm font-black text-brand-cyan">
              <Rocket className="h-4 w-4" /> {publishing ? "Publicando" : "Publicar"}
            </button>
          </div>
        </div>
        {msg && <div className="border-t border-white/10 px-4 py-2 text-xs text-brand-silver/80">{msg}</div>}
        <div className="border-t border-white/10 px-4 py-2">
          <div className="mx-auto flex max-w-[1700px] items-center gap-2 overflow-x-auto text-xs">
            <span className="shrink-0 rounded-lg border border-white/10 px-2 py-1 font-bold text-brand-cyan">Fluxo publicado</span>
            {cfg.layout.sections
              .filter((section) => section.enabled)
              .map((section, index) => (
                <button
                  key={`flow-${section.id}`}
                  type="button"
                  onClick={() => {
                    setSelectedLayoutSectionId(section.id);
                    setSelectedSectionType(section.type);
                  }}
                  className={`shrink-0 rounded-lg border px-2 py-1 font-semibold ${
                    selectedLayoutSectionId === section.id
                      ? "border-brand-cyan/45 bg-brand-cyan/12 text-brand-cyan"
                      : "border-white/10 bg-black/20 text-brand-silver/80"
                  }`}
                  title={`${section.type} | mobile:${section.mobile ? "on" : "off"} desktop:${section.desktop ? "on" : "off"}`}
                >
                  {index + 1}. {section.type}
                </button>
              ))}
          </div>
        </div>
      </div>

      <main className="relative xl:pr-[360px]">
        <section
          className={`relative min-h-[92svh] overflow-hidden pt-24 ${!visibleByType("hero") ? "hidden" : ""} ${
            selectedSectionType === "hero" ? "ring-2 ring-brand-cyan/60 ring-inset" : ""
          }`}
          onClick={() => syncSelectedType("hero")}
        >
          <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `url(${cfg.heroBanner.slides[heroSlide].image})` }} />
          <div className="absolute right-6 top-24 z-10">
            <ImageTool
              label="Imagem do Hero"
              value={cfg.heroBanner.slides[heroSlide].image}
              folder={`hero/slide-${heroSlide + 1}`}
              onChange={(next) => {
                const slides = cfg.heroBanner.slides.map((s, i) => (i === heroSlide ? { ...s, image: next } : s));
                setCfg({ ...cfg, heroBanner: { ...cfg.heroBanner, slides } });
              }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-brand-dark" />
          <div className="relative mx-auto max-w-6xl px-4 py-14 text-center sm:px-6">
            <div className="mb-8 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
              <EditableText
                value={nav.home}
                onSave={(next) => {
                  if (isCa) setCfg({ ...cfg, navbar: { ...cfg.navbar, home: next } });
                  else setLocalized("navbar", (n: any) => ({ ...n, home: next }));
                }}
                className="w-auto text-sm font-semibold text-brand-silver/90"
              />
              <EditableText
                value={nav.services}
                onSave={(next) => {
                  if (isCa) setCfg({ ...cfg, navbar: { ...cfg.navbar, services: next } });
                  else setLocalized("navbar", (n: any) => ({ ...n, services: next }));
                }}
                className="w-auto text-sm font-semibold text-brand-silver/90"
              />
              <EditableText
                value={nav.process}
                onSave={(next) => {
                  if (isCa) setCfg({ ...cfg, navbar: { ...cfg.navbar, process: next } });
                  else setLocalized("navbar", (n: any) => ({ ...n, process: next }));
                }}
                className="w-auto text-sm font-semibold text-brand-silver/90"
              />
              <EditableText
                value={nav.contact}
                onSave={(next) => {
                  if (isCa) setCfg({ ...cfg, navbar: { ...cfg.navbar, contact: next } });
                  else setLocalized("navbar", (n: any) => ({ ...n, contact: next }));
                }}
                className="w-auto text-sm font-semibold text-brand-silver/90"
              />
            </div>
            <EditableText
              value={heroText.badge}
              onSave={(next) => {
                if (isCa) {
                  const slides = cfg.heroBanner.slides.map((s, i) => (i === heroSlide ? { ...s, badge: next } : s));
                  setCfg({ ...cfg, heroBanner: { ...cfg.heroBanner, slides } });
                } else {
                  setLocalized("heroSlides", (arr: any[]) => arr.map((s: any, i: number) => (i === heroSlide ? { ...s, badge: next } : s)));
                }
              }}
              className="mx-auto inline-flex w-auto rounded-full border border-brand-cyan/30 bg-brand-cyan/10 px-4 py-2 text-sm font-semibold text-brand-cyan"
            />
            <div className="mx-auto mt-6 max-w-4xl">
              <EditableText
                value={`${heroText.title} ${heroText.highlight}`}
                onSave={(next) => {
                  const [title, ...rest] = next.split(" ");
                  const highlight = rest.join(" ") || heroText.highlight;
                  if (isCa) {
                    const slides = cfg.heroBanner.slides.map((s, i) => (i === heroSlide ? { ...s, title, highlight } : s));
                    setCfg({ ...cfg, heroBanner: { ...cfg.heroBanner, slides } });
                  } else {
                    setLocalized("heroSlides", (arr: any[]) => arr.map((s: any, i: number) => (i === heroSlide ? { ...s, title, highlight } : s)));
                  }
                }}
                className="text-5xl font-black leading-tight sm:text-6xl"
              />
            </div>
            <div className="mx-auto mt-5 max-w-3xl">
              <EditableText
                value={heroText.description}
                multiline
                onSave={(next) => {
                  if (isCa) {
                    const slides = cfg.heroBanner.slides.map((s, i) => (i === heroSlide ? { ...s, description: next } : s));
                    setCfg({ ...cfg, heroBanner: { ...cfg.heroBanner, slides } });
                  } else {
                    setLocalized("heroSlides", (arr: any[]) => arr.map((s: any, i: number) => (i === heroSlide ? { ...s, description: next } : s)));
                  }
                }}
                className="text-lg text-brand-silver/90"
              />
            </div>
            <div className="mt-8 flex justify-center gap-2">
              {cfg.heroBanner.slides.map((slide, index) => (
                <button
                  key={`${slide.image}-${index}`}
                  onClick={() => setHeroSlide(index)}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${index === heroSlide ? "bg-brand-cyan text-brand-dark" : "bg-white/15 text-white"}`}
                >
                  Slide {index + 1}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section
          className={`mx-auto max-w-7xl px-4 py-16 sm:px-6 ${!visibleByType("services") ? "hidden" : ""} ${
            selectedSectionType === "services" ? "ring-2 ring-brand-cyan/60 ring-inset rounded-2xl" : ""
          }`}
          onClick={() => syncSelectedType("services")}
        >
          <EditableText
            value={`${isCa ? cfg.navbar.services : nav.services} ${t.services.highlight}`}
            onSave={() => {}}
            className="text-center text-4xl font-black"
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cfg.services.map((service, index) => {
              const tr = cfg.i18n?.[language]?.services?.[service.id] ?? t.services.items[service.id];
              const name = isCa ? service.name : tr?.name ?? service.name;
              const desc = isCa ? service.description : tr?.description ?? service.description;
              const price = service.priceFrom ?? SERVICE_PRICING_BY_ID[service.id];
              return (
                <div
                  key={service.id}
                  draggable
                  onDragStart={() => setDragService(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragService !== null) moveService(dragService, index);
                    setDragService(null);
                  }}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-brand-dark2/70"
                >
                  <div className="absolute right-3 top-3 z-10 flex items-center gap-2">
                    <span className="rounded-full border border-white/20 bg-brand-dark/70 p-1.5 text-brand-silver/80" title="Arraste para ordenar">
                      <GripVertical className="h-4 w-4" />
                    </span>
                    <ImageTool
                      label={`Imagem ${name}`}
                      value={service.imageUrl}
                      folder={`services/${service.id}`}
                      onChange={(next) => setCfg({ ...cfg, services: cfg.services.map((s, i) => (i === index ? { ...s, imageUrl: next } : s)) })}
                    />
                  </div>
                  <div className="h-40 bg-cover bg-center" style={{ backgroundImage: `url(${service.imageUrl})` }} />
                  <div className="space-y-2 p-5">
                    <EditableText
                      value={name}
                      onSave={(next) => {
                        if (isCa) setCfg({ ...cfg, services: cfg.services.map((s, i) => (i === index ? { ...s, name: next } : s)) });
                        else {
                          setLocalized("services", (map: Record<string, any>) => ({ ...map, [service.id]: { ...(map[service.id] ?? tr ?? { name, description: desc, highlights: service.highlights }), name: next } }));
                        }
                      }}
                      className="text-xl font-extrabold"
                    />
                    <EditableText
                      value={String(price)}
                      onSave={(next) => setCfg({ ...cfg, services: cfg.services.map((s, i) => (i === index ? { ...s, priceFrom: parsePriceInput(next) } : s)) })}
                      className="text-sm font-black text-brand-cyan"
                    />
                    <EditableText
                      value={desc}
                      multiline
                      onSave={(next) => {
                        if (isCa) setCfg({ ...cfg, services: cfg.services.map((s, i) => (i === index ? { ...s, description: next } : s)) });
                        else {
                          setLocalized("services", (map: Record<string, any>) => ({ ...map, [service.id]: { ...(map[service.id] ?? tr ?? { name, description: desc, highlights: service.highlights }), description: next } }));
                        }
                      }}
                      className="text-sm text-brand-silver/85"
                    />
                    <label className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-2 py-1 text-xs text-brand-silver/85">
                      <input
                        type="checkbox"
                        checked={service.estimateEnabled !== false}
                        onChange={(e) => setCfg({ ...cfg, services: cfg.services.map((s, i) => (i === index ? { ...s, estimateEnabled: e.target.checked } : s)) })}
                      />
                      Checkbox no orcamento
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section
          className={`mx-auto max-w-7xl px-4 py-12 sm:px-6 ${!visibleByType("estimate") ? "hidden" : ""} ${
            selectedSectionType === "estimate" ? "ring-2 ring-brand-cyan/60 ring-inset rounded-2xl" : ""
          }`}
          onClick={() => syncSelectedType("estimate")}
        >
          <div className="rounded-3xl border border-white/10 bg-brand-dark2/60 p-6">
            <EditableText value={`${estimateText.title} ${estimateText.highlight}`} onSave={(next) => {
              const parts = next.split(" ");
              const title = parts.shift() || estimateText.title;
              const highlight = parts.join(" ") || estimateText.highlight;
              if (isCa) setCfg({ ...cfg, estimate: { ...cfg.estimate, title, highlight } });
              else setLocalized("estimate", (e: any) => ({ ...e, title, highlight }));
            }} className="text-3xl font-black" />
            <EditableText
              value={estimateText.subtitle}
              multiline
              onSave={(next) => {
                if (isCa) setCfg({ ...cfg, estimate: { ...cfg.estimate, subtitle: next } });
                else setLocalized("estimate", (e: any) => ({ ...e, subtitle: next }));
              }}
              className="mt-2 text-brand-silver/85"
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {estimateOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setEstimateSelection((s) => ({ ...s, [option.id]: !s[option.id] }))}
                  className={`rounded-2xl border px-4 py-3 text-left ${estimateSelection[option.id] ? "border-brand-cyan/45 bg-brand-cyan/10" : "border-white/10 bg-black/20"}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">{option.name}</div>
                      <div className="text-xs text-brand-silver/80">{option.numeric === null ? estimateText.onRequest : eur(option.numeric)}</div>
                    </div>
                    {estimateSelection[option.id] && <Check className="h-4 w-4 text-brand-cyan" />}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 text-2xl font-black text-brand-cyan">
              {estimateText.total}: {eur(total)}
            </div>
          </div>
        </section>

        <section
          className={`mx-auto max-w-7xl px-4 py-14 sm:px-6 ${!visibleByType("process") ? "hidden" : ""} ${
            selectedSectionType === "process" ? "ring-2 ring-brand-cyan/60 ring-inset rounded-2xl" : ""
          }`}
          onClick={() => syncSelectedType("process")}
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {processText.steps.map((step, index) => (
              <div
                key={`step-${index}`}
                draggable
                onDragStart={() => setDragStep(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragStep !== null) moveProcessStep(dragStep, index);
                  setDragStep(null);
                }}
                className="rounded-3xl border border-white/10 bg-brand-dark2/65 p-5"
              >
                <div className="mb-2 inline-flex items-center gap-1 text-xs text-brand-cyan">
                  <GripVertical className="h-3.5 w-3.5" /> Drag
                </div>
                <EditableText
                  value={step.t}
                  onSave={(next) => {
                    if (isCa) {
                      const steps = cfg.process.steps.map((s, i) => (i === index ? { ...s, t: next } : s));
                      setCfg({ ...cfg, process: { ...cfg.process, steps } });
                    } else {
                      setLocalized("process", (p: any) => ({ ...p, steps: p.steps.map((s: any, i: number) => (i === index ? { ...s, t: next } : s)) }));
                    }
                  }}
                  className="text-lg font-extrabold"
                />
                <EditableText
                  value={step.d}
                  multiline
                  onSave={(next) => {
                    if (isCa) {
                      const steps = cfg.process.steps.map((s, i) => (i === index ? { ...s, d: next } : s));
                      setCfg({ ...cfg, process: { ...cfg.process, steps } });
                    } else {
                      setLocalized("process", (p: any) => ({ ...p, steps: p.steps.map((s: any, i: number) => (i === index ? { ...s, d: next } : s)) }));
                    }
                  }}
                  className="mt-2 text-sm text-brand-silver/85"
                />
              </div>
            ))}
          </div>
        </section>

        <section
          className={`mx-auto max-w-4xl px-4 py-12 text-center sm:px-6 ${!visibleByType("location") ? "hidden" : ""} ${
            selectedSectionType === "location" ? "ring-2 ring-brand-cyan/60 ring-inset rounded-2xl" : ""
          }`}
          onClick={() => syncSelectedType("location")}
        >
          <div className="rounded-3xl border border-white/10 bg-brand-dark2/55 p-6 text-left">
            <EditableText
              value={locationText.title}
              onSave={(next) => {
                if (isCa) setCfg({ ...cfg, location: { ...cfg.location, title: next } });
                else setLocalized("location", (loc: any) => ({ ...loc, title: next }));
              }}
              className="text-3xl font-black"
            />
            <EditableText
              value={locationText.intro}
              multiline
              onSave={(next) => {
                if (isCa) setCfg({ ...cfg, location: { ...cfg.location, intro: next } });
                else setLocalized("location", (loc: any) => ({ ...loc, intro: next }));
              }}
              className="mt-3 text-brand-silver/85"
            />
          </div>
        </section>

        <section
          className={`mx-auto max-w-4xl px-4 pb-20 text-center sm:px-6 ${!visibleByType("cta") ? "hidden" : ""} ${
            selectedSectionType === "cta" ? "ring-2 ring-brand-cyan/60 ring-inset rounded-2xl" : ""
          }`}
          onClick={() => syncSelectedType("cta")}
        >
          <EditableText
            value={`${ctaText.title} ${ctaText.highlight}`}
            onSave={(next) => {
              const [title, ...rest] = next.split(" ");
              const highlight = rest.join(" ");
              if (isCa) setCfg({ ...cfg, cta: { ...cfg.cta, title, highlight } });
              else setLocalized("cta", (c: any) => ({ ...c, title, highlight }));
            }}
            className="text-5xl font-black"
          />
          <EditableText
            value={ctaText.description}
            multiline
            onSave={(next) => {
              if (isCa) setCfg({ ...cfg, cta: { ...cfg.cta, description: next } });
              else setLocalized("cta", (c: any) => ({ ...c, description: next }));
            }}
            className="mx-auto mt-4 max-w-2xl text-brand-silver/85"
          />
          <div className="mt-10 rounded-2xl border border-white/10 bg-brand-dark/40 p-4 text-sm text-brand-silver/75">
            <EditableText
              value={footerText.reserveMessage}
              onSave={(next) => {
                if (isCa) setCfg({ ...cfg, footer: { ...cfg.footer, reserveMessage: next } });
                else setLocalized("footer", (f: any) => ({ ...f, reserveMessage: next }));
              }}
            />
            <div className="mt-2 text-xs">{BUSINESS.address.street}</div>
          </div>
          <div className="mt-6 text-xs text-brand-silver/65">Modo construcao ativo: clique nos textos com lapis para editar.</div>
          <div className="mt-2 text-xs text-brand-silver/65">{locationText.title} - {locationText.phone}</div>
        </section>

        <section
          className={`mx-auto max-w-7xl px-4 pb-16 ${!visibleByType("footer") ? "hidden" : ""} ${
            selectedSectionType === "footer" ? "ring-2 ring-brand-cyan/60 ring-inset rounded-2xl" : ""
          }`}
          onClick={() => syncSelectedType("footer")}
        >
          <div className="rounded-2xl border border-white/10 bg-brand-dark/40 p-4 text-sm text-brand-silver/75">
            <EditableText
              value={footerText.reserveMessage}
              onSave={(next) => {
                if (isCa) setCfg({ ...cfg, footer: { ...cfg.footer, reserveMessage: next } });
                else setLocalized("footer", (f: any) => ({ ...f, reserveMessage: next }));
              }}
            />
            <div className="mt-2 text-xs">{BUSINESS.address.street}</div>
          </div>
        </section>
      </main>

      <aside className="fixed right-4 top-24 z-30 hidden w-[330px] rounded-2xl border border-white/10 bg-brand-dark2/92 p-4 backdrop-blur xl:block">
        <div className="text-sm font-black text-brand-cyan">Painel de Blocos</div>
        <div className="mt-1 text-xs text-brand-silver/70">Clique no bloco no canvas para selecionar e gerenciar.</div>

        <div className="mt-4 max-h-[62vh] space-y-2 overflow-y-auto pr-1">
          {cfg.layout.sections.map((section, index) => {
            const active = section.id === selectedLayoutSectionId;
            return (
              <div
                key={section.id}
                draggable
                onDragStart={() => setDragSection(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (dragSection !== null) moveLayoutSection(dragSection, index);
                  setDragSection(null);
                }}
                className={`rounded-xl border p-2 ${active ? "border-brand-cyan/50 bg-brand-cyan/10" : "border-white/10 bg-black/20"}`}
                onClick={() => {
                  setSelectedLayoutSectionId(section.id);
                  setSelectedSectionType(section.type);
                }}
              >
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-brand-silver/70" />
                  <div className="flex-1 text-sm font-semibold capitalize">{section.type}</div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateLayoutSection(index);
                    }}
                    className="rounded-lg border border-white/10 p-1.5 text-brand-silver/85 hover:text-brand-cyan"
                    title="Duplicar bloco"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayoutSection(index);
                    }}
                    className="rounded-lg border border-red-400/35 p-1.5 text-red-300"
                    title="Remover bloco"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <label className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1">
                    <input
                      type="checkbox"
                      checked={section.enabled}
                      onChange={(e) =>
                        setCfg({
                          ...cfg,
                          layout: {
                            ...cfg.layout,
                            sections: cfg.layout.sections.map((s, i) => (i === index ? { ...s, enabled: e.target.checked } : s)),
                          },
                        })
                      }
                    />
                    on
                  </label>
                  <label className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1">
                    <input
                      type="checkbox"
                      checked={section.mobile}
                      onChange={(e) =>
                        setCfg({
                          ...cfg,
                          layout: {
                            ...cfg.layout,
                            sections: cfg.layout.sections.map((s, i) => (i === index ? { ...s, mobile: e.target.checked } : s)),
                          },
                        })
                      }
                    />
                    m
                  </label>
                  <label className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2 py-1">
                    <input
                      type="checkbox"
                      checked={section.desktop}
                      onChange={(e) =>
                        setCfg({
                          ...cfg,
                          layout: {
                            ...cfg.layout,
                            sections: cfg.layout.sections.map((s, i) => (i === index ? { ...s, desktop: e.target.checked } : s)),
                          },
                        })
                      }
                    />
                    d
                  </label>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-brand-silver/75">
          Selecionado: {selectedSectionType ?? "nenhum"} | Hero x{sectionCount("hero")} | Services x{sectionCount("services")} | Process x{sectionCount("process")}
        </div>
      </aside>
    </div>
  );
}
