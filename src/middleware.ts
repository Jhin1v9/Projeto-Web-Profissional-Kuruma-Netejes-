import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!isAdminRequest(req)) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
