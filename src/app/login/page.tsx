"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.replace("/");
        router.refresh();
      } else {
        const json = await res.json().catch(() => null);
        setError(typeof json?.error === "string" ? json.error : "パスワードが正しくありません");
      }
    } catch {
      setError("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center px-4 court-pattern">
      <div className="glass-card p-8 w-full max-w-sm relative">
        {/* Decorative accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent-purple/40 to-transparent" aria-hidden="true" />

        <h1 className="font-[family-name:var(--font-barlow-condensed)] text-3xl font-bold text-center mb-6 uppercase tracking-wider">
          <span className="text-accent-purple">E</span>spoir <span className="text-neutral-500">Stats</span>
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="sr-only">
              パスワード
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワード…"
              className="w-full px-4 py-3 rounded-lg bg-white/3 border border-card-border text-foreground placeholder-neutral-600 focus-visible:border-accent-purple focus-visible:ring-1 focus-visible:ring-accent-purple/30 transition-colors"
              autoFocus
              aria-describedby={error ? "auth-error" : undefined}
            />
          </div>

          {error && (
            <p id="auth-error" role="alert" className="text-red-400 text-sm text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-lg bg-accent-purple text-black font-bold font-[family-name:var(--font-barlow-condensed)] uppercase tracking-wider hover:bg-accent-purple-light transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? "認証中…" : "ログイン"}
          </button>
        </form>
      </div>
    </main>
  );
}
