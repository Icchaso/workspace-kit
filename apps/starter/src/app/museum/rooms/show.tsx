"use client";

/** 見せる部屋：円のゲージ・横棒のゲージ・3重のリング・数字の回転・小さなグラフ・ガラスのカード */
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { CountUp } from "@/components/kit/count-up";
import { cn } from "@/lib/cn";
import { GlassCard } from "../_glass/components/GlassCard";
import { Exhibit, KnobPick, KnobRange, Room, useDeck } from "../exhibit";

const EASE = [0.23, 1, 0.32, 1] as const;

/** 値に近づく数（動きを減らす設定ではすぐ切り替える） */
function useTween(value: number, duration = 0.6) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(value);
  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const c = animate(mv, value, { duration, ease: EASE });
    return () => c.stop();
  }, [value, reduce, mv, duration]);
  return mv;
}

/** しきい値で色を変える（70 以上＝注意・90 以上＝危険 など） */
function levelColor(v: number, warn: number, danger: number) {
  return v >= danger ? "var(--wk-danger)" : v >= warn ? "var(--wk-warn)" : "var(--wk-ok)";
}

function RingGauge() {
  const [v, setV] = useState(62);
  const [warn, setWarn] = useState(70);
  const mv = useTween(v);
  const R = 70;
  const ARC = 0.75; // 270°
  const len = 2 * Math.PI * R;
  const dash = useTransform(mv, (x) => `${(x / 100) * ARC * len} ${len}`);
  const shown = useTransform(mv, (x) => String(Math.round(x)));
  return (
    <Exhibit
      id="ring-gauge"
      title="円のゲージ"
      lead="値が変わると針の代わりに弧がなめらかに伸び縮みし、しきい値を超えると色が変わります。"
      stage="plain"
      minHeight={240}
      knobs={
        <>
          <KnobRange label="値" value={v} min={0} max={100} onChange={setV} />
          <KnobPick label="注意の線" value={warn} onChange={setWarn} options={[{ value: 50, label: "50" }, { value: 70, label: "70" }, { value: 85, label: "85" }]} />
        </>
      }
      specs={["弧の長さ（270°・半円・一周）を選べる", "しきい値で 緑→黄→赤 に変えられる", "中に数字・単位・説明を置ける", "動きを減らす設定ではすぐ切り替わる"]}
    >
      <div className="relative grid place-items-center">
        <svg width="180" height="180" viewBox="0 0 180 180" className="rotate-[135deg]" aria-hidden>
          <circle cx="90" cy="90" r={R} fill="none" stroke="var(--wk-surface-2)" strokeWidth="14" strokeLinecap="round" strokeDasharray={`${ARC * len} ${len}`} />
          <motion.circle
            cx="90"
            cy="90"
            r={R}
            fill="none"
            strokeWidth="14"
            strokeLinecap="round"
            style={{ strokeDasharray: dash, stroke: levelColor(v, warn, Math.min(100, warn + 20)) }}
            className="transition-[stroke] duration-300"
          />
        </svg>
        <div className="absolute grid justify-items-center" role="meter" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label="使用率">
          <span className="num text-4xl font-semibold">
            <motion.span>{shown}</motion.span>
            <span className="text-base text-fg-3">%</span>
          </span>
          <span className="text-xs text-fg-3">使用率</span>
        </div>
      </div>
    </Exhibit>
  );
}

function BarGauge() {
  const [v, setV] = useState(7);
  const [style, setStyle] = useState<"seg" | "bar">("seg");
  const max = 10;
  return (
    <Exhibit
      id="bar-gauge"
      title="横棒のゲージ"
      lead="区切りのある型と、なめらかな型。目標までどれだけかが一目で分かります。"
      stage="plain"
      knobs={
        <>
          <KnobRange label="件数" value={v} min={0} max={max} onChange={setV} />
          <KnobPick label="型" value={style} onChange={setStyle} options={[{ value: "seg", label: "区切り" }, { value: "bar", label: "なめらか" }]} />
        </>
      }
      specs={["区切り（10段など）か、なめらかな棒かを選べる", "目標の線を引ける", "色は主色・しきい値の色・好きな色にできる"]}
    >
      <div className="grid w-full max-w-[320px] gap-2">
        <div className="flex items-baseline justify-between text-sm">
          <span className="text-fg-2">今月の契約</span>
          <span className="num font-semibold">
            {v}
            <span className="text-fg-3"> / {max} 件</span>
          </span>
        </div>
        {style === "seg" ? (
          <div className="flex gap-1" role="meter" aria-valuenow={v} aria-valuemin={0} aria-valuemax={max} aria-label="今月の契約">
            {Array.from({ length: max }, (_, i) => (
              <span
                key={i}
                className="h-3 flex-1 rounded-full transition-[background-color] duration-200"
                style={{ background: i < v ? "var(--wk-accent)" : "var(--wk-surface-2)", transitionDelay: `${i * 18}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="relative h-3 overflow-hidden rounded-full bg-surface-2" role="meter" aria-valuenow={v} aria-valuemin={0} aria-valuemax={max} aria-label="今月の契約">
            <motion.span className="absolute inset-y-0 left-0 rounded-full bg-accent" animate={{ width: `${(v / max) * 100}%` }} transition={{ duration: 0.5, ease: EASE }} />
            <span aria-hidden className="absolute inset-y-[-3px] left-[80%] w-0.5 bg-fg" title="目標" />
          </div>
        )}
        <p className="text-xs text-fg-3">{v >= 8 ? "目標の 8 件に届きました" : `目標の 8 件まで、あと ${8 - v} 件`}</p>
      </div>
    </Exhibit>
  );
}

function Rings() {
  const [vals, setVals] = useState([0.72, 0.48, 0.9]);
  const colors = ["#ff375f", "#a2ff00", "#00d8ff"];
  const names = ["売上", "訪問", "返信"];
  return (
    <Exhibit
      id="rings"
      title="3重の進捗リング"
      lead="Apple Watch のアクティビティのような3重の輪。ボタンを押すと、輪がそれぞれの値まで回ります。"
      stage="plain"
      minHeight={240}
      knobs={
        <button type="button" onClick={() => setVals(vals.map(() => Math.round((0.15 + Math.random() * 0.95) * 100) / 100))} className="min-h-hit rounded-full border border-line px-3 text-sm">
          値を変える
        </button>
      }
      specs={["輪の数（1〜3）と色を選べる", "100% を超えると2周目に入る見せ方もできる", "輪ごとに名前と数字を添えられる"]}
    >
      <div className="flex items-center gap-5">
        <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90" aria-hidden>
          {vals.map((v, i) => {
            const r = 62 - i * 18;
            const len = 2 * Math.PI * r;
            return (
              <g key={i}>
                <circle cx="75" cy="75" r={r} fill="none" stroke={colors[i]} strokeOpacity={0.18} strokeWidth="14" />
                <motion.circle
                  cx="75"
                  cy="75"
                  r={r}
                  fill="none"
                  stroke={colors[i]}
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray={len}
                  initial={{ strokeDashoffset: len }}
                  animate={{ strokeDashoffset: len * (1 - Math.min(v, 1)) }}
                  transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
                />
              </g>
            );
          })}
        </svg>
        <ul className="grid gap-1.5 text-sm">
          {names.map((n, i) => (
            <li key={n} className="flex items-center gap-2">
              <span aria-hidden className="size-2.5 rounded-full" style={{ background: colors[i] }} />
              {n}
              <span className="num font-semibold">{Math.round(vals[i] * 100)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </Exhibit>
  );
}

function Counter() {
  const [n, setN] = useState(128);
  return (
    <Exhibit
      id="count-up"
      title="数字が回って止まる表示"
      lead="値が変わったときだけ、今の数から 0.24 秒で数え直します。何が増えた・減ったかが目で追えます。"
      stage="plain"
      knobs={
        <div className="flex gap-2">
          <button type="button" onClick={() => setN((x) => x + 12)} className="min-h-hit rounded-full border border-line px-3 text-sm">
            ＋12
          </button>
          <button type="button" onClick={() => setN((x) => Math.max(0, x - 30))} className="min-h-hit rounded-full border border-line px-3 text-sm">
            −30
          </button>
        </div>
      }
      specs={["開いたときは最初から目標の数を出す（毎回0から数えない）", "桁がずれない等幅の数字", "読み上げには最後の数だけを伝える"]}
    >
      <div className="grid justify-items-center gap-1">
        <span className="text-sm text-fg-2">今週の問い合わせ</span>
        <span className="text-5xl font-semibold">
          <CountUp value={n} />
        </span>
      </div>
    </Exhibit>
  );
}

const DATA = [12, 18, 15, 22, 19, 28, 25, 31, 27, 36, 33, 41];
function Spark() {
  const [i, setI] = useState<number | null>(null);
  const [run, setRun] = useState(0);
  const box = useRef<SVGSVGElement>(null);
  const W = 280;
  const H = 90;
  const max = Math.max(...DATA);
  const pts = DATA.map((d, k) => [(k / (DATA.length - 1)) * W, H - (d / max) * (H - 10) - 4] as const);
  const path = pts.map(([x, y], k) => `${k ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const at = (clientX: number) => {
    const r = box.current!.getBoundingClientRect();
    return Math.round(Math.min(1, Math.max(0, (clientX - r.left) / r.width)) * (DATA.length - 1));
  };
  const cur = i ?? DATA.length - 1;
  return (
    <Exhibit
      id="spark"
      title="小さなグラフ"
      lead="線が左から描かれて出てきます。指でなぞると、その月の数字が読めます。"
      stage="plain"
      knobs={
        <button type="button" onClick={() => setRun((r) => r + 1)} className="min-h-hit rounded-full border border-line px-3 text-sm">
          もう一度描く
        </button>
      }
      specs={["線・面・棒の形を選べる", "なぞった所の値を出せる（指を離すと最新に戻る）", "数字カードの中に小さく置ける"]}
    >
      <div className="grid w-full max-w-[300px] gap-1">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-fg-2">{cur + 1}月の売上</span>
          <span className="num text-xl font-semibold">{DATA[cur]}万円</span>
        </div>
        <svg
          ref={box}
          viewBox={`0 0 ${W} ${H}`}
          className="w-full touch-none"
          role="img"
          aria-label={`1月から12月の売上。最新は ${DATA[DATA.length - 1]}万円`}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setI(at(e.clientX));
          }}
          onPointerMove={(e) => {
            if (e.buttons || e.pointerType === "mouse") setI(at(e.clientX));
          }}
          onPointerUp={() => setI(null)}
          onPointerLeave={() => setI(null)}
        >
          <motion.path key={run} d={`${path} L${W},${H} L0,${H} Z`} fill="var(--wk-accent)" initial={{ opacity: 0 }} animate={{ opacity: 0.12 }} transition={{ duration: 0.6, delay: 0.3 }} />
          <motion.path key={`l${run}`} d={path} fill="none" stroke="var(--wk-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: EASE }} />
          <line x1={pts[cur][0]} x2={pts[cur][0]} y1={0} y2={H} stroke="var(--wk-fg-3)" strokeDasharray="3 3" className={cn(i === null && "opacity-0")} />
          <circle cx={pts[cur][0]} cy={pts[cur][1]} r="5" fill="var(--wk-surface)" stroke="var(--wk-accent)" strokeWidth="2.5" />
        </svg>
      </div>
    </Exhibit>
  );
}

function Cards() {
  const { intensity } = useDeck();
  const [variant, setVariant] = useState<"regular" | "clear">("regular");
  return (
    <Exhibit
      id="glass-card"
      title="ガラスのカード"
      lead="後ろの模様が縁で曲がって見えるカード。すりガラスと透明の2種類です。操作台の「背景」を変えると違いが分かります。"
      minHeight={220}
      knobs={<KnobPick label="種類" value={variant} onChange={setVariant} options={[{ value: "regular", label: "すりガラス" }, { value: "clear", label: "透明" }]} />}
      specs={["すりガラス（読みやすい）と透明（後ろがよく見える）", "角の丸み・余白・縁の厚み・色の重ねを変えられる", "文字が多い所はすりガラスにする（読みやすさ優先）"]}
    >
      <GlassCard variant={variant} intensity={intensity} padding="20px" radius="24px" style={{ width: "min(280px, 100%)" }}>
        <p className="text-sm font-semibold">次の予定</p>
        <p className="mt-1 text-2xl font-semibold">14:00</p>
        <p className="text-sm">山田様 打ち合わせ</p>
      </GlassCard>
    </Exhibit>
  );
}

export function ShowRoom() {
  return (
    <Room id="show" title="見せる" lead="数字や状態を見せる部品。値が変わったときの動きを確かめる部屋です。">
      <RingGauge />
      <BarGauge />
      <Rings />
      <Counter />
      <Spark />
      <Cards />
    </Room>
  );
}
