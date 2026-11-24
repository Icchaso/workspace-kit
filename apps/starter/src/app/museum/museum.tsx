"use client";

/**
 * UI博物館（/museum）。Workspace Kit で作れる部品と動きを、部屋ごとに並べてその場で触れる見本。
 * 見本サイトの中だけの物で、配る部品集（registry）には入れない。
 *
 *   上の目次 … 部屋（押す・入れる・見せる・動く・知らせる）へ飛ぶ。今いる部屋に色が付く
 *   操作台   … 屈折の強さ（ガラスの部品すべて）・テーマ・明暗・背景（ガラスの透けと曲がりが分かるように）
 *   展示     … 実物＋調整つまみ＋「この仕様にできる」
 */
import "./museum.css";
import { PALETTES } from "@workspace-kit/themes/catalog";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/kit/toast";
import { setPalette, setTheme, usePalette, useTheme, type Theme } from "@/lib/prefs";
import { cn } from "@/lib/cn";
import { DeckContext, type Backdrop } from "./exhibit";
import { PressRoom } from "./rooms/press";
import { InputRoom } from "./rooms/input";
import { ShowRoom } from "./rooms/show";
import { MotionRoom } from "./rooms/motion";
import { NotifyRoom } from "./rooms/notify";

const ROOMS = [
  { id: "press", label: "押す" },
  { id: "input", label: "入れる" },
  { id: "show", label: "見せる" },
  { id: "motion", label: "動く" },
  { id: "notify", label: "知らせる" },
];

const BACKDROPS: { value: Backdrop; label: string }[] = [
  { value: "pattern", label: "模様" },
  { value: "bands", label: "色の帯" },
  { value: "plain", label: "無地" },
];

const THEMES: { value: Theme; label: string }[] = [
  { value: "system", label: "端末に合わせる" },
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
];

/** 今いる部屋（画面の上から 30% の線にかかっている部屋） */
function useCurrentRoom() {
  const [current, setCurrent] = useState(ROOMS[0].id);
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setCurrent(e.target.id);
      },
      { rootMargin: "-30% 0px -69% 0px" },
    );
    for (const r of ROOMS) {
      const el = document.getElementById(r.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, []);
  return current;
}

export function Museum() {
  const [intensity, setIntensity] = useState(5);
  const [backdrop, setBackdrop] = useState<Backdrop>("pattern");
  const palette = usePalette();
  const theme = useTheme();
  const current = useCurrentRoom();

  return (
    <DeckContext.Provider value={{ intensity, backdrop }}>
      <div className="museum mx-auto grid max-w-[1320px] gap-8 px-4 pt-[calc(16px+env(safe-area-inset-top,0px))] pb-24 rail:px-8">
        <header className="grid gap-2">
          <Link href="/kit" className="flex min-h-hit w-fit items-center gap-1 text-sm text-fg-2 hover:text-fg">
            <ArrowLeft aria-hidden size={16} />
            見本へ戻る
          </Link>
          <p className="text-sm font-medium text-accent-text">Workspace Kit</p>
          <h1 className="text-2xl leading-tight font-semibold rail:text-3xl">UI博物館</h1>
          <p className="max-w-[60ch] text-fg-2">
            ボタン・スイッチ・スライダー・ゲージ・スクロール・シートなど、作れる部品と動きを並べました。どれもその場で触れます。つまみで仕様を変えて、「こういう動きにできる」を確かめてください。
          </p>
        </header>

        {/* 目次：スクロールしても上に残る */}
        <nav aria-label="部屋" className="sticky top-[calc(8px+env(safe-area-inset-top,0px))] z-30 -mx-1 flex justify-center">
          <div className="wk-glass flex max-w-full gap-0.5 overflow-x-auto rounded-full p-[3px] [scrollbar-width:none]">
            {ROOMS.map((r) => (
              <a
                key={r.id}
                href={`#${r.id}`}
                aria-current={current === r.id ? "location" : undefined}
                className={cn(
                  "flex min-h-hit flex-none items-center rounded-full px-3.5 text-sm text-fg-2 transition-[color,background-color] duration-[var(--wk-dur-fast)]",
                  current === r.id && "bg-surface font-medium text-fg shadow-sm",
                )}
              >
                {r.label}
              </a>
            ))}
          </div>
        </nav>

        {/* 操作台：全部の展示に効く */}
        <section aria-label="操作台" className="grid gap-3 rounded-lg border border-line bg-surface p-4">
          <p className="text-sm font-medium">操作台（全部の展示に効きます）</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="flex items-center gap-2 text-sm text-fg-2">
              屈折の強さ
              <input
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="h-hit w-32 accent-[var(--wk-accent)]"
              />
              <span className="num w-5 text-fg">{intensity}</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-fg-2">
              テーマ
              <select
                value={palette}
                onChange={(e) => setPalette(e.target.value)}
                className="min-h-hit rounded-md border border-line bg-surface px-2 text-[16px] text-fg"
              >
                {PALETTES.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <Pills label="明暗" value={theme} options={THEMES} onChange={setTheme} />
            <Pills label="背景" value={backdrop} options={BACKDROPS} onChange={setBackdrop} />
          </div>
          <p className="text-xs text-fg-3">「動きを減らす」は端末の設定（iPhone は 設定→アクセシビリティ→動作）に従います。オンにすると、どの展示もバネを使わずすぐ止まります。</p>
        </section>

        <PressRoom />
        <InputRoom />
        <ShowRoom />
        <MotionRoom />
        <NotifyRoom />
      </div>
      <Toaster />
    </DeckContext.Provider>
  );
}

function Pills<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-1.5 text-sm text-fg-2">
      {label}
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "min-h-hit min-w-[44px] rounded-full border border-line px-3 text-sm transition-colors duration-[var(--wk-dur-fast)]",
            value === o.value && "border-transparent bg-accent-soft font-medium text-accent-text",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
