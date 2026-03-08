import type { SiteConfig } from "@/types/site-config";

export type PreviewViewport = "mobile" | "desktop";

type LayoutSection = SiteConfig["layout"]["sections"][number];

export type SectionRenderItem =
  | {
      kind: "section";
      key: string;
      section: LayoutSection;
      sectionId?: string;
    }
  | {
      kind: "infoFaq";
      key: string;
      sectionId: string;
    };

function isVisibleOnViewport(section: LayoutSection, viewport?: PreviewViewport): boolean {
  if (!viewport) return true;
  return viewport === "mobile" ? section.mobile : section.desktop;
}

function hasInfoFaq(cfg: SiteConfig): boolean {
  return cfg.services.some((service) => service.infoEnabled !== false);
}

export function buildSectionRenderPlan(
  cfg: SiteConfig,
  options?: { viewport?: PreviewViewport }
): SectionRenderItem[] {
  const viewport = options?.viewport;
  const sections = cfg.layout.sections.filter(
    (section) => section.enabled && isVisibleOnViewport(section, viewport)
  );
  const includeInfoFaq = hasInfoFaq(cfg);
  const typeCounts = new Map<LayoutSection["type"], number>();
  const items: SectionRenderItem[] = [];
  let infoFaqInserted = false;

  sections.forEach((section) => {
    if (section.type === "footer" && includeInfoFaq && !infoFaqInserted) {
      items.push({ kind: "infoFaq", key: `info-faq-before-${section.id}`, sectionId: "service-details" });
      infoFaqInserted = true;
    }

    const count = typeCounts.get(section.type) ?? 0;
    typeCounts.set(section.type, count + 1);

    items.push({
      kind: "section",
      key: section.id,
      section,
      sectionId: count === 0 ? section.type : undefined,
    });
  });

  if (includeInfoFaq && !infoFaqInserted) {
    items.push({ kind: "infoFaq", key: "info-faq-fallback", sectionId: "service-details" });
  }

  return items;
}
