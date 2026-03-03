import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const COOKIE_NAME = "kn_admin";
const FALLBACK_SESSION_TOKEN = "kuruma-admin-session";

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

export function getExpectedAdminSessionToken(): string {
  return process.env.ADMIN_SESSION_TOKEN || FALLBACK_SESSION_TOKEN;
}

export function isAdminTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  return token === getExpectedAdminSessionToken();
}

export function isAdminRequest(request: NextRequest): boolean {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  return isAdminTokenValid(token);
}

export async function isAdminSessionFromCookies(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  return isAdminTokenValid(token);
}
