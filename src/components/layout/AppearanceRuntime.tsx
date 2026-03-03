"use client";

import { useEffect } from "react";
import { useSiteConfig } from "@/components/sections/useSiteConfig";
import { useTheme } from "@/components/providers/ThemeProvider";
import { CustomCursor } from "@/components/layout/CustomCursor";

export function AppearanceRuntime() {
  const cfg = useSiteConfig();
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    const darkTexture = cfg.appearance.textureUrl;
    const lightTexture = cfg.appearance.lightTextureUrl || darkTexture;
    const activeTexture = theme === "light" ? lightTexture : darkTexture;
    const textureOpacity = cfg.appearance.showTexture
      ? String(theme === "light" ? cfg.appearance.textureOpacityLight ?? 0.22 : cfg.appearance.textureOpacityDark ?? 0.36)
      : "0";
    const textureBrightness = theme === "light" ? "1.02" : String(cfg.appearance.brightness);

    root.style.setProperty("--overlay", String(cfg.appearance.overlay));
    root.style.setProperty("--brightness", textureBrightness);
    root.style.setProperty("--texture-dark", `url('${darkTexture}')`);
    root.style.setProperty("--texture-light", `url('${lightTexture}')`);
    root.style.setProperty("--texture-active", `url('${activeTexture}')`);
    root.style.setProperty("--texture-opacity", textureOpacity);
  }, [cfg.appearance, theme]);

  return cfg.appearance.cursorMode === "off" ? null : <CustomCursor mode={cfg.appearance.cursorMode} />;
}
