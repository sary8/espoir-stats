# espoir-stats 仕様書

## プロジェクト概要

Espoirバスケットボールチームの2025-2026シーズンスタッツダッシュボードサイト。
チームメンバー限定（パスワード認証付き）で、シーズン通算・試合別の統計データを可視化する。

## Tech Stack

- Next.js 16 (App Router, Vercelデプロイ)
- React 19 + TypeScript 5 (strict mode)
- Tailwind CSS v4 (CSS-first @theme設定)
- Recharts 3.7 (BarChart, RadarChart, LineChart)
- Framer Motion 12 (スクロールアニメーション)
- papaparse 5.5 (CSV解析)
- lucide-react (アイコン)

## アーキテクチャ

### レンダリング戦略
- **SSR**: ホームページ (`/`) - サーバー側でCSV読込・集計
- **SSG**: 選手詳細 (`/player/[number]`) - `generateStaticParams()`で全選手分生成
- **CSR**: チャート系コンポーネント - `dynamic()` import で SSR 回避

### データフロー
```
stats-csv/*.csv → src/lib/data.ts (ビルド時fs読込) → PlayerSummary[] / GameResult[]
  → Server Component (集計・変換) → Client Component (チャート描画)
```

### 認証
- HMAC-SHA256署名付きトークン (cookie: `espoir-auth`)
- Next.js middleware で全ページ保護
- 有効期限: 30日
- 除外: `/login`, `/api/auth`, 静的アセット

## ページ構成

| URL | 説明 | レンダリング |
|-----|------|-------------|
| `/` | チームダッシュボード | SSR |
| `/login` | ログイン | CSR |
| `/players` | 選手一覧 | SSR |
| `/player/[number]` | 選手詳細 | SSG |
| `/api/auth` | 認証API (POST) | API Route |

## デザイン

- ダークテーマ (背景: #0a0a0f)
- アクセントカラー: 紫 (#A855F7)
- ガラスモーフィズムカード (backdrop-filter: blur)
- フォント: Space Grotesk (英数) + Noto Sans JP (日本語)
- レスポンシブ対応 (モバイル〜デスクトップ)
