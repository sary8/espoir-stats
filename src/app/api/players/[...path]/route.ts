import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET } from "@/lib/r2";

// 認証は proxy.ts で保護済み
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const segments = (await params).path;

  // パストラバーサル防止: 安全な文字のみ許可（英数字, ハイフン, アンダースコア, ドット）
  if (segments.some((s) => !s || /[^a-zA-Z0-9._-]/.test(s) || s === ".." || s.startsWith("."))) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const key = `players/${segments.join("/")}`;

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
    });
    const signedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: 3600,
    });

    return NextResponse.redirect(signedUrl, {
      status: 302,
      headers: {
        "Cache-Control": "private, max-age=3000",
      },
    });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
