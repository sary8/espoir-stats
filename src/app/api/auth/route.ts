import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createToken, TOKEN_MAX_AGE_SEC } from "@/lib/auth";

function timingSafeCompare(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
  if (aBuf.length !== bBuf.length) {
    // 長さが異なる場合も一定時間消費するためダミー比較
    let dummy = 0;
    for (let i = 0; i < aBuf.length; i++) {
      dummy |= aBuf[i] ^ (bBuf[i % bBuf.length] || 0);
    }
    void dummy;
    return false;
  }
  let result = 0;
  for (let i = 0; i < aBuf.length; i++) {
    result |= aBuf[i] ^ bBuf[i];
  }
  return result === 0;
}

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

  if (!timingSafeCompare(password, sitePassword)) {
    return NextResponse.json(
      { error: "パスワードが正しくありません" },
      { status: 401 }
    );
  }

  const token = await createToken();
  const response = NextResponse.json({ success: true });
  response.cookies.set("espoir-auth", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TOKEN_MAX_AGE_SEC,
    path: "/",
  });

  return response;
}
