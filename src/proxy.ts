import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const PUBLIC_PATHS = ["/login", "/api/auth"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 静的アセットと公開パスはスキップ
  if (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
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

  // X-Robots-Tag ヘッダー付与
  const response = NextResponse.next();
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
