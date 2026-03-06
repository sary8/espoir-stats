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
- @vercel/analytics (アクセス解析)

## アーキテクチャ

### レンダリング戦略
- **SSR**: ホームページ (`/`), 選手一覧 (`/players`), 試合一覧 (`/games`)
- **SSG**: 選手詳細 (`/player/[number]`), 試合詳細 (`/games/[opponent]`) - `generateStaticParams()`で全ページ生成
- **CSR**: チャート系コンポーネント - `dynamic()` import で SSR 回避

### データフロー
```
stats-csv/*.csv → src/lib/data.ts (ビルド時fs読込) → PlayerSummary[] / GameResult[]
  → Server Component (集計・変換) → Client Component (チャート描画)
```

### 認証
- HMAC-SHA256署名付きトークン (cookie: `espoir-auth`)
- Next.js proxy (`src/proxy.ts`, Next.js 16規約) で全ページ保護
- 有効期限: 30日
- 除外: `/login`, `/api/auth`, 静的アセット

## ページ構成

| URL | 説明 | レンダリング |
|-----|------|-------------|
| `/` | チームダッシュボード | SSR |
| `/login` | ログイン | CSR |
| `/players` | 選手一覧 | SSR |
| `/player/[number]` | 選手詳細 | SSG |
| `/games` | 試合結果一覧 | SSR |
| `/games/[opponent]` | 試合詳細 | SSG |
| `/glossary` | 用語集 | SSR |
| `/api/auth` | 認証API (POST) | API Route |

## デザイン

- ダークテーマ (背景: #0a0a0f)
- アクセントカラー: 紫 (#A855F7)
- ガラスモーフィズムカード (backdrop-filter: blur)
- フォント: Space Grotesk (英数) + Noto Sans JP (日本語)
- レスポンシブ対応 (モバイル〜デスクトップ)

## ファイル構成

```
src/
├── app/
│   ├── layout.tsx                 (ルートレイアウト、フォント、Analytics)
│   ├── page.tsx                   (ホーム - メインダッシュボード)
│   ├── not-found.tsx              (カスタム404ページ)
│   ├── login/page.tsx             (パスワードフォーム)
│   ├── players/page.tsx           (選手一覧)
│   ├── player/[number]/page.tsx   (SSG選手詳細)
│   ├── games/page.tsx             (試合結果一覧)
│   ├── games/[opponent]/page.tsx  (SSG試合詳細)
│   ├── glossary/page.tsx          (用語集)
│   ├── api/auth/route.ts          (認証エンドポイント)
│   └── globals.css                (Tailwind + カスタムスタイル)
├── components/
│   ├── layout/ (Header, Footer)
│   ├── ui/ (GlassCard, StatCounter, ProgressRing, AnimatedSection, Badge)
│   └── sections/ (各セクションコンポーネント)
├── lib/
│   ├── types.ts    (型定義)
│   ├── data.ts     (CSVパース・データ取得)
│   ├── auth.ts     (HMACトークン生成・検証)
│   ├── stats.ts    (アドバンスドスタッツ計算)
│   └── utils.ts    (フォーマットヘルパー)
├── config/
│   └── theme.ts    (チャートカラーパレット)
└── proxy.ts        (認証ミドルウェア, Next.js 16規約)

stats-csv/
├── 選手別サマリ.csv
├── 全試合スタッツ.csv
├── 相手チームスタッツ.csv
└── 試合情報.csv
```
