"use client";

/**
 * 見本サイト（/kit）。テーマ × 画面の型 × 明るさを選ぶと、同じアプリをスマホ幅（390px）と PC 幅（1280px）で並べて見せる。
 * 中身は本物の雛形を iframe で開いているだけ（?palette=…&theme=… を付ける）。触ることもできる。
 */
import { PALETTES } from "@workspace-kit/themes/catalog";
import { ExternalLink, Monitor, Moon, Smartphone, Sun } from "lucide-react";
import { useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { Segmented } from "@/components/kit/segmented";
import { cn } from "@/lib/cn";

const VIEWS = [
  { value: "/", label: "B 現場" },
  { value: "/tasks", label: "A 指令室" },
  { value: "/ai", label: "C 相棒" },
] as const;
type View = (typeof VIEWS)[number]["value"];
type Scheme = "light" | "dark";

const STEPS = [
  { title: "新しく作る", body: "Claude Code に「Workspace Kit で新しくツールを作りたい」と言うと、画面の型とテーマを聞かれ、この見本と同じ土台が出来上がります。" },
  { title: "今のツールに入れる", body: "「今のツールを Workspace Kit で整えて」と言うと、色・文字・ナビの作りを読んでから、変える場所の計画を見せてくれます。承認すると差し替えが始まります。" },
  { title: "テーマを変える", body: "「テーマをラベンダーにして」のように名前で頼むか、アプリの設定画面・⌘K から選べます。色・文字・角の丸みがまとめて変わります。" },
  { title: "スマホで崩れていないか見る", body: "「スマホで崩れてないか見て」と言うと、6つの幅 × ライト/ダークで撮影し、はみ出し・押せる大きさ・文字の小ささ・コントラストを数字で確かめます。" },
];

const darkQuery = "(prefers-color-scheme: dark)";
function subscribeDark(cb: () => void) {
  const m = window.matchMedia(darkQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
function readPageDark() {
  const t = document.documentElement.dataset.theme;
  return t === "dark" || (t !== "light" && window.matchMedia(darkQuery).matches);
}

/** 中身を決まった幅で描き、外枠の幅に合わせて縮める */
function Frame({ src, width, height, title }: { src: string; width: number; height: number; title: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(Math.min(1, el.clientWidth / width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);
  return (
    <div ref={box} className="relative w-full overflow-hidden rounded-lg border border-line bg-surface shadow-float" style={{ height: height * scale, maxWidth: width }}>
      <iframe
        src={src}
        title={title}
        loading="lazy"
        className="absolute top-0 left-0 origin-top-left border-0"
        style={{ width, height, transform: `scale(${scale})` }}
      />
    </div>
  );
}

export function KitShowcase() {
  const [palette, setPalette] = useState("graphite");
  const [view, setView] = useState<View>("/");
  // 明るさは選ぶまで、このページを見ている端末の表示に合わせる（ダークの端末でいきなり白い枠が出ないように）
  const [picked, setScheme] = useState<Scheme | null>(null);
  const pageDark = useSyncExternalStore(subscribeDark, readPageDark, () => false);
  const scheme: Scheme = picked ?? (pageDark ? "dark" : "light");
  const current = PALETTES.find((p) => p.id === palette)!;
  const src = `${view}?palette=${palette}&theme=${current.darkOnly ? "dark" : scheme}`;

  return (
    <div className="mx-auto grid max-w-[1320px] gap-8 px-4 pt-[calc(24px+env(safe-area-inset-top,0px))] pb-16 rail:px-8">
      <header className="grid gap-2">
        <p className="text-sm font-medium text-accent-text">Workspace Kit</p>
        <h1 className="text-2xl leading-tight font-semibold rail:text-3xl">入れるだけで、<span className="whitespace-nowrap">PC でも</span><span className="whitespace-nowrap">スマホでも</span>整う。</h1>
        <p className="max-w-[60ch] text-fg-2">
          自分の業務ツールに入れると、ナビ・ボタン・シート・色・文字・動きがそろいます。下の見本は本物のアプリです。テーマと画面の型を切り替えて、スマホ幅と PC 幅の見え方を並べて確かめられます。
        </p>
      </header>

      <section aria-labelledby="pick-h" className="grid gap-4">
        <h2 id="pick-h" className="sr-only">
          見え方を選ぶ
        </h2>
        <div role="group" aria-label="テーマ" className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin] rail:flex-wrap">
          {PALETTES.map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={palette === p.id}
              onClick={() => setPalette(p.id)}
              title={p.desc}
              className={cn(
                "flex h-hit flex-none items-center gap-2 rounded-full border px-3 text-sm transition-[color,background-color,border-color,scale] ease-out active:scale-(--wk-press) active:duration-[var(--wk-dur-press)]",
                palette === p.id ? "border-fg bg-fg text-canvas" : "border-line bg-surface text-fg-2 hover:text-fg",
              )}
            >
              <span aria-hidden className="flex -space-x-1">
                {p.swatch.slice(0, 3).map((c, i) => (
                  <i key={i} className="block size-3.5 rounded-full border border-line" style={{ background: c }} />
                ))}
              </span>
              {p.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Segmented<View> label="画面の型" value={view} onChange={setView} options={VIEWS.map((v) => ({ value: v.value, label: v.label }))} />
          {current.darkOnly ? (
            <span className="text-sm text-fg-3">このテーマは常に暗い表示です</span>
          ) : (
            <Segmented<Scheme>
              label="明るさ"
              value={scheme}
              onChange={setScheme}
              options={[
                { value: "light", label: "ライト" },
                { value: "dark", label: "ダーク" },
              ]}
            />
          )}
        </div>
        <p className="text-sm text-fg-2">
          <b className="font-semibold text-fg">{current.label}</b> ― {current.desc}
        </p>
      </section>

      <section aria-label="見本" className="grid items-start gap-6 side:grid-cols-[390px_minmax(0,1fr)]">
        <figure className="grid gap-2">
          <figcaption className="flex items-center gap-1.5 text-sm text-fg-3">
            <Smartphone aria-hidden size={16} />
            スマホ（390px）
          </figcaption>
          <Frame key={`p-${src}`} src={src} width={390} height={760} title={`スマホ幅の見本：${current.label}`} />
        </figure>
        <figure className="grid gap-2">
          <figcaption className="flex items-center gap-1.5 text-sm text-fg-3">
            <Monitor aria-hidden size={16} />
            PC（1280px を縮小）
          </figcaption>
          <Frame key={`d-${src}`} src={src} width={1280} height={800} title={`PC 幅の見本：${current.label}`} />
          <a href={src} target="_blank" rel="noreferrer" className="inline-flex h-hit items-center gap-1.5 justify-self-start text-sm text-accent-text underline-offset-4 hover:underline">
            <ExternalLink aria-hidden size={16} />
            このテーマで全画面で開く
          </a>
        </figure>
      </section>

      <section aria-labelledby="how-h" className="grid gap-4">
        <h2 id="how-h" className="text-xl font-semibold">
          使い方
        </h2>
        <ol className="grid gap-3 rail:grid-cols-2">
          {STEPS.map((s, i) => (
            <li key={s.title} className="grid gap-1.5 rounded-md border border-line bg-surface p-4">
              <span className="flex items-center gap-2 font-semibold">
                <span className="num grid size-6 place-items-center rounded-full bg-accent-soft text-xs text-accent-text">{i + 1}</span>
                {s.title}
              </span>
              <p className="text-sm text-fg-2">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="inside-h" className="grid gap-3">
        <h2 id="inside-h" className="text-xl font-semibold">
          中に入っているもの
        </h2>
        <ul className="grid gap-2 text-sm text-fg-2 rail:grid-cols-2">
          <li className="flex gap-2">
            <Sun aria-hidden size={16} className="mt-0.5 flex-none text-accent-text" />
            画面幅で姿を変える骨格：スマホは下タブ、タブレットはアイコン列、PC はサイドバー。どの幅でもナビが消えない
          </li>
          <li className="flex gap-2">
            <Smartphone aria-hidden size={16} className="mt-0.5 flex-none text-accent-text" />
            ボタンの大きさは「指かマウスか」で自動（指 44px／マウス 36px）。入力欄は 16px で iPhone の勝手な拡大を防ぐ
          </li>
          <li className="flex gap-2">
            <Moon aria-hidden size={16} className="mt-0.5 flex-none text-accent-text" />
            テーマ12種（ライト／ダーク両方）。文字と背景の差はすべて 4.5:1 以上に自動調整済み
          </li>
          <li className="flex gap-2">
            <Monitor aria-hidden size={16} className="mt-0.5 flex-none text-accent-text" />
            画面の検査台本：6つの幅 × ライト/ダークで撮影し、はみ出し・押せる大きさ・文字・コントラスト・動きの速さを数字で合否
          </li>
        </ul>
        <p className="text-xs text-fg-3">テーマの元の色・文字：awesome-design-skills（Copyright (c) 2026 Bergside, MIT License）。日本語フォントの組み合わせとコントラスト調整は Workspace Kit。</p>
      </section>
    </div>
  );
}
