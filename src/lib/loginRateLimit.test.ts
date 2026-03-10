import { afterEach, describe, expect, it } from "vitest";
import { clearLoginFailures, getClientKey, getLoginRateLimitStatus, recordLoginFailure, resetLoginRateLimitForTests } from "./loginRateLimit";

describe("loginRateLimit", () => {
  afterEach(() => {
    resetLoginRateLimitForTests();
  });

  it("5回未満の失敗では許可される", () => {
    const clientKey = "1.2.3.4";
    for (let i = 0; i < 4; i++) {
      const result = recordLoginFailure(clientKey, 1000 + i);
      expect(result.allowed).toBe(true);
    }
    expect(getLoginRateLimitStatus(clientKey, 2000).allowed).toBe(true);
  });

  it("5回目の失敗でブロックされる", () => {
    const clientKey = "1.2.3.4";
    for (let i = 0; i < 4; i++) {
      recordLoginFailure(clientKey, 1000 + i);
    }
    const result = recordLoginFailure(clientKey, 2000);
    expect(result.allowed).toBe(false);
    expect(result.retryAfterSec).toBeGreaterThan(0);
  });

  it("成功時に履歴をクリアできる", () => {
    const clientKey = "1.2.3.4";
    for (let i = 0; i < 5; i++) {
      recordLoginFailure(clientKey, 1000 + i);
    }
    clearLoginFailures(clientKey);
    expect(getLoginRateLimitStatus(clientKey, 2000).allowed).toBe(true);
  });

  it("x-forwarded-for を優先してクライアント識別子を返す", () => {
    const headers = {
      get(name: string) {
        if (name === "x-forwarded-for") return "1.2.3.4, 5.6.7.8";
        return null;
      },
    };
    expect(getClientKey(headers)).toBe("1.2.3.4");
  });

  it("cf-connecting-ip にフォールバックする", () => {
    const headers = {
      get(name: string) {
        if (name === "cf-connecting-ip") return "10.0.0.1";
        return null;
      },
    };
    expect(getClientKey(headers)).toBe("10.0.0.1");
  });

  it("ヘッダーが無い場合 fallbackIp を使う", () => {
    const headers = { get() { return null; } };
    expect(getClientKey(headers, "::1")).toBe("::1");
  });

  it("全て無い場合 unknown を返す", () => {
    const headers = { get() { return null; } };
    expect(getClientKey(headers)).toBe("unknown");
  });
});

