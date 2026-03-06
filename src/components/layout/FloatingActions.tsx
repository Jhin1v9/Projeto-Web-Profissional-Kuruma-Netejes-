"use client";

import { useEffect, useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { generateWhatsAppLink } from "@/lib/utils";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { useCursor } from "@/components/providers/CursorProvider";

export function FloatingActions() {
  const { t } = useLanguage();
  const { setHover } = useCursor();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 320);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 sm:bottom-6 sm:right-6">
      <a
        href={generateWhatsAppLink(BUSINESS.whatsapp, t.navbar.whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center rounded-full border border-brand-cyan/50 bg-brand-cyan px-3 py-3 text-brand-dark shadow-glowStrong transition hover:scale-[1.04]"
        aria-label="WhatsApp"
        onMouseEnter={() => setHover(true, "cta")}
        onMouseLeave={() => setHover(false)}
      >
        <MessageCircle className="h-5 w-5" />
      </a>

      {showTop ? (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/45 px-3 py-3 text-white backdrop-blur transition hover:border-brand-cyan/45 hover:text-brand-cyan"
          aria-label="Voltar ao topo"
          onMouseEnter={() => setHover(true, "hover")}
          onMouseLeave={() => setHover(false)}
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      ) : null}
    </div>
  );
}

