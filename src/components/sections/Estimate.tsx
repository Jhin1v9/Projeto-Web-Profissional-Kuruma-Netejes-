"use client";

import { useMemo, useState } from "react";
import { Check, Calculator, MessageCircleMore } from "lucide-react";
import { BUSINESS, SERVICE_PRICING_BY_ID } from "@/lib/constants";
import { eur, generateWhatsAppLink } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useSiteConfig } from "./useSiteConfig";

function toNumberPrice(value: string | number): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const normalized = String(value).replace(",", ".").trim();
  if (!normalized) return null;
  const parsed = Number(normalized);
  if (Number.isFinite(parsed)) return parsed;
  return null;
}

export function Estimate({ sectionId = "estimate" }: { sectionId?: string }) {
  const cfg = useSiteConfig();
  const { language, t } = useLanguage();
  const copy = language === "ca" ? cfg.estimate : cfg.i18n?.[language]?.estimate ?? t.estimate;
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const options = useMemo(
    () =>
      cfg.services
      .filter((service) => service.estimateEnabled !== false)
      .map((service) => {
        const translated = cfg.i18n?.[language]?.services?.[service.id] ?? t.services.items[service.id];
        const translatedName = language === "ca" ? service.name : translated?.name ?? service.name;
        const name = (service.estimateLabel && service.estimateLabel.trim()) || translatedName;
        const rawPrice = service.priceFrom ?? SERVICE_PRICING_BY_ID[service.id];
        const numericPrice = toNumberPrice(rawPrice);
        return {
          id: service.id,
          name,
          rawPrice,
          numericPrice,
        };
      }),
    [cfg.i18n, cfg.services, language, t.services.items]
  );

  const selectedOptions = options.filter((option) => selected[option.id]);
  const total = selectedOptions.reduce((sum, option) => sum + (option.numericPrice ?? 0), 0);
  const hasUnknownPrice = selectedOptions.some((option) => option.numericPrice === null);

  const waMessage = useMemo(() => {
    if (!selectedOptions.length) return copy.none;
    const serviceList = selectedOptions.map((item) => `- ${item.name}`).join("\n");
    const totalLine = `${copy.total}: ${eur(total)}${hasUnknownPrice ? " +" : ""}`;
    return `${copy.cta}\n\n${serviceList}\n\n${totalLine}`;
  }, [copy.cta, copy.none, copy.total, hasUnknownPrice, selectedOptions, total]);

  return (
    <section id={sectionId} className="relative py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-brand-dark2/70 p-5 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-cyan/35 bg-brand-cyan/10 px-3 py-1 text-xs font-semibold text-brand-cyan">
              <Calculator className="h-3.5 w-3.5" />
              {copy.helper}
            </p>
            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              {copy.title} <span className="text-brand-cyan">{copy.highlight}</span>
            </h2>
            <p className="mt-3 text-brand-silver/85">{copy.subtitle}</p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {options.map((option) => {
              const active = !!selected[option.id];
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelected((current) => ({ ...current, [option.id]: !current[option.id] }))}
                  className={[
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition sm:px-5",
                    active
                      ? "border-brand-cyan/45 bg-brand-cyan/15 text-white shadow-glow"
                      : "border-white/10 bg-black/20 text-brand-silver/90 hover:border-brand-cyan/25 hover:text-white",
                  ].join(" ")}
                >
                  <span>
                    <span className="block text-sm font-bold">{option.name}</span>
                      <span className="mt-0.5 block text-xs">
                      {copy.helper}: {option.numericPrice === null ? copy.onRequest : eur(option.numericPrice)}
                    </span>
                  </span>
                  <span
                    className={[
                      "inline-flex h-6 w-6 items-center justify-center rounded-full border",
                      active ? "border-brand-cyan bg-brand-cyan text-brand-dark" : "border-white/20 text-transparent",
                    ].join(" ")}
                  >
                    <Check className="h-4 w-4" />
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/25 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-brand-silver/65">{copy.total}</div>
              <div className="mt-1 text-3xl font-black text-brand-cyan">
                {eur(total)}
                {hasUnknownPrice ? "+" : ""}
              </div>
              {hasUnknownPrice && <div className="mt-1 text-xs text-brand-silver/70">{copy.unknown}</div>}
            </div>
            <a
              href={generateWhatsAppLink(BUSINESS.whatsapp, waMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-cyan px-5 py-3 font-extrabold text-brand-dark shadow-glowStrong"
            >
              <MessageCircleMore className="h-4 w-4" />
              {copy.cta}
            </a>
          </div>

          <p className="mt-4 text-sm text-brand-silver/75">{copy.note}</p>
        </div>
      </div>
    </section>
  );
}
