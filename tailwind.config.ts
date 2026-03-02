import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/app/**/*.{js,ts,jsx,tsx,mdx}","./src/components/**/*.{js,ts,jsx,tsx,mdx}","./src/lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        "brand-cyan": "#00F0FF",
        "brand-blue": "#00A3FF",
        "brand-dark": "#0A0A0F",
        "brand-dark2": "#1A1A1F",
        "brand-silver": "#C0C0C8"
      },
      boxShadow: {
        glow: "0 0 30px rgba(0,240,255,0.25)",
        glowStrong: "0 0 50px rgba(0,240,255,0.35)"
      },
      backgroundImage: {
        "hero-sheen": "radial-gradient(circle at 20% 10%, rgba(0,240,255,0.22), transparent 45%), radial-gradient(circle at 80% 70%, rgba(0,163,255,0.18), transparent 52%)"
      }
    }
  },
  plugins: []
};
export default config;
