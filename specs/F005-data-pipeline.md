# F005 - データパイプライン

**ステータス:** 実装済み
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

### 相手チームスタッツ (`stats-csv/相手チームスタッツ.csv`)
- 対戦相手チームの個人別スタッツ
- カラム: 全試合スタッツと同一フォーマット

### 試合情報 (`stats-csv/試合情報.csv`)
- 試合のメタデータ
- カラム: 対戦相手, 日付, YouTube, 大会名, 会場, 試合種別, クォータースコア(1Q〜4Q)

## パース処理 (`src/lib/data.ts`)

### `readCsv(filename)`
- `fs.readFileSync` でCSV読込（ビルド時のみ）
- papaparse でパース（header: true, skipEmptyLines: true）

### `getPlayerSummaries()`
- 選手別サマリCSVをパース → `PlayerSummary[]`
- PF/FO は全試合CSVから集計（サマリCSVに含まれないため）
- パーセンテージ文字列 → 数値変換 (`parsePctString()`)
- 分母0の場合は null を保持
- モジュールスコープでキャッシュ

### `getGameStats()`
- 全試合CSVをパース → 対戦相手でグループ化 → `GameResult[]`
- `試合情報.csv` から日付・YouTube URL・クォータースコア・試合情報を結合
- `相手チームスタッツ.csv` から相手チームスタッツを結合
- 出場時間を160分（8クォーター x 5人）に正規化 (`adjustMinutesTo160`)
- 日付降順ソート
- モジュールスコープでキャッシュ

### `getPlayerByNumber(number)`
- 特定選手のサマリ + 試合別スタッツ（opponent, date, stat）を返す

### `getGameByOpponent(opponent)`
- 対戦相手名から試合結果を検索

### `getAllPlayerNumbers()`
- 全選手の背番号リスト（SSG用 `generateStaticParams`）

### `getAllOpponents()`
- 全対戦相手名リスト（SSG用 `generateStaticParams`）

### `getTopPlayers(players)`
- 8カテゴリ（得点, リバウンド, アシスト, 3P, スティール, ブロック, ファール, ターンオーバー）のトップ選手を返す

## ユーティリティ (`src/lib/utils.ts`)

- `formatPct()` - パーセンテージの表示フォーマット（null → "-"）
- `parsePctString()` - パーセンテージ文字列 → 数値変換
- `parseIntOrNull()` - 数値文字列 → 数値変換（null対応）
- `pctColor()` - パーセンテージに応じた色を返す（50%以上: 緑, 33%以上: 黄, それ以下: 赤）
- `CHART_COLORS` - チャート用カラーパレット（9色）
- `getPlayerColor()` - インデックスに応じたチャートカラーを返す

## アドバンスドスタッツ (`src/lib/stats.ts`)

- `calcTeamPossEst()` - B.League式でポゼッション数を推定
- `calcAdvancedStats()` - PACE, OFFRTG, DEFRTG, NETRTGを計算

## 型定義 (`src/lib/types.ts`)

### PlayerSummary
- number, name, games, totalPoints, ppg
- 3P/2P/FT: made, attempt, pct (null可)
- offReb, defReb, totalReb
- assists, steals, blocks, turnovers
- personalFouls, foulsDrawn

### GamePlayerStat
- opponent, number, name, starter
- points, 3P/2P/FT (made/attempt/pct)
- dunk
- rebounds (off/def/total), assists, steals, blocks
- turnovers, personalFouls, technicalFouls, offensiveFouls, foulsDrawn, disqualifications
- minutes (MM:SS形式)

### QuarterScore
- quarter, espoir, opponent

### GameInfo
- tournament, venue, gameType (全てnull可)

### GameResult
- opponent, date, players[], teamPoints
- opponentPlayers[], opponentPoints
- youtubeUrl (null可)
- quarterScores[]
- gameInfo

## 受け入れ条件
- [x] CSVが正しくパースされる
- [x] 型安全な変換
- [x] パーセンテージの null ハンドリング
- [x] PF/FO が全試合CSVから正しく集計される
- [x] 日付順ソート
- [x] 相手チームスタッツの結合
- [x] 試合情報（日付, YouTube, クォータースコア）の結合
- [x] 出場時間の160分正規化
