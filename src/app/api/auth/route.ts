import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { timingSafeEqual } from "crypto";
import { createToken, TOKEN_MAX_AGE_SEC } from "@/lib/auth";
import { clearLoginFailures, getClientKey, getLoginRateLimitStatus, recordLoginFailure } from "@/lib/loginRateLimit";

function timingSafeCompare(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request.headers);
  const rateLimit = getLoginRateLimitStatus(clientKey);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "試行回数が多すぎます。時間をおいて再試行してください" },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSec),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "不正なリクエストです" },
      { status: 400 }
    );
  }
  const password =
    typeof body === "object" &&
    body !== null &&
    "password" in body &&
    typeof body.password === "string"
      ? body.password
      : "";
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    return NextResponse.json(
      { error: "サーバー設定エラー" },
      { status: 500 }
    );
  }

  if (!timingSafeCompare(password, sitePassword)) {
    const failure = recordLoginFailure(clientKey);
    if (!failure.allowed) {
      console.warn(`Login rate limit exceeded for ${clientKey}`);
      return NextResponse.json(
        { error: "試行回数が多すぎます。時間をおいて再試行してください" },
        {
          status: 429,
          headers: {
            "Retry-After": String(failure.retryAfterSec),
          },
        }
      );
    }
    return NextResponse.json(
      { error: "パスワードが正しくありません" },
      { status: 401 }
    );
  }

  clearLoginFailures(clientKey);
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

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set("espoir-auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}
