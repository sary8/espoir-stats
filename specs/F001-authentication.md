# F001 - 認証機能

**ステータス:** ✅ 実装済み
**優先度:** P0

## 概要
チームメンバーのみがサイトにアクセスできるよう、パスワード認証を実装。

## 機能要件

### ログインページ (`/login`)
- パスワード入力フォーム（1フィールド）
- 送信ボタン
- エラーメッセージ表示（`role="alert"`）
- 認証成功時: `/` にリダイレクト

### 認証API (`/api/auth`)
- POST リクエストでパスワードを受信
- `SITE_PASSWORD` 環境変数と照合
- 一致: HMAC-SHA256署名付きトークンをcookieに設定
- 不一致: 401エラー

### トークン仕様
- 形式: `{uuid}.{hmac-sha256(uuid, AUTH_SECRET)}`
- Cookie名: `espoir-auth`
- 属性: httpOnly, secure(本番), sameSite=lax
- 有効期限: 30日

### Middleware (`src/middleware.ts`)
- 全リクエストで `espoir-auth` cookie を検証
- 除外パス: `/login`, `/api/auth`, 静的アセット (`_next/`, favicon等)
- 無効トークン: cookie削除 + `/login` リダイレクト
- 有効トークン: `X-Robots-Tag: noindex, nofollow` ヘッダー付加

## 受け入れ条件
- [x] パスワード未入力では認証不可
- [x] 正しいパスワードでログイン・リダイレクト
- [x] 誤ったパスワードでエラーメッセージ表示
- [x] トークン有効期限切れで再ログイン要求
- [x] httpOnly cookieでXSS対策
- [x] タイミング攻撃対策（固定時間比較）
