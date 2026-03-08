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
import { buildSectionRenderPlan } from "@/lib/section-flow";
import { useSiteConfig } from "./useSiteConfig";

function visibilityClass(mobile: boolean, desktop: boolean): string {
  if (mobile && desktop) return "";
  if (mobile && !desktop) return "lg:hidden";
  if (!mobile && desktop) return "hidden lg:block";
  return "hidden";
}

export function HomeSections() {
  const cfg = useSiteConfig();
  const renderPlan = useMemo(() => buildSectionRenderPlan(cfg), [cfg]);

  return (
    <>
      {renderPlan.map((item) => {
        if (item.kind === "infoFaq") {
          return <ServiceSummaries key={item.key} sectionId={item.sectionId} />;
        }

        const cls = visibilityClass(item.section.mobile, item.section.desktop);
        switch (item.section.type) {
          case "hero":
            return (
              <div key={item.key} className={cls}>
                <Hero sectionId={item.sectionId} />
              </div>
            );
          case "services":
            return (
              <div key={item.key} className={cls}>
                <Services sectionId={item.sectionId} />
              </div>
            );
          case "estimate":
            return (
              <div key={item.key} className={cls}>
                <Estimate sectionId={item.sectionId} />
              </div>
            );
          case "process":
            return (
              <div key={item.key} className={cls}>
                <Process sectionId={item.sectionId} />
              </div>
            );
          case "location":
            return (
              <div key={item.key} className={cls}>
                <Location sectionId={item.sectionId} />
              </div>
            );
          case "cta":
            return (
              <div key={item.key} className={cls}>
                <CTA sectionId={item.sectionId} />
              </div>
            );
          case "footer":
            return (
              <div key={item.key} className={cls}>
                <Footer sectionId={item.sectionId} />
              </div>
            );
          default:
            return null;
        }
      })}
    </>
  );
}
