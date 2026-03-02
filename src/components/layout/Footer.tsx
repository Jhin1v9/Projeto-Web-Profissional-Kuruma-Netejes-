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
      <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="font-black text-lg">Kuruma Netejes</div>
          <div className="text-sm text-brand-silver/75 mt-1">{BUSINESS.address.street}</div>
        </div>
        <a
          href={generateWhatsAppLink(BUSINESS.whatsapp, t.footer.reserveMessage)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 bg-white/5 border border-white/10 hover:border-brand-cyan/30 hover:text-brand-cyan"
          onMouseEnter={() => setHover(true,"cta")} onMouseLeave={() => setHover(false)}
        >
          <Phone className="w-4 h-4" /> {BUSINESS.phone}
        </a>
      </div>
    </footer>
  );
}
