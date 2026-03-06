# F003 - 選手詳細ページ

**ステータス:** ✅ 実装済み
**優先度:** P0

## 概要
各選手の個別ページ (`/player/[number]`) で、シーズン通算と試合ごとの詳細スタッツを表示。

## SSG生成
- `generateStaticParams()` で全選手番号を取得
- ビルド時に全選手ページを静的生成

## 表示内容

### ヘッダー
- 背番号、選手名
- メタデータ (Next.js `generateMetadata`)

### シーズン通算スタッツ
- 6つのキーメトリクス: PPG, RPG, APG, SPG, BPG, EFF
- ProgressRing でシュート成功率表示 (3P%, 2P%, FT%)
- StatCounter で数値アニメーション

### 効率性指標 (EFF)
- 計算式: PTS + REB + AST + STL + BLK - ((FGA - FGM) + (FTA - FTM) + TO)
- per game で表示

### 試合推移チャート
- ラインチャート (Recharts LineChart)
- 3ライン: 得点, リバウンド, アシスト
- X軸: 対戦相手名
- ツールチップ付き

### ゲームログテーブル
- 試合ごとの詳細スタッツ
- カラム: 対戦相手, PTS, 3P, 2P, FT, REB, AST, STL, BLK, TO, PF, MIN
- ソート機能
- 横スクロール対応

## データソース
- `getPlayerByNumber(number)` → `{ summary: PlayerSummary, games: GamePlayerStat[] }`

## 受け入れ条件
- [x] 全選手のページが静的生成される
- [x] シーズン通算スタッツが正しく表示される
- [x] 試合推移チャートが描画される
- [x] ゲームログテーブルでソートが機能する
- [x] 存在しない番号で404
