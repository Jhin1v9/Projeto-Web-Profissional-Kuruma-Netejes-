import { NextResponse } from "next/server";
import { getAdminCookieName, getExpectedAdminSessionToken } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({ email: "", password: "" }));

  const expectedEmail = process.env.ADMIN_EMAIL || "abnerr2002@icloud.com";
  const expectedPassword = process.env.ADMIN_PASSWORD || "7741";

  const isEmailValid = String(email || "").toLowerCase().trim() === expectedEmail.toLowerCase().trim();
  const isPasswordValid = String(password || "") === expectedPassword;
  if (!isEmailValid || !isPasswordValid) {
    return NextResponse.json({ error: "Email o password incorrectes." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(getAdminCookieName(), getExpectedAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
