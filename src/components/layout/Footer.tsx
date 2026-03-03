"use client";

import { BUSINESS } from "@/lib/constants";
import { generateWhatsAppLink } from "@/lib/utils";
import { Phone } from "lucide-react";
import { useCursor } from "@/components/providers/CursorProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";

export function Footer() {
  const { setHover } = useCursor();
  const { t } = useLanguage();
  return (
    <footer className="border-t border-white/10 bg-brand-dark/40 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-4 px-4 py-8 sm:px-6 md:flex-row md:items-center md:gap-6 md:py-10">
        <div>
          <div className="text-lg font-black">Kuruma Netejes</div>
          <div className="mt-1 text-sm text-brand-silver/75">{BUSINESS.address.street}</div>
        </div>
        <a
          href={generateWhatsAppLink(BUSINESS.whatsapp, t.footer.reserveMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 hover:border-brand-cyan/30 hover:text-brand-cyan md:w-auto"
          onMouseEnter={() => setHover(true,"cta")} onMouseLeave={() => setHover(false)}
        >
          <Phone className="w-4 h-4" /> {BUSINESS.phone}
        </a>
      </div>
    </footer>
  );
}
