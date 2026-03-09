import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SitePulse Hub",
  description: "Audit command center for SitePulse QA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

