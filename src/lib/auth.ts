const encoder = new TextEncoder();

const TOKEN_MAX_AGE_SEC = 60 * 60; // 1時間

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET が設定されていません");
  return secret;
}

async function hmacSign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return Buffer.from(signature).toString("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
  let result = 0;
  for (let i = 0; i < aBuf.length; i++) {
    result |= aBuf[i] ^ bBuf[i];
  }
  return result === 0;
}

/** トークンを生成（発行時刻を埋め込み） */
export async function createToken(): Promise<string> {
  const id = crypto.randomUUID();
  const iat = Math.floor(Date.now() / 1000);
  const payload = `${id}:${iat}`;
  const secret = getSecret();
  const signature = await hmacSign(payload, secret);
  return `${payload}.${signature}`;
}

/** トークンの署名と有効期限を検証する */
export async function verifyToken(token: string): Promise<boolean> {
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return false;

  const payload = token.slice(0, dotIdx);
  const signature = token.slice(dotIdx + 1);

  // payload形式: uuid:iat
  const colonIdx = payload.lastIndexOf(":");
  if (colonIdx === -1) return false;

  const iatStr = payload.slice(colonIdx + 1);
  const iat = parseInt(iatStr, 10);
  if (isNaN(iat)) return false;

  // 有効期限チェック
  const now = Math.floor(Date.now() / 1000);
  if (now - iat > TOKEN_MAX_AGE_SEC) return false;

  try {
    const secret = getSecret();
    const expected = await hmacSign(payload, secret);
    return timingSafeEqual(expected, signature);
  } catch {
    return false;
  }
}

export { TOKEN_MAX_AGE_SEC };
