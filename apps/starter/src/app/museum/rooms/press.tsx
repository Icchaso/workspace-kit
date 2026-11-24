"use client";

/** 押す部屋：ボタン・スイッチ・切り替え・メニュー・長押し・増減 */
import { Bell, Check, Copy, Ellipsis, Heart, Minus, Pencil, Plus, Share, Trash2, Wifi } from "lucide-react";
import { useRef, useState } from "react";
import { notify } from "@/components/kit/toast";
import { cn } from "@/lib/cn";
import { GlassButton } from "../_glass/components/GlassButton";
import { GlassMenu } from "../_glass/components/GlassMenu";
import { GlassSegmented } from "../_glass/components/GlassSegmented";
import { GlassSwitch } from "../_glass/components/GlassSwitch";
import { Exhibit, KnobPick, KnobToggle, Room, useDeck } from "../exhibit";

type Variant = "glass" | "clear" | "tinted" | "tinted-filled" | "filled";

function Buttons() {
  const { intensity } = useDeck();
  const [variant, setVariant] = useState<Variant>("glass");
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [destructive, setDestructive] = useState(false);
  return (
    <Exhibit
      id="buttons"
      title="ガラスのボタン"
      lead="押すとふくらみ、指の方へ少し傾き、離すとぷるんと戻ります。"
      knobs={
        <>
          <KnobPick
            label="種類"
            value={variant}
            onChange={setVariant}
            options={[
              { value: "glass", label: "ガラス" },
              { value: "clear", label: "透明" },
              { value: "tinted", label: "色文字" },
              { value: "tinted-filled", label: "淡い塗り" },
              { value: "filled", label: "塗り" },
            ]}
          />
          <KnobPick
            label="大きさ"
            value={size}
            onChange={setSize}
            options={[
              { value: "sm", label: "小 36" },
              { value: "md", label: "中 44" },
              { value: "lg", label: "大 52" },
            ]}
          />
          <KnobToggle label="危険な操作（赤）" value={destructive} onChange={setDestructive} />
        </>
      }
      specs={["種類は5つ。色は好きな色にできる", "高さは 36・44・52px の3段", "アイコンだけにすると丸いボタンになる", "削除など取り消せない操作は赤にできる"]}
    >
      <div className="flex flex-wrap items-center justify-center gap-3">
        <GlassButton variant={variant} size={size} destructive={destructive} intensity={intensity} onClick={() => notify(destructive ? "削除しました" : "保存しました")}>
          {destructive ? "削除" : "保存"}
        </GlassButton>
        <GlassButton variant={variant} size={size} destructive={destructive} intensity={intensity} icon={destructive ? <Trash2 size={18} /> : <Pencil size={18} />}>
          {destructive ? "まとめて消す" : "書く"}
        </GlassButton>
        <GlassButton variant={variant} size={size} destructive={destructive} intensity={intensity} icon={<Heart size={18} />} aria-label="お気に入り" />
      </div>
    </Exhibit>
  );
}

function Switches() {
  const { intensity } = useDeck();
  const [wifi, setWifi] = useState(true);
  const [bell, setBell] = useState(false);
  const [tint, setTint] = useState("var(--wk-ok)");
  return (
    <Exhibit
      id="switch"
      title="スイッチ"
      lead="つまみが持ち上がって透明なレンズになり、下の溝を曲げて映します。タップでも、つまんで横にずらしても切り替わります。"
      knobs={
        <KnobPick
          label="入の色"
          value={tint}
          onChange={setTint}
          options={[
            { value: "var(--wk-ok)", label: "緑" },
            { value: "var(--wk-accent)", label: "主色" },
            { value: "#ff9f0a", label: "橙" },
          ]}
        />
      }
      specs={["タップ・横にずらす、どちらでも切り替わる", "端まで引くとゴムのように少し伸びて戻る", "入の色は好きな色にできる", "押せない状態（薄く表示）にもできる"]}
    >
      <div className="grid w-full max-w-[300px] gap-2">
        {[
          { icon: Wifi, label: "Wi-Fi", on: wifi, set: setWifi },
          { icon: Bell, label: "通知", on: bell, set: setBell },
        ].map((r) => (
          <div key={r.label} className="flex items-center justify-between rounded-md bg-surface/80 px-3 py-2">
            <span className="flex items-center gap-2 text-sm">
              <r.icon aria-hidden size={18} />
              {r.label}
              <span className="text-xs text-fg-3">{r.on ? "入" : "切"}</span>
            </span>
            <GlassSwitch checked={r.on} onChange={r.set} tint={tint} intensity={intensity} aria-label={r.label} />
          </div>
        ))}
        <div className="flex items-center justify-between rounded-md bg-surface/80 px-3 py-2">
          <span className="text-sm text-fg-3">押せない状態</span>
          <GlassSwitch checked disabled tint={tint} intensity={intensity} aria-label="押せない状態" />
        </div>
      </div>
    </Exhibit>
  );
}

function Segments() {
  const { intensity } = useDeck();
  const [count, setCount] = useState(3);
  const [size, setSize] = useState<"sm" | "md">("md");
  const [value, setValue] = useState(0);
  const options = ["日", "週", "月", "年"].slice(0, count);
  return (
    <Exhibit
      id="segmented"
      title="切り替え"
      lead="選んでいる所がレンズになり、つまんで隣へ動かせます。動かしている間は全体が少しふくらみます。"
      knobs={
        <>
          <KnobPick
            label="数"
            value={count}
            onChange={(c) => {
              setCount(c);
              setValue((v) => Math.min(v, c - 1));
            }}
            options={[
              { value: 2, label: "2" },
              { value: 3, label: "3" },
              { value: 4, label: "4" },
            ]}
          />
          <KnobPick
            label="高さ"
            value={size}
            onChange={setSize}
            options={[
              { value: "sm", label: "28" },
              { value: "md", label: "36" },
            ]}
          />
        </>
      }
      specs={["2〜5個から1つ選ぶ。タップでも、つまんでずらしても選べる", "文字の代わりにアイコンも置ける", "高さは 28・36px"]}
    >
      <div className="grid justify-items-center gap-3">
        <GlassSegmented key={count} options={options} value={value} onChange={setValue} size={size} intensity={intensity} aria-label="期間" />
        <p className="text-sm text-fg-2">
          選択中：<span className="font-medium text-fg">{options[value]}</span>
        </p>
      </div>
    </Exhibit>
  );
}

function Menus() {
  const [align, setAlign] = useState<"start" | "end">("end");
  const [sort, setSort] = useState("新しい順");
  return (
    <Exhibit
      id="menu"
      title="ボタンから育つメニュー"
      lead="… ボタンを押すと、ボタンそのものが広がってメニューになり、閉じるとボタンへ畳まれて戻ります。"
      minHeight={300}
      stageClassName="place-items-start justify-items-center pt-6"
      knobs={
        <KnobPick
          label="広がる向き"
          value={align}
          onChange={setAlign}
          options={[
            { value: "start", label: "右へ" },
            { value: "end", label: "左へ" },
          ]}
        />
      }
      specs={["行にアイコン・チェック印・赤い危険な行を置ける", "押せない行も作れる", "幅と広がる向きを選べる"]}
    >
      <div className={cn("flex w-full max-w-[320px] items-center gap-2", align === "end" ? "justify-end" : "justify-start")}>
        <span className="text-sm text-fg-2">並び：{sort}</span>
        <GlassMenu
          aria-label="並び替えと操作"
          icon={<Ellipsis size={20} />}
          align={align}
          items={[
            ...["新しい順", "古い順", "名前順"].map((s) => ({ label: s, checked: sort === s, onSelect: () => setSort(s) })),
            { label: "コピー", icon: <Copy size={17} />, onSelect: () => notify("コピーしました") },
            { label: "共有", icon: <Share size={17} />, disabled: true },
            { label: "削除", icon: <Trash2 size={17} />, destructive: true, onSelect: () => notify("削除しました") },
          ]}
        />
      </div>
    </Exhibit>
  );
}

const HOLD_MS = 450;

function LongPress() {
  const [open, setOpen] = useState(false);
  const [held, setHeld] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<[number, number] | null>(null);
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    start.current = null;
    setHeld(false);
  };
  return (
    <Exhibit
      id="long-press"
      title="長押しメニュー"
      lead="カードを 0.45 秒押し続けると少し沈み、指を離すとメニューが出ます。指が動いたらスクロールとみなして取り消します。"
      minHeight={260}
      specs={["押し続ける時間は変えられる（今は 0.45 秒）", "押している間は沈んで、長押しが効いたことが分かる", "8px 以上動いたら取り消し（スクロールの邪魔をしない）", "マウスでは右クリックで同じメニュー"]}
    >
      <div className="relative">
        <button
          type="button"
          onPointerDown={(e) => {
            start.current = [e.clientX, e.clientY];
            timer.current = setTimeout(() => setHeld(true), HOLD_MS);
          }}
          onPointerMove={(e) => {
            if (start.current && Math.hypot(e.clientX - start.current[0], e.clientY - start.current[1]) > 8) cancel();
          }}
          onPointerUp={() => {
            if (held) setOpen(true);
            cancel();
          }}
          onPointerLeave={cancel}
          onPointerCancel={cancel}
          onContextMenu={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
          className={cn(
            "grid w-56 touch-pan-y gap-1 rounded-lg bg-surface p-4 text-left shadow-float transition-[scale] duration-[var(--wk-dur-base)] ease-out select-none [-webkit-touch-callout:none]",
            held && "scale-95",
          )}
        >
          <span className="text-sm font-medium">見積書を作る</span>
          <span className="text-xs text-fg-3">長押し（PC は右クリック）</span>
        </button>
        {open && (
          <>
            <button type="button" aria-label="閉じる" className="fixed inset-0 z-40 cursor-default" onClick={() => setOpen(false)} />
            <div role="menu" className="wk-glass-sheet absolute top-full left-1/2 z-50 mt-2 grid w-48 -translate-x-1/2 overflow-hidden rounded-[14px] p-1 shadow-float">
              {[
                { label: "完了にする", icon: Check },
                { label: "コピー", icon: Copy },
                { label: "削除", icon: Trash2, danger: true },
              ].map((m) => (
                <button
                  key={m.label}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    notify(m.label === "削除" ? "削除しました" : `${m.label}にしました`);
                  }}
                  className={cn("flex min-h-hit items-center justify-between rounded-md px-3 text-sm hover:bg-surface-2", m.danger && "text-danger")}
                >
                  {m.label}
                  <m.icon aria-hidden size={16} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </Exhibit>
  );
}

function Stepper() {
  const [n, setN] = useState(2);
  const [max, setMax] = useState(10);
  const repeat = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = () => {
    if (repeat.current) clearInterval(repeat.current);
    repeat.current = null;
  };
  const press = (d: number) => {
    setN((v) => Math.min(max, Math.max(0, v + d)));
    stop();
    // 押し続けると連続で増える（0.4 秒後から）
    const t = setTimeout(() => {
      repeat.current = setInterval(() => setN((v) => Math.min(max, Math.max(0, v + d))), 90);
    }, 400);
    repeat.current = t as unknown as ReturnType<typeof setInterval>;
  };
  const btn = "grid size-11 place-items-center rounded-full bg-surface text-fg shadow-sm transition-[scale,opacity] duration-[var(--wk-dur-fast)] active:scale-90 disabled:opacity-35";
  return (
    <Exhibit
      id="stepper"
      title="増減ボタン（＋−）"
      lead="押すと1つずつ、押し続けると連続で増えます。上限・下限に着くとボタンが薄くなります。"
      knobs={
        <KnobPick
          label="上限"
          value={max}
          onChange={(m) => {
            setMax(m);
            setN((v) => Math.min(v, m));
          }}
          options={[
            { value: 5, label: "5" },
            { value: 10, label: "10" },
            { value: 99, label: "99" },
          ]}
        />
      }
      specs={["押し続けると連続で増減する", "上限・下限・刻み（1つずつ・5つずつ）を決められる", "数字は桁がずれない等幅で表示"]}
    >
      <div className="flex items-center gap-4 rounded-full bg-surface/80 p-1.5">
        <button type="button" aria-label="減らす" disabled={n <= 0} className={btn} onPointerDown={() => press(-1)} onPointerUp={stop} onPointerLeave={stop} onKeyDown={(e) => e.key === "Enter" && setN((v) => Math.max(0, v - 1))}>
          <Minus aria-hidden size={18} />
        </button>
        <output aria-live="polite" className="num w-10 text-center text-2xl font-semibold">
          {n}
        </output>
        <button type="button" aria-label="増やす" disabled={n >= max} className={btn} onPointerDown={() => press(1)} onPointerUp={stop} onPointerLeave={stop} onKeyDown={(e) => e.key === "Enter" && setN((v) => Math.min(max, v + 1))}>
          <Plus aria-hidden size={18} />
        </button>
      </div>
    </Exhibit>
  );
}

export function PressRoom() {
  return (
    <Room id="press" title="押す" lead="ボタン・スイッチ・切り替え・メニュー。指で押したときの反応を確かめる部屋です。">
      <Buttons />
      <Switches />
      <Segments />
      <Menus />
      <LongPress />
      <Stepper />
    </Room>
  );
}
