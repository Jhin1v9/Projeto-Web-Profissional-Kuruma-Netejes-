"use client";
import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCursor } from "@/components/providers/CursorProvider";
import type { CursorMode } from "@/types/site-config";

export function CustomCursor({ mode }:{mode:CursorMode}) {
  const pathname = usePathname();
  const { state, setClick } = useCursor();
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const sx = useSpring(x, { damping: 25, stiffness: 520, mass: 0.35 });
  const sy = useSpring(y, { damping: 25, stiffness: 520, mass: 0.35 });
  const isAdminRoute = pathname?.startsWith("/admin");

  useEffect(() => {
    if (isAdminRoute) return;
    const move=(e:MouseEvent)=>{ x.set(e.clientX); y.set(e.clientY); };
    const down=()=>setClick(true); const up=()=>setClick(false);
    window.addEventListener("mousemove",move);
    window.addEventListener("mousedown",down);
    window.addEventListener("mouseup",up);
    return ()=>{ window.removeEventListener("mousemove",move); window.removeEventListener("mousedown",down); window.removeEventListener("mouseup",up); };
  }, [isAdminRoute, x,y,setClick]);

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer || isAdminRoute) {
      document.body.style.cursor = "auto";
      return;
    }

    const previous = document.body.style.cursor;
    document.body.style.cursor = "none";
    return () => {
      document.body.style.cursor = previous || "auto";
    };
  }, [isAdminRoute]);

  if (isAdminRoute) return null;
  if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return null;

  const hovering = state.hovering;
  const clicking = state.clicking;
  const neon = mode === "neon";
  const bodyStroke = neon ? "#00F0FF" : "#C0C0C8";
  const headlight = neon ? "#BFF7FF" : "#FFF3C4";
  const headGlow = neon ? "drop-shadow(0 0 10px rgba(0,240,255,0.95))" : "drop-shadow(0 0 10px rgba(255,243,196,0.95))";

  return (
    <motion.div className="fixed top-0 left-0 pointer-events-none z-[9999]" style={{ x: sx, y: sy }}>
      <motion.div className="relative -translate-x-1/2 -translate-y-1/2" animate={{ scale: clicking ? 0.86 : hovering ? 1.18 : 1, rotate: hovering ? 7 : 0 }} transition={{ type:"spring", stiffness: 360, damping: 20 }}>
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
          <path d="M10 38H46L44 24H12L10 38Z" fill="#111317" stroke={bodyStroke} strokeWidth="2"/>
          <path d="M15 24L19 14H37L41 24" fill="#0A0A0F" stroke={bodyStroke} strokeWidth="2"/>
          <circle cx="18" cy="40" r="5" fill="#0A0A0F" stroke="#7B7F86" strokeWidth="2"/>
          <circle cx="38" cy="40" r="5" fill="#0A0A0F" stroke="#7B7F86" strokeWidth="2"/>
          <motion.circle cx="13.5" cy="30" r="2.2" animate={{ fill: hovering ? headlight : "#0A0A0F", filter: hovering ? headGlow : "none" }} transition={{ duration: 0.2 }}/>
          <motion.circle cx="42.5" cy="30" r="2.2" animate={{ fill: hovering ? headlight : "#0A0A0F", filter: hovering ? headGlow : "none" }} transition={{ duration: 0.2 }}/>
          {hovering && (
            <>
              <motion.path d="M4 30L-10 25M4 30L-10 35" stroke={headlight} strokeWidth="1.2" strokeOpacity="0.65" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.25 }}/>
              <motion.path d="M52 30L66 25M52 30L66 35" stroke={headlight} strokeWidth="1.2" strokeOpacity="0.65" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.25 }}/>
            </>
          )}
          {clicking && (
            <motion.circle cx="28" cy="28" r="20" fill="none" stroke={neon ? "#00F0FF" : "#FFFFFF"} strokeOpacity="0.35" initial={{ scale: 0.6, opacity: 0.6 }} animate={{ scale: 1.2, opacity: 0 }} transition={{ duration: 0.35 }}/>
          )}
        </svg>
      </motion.div>
    </motion.div>
  );
}
