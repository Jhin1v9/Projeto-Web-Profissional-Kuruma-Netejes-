"use client";

import { useMemo, useState } from "react";
import type { SiteConfig } from "@/types/site-config";
import { SERVICE_PRICING_BY_ID } from "@/lib/constants";
import { maskedPrice } from "@/lib/utils";
import { resolveBusinessStatus } from "@/lib/business-status";
import { buildSectionRenderPlan, type PreviewViewport } from "@/lib/section-flow";

function numberPrice(value: string | number): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number(String(value).replace(",", ".").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

export function LivePreview({ cfg }: { cfg: SiteConfig }) {
  const [viewport, setViewport] = useState<PreviewViewport>("desktop");
  const renderPlan = useMemo(() => buildSectionRenderPlan(cfg, { viewport }), [cfg, viewport]);
  const previewSlide = cfg.heroBanner.slides[0];
  const colors = cfg.appearance.textColors;
  const estimateOptions = cfg.services.filter((s) => s.estimateEnabled !== false);
  const firstInfoService = cfg.services.find((service) => service.infoEnabled !== false);
  const status = resolveBusinessStatus({
    mode: cfg.businessStatusMode,
    manualStatus: cfg.businessStatus,
    timeZone: "Europe/Madrid",
  });
  const statusMeta = {
    open: { label: "Aberto agora", dot: "bg-emerald-500" },
    closing: { label: "Fechando", dot: "bg-orange-400" },
    closed: { label: "Fechado", dot: "bg-red-500" },
  } as const;

  return (
    <div className="rounded-3xl border border-white/10 overflow-hidden">
      <div className="px-5 py-4 bg-black/25 border-b border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="font-extrabold">Live preview completo</div>
            <div className="text-xs text-brand-silver/70">Renderizacao real da ordem de secoes, incluindo Infos + FAQ antes do footer.</div>
          </div>
          <div className="inline-flex rounded-xl border border-white/10 bg-black/25 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setViewport("desktop")}
              className={`rounded-lg px-3 py-1.5 ${viewport === "desktop" ? "bg-brand-cyan/20 text-brand-cyan" : "text-brand-silver/80"}`}
            >
              Desktop
            </button>
            <button
              type="button"
              onClick={() => setViewport("mobile")}
              className={`rounded-lg px-3 py-1.5 ${viewport === "mobile" ? "bg-brand-cyan/20 text-brand-cyan" : "text-brand-silver/80"}`}
            >
              Mobile
            </button>
          </div>
        </div>
      </div>
      <div className="relative max-h-[78vh] overflow-y-auto bg-brand-dark p-3 sm:p-6">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${cfg.appearance.textureUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: cfg.appearance.showTexture ? 0.35 : 0,
            filter: `brightness(${cfg.appearance.brightness})`,
          }}
        />
        <div className="absolute inset-0" style={{ background: `rgba(10,10,15,${cfg.appearance.overlay})` }} />

        <div className={`relative space-y-5 ${viewport === "mobile" ? "mx-auto max-w-[390px]" : ""}`}>
          {renderPlan.map((item, index) => {
            if (item.kind === "infoFaq") {
              if (!firstInfoService) return null;
              return (
                <div key={item.key} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-silver/60">#{index + 1}</div>
                  <div className="text-xs font-bold uppercase tracking-[0.08em] text-brand-cyan">Infos + FAQ</div>
                  <div className="mt-2 text-sm font-semibold text-white">{firstInfoService.name}</div>
                  <div className="mt-1 text-xs text-brand-silver/80">
                    {(firstInfoService.infoSummary ?? "").trim() || "Resumo do servico e perguntas frequentes."}
                  </div>
                </div>
              );
            }

            switch (item.section.type) {
              case "hero":
                return (
                  <div key={item.key} className="rounded-3xl overflow-hidden border border-white/10">
                    <div
                      className="h-44 sm:h-56"
                      style={{
                        backgroundImage: `url(${previewSlide.image})`,
                        backgroundSize: previewSlide.imageSize,
                        backgroundPosition: previewSlide.imagePosition,
                      }}
                    />
                    <div className="bg-black/30 p-4 sm:p-5">
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-silver/60">#{index + 1}</div>
                      <div className="text-xs font-bold" style={{ color: colors.heroBadge }}>{previewSlide.badge}</div>
                      <div className="mt-2 text-lg font-black sm:text-2xl">
                        <span style={{ color: colors.heroTitle }}>{previewSlide.title}</span>{" "}
                        <span style={{ color: colors.heroHighlight }}>{previewSlide.highlight}</span>
                      </div>
                      <div className="text-sm mt-2" style={{ color: colors.heroDescription }}>{previewSlide.description}</div>
                    </div>
                  </div>
                );
              case "services":
                return (
                  <div key={item.key} className={`grid gap-3 ${viewport === "mobile" ? "grid-cols-1" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
                    {cfg.services.map((s) => (
                      <div key={`${item.key}-${s.id}`} className="rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
                        <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${s.imageUrl})` }} />
                        <div className="p-4">
                          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-brand-silver/60">#{index + 1}</div>
                          <div className="text-sm font-extrabold" style={{ color: colors.servicesCardTitle }}>{s.name}</div>
                          <div className="text-xs font-bold mt-1" style={{ color: colors.servicesCardPrice }}>
                            Des de {maskedPrice(s.priceFrom ?? SERVICE_PRICING_BY_ID[s.id])}
                          </div>
                          <div className="mt-2 text-xs" style={{ color: colors.servicesCardDescription }}>{s.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              case "estimate":
                return (
                  <div key={item.key} className="rounded-3xl border border-white/10 bg-black/25 p-4">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-silver/60">#{index + 1}</div>
                    <div className="text-sm font-black">{cfg.estimate.title} <span className="text-brand-cyan">{cfg.estimate.highlight}</span></div>
                    <div className="mt-1 text-xs text-brand-silver/80">{cfg.estimate.subtitle}</div>
                    <div className={`mt-3 grid gap-2 ${viewport === "mobile" ? "grid-cols-1" : "sm:grid-cols-2"}`}>
                      {estimateOptions.map((option) => {
                        const numeric = numberPrice(option.priceFrom ?? SERVICE_PRICING_BY_ID[option.id]);
                        return (
                          <div key={`preview-estimate-${item.key}-${option.id}`} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs">
                            <div className="font-semibold">{option.estimateLabel?.trim() || option.name}</div>
                            <div className="text-brand-silver/80">{numeric === null ? cfg.estimate.onRequest : maskedPrice(numeric)}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              case "process":
                return (
                  <div key={item.key} className="rounded-3xl border border-white/10 bg-black/25 p-4">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-silver/60">#{index + 1}</div>
                    <div className="text-sm font-black">{cfg.process.title} <span className="text-brand-cyan">{cfg.process.highlight}</span></div>
                    <div className={`mt-3 grid gap-2 ${viewport === "mobile" ? "grid-cols-1" : "sm:grid-cols-2"}`}>
                      {cfg.process.steps.map((step, stepIndex) => (
                        <div key={`preview-step-${item.key}-${stepIndex}`} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                          <div className="text-xs font-semibold">{step.t}</div>
                          <div className="mt-1 text-xs text-brand-silver/80">{step.d}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              case "location":
                return (
                  <div key={item.key} className="rounded-3xl border border-white/10 bg-black/25 p-4">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-silver/60">#{index + 1}</div>
                    <div className="text-sm font-black">{cfg.location.title}</div>
                    <div className="mt-1 text-xs text-brand-silver/80">{cfg.location.intro}</div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs font-semibold">
                      <span className={`h-2.5 w-2.5 rounded-full ${statusMeta[status].dot}`} />
                      {statusMeta[status].label}
                    </div>
                  </div>
                );
              case "cta":
                return (
                  <div key={item.key} className="rounded-3xl border border-white/10 bg-black/25 p-4 text-center">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-silver/60">#{index + 1}</div>
                    <div className="text-2xl font-black">
                      <span style={{ color: colors.ctaTitle }}>{cfg.cta.title}</span>{" "}
                      <span style={{ color: colors.ctaHighlight }}>{cfg.cta.highlight}</span>
                    </div>
                    <div className="mt-2 text-sm" style={{ color: colors.ctaDescription }}>{cfg.cta.description}</div>
                  </div>
                );
              case "footer":
                return (
                  <div key={item.key} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-brand-silver/80">
                    <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.08em] text-brand-silver/60">#{index + 1}</div>
                    {cfg.footer.reserveMessage}
                  </div>
                );
              default:
                return null;
            }
          })}
        </div>
      </div>
    </div>
  );
}
