# F005 - データパイプライン

**ステータス:** ✅ 実装済み
**優先度:** P0

## 概要
CSVファイルからデータを読み込み、型安全なオブジェクトに変換するパイプライン。

## データソース

### 選手別サマリ (`stats-csv/選手別サマリ.csv`)
- 選手ごとのシーズン通算スタッツ
- カラム: 背番号, 名前, 試合数, 得点, PPG, シュート成功率, リバウンド, アシスト等

### 全試合スタッツ (`stats-csv/全試合スタッツ.csv`)
- 全試合の個人別スタッツ
- カラム: 対戦相手, 背番号, 名前, 先発, 得点, 各種スタッツ, 出場時間

## パース処理 (`src/lib/data.ts`)

### `readCsv(filename)`
- `fs.readFileSync` でCSV読込（ビルド時のみ）
- papaparse でパース（header: true, skipEmptyLines: true）

### `getPlayerSummaries()`
- 選手別サマリCSVをパース → `PlayerSummary[]`
- PF/FO は全試合CSVから集計（サマリCSVに含まれないため）
- パーセンテージ文字列 → 数値変換 (`parsePctString()`)
- 分母0の場合は null を保持

### `getGameStats()`
- 全試合CSVをパース → 対戦相手でグループ化 → `GameResult[]`
- `GAME_DATES` マッピングで日付付与
- 日付順ソート（マッピングにない相手は "9999-12-31"）

### `getPlayerByNumber(number)`
- 特定選手のサマリ + 試合別スタッツを返す

### `getAllPlayerNumbers()`
- 全選手の背番号リスト（SSG用 `generateStaticParams`）

## 型定義 (`src/lib/types.ts`)

### PlayerSummary
- number, name, games, totalPoints, ppg
- 3P/2P/FT: made, attempt, pct (null可)
- offReb, defReb, totalReb
- assists, steals, blocks, turnovers
- personalFouls, foulsDrawn

### GamePlayerStat
- opponent, number, name, starter
- points, 3P/2P/FT (made/attempt)
- rebounds (off/def/total), assists, steals, blocks
- turnovers, personalFouls, foulsDrawn
- minutes (MM:SS形式)

### GameResult
- opponent, date, players[], teamPoints

## 対戦相手日付マッピング
```
LINKS: 2025-06-01
Urus: 2025-11-02
Jokers: 2025-11-09
POLYGON: 2026-03-01
```

## 受け入れ条件
- [x] CSVが正しくパースされる
- [x] 型安全な変換
- [x] パーセンテージの null ハンドリング
- [x] PF/FO が全試合CSVから正しく集計される
- [x] 日付順ソート
