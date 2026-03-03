"use client";

import { useEffect, useState } from "react";

const KEY = "kuruma_local_theme";

type ThemeMode = "dark" | "light";

export function LocalThemeToggle() {
  const [enabled, setEnabled] = useState(false);
  const [mode, setMode] = useState<ThemeMode>("dark");

  useEffect(() => {
    const host = window.location.hostname;
    const isLocalhost = host === "localhost" || host === "127.0.0.1";
    setEnabled(isLocalhost);
    if (!isLocalhost) return;

    const saved = window.localStorage.getItem(KEY);
    const initial = saved === "light" ? "light" : "dark";
    setMode(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  function setTheme(next: ThemeMode) {
    setMode(next);
    window.localStorage.setItem(KEY, next);
    document.documentElement.setAttribute("data-theme", next);
  }

  if (!enabled) return null;

  return (
    <div className="local-theme-toggle fixed bottom-4 left-4 z-[999] rounded-2xl border border-white/20 bg-black/70 p-2 backdrop-blur">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-white/70">Theme lab</div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${mode === "dark" ? "bg-brand-cyan text-brand-dark" : "bg-white/10 text-white/80"}`}
        >
          Dark
        </button>
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={`rounded-lg px-3 py-1.5 text-xs font-bold ${mode === "light" ? "bg-brand-cyan text-brand-dark" : "bg-white/10 text-white/80"}`}
        >
          Light
        </button>
      </div>
    </div>
  );
}
