"use client";

import AnimatedSection from "../ui/AnimatedSection";
import GlassCard from "../ui/GlassCard";

interface Term {
  abbr: string;
  name: string;
  desc: string;
}

const basicStats: Term[] = [
  { abbr: "PTS", name: "Points", desc: "得点数。フリースロー・2P・3Pすべて含む合計得点。" },
  { abbr: "PPG", name: "Points Per Game", desc: "1試合あたりの平均得点。" },
  { abbr: "GS", name: "Game Start", desc: "スターター（先発出場）。" },
  { abbr: "MIN", name: "Minutes", desc: "出場時間（分:秒）。" },
];

const shootingStats: Term[] = [
  { abbr: "FG%", name: "Field Goal Percentage", desc: "フィールドゴール成功率。2Pと3Pを合わせた全シュートの成功率。" },
  { abbr: "3PM", name: "3-Point Made", desc: "3ポイントシュート成功数。" },
  { abbr: "3PA", name: "3-Point Attempted", desc: "3ポイントシュート試投数。" },
  { abbr: "3P%", name: "3-Point Percentage", desc: "3ポイントシュート成功率（3PM ÷ 3PA × 100）。" },
  { abbr: "2PM", name: "2-Point Made", desc: "2ポイントシュート成功数。" },
  { abbr: "2PA", name: "2-Point Attempted", desc: "2ポイントシュート試投数。" },
  { abbr: "2P%", name: "2-Point Percentage", desc: "2ポイントシュート成功率（2PM ÷ 2PA × 100）。" },
  { abbr: "FTM", name: "Free Throw Made", desc: "フリースロー成功数。" },
  { abbr: "FTA", name: "Free Throw Attempted", desc: "フリースロー試投数。" },
  { abbr: "FT%", name: "Free Throw Percentage", desc: "フリースロー成功率（FTM ÷ FTA × 100）。" },
  { abbr: "DK", name: "Dunk", desc: "ダンクシュート数。" },
];

const reboundStats: Term[] = [
  { abbr: "OR", name: "Offensive Rebound", desc: "オフェンスリバウンド。自チームがシュートを外した後に確保したリバウンド。" },
  { abbr: "DR", name: "Defensive Rebound", desc: "ディフェンスリバウンド。相手チームがシュートを外した後に確保したリバウンド。" },
  { abbr: "REB / TOT", name: "Total Rebounds", desc: "リバウンド合計（OR + DR）。" },
  { abbr: "RPG", name: "Rebounds Per Game", desc: "1試合あたりの平均リバウンド数。" },
];

const playStats: Term[] = [
  { abbr: "AST", name: "Assists", desc: "アシスト。パスを受けた味方がそのままシュートを決めた回数。" },
  { abbr: "APG", name: "Assists Per Game", desc: "1試合あたりの平均アシスト数。" },
  { abbr: "STL", name: "Steals", desc: "スティール。相手からボールを奪った回数。" },
  { abbr: "SPG", name: "Steals Per Game", desc: "1試合あたりの平均スティール数。" },
  { abbr: "BLK", name: "Blocks", desc: "ブロック。相手のシュートをブロックした回数。" },
  { abbr: "BPG", name: "Blocks Per Game", desc: "1試合あたりの平均ブロック数。" },
  { abbr: "TO", name: "Turnovers", desc: "ターンオーバー。ミスやバイオレーションなどで相手にボールが渡った回数。" },
];

const foulStats: Term[] = [
  { abbr: "PF", name: "Personal Fouls", desc: "パーソナルファール。身体接触による反則の合計。" },
  { abbr: "TF", name: "Technical Fouls", desc: "テクニカルファール。スポーツマンシップに反する行為に対するファール。" },
  { abbr: "OF", name: "Offensive Fouls", desc: "オフェンスファール。攻撃側の選手が犯したファール（チャージングなど）。" },
  { abbr: "FD", name: "Fouls Drawn", desc: "ファールドローン。相手からファールを受けた回数。" },
  { abbr: "DQ", name: "Disqualifications", desc: "退場。ファール累積やフレグラントファールによる退場処分。" },
];

const advancedStats: Term[] = [
  { abbr: "EFF", name: "Efficiency", desc: "効率指標。(PTS + REB + AST + STL + BLK) − (シュートミス + フリースローミス + TO)。プラスが大きいほど貢献度が高い。" },
  { abbr: "GmSc", name: "Game Score", desc: "ゲームスコア（Hollinger式）。1試合のパフォーマンスを1つの数値で評価する指標。得点・リバウンド・アシスト・スティール・ブロックをプラス、ミスショット・ターンオーバー・ファールをマイナスに加重。" },
  { abbr: "POSS", name: "Possessions", desc: "ポゼッション数。1試合の攻撃回数の推定値。FGA + 0.4×FTA − 1.07×(OREB/(OREB+相手DREB))×(FGA−FGM) + TO で算出（B.League準拠）。" },
  { abbr: "PACE", name: "Pace", desc: "ペース。40分あたりのポゼッション数。試合のテンポを示す指標。数値が大きいほどテンポが速い試合。" },
  { abbr: "OFFRTG", name: "Offensive Rating", desc: "オフェンスレーティング。100ポゼッションあたりの得点数（100 × PTS ÷ POSS）。攻撃効率を示す。" },
  { abbr: "DEFRTG", name: "Defensive Rating", desc: "ディフェンスレーティング。100ポゼッションあたりの失点数（100 × 相手PTS ÷ POSS）。数値が低いほど守備が良い。" },
  { abbr: "NETRTG", name: "Net Rating", desc: "ネットレーティング（OFFRTG − DEFRTG）。プラスなら得点が失点を上回っている。チーム力の総合指標。" },
];

const categories = [
  { title: "Basic Stats", terms: basicStats },
  { title: "Shooting", terms: shootingStats },
  { title: "Rebounds", terms: reboundStats },
  { title: "Playmaking", terms: playStats },
  { title: "Fouls", terms: foulStats },
  { title: "Advanced Stats", terms: advancedStats },
];

export default function GlossaryContent() {
  return (
    <AnimatedSection className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <h1 className="font-display text-2xl sm:text-4xl font-bold uppercase tracking-wider mb-2 text-center">
        Stats <span className="text-accent-purple">Glossary</span>
      </h1>
      <p className="text-sm text-neutral-400 text-center mb-8">
        このサイトで使われているスタッツ用語の一覧です
      </p>

      <div className="space-y-6">
        {categories.map((cat) => (
          <GlassCard key={cat.title}>
            <h2 className="font-display text-base sm:text-lg font-bold uppercase tracking-wider text-accent-purple mb-4">{cat.title}</h2>
            <dl className="space-y-3">
              {cat.terms.map((term) => (
                <div key={term.abbr} className="flex flex-col sm:flex-row sm:gap-4">
                  <dt className="flex items-center gap-2 shrink-0 sm:w-48">
                    <span className="font-mono font-bold text-foreground text-sm">{term.abbr}</span>
                    <span className="text-xs text-neutral-500">{term.name}</span>
                  </dt>
                  <dd className="text-sm text-neutral-300 mt-0.5 sm:mt-0">{term.desc}</dd>
                </div>
              ))}
            </dl>
          </GlassCard>
        ))}
      </div>
    </AnimatedSection>
  );
}
