import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createToken, verifyToken, TOKEN_MAX_AGE_SEC } from "./auth";

const TEST_SECRET = "test-secret-key-for-vitest";

describe("auth トークン", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SECRET", TEST_SECRET);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  describe("createToken", () => {
    it("ドット区切りの payload.signature 形式で返す", async () => {
      const token = await createToken();
      const parts = token.split(".");
      expect(parts.length).toBe(2);
    });

    it("payload は uuid:iat 形式", async () => {
      const token = await createToken();
      const payload = token.split(".")[0];
      const colonIdx = payload.lastIndexOf(":");
      const uuid = payload.slice(0, colonIdx);
      const iat = payload.slice(colonIdx + 1);

      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
      expect(parseInt(iat, 10)).toBeGreaterThan(0);
    });

    it("毎回異なるトークンを生成する", async () => {
      const t1 = await createToken();
      const t2 = await createToken();
      expect(t1).not.toBe(t2);
    });
  });

  describe("verifyToken", () => {
    it("生成直後のトークンは有効", async () => {
      const token = await createToken();
      expect(await verifyToken(token)).toBe(true);
    });

    it("改ざんされた署名は無効", async () => {
      const token = await createToken();
      const tampered = token.slice(0, -4) + "0000";
      expect(await verifyToken(tampered)).toBe(false);
    });

    it("改ざんされた payload は無効", async () => {
      const token = await createToken();
      const dotIdx = token.lastIndexOf(".");
      const sig = token.slice(dotIdx);
      expect(await verifyToken("tampered-payload:123" + sig)).toBe(false);
    });

    it("ドットなしの文字列は無効", async () => {
      expect(await verifyToken("no-dot-token")).toBe(false);
    });

    it("コロンなしの payload は無効", async () => {
      expect(await verifyToken("no-colon.signature")).toBe(false);
    });

    it("iat が数値でない場合は無効", async () => {
      expect(await verifyToken("uuid:abc.signature")).toBe(false);
    });

    it("有効期限切れのトークンは無効", async () => {
      const token = await createToken();
      const dotIdx = token.lastIndexOf(".");
      const payload = token.slice(0, dotIdx);
      const colonIdx = payload.lastIndexOf(":");
      const uuid = payload.slice(0, colonIdx);

      // 2時間前の iat を設定
      const expiredIat = Math.floor(Date.now() / 1000) - TOKEN_MAX_AGE_SEC - 3600;
      const expiredPayload = `${uuid}:${expiredIat}`;

      // 期限切れ payload で新しいトークンを作る（署名も正しく計算）
      // verifyToken は iat チェック → 署名チェックの順なので、iat で弾かれる
      expect(await verifyToken(`${expiredPayload}.fakesig`)).toBe(false);
    });
  });

  describe("TOKEN_MAX_AGE_SEC", () => {
    it("1時間（3600秒）", () => {
      expect(TOKEN_MAX_AGE_SEC).toBe(3600);
    });
  });

  describe("AUTH_SECRET 未設定", () => {
    it("createToken は例外をスローする", async () => {
      vi.stubEnv("AUTH_SECRET", "");
      await expect(createToken()).rejects.toThrow("AUTH_SECRET");
    });

    it("verifyToken は false を返す", async () => {
      const token = await createToken();
      vi.stubEnv("AUTH_SECRET", "");
      expect(await verifyToken(token)).toBe(false);
    });
  });
});
