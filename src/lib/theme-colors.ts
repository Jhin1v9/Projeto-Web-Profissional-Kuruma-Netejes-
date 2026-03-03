import type { ThemeMode } from "@/components/providers/ThemeProvider";

function toRgb(hex: string): { r: number; g: number; b: number } | null {
  const value = hex.trim();
  const full = /^#([0-9a-f]{6})$/i.exec(value);
  if (!full) return null;
  const raw = full[1];
  return {
    r: parseInt(raw.slice(0, 2), 16),
    g: parseInt(raw.slice(2, 4), 16),
    b: parseInt(raw.slice(4, 6), 16),
  };
}

function luminance(hex: string): number {
  const rgb = toRgb(hex);
  if (!rgb) return 0;
  const normalize = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const r = normalize(rgb.r);
  const g = normalize(rgb.g);
  const b = normalize(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function adaptiveThemeColor(color: string, theme: ThemeMode, lightFallback: string): string {
  if (theme !== "light") return color;
  const lum = luminance(color);
  if (lum > 0.72) return lightFallback;
  return color;
}
