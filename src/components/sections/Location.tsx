"use client";

import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";
import { BUSINESS } from "@/lib/constants";
import { useCursor } from "@/components/providers/CursorProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { generateWhatsAppLink } from "@/lib/utils";

export function Location() {
  const { setHover } = useCursor();
  const { t } = useLanguage();
  const maps = "https://www.google.com/maps?q=Carrer%20d%27Alfons%20Sala%2C%2057%2C%2008202%20Sabadell&output=embed";

  return (
    <section id="location" className="relative py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          <motion.div
            className="rounded-3xl border border-white/10 bg-brand-dark2/65 p-5 sm:p-8"
            initial={{ opacity: 0, x: -18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black sm:text-4xl">{t.location.title}</h2>
            <p className="mt-3 text-sm text-brand-silver/85 sm:text-base">{t.location.intro}</p>

            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-brand-cyan mt-1" />
                <div>
                  <div className="font-bold">{t.location.address}</div>
                  <div className="text-brand-silver/85">{BUSINESS.address.street}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-brand-cyan mt-1" />
                <div>
                  <div className="font-bold">{t.location.phone}</div>
                  <div className="text-brand-silver/85">{BUSINESS.phone}</div>
                </div>
              </div>
            </div>

            <a
              href={generateWhatsAppLink(BUSINESS.whatsapp, t.location.whatsappMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex w-full items-center justify-center rounded-2xl bg-brand-cyan px-6 py-3.5 text-sm font-black text-brand-dark shadow-glowStrong sm:mt-10 sm:py-4 sm:text-base"
              onMouseEnter={() => setHover(true, "cta")}
              onMouseLeave={() => setHover(false)}
            >
              {t.location.whatsappButton}
            </a>
          </motion.div>

          <motion.div
            className="min-h-[280px] overflow-hidden rounded-3xl border border-white/10 bg-brand-dark2/65 sm:min-h-[360px] lg:min-h-[420px]"
            initial={{ opacity: 0, x: 18 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <iframe
              src={maps}
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(20%) contrast(105%) brightness(95%)" }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Kuruma Netejes - Location"
              className="w-full h-full"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
