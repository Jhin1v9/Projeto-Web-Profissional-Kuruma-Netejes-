"use client";
import { useEffect, useState } from "react";
import type { SiteConfig } from "@/types/site-config";
import { getDefaultConfig } from "@/lib/site-config";

export function useSiteConfig() {
  const [cfg, setCfg] = useState<SiteConfig>(getDefaultConfig());

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);

    (async () => {
      try {
        const res = await fetch("/api/site-config?view=published", { cache: "no-store", signal: controller.signal });
        if (!res.ok) return;
        const json = await res.json().catch(() => null);
        if (json) setCfg(json);
      } catch {
        setCfg(getDefaultConfig());
      } finally {
        window.clearTimeout(timeout);
      }
    })();

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  return cfg;
}
