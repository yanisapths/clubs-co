import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // (studio)/[username] resolves to /<username> at the URL level,
  // so match any top-level path that isn't a known reserved route.
  const RESERVED = [
    "api",
    "login",
    "club",
    "profile",
    "category",
    "favicon.ico",
    "_next",
  ];

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  if (!first || RESERVED.includes(first)) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token.username !== first) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - _next/static, _next/image
     * - favicon.ico
     * - explicit (membership) routes (login, club, profile)
     */
    "/((?!api|_next/static|_next/image|favicon\\.ico|login|club|profile|category).*)",
  ],
};
