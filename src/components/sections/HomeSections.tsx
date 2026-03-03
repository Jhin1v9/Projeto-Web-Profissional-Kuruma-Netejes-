"use client";

import { useMemo } from "react";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { ServiceSummaries } from "@/components/sections/ServiceSummaries";
import { Estimate } from "@/components/sections/Estimate";
import { Process } from "@/components/sections/Process";
import { Location } from "@/components/sections/Location";
import { CTA } from "@/components/sections/CTA";
import { Footer } from "@/components/layout/Footer";
import { useSiteConfig } from "./useSiteConfig";

function visibilityClass(mobile: boolean, desktop: boolean): string {
  if (mobile && desktop) return "";
  if (mobile && !desktop) return "lg:hidden";
  if (!mobile && desktop) return "hidden lg:block";
  return "hidden";
}

export function HomeSections() {
  const cfg = useSiteConfig();
  const usedAnchors = useMemo(() => new Map<string, number>(), [cfg.layout.sections.length]);

  return (
    <>
      {cfg.layout.sections.map((section) => {
        if (!section.enabled) return null;
        const cls = visibilityClass(section.mobile, section.desktop);
        const count = usedAnchors.get(section.type) ?? 0;
        usedAnchors.set(section.type, count + 1);
        const sectionId = count === 0 ? section.type : undefined;

        switch (section.type) {
          case "hero":
            return <div key={section.id} className={cls}><Hero sectionId={sectionId} /></div>;
          case "services":
            return (
              <div key={section.id} className={cls}>
                <Services sectionId={sectionId} />
                {count === 0 ? <ServiceSummaries /> : null}
              </div>
            );
          case "estimate":
            return <div key={section.id} className={cls}><Estimate sectionId={sectionId} /></div>;
          case "process":
            return <div key={section.id} className={cls}><Process sectionId={sectionId} /></div>;
          case "location":
            return <div key={section.id} className={cls}><Location sectionId={sectionId} /></div>;
          case "cta":
            return <div key={section.id} className={cls}><CTA sectionId={sectionId} /></div>;
          case "footer":
            return <div key={section.id} className={cls}><Footer sectionId={sectionId} /></div>;
          default:
            return null;
        }
      })}
    </>
  );
}
