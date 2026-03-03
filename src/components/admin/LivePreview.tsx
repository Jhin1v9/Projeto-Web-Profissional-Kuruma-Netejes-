"use client";

import type { SiteConfig } from "@/types/site-config";
import { SERVICE_PRICING_BY_ID } from "@/lib/constants";
import { eur } from "@/lib/utils";

export function LivePreview({ cfg }: { cfg: SiteConfig }) {
  const previewSlide = cfg.heroBanner.slides[0];
  const colors = cfg.appearance.textColors;

  return (
    <div className="rounded-3xl border border-white/10 overflow-hidden">
      <div className="px-5 py-4 bg-black/25 border-b border-white/10">
        <div className="font-extrabold">Live preview</div>
        <div className="text-xs text-brand-silver/70">Hero + cards</div>
      </div>
      <div className="relative bg-brand-dark p-3 sm:p-6">
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

        <div className="relative">
          <div className="rounded-3xl overflow-hidden border border-white/10">
            <div
              className="h-40 sm:h-56"
              style={{
                backgroundImage: `url(${previewSlide.image})`,
                backgroundSize: previewSlide.imageSize,
                backgroundPosition: previewSlide.imagePosition,
              }}
            />
            <div className="bg-black/30 p-4 sm:p-5">
              <div className="text-xs font-bold" style={{ color: colors.heroBadge }}>{previewSlide.badge}</div>
              <div className="mt-2 text-lg font-black sm:text-2xl">
                <span style={{ color: colors.heroTitle }}>{previewSlide.title}</span>{" "}
                <span style={{ color: colors.heroHighlight }}>{previewSlide.highlight}</span>
              </div>
              <div className="text-sm mt-2" style={{ color: colors.heroDescription }}>{previewSlide.description}</div>
              <div className="mt-3 flex gap-2">
                {cfg.heroBanner.slides.map((slide, index) => (
                  <div
                    key={`${slide.image}-${index}`}
                    className={`h-1.5 rounded-full ${index === 0 ? "w-8 bg-brand-cyan" : "w-3 bg-white/50"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
            {cfg.services.map((s) => (
              <div key={s.id} className="rounded-2xl border border-white/10 bg-black/25 overflow-hidden">
                <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${s.imageUrl})` }} />
                <div className="p-4">
                  <div className="text-sm font-extrabold" style={{ color: colors.servicesCardTitle }}>{s.name}</div>
                  <div className="text-xs font-bold mt-1" style={{ color: colors.servicesCardPrice }}>Des de {eur(SERVICE_PRICING_BY_ID[s.id] ?? s.priceFrom)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
