import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BUSINESS, SEO_DEFAULTS } from "@/lib/constants";
import { generateLocalBusinessSchema, generateWebSiteSchema } from "@/lib/seo";
import { getDefaultConfig } from "@/lib/site-config";
import { CursorProvider } from "@/components/providers/CursorProvider";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AppearanceRuntime } from "@/components/layout/AppearanceRuntime";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0F",
};

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.url),
  title: { default: SEO_DEFAULTS.title, template: "%s | Kuruma Netejes" },
  description: SEO_DEFAULTS.description,
  keywords: [...SEO_DEFAULTS.keywords],
  robots: { index: true, follow: true },
  alternates: { canonical: BUSINESS.url },
  openGraph: {
    type: "website",
    locale: "ca_ES",
    url: BUSINESS.url,
    title: SEO_DEFAULTS.title,
    description: SEO_DEFAULTS.description,
    siteName: BUSINESS.name,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schema = [generateLocalBusinessSchema(), generateWebSiteSchema()];
  const cfg = getDefaultConfig();

  return (
    <html lang="ca" className={inter.variable}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <style dangerouslySetInnerHTML={{ __html: `:root{--overlay:${cfg.appearance.overlay};--brightness:${cfg.appearance.brightness};--texture-dark:url('${cfg.appearance.textureUrl}');--texture-light:url('${cfg.appearance.lightTextureUrl || cfg.appearance.textureUrl}');--texture-active:url('${cfg.appearance.textureUrl}');--texture-opacity:${cfg.appearance.showTexture ? "0.36" : "0"};}` }} />
      </head>
      <body className={`${inter.className} antialiased text-white`}>
        <div className="k-bg" />
        <ThemeProvider>
          <LanguageProvider>
            <CursorProvider>
              <AppearanceRuntime />
              {children}
            </CursorProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
