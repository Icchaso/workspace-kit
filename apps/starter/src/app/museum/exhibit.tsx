"use client";

/**
 * 博物館の展示の共通部品。
 *   Exhibit … 1つの展示の枠（名前・一文・実物の台・調整つまみ・「この仕様にできる」の箇条）
 *   Knob*   … 調整つまみ（選ぶ・数を動かす・入/切）
 *   useDeck … 画面の上の操作台（屈折の強さ・背景）の値
 * 実物の台は、画面の近くに来たときだけ中身を描く（遠い展示の動き・ガラスの計算を止めて軽くする）。
 */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export type Backdrop = "plain" | "pattern" | "bands";
export type Deck = { intensity: number; backdrop: Backdrop };
export const DeckContext = createContext<Deck>({ intensity: 5, backdrop: "pattern" });
export const useDeck = () => useContext(DeckContext);

/** 画面の近くにある間だけ true（上下 600px の余裕を持たせる） */
function useNear<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return [ref, near] as const;
}

export function Exhibit({
  id,
  title,
  lead,
  specs,
  knobs,
  stage = "backdrop",
  stageClassName,
  minHeight = 180,
  children,
}: {
  id: string;
  title: string;
  lead: string;
  /** 「この仕様にできる」の箇条 */
  specs: string[];
  knobs?: React.ReactNode;
  /** 実物の台の下地。backdrop＝操作台で選んだ背景（ガラスが透けて見える）、plain＝アプリと同じ無地 */
  stage?: "backdrop" | "plain";
  stageClassName?: string;
  minHeight?: number;
  children: React.ReactNode;
}) {
  const { backdrop } = useDeck();
  const [ref, near] = useNear<HTMLDivElement>();
  return (
    <article id={id} aria-labelledby={`${id}-h`} className="grid min-w-0 content-start gap-3 rounded-lg border border-line bg-surface p-3 rail:p-4">
      <header className="grid gap-1 px-1">
        <h3 id={`${id}-h`} className="text-base font-semibold">
          {title}
        </h3>
        <p className="text-sm text-fg-2">{lead}</p>
      </header>
      <div
        ref={ref}
        data-backdrop={stage === "backdrop" ? backdrop : "plain"}
        className={cn("museum-stage relative grid min-w-0 place-items-center overflow-hidden rounded-md p-4", stageClassName)}
        style={{ minHeight }}
      >
        {near ? children : <span className="text-sm text-fg-3">近づくと動きます</span>}
      </div>
      {knobs && <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-1">{knobs}</div>}
      <ul className="grid gap-1 px-1 text-sm text-fg-2">
        {specs.map((s) => (
          <li key={s} className="flex gap-2">
            <span aria-hidden className="mt-[0.55em] size-1 flex-none rounded-full bg-fg-3" />
            <span>{s}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** 2〜5個から1つ選ぶつまみ */
export function KnobPick<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex min-w-0 flex-wrap items-center gap-1.5">
      <span className="text-xs text-fg-3">{label}</span>
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-[32px] min-w-[44px] rounded-full border border-line px-2.5 text-xs text-fg-2 transition-colors duration-[var(--wk-dur-fast)] pointer-coarse:min-h-hit",
            value === o.value && "border-transparent bg-accent-soft font-medium text-accent-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** 数を動かすつまみ */
export function KnobRange({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => String(v),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  return (
    <label className="flex min-w-0 items-center gap-2 text-xs text-fg-3">
      <span className="flex-none">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-hit w-28 accent-[var(--wk-accent)]"
      />
      <span className="num w-10 flex-none text-fg-2">{format(value)}</span>
    </label>
  );
}

/** 入/切のつまみ */
export function KnobToggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-hit items-center gap-2 text-xs text-fg-2">
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-[var(--wk-accent)]" />
      {label}
    </label>
  );
}

/** 部屋（見出し＋展示の並び） */
export function Room({ id, title, lead, children }: { id: string; title: string; lead: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="grid scroll-mt-[76px] gap-4">
      <header className="grid gap-1">
        <h2 id={`${id}-h`} className="text-xl font-semibold">
          {title}
        </h2>
        <p className="text-sm text-fg-2">{lead}</p>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}
