"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";
import { CircleHelp, Contact, HandCoins, Home, ListChecks, MapPin, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { scrollToSection } from "@/lib/utils";

type DockItem = {
  id: string;
  labels: Record<"ca" | "es" | "en", string>;
  icon: ComponentType<{ className?: string }>;
};

const ITEMS: DockItem[] = [
  { id: "hero", labels: { ca: "Inici", es: "Inicio", en: "Home" }, icon: Home },
  { id: "services", labels: { ca: "Serveis", es: "Servicios", en: "Services" }, icon: ListChecks },
  { id: "service-details", labels: { ca: "Info de serveis", es: "Info de servicios", en: "Service details" }, icon: CircleHelp },
  { id: "estimate", labels: { ca: "Pressupost", es: "Presupuesto", en: "Estimate" }, icon: HandCoins },
  { id: "process", labels: { ca: "Proces", es: "Proceso", en: "Process" }, icon: Sparkles },
  { id: "location", labels: { ca: "Ubicacio", es: "Ubicacion", en: "Location" }, icon: MapPin },
  { id: "cta", labels: { ca: "Contacte", es: "Contacto", en: "Contact" }, icon: Contact },
];

export function SectionDock() {
  const { language } = useLanguage();
  const [activeSection, setActiveSection] = useState<string>("hero");

  const visibleItems = useMemo(
    () =>
      ITEMS.filter((item) => {
        if (typeof window === "undefined") return true;
        return !!document.getElementById(item.id);
      }),
    []
  );

  useEffect(() => {
    const sections = ITEMS.map((item) => ({
      id: item.id,
      element: document.getElementById(item.id),
    })).filter((entry): entry is { id: string; element: HTMLElement } => !!entry.element);

    if (!sections.length) return;

    const onScroll = () => {
      const offset = window.innerHeight * 0.32;
      let current = sections[0].id;
      for (const section of sections) {
        if (section.element.getBoundingClientRect().top - offset <= 0) {
          current = section.id;
        }
      }
      setActiveSection(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  if (!visibleItems.length) return null;

  return (
    <div className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-2 xl:flex">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const label = item.labels[language];
        const active = activeSection === item.id;
        return (
          <button
            key={`dock-${item.id}`}
            type="button"
            onClick={() => scrollToSection(item.id)}
            className={[
              "group inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-xs font-semibold transition",
              active
                ? "border-brand-cyan/55 bg-brand-cyan/18 text-brand-cyan shadow-glow"
                : "border-white/15 bg-black/35 text-brand-silver/85 hover:border-brand-cyan/35 hover:text-brand-cyan",
            ].join(" ")}
            title={label}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden max-w-0 overflow-hidden whitespace-nowrap transition-all duration-300 group-hover:max-w-[160px] group-hover:pr-1">
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
