import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (process.env.DEMO_AUTH === "1") {
      const token = req.cookies.get("kn_admin")?.value;
      if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("next", req.nextUrl.pathname);
        return NextResponse.redirect(url);
      }
    }
  }
  return NextResponse.next();
}
export const config = { matcher: ["/admin/:path*"] };
