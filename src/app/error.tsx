"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-display text-accent-purple text-lg font-bold tracking-[0.3em] uppercase mb-4">
          Error
        </p>
        <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-wider mb-4">
          一時的なエラー
        </h1>
        <p className="text-neutral-500 text-sm mb-8">
          データの取得に失敗しました。しばらく待ってから再度お試しください。
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 rounded-lg bg-accent-purple text-black font-display font-bold uppercase tracking-wider hover:bg-accent-purple-light transition-colors cursor-pointer"
        >
          再試行
        </button>
      </div>
    </main>
  );
}
