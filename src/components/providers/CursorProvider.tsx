"use client";
import React, { createContext, useContext, useState } from "react";
type Variant = "default" | "hover" | "cta";
type CursorState = { hovering: boolean; clicking: boolean; variant: Variant; };
const Ctx = createContext<{ state: CursorState; setHover:(h:boolean,v?:Variant)=>void; setClick:(c:boolean)=>void }|null>(null);

export function CursorProvider({ children }:{children:React.ReactNode}) {
  const [state,setState]=useState<CursorState>({hovering:false,clicking:false,variant:"default"});
  const setHover=(hovering:boolean, variant:Variant="hover")=>setState(s=>({...s,hovering,variant:hovering?variant:"default"}));
  const setClick=(clicking:boolean)=>setState(s=>({...s,clicking}));
  return <Ctx.Provider value={{state,setHover,setClick}}>{children}</Ctx.Provider>;
}
export function useCursor(){ const ctx=useContext(Ctx); if(!ctx) throw new Error("useCursor"); return ctx; }
