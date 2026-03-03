import { NextResponse } from "next/server";
import { getAdminCookieName } from "@/lib/admin-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(getAdminCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
