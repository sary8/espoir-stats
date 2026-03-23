# Espoir Stats

社会人バスケットボールチーム「Espoir」のスタッツダッシュボードサイト。試合データの可視化・選手比較・成長分析を提供する。

## Features

- **チーム概要ダッシュボード** - シーズンごとの勝敗・得失点・チームスタッツを一覧表示
- **選手個別ページ** - レーダーチャート・試合別推移グラフ・シュートチャート・成長分析
- **選手比較** - 複数選手のスタッツを並べて比較（レーダー・バーチャート）
- **試合詳細** - スコア推移・個人スタッツ・クォーター別ブレイクダウン
- **シーズン横断分析** - 複数シーズンの通算成績・シーズン比較
- **シーズンアワード** - MVP・得点王・アシスト王などの自動算出
- **用語集** - バスケットボールスタッツ用語の解説ページ
- **認証** - パスワード認証によるアクセス制限（チーム関係者向け）

## Tech Stack

| カテゴリ | 技術 |
|---------|------|
| Framework | Next.js 16 (App Router, SSG) |
| Language | TypeScript 5, React 19 |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Animation | Framer Motion |
| Database | Neon (PostgreSQL) + Drizzle ORM |
| Storage | Cloudflare R2 (選手画像) |
| Auth | HMAC-SHA256 署名トークン + httpOnly Cookie |
| Testing | Vitest (Unit) + Playwright (E2E) |
| Deploy | Vercel |

## Architecture

```
src/
├── app/                    # Next.js App Router pages
│   ├── page.tsx            # トップ（サーバーコンポーネント）
│   ├── player/[number]/    # 選手個別ページ (SSG)
│   ├── games/[gameId]/     # 試合詳細ページ
│   ├── player-compare/     # 選手比較
│   ├── season/[season]/    # シーズン別ページ群
│   ├── all-time/           # 通算成績
│   ├── api/auth/           # 認証エンドポイント
│   └── api/players/        # 画像配信API
├── components/
│   ├── sections/           # 各ページのメインコンテンツ
│   ├── layout/             # Header, Footer
│   └── ui/                 # GlassCard, ProgressRing 等の汎用UI
└── lib/
    ├── data.ts             # データ取得層 (Drizzle ORM)
    ├── auth.ts             # 認証ロジック
    ├── stats.ts            # スタッツ計算・集計
    └── types.ts            # 型定義
```

**設計方針**
- サーバーコンポーネントでデータ取得 → クライアントコンポーネントで描画の明確な分離
- `generateStaticParams` によるSSGで高速なページ遷移
- チャートコンポーネントは `next/dynamic` で遅延ロード
- `React.cache()` でサーバーサイドのデータ取得を重複排除

## Development

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# テスト実行
npm run test          # Unit tests (Vitest)
npm run test:e2e      # E2E tests (Playwright)

# ビルド
npm run build
```

### Environment Variables

```
DATABASE_URL=          # Neon PostgreSQL接続文字列
SITE_PASSWORD=         # 認証パスワード
AUTH_SECRET=           # トークン署名シークレット
R2_ENDPOINT=           # Cloudflare R2エンドポイント
R2_ACCESS_KEY_ID=      # R2アクセスキー
R2_SECRET_ACCESS_KEY=  # R2シークレットキー
R2_BUCKET_NAME=        # R2バケット名
```

## License

MIT
