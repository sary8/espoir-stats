import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth"];
const PUBLIC_FILES = ["/robots.txt", "/sitemap.xml", "/icon.png", "/apple-icon.png", "/manifest.json"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静的アセット・公開パス・公開ファイルはスキップ
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    PUBLIC_FILES.includes(pathname) ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  // 認証チェック: トークンの署名を検証
  const authCookie = request.cookies.get("espoir-auth");
  const isValid = authCookie ? await verifyToken(authCookie.value) : false;
  if (!isValid) {
    const loginUrl = new URL("/login", request.url);
    const response = NextResponse.redirect(loginUrl);
    // 無効なcookieがあれば削除
    if (authCookie) {
      response.cookies.delete("espoir-auth");
    }
    return response;
  }

  // セキュリティヘッダー付与
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
