# F006 - UIコンポーネント

**ステータス:** ✅ 実装済み
**優先度:** P1

## 概要
再利用可能なUIコンポーネント群。

## コンポーネント一覧

### AnimatedSection
- Framer Motion ラッパー
- スクロール時にフェードイン + 上方向スライド
- `useReducedMotion()` で prefers-reduced-motion 尊重
- `whileInView` + `once: true` で単発実行
- `delay` prop でアニメーション遅延制御

### GlassCard
- ガラスモーフィズムカード
- `background: rgba(255, 255, 255, 0.05)`
- `backdrop-filter: blur(12px)`
- `border: 1px solid rgba(255, 255, 255, 0.1)`
- ホバー効果オプション

### ProgressRing
- SVG円形の進捗表示
- シュート成功率の可視化
- ストロークアニメーション
- `role="img"` + `aria-label` 付き

### StatCounter
- 0 → 目標値へのカウントアップアニメーション
- `requestAnimationFrame` + 3次イージング
- viewport内で開始

### Badge
- 8色バリエーション (purple, blue, green, yellow, red, pink, cyan, indigo)
- ラベルテキスト表示

## レイアウトコンポーネント

### Header
- 固定ヘッダー
- ロゴ + ナビゲーションリンク
- モバイルメニュー（ハンバーガー）
- スクロール時の背景不透明度変化

### Footer
- ページ内リンク
- パス依存の表示切替（ホーム vs 他ページ）

## 受け入れ条件
- [x] 全コンポーネントが正しくレンダリングされる
- [x] アニメーションが動作する
- [x] reduced-motion が尊重される
- [x] アクセシビリティ属性が適切
