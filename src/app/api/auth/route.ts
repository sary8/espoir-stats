import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const password = typeof body?.password === "string" ? body.password : "";
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    return NextResponse.json(
      { error: "サーバー設定エラー" },
      { status: 500 }
    );
  }

  if (password !== sitePassword) {
    return NextResponse.json(
      { error: "パスワードが正しくありません" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("espoir-auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30日
    path: "/",
  });

  return response;
}
