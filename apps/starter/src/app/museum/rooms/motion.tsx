"use client";

/** 動く部屋：縮む見出し・引っ張って更新・ずらして消す・横に滑るカード・並べ替え・シート・下タブ */
import { animate, motion, Reorder, useDragControls, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import { CalendarDays, GripVertical, House, Loader, MessageCircle, Settings, Trash2, User } from "lucide-react";
import { useRef, useState } from "react";
import { LensTrack } from "@/components/kit/liquid-glass/lens-track";
import { notify } from "@/components/kit/toast";
import { cn } from "@/lib/cn";
import { GlassSheet } from "../_glass/components/GlassSheet";
import { Exhibit, KnobPick, Room, useDeck } from "../exhibit";

const EASE = [0.23, 1, 0.32, 1] as const;
const ROWS = ["山田様 見積の返信", "佐藤様 契約書の確認", "鈴木様 内見の日程", "高橋様 請求書の送付", "田中様 打ち合わせメモ", "伊藤様 写真の追加", "渡辺様 鍵の受け渡し", "中村様 書類の不足", "小林様 申込の受付", "加藤様 退去の立会い"];

/** 小さなスマホの枠（中だけスクロールする） */
function Phone({
  children,
  className,
  innerRef,
  onScroll,
}: {
  children: React.ReactNode;
  className?: string;
  innerRef?: React.Ref<HTMLDivElement>;
  onScroll?: React.UIEventHandler<HTMLDivElement>;
}) {
  return (
    <div className="relative h-[360px] w-[min(260px,100%)] overflow-hidden rounded-[28px] border-[6px] border-fg/85 bg-canvas shadow-float">
      <div ref={innerRef} onScroll={onScroll} className={cn("h-full overflow-y-auto overscroll-contain [scrollbar-width:none]", className)}>
        {children}
      </div>
    </div>
  );
}

function ShrinkHeader() {
  // 枠の中のスクロール量をそのまま渡す（useScroll の container は WebKit で値が届かなかった）
  const scrollY = useMotionValue(0);
  const big = useTransform(scrollY, [0, 48], [1, 0.6]);
  const bigOpacity = useTransform(scrollY, [20, 48], [1, 0]);
  const barOpacity = useTransform(scrollY, [36, 56], [0, 1]);
  return (
    <Exhibit
      id="shrink-header"
      title="スクロールで縮む見出し"
      lead="中をスクロールすると、大きな見出しが縮んで消え、上のガラスの帯に小さな見出しが現れます。iPhone の設定画面と同じ型です。"
      stage="plain"
      minHeight={400}
      specs={["大きな見出し→小さな見出しへ、指の動きにぴったり合わせて変わる", "上の帯はすりガラスで、下の文字が透ける", "見出しの横にボタンを置ける"]}
    >
      <Phone onScroll={(e) => scrollY.set(e.currentTarget.scrollTop)}>
        <motion.div style={{ opacity: barOpacity }} className="wk-glass-top sticky top-0 z-10 grid h-11 place-items-center text-sm font-semibold">
          受信箱
        </motion.div>
        <motion.h4 style={{ scale: big, opacity: bigOpacity }} className="-mt-11 origin-left px-4 pt-12 pb-2 text-3xl font-bold">
          受信箱
        </motion.h4>
        <ul className="divide-y divide-line px-4 pb-4">
          {ROWS.map((r) => (
            <li key={r} className="py-3 text-sm">
              {r}
            </li>
          ))}
        </ul>
      </Phone>
    </Exhibit>
  );
}

const PULL = 64;
function PullRefresh() {
  const reduce = useReducedMotion();
  const box = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);
  const spin = useTransform(y, [0, PULL], [0, 270]);
  const ready = useTransform(y, (v) => (v >= PULL ? 1 : 0.45));
  const [items, setItems] = useState(ROWS.slice(0, 6));
  const [loading, setLoading] = useState(false);
  const start = useRef<number | null>(null);
  const [armed, setArmed] = useState(false);
  useMotionValueEvent(y, "change", (v) => setArmed(v >= PULL));
  const settle = (to: number) => (reduce ? y.set(to) : animate(y, to, { type: "spring", stiffness: 420, damping: 38 }));
  return (
    <Exhibit
      id="pull-refresh"
      title="引っ張って更新"
      lead="一番上で下に引くと、ゴムのように重くなりながら伸び、くるくるが回ります。線を越えて離すと読み込み、新しい行が上に加わります。"
      stage="plain"
      minHeight={400}
      specs={["引くほど重くなる（ゴムのような手ごたえ）", "越えたら離して読み込む線の位置を決められる", "線を越えた瞬間に軽く震える（対応する端末）", "読み込み中は上にくるくるを残す"]}
    >
      <Phone innerRef={box} className="touch-pan-x">
        <div
          className="relative min-h-full"
          onPointerDown={(e) => {
            if (loading || (box.current?.scrollTop ?? 0) > 0) return;
            start.current = e.clientY;
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (start.current === null) return;
            const d = Math.max(0, e.clientY - start.current);
            // 引くほど重く（ゴム）
            y.set(PULL * 1.6 * (1 - Math.exp(-d / (PULL * 1.6))));
          }}
          onPointerUp={() => {
            if (start.current === null) return;
            start.current = null;
            if (y.get() >= PULL) {
              setLoading(true);
              settle(PULL * 0.75);
              setTimeout(() => {
                setItems((s) => [`新着 ${new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`, ...s]);
                setLoading(false);
                settle(0);
              }, 1100);
            } else settle(0);
          }}
          onPointerCancel={() => {
            start.current = null;
            settle(0);
          }}
        >
          <motion.div style={{ opacity: ready, height: y }} className="grid place-items-end justify-center overflow-hidden">
            <motion.span style={{ rotate: loading ? undefined : spin }} className={cn("mb-2 grid place-items-center", loading && "museum-spin")}>
              <Loader aria-hidden size={22} />
            </motion.span>
          </motion.div>
          <p className="px-4 pt-3 text-xs text-fg-3" aria-live="polite">
            {loading ? "読み込み中…" : armed ? "離すと更新" : "下に引いて更新"}
          </p>
          <ul className="divide-y divide-line px-4 pb-4">
            {items.map((r) => (
              <motion.li key={r} layout initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="py-3 text-sm">
                {r}
              </motion.li>
            ))}
          </ul>
        </div>
      </Phone>
    </Exhibit>
  );
}

function SwipeRow({ label, onDelete }: { label: string; onDelete: () => void }) {
  const x = useMotionValue(0);
  const reveal = useTransform(x, [-80, -20], [1, 0]);
  return (
    <motion.li layout exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: EASE }} className="relative overflow-hidden">
      <motion.button type="button" style={{ opacity: reveal }} onClick={onDelete} className="absolute inset-y-0 right-0 flex w-20 items-center justify-center gap-1 bg-danger text-sm text-on-danger">
        <Trash2 aria-hidden size={16} />
        削除
      </motion.button>
      <motion.div
        drag="x"
        dragConstraints={{ left: -200, right: 0 }}
        dragElastic={{ left: 0.15, right: 0.05 }}
        dragDirectionLock
        style={{ x }}
        onDragEnd={(_, info) => {
          if (info.offset.x < -150 || info.velocity.x < -900) onDelete();
          else animate(x, info.offset.x < -50 ? -80 : 0, { type: "spring", stiffness: 500, damping: 40 });
        }}
        className="relative bg-surface px-4 py-3 text-sm touch-pan-y"
      >
        {label}
      </motion.div>
    </motion.li>
  );
}

function SwipeDelete() {
  const [rows, setRows] = useState(ROWS.slice(0, 5));
  const remove = (r: string) => {
    const before = rows;
    setRows((s) => s.filter((x) => x !== r));
    notify(`「${r}」を削除しました`, () => setRows(before));
  };
  return (
    <Exhibit
      id="swipe-delete"
      title="横にずらして消す行"
      lead="行を左へずらすと赤い「削除」が現れます。少しずらすとボタンが残り、大きく・速くずらすとそのまま消えます。"
      stage="plain"
      minHeight={300}
      knobs={
        <button type="button" onClick={() => setRows(ROWS.slice(0, 5))} className="min-h-hit rounded-full border border-line px-3 text-sm">
          元に戻す
        </button>
      }
      specs={["少しずらす＝ボタンを出す／大きく・速く＝そのまま消す", "消したあとはお知らせの「取り消す」で戻せる", "右へずらすと「完了」など、左右で別の操作にできる", "縦のスクロールとは混ざらない"]}
    >
      <ul className="w-full max-w-[300px] divide-y divide-line overflow-hidden rounded-lg border border-line">
        {rows.map((r) => (
          <SwipeRow key={r} label={r} onDelete={() => remove(r)} />
        ))}
        {rows.length === 0 && <li className="px-4 py-6 text-center text-sm text-fg-3">全部消しました</li>}
      </ul>
    </Exhibit>
  );
}

const SLIDES = [
  { t: "1LDK 駅5分", c: "#4da3ff" },
  { t: "2LDK 南向き", c: "#5ed39b" },
  { t: "ワンルーム 新築", c: "#ffb84d" },
  { t: "3LDK 駐車場付き", c: "#ff6b8b" },
  { t: "1K 角部屋", c: "#a07bff" },
];
function Carousel() {
  const box = useRef<HTMLDivElement>(null);
  const [cur, setCur] = useState(0);
  const go = (i: number) => {
    const el = box.current?.children[i] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };
  return (
    <Exhibit
      id="carousel"
      title="横に滑らせて止まるカード列"
      lead="指で横に滑らせると、カードが1枚ずつ真ん中でぴたっと止まります。下の点で今どこかが分かります。"
      stage="plain"
      minHeight={260}
      specs={["1枚ずつ真ん中に吸い付いて止まる", "隣のカードの端を少し見せて、続きがあると分かるようにする", "点を押してもその1枚へ移る"]}
    >
      <div className="grid w-full max-w-[340px] gap-3">
        <div
          ref={box}
          onScroll={(e) => {
            const el = e.currentTarget;
            const w = (el.children[0] as HTMLElement).offsetWidth + 12;
            setCur(Math.round(el.scrollLeft / w));
          }}
          className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[12%] [scrollbar-width:none]"
        >
          {SLIDES.map((s, i) => (
            <div
              key={s.t}
              className={cn("grid h-36 w-[76%] flex-none snap-center content-end rounded-lg p-3 text-white transition-[scale,opacity] duration-300", i === cur ? "scale-100" : "scale-[0.92] opacity-70")}
              style={{ background: `linear-gradient(160deg, ${s.c}, color-mix(in oklab, ${s.c} 55%, #000))` }}
            >
              <span className="text-base font-semibold drop-shadow">{s.t}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button key={s.t} type="button" aria-label={`${i + 1}枚目`} aria-current={i === cur} onClick={() => go(i)} className="grid size-6 place-items-center">
              <span className={cn("h-1.5 rounded-full bg-fg transition-[width,opacity] duration-300", i === cur ? "w-5 opacity-90" : "w-1.5 opacity-25")} />
            </button>
          ))}
        </div>
      </div>
    </Exhibit>
  );
}

function ReorderItem({ item }: { item: string }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} whileDrag={{ scale: 1.03, boxShadow: "0 10px 24px rgb(0 0 0 / 0.14)" }} className="flex items-center gap-2 rounded-md bg-surface px-2 py-1.5 text-sm">
      <button type="button" aria-label={`${item}をつかんで動かす`} onPointerDown={(e) => controls.start(e)} className="grid size-9 flex-none cursor-grab touch-none place-items-center text-fg-3 active:cursor-grabbing">
        <GripVertical aria-hidden size={18} />
      </button>
      {item}
    </Reorder.Item>
  );
}

function ReorderList() {
  const [items, setItems] = useState(["朝のメール確認", "見積書を作る", "内見の準備", "日報を書く"]);
  return (
    <Exhibit
      id="reorder"
      title="ドラッグで並べ替え"
      lead="左のつまみを持って上下に動かすと、ほかの行がよけて場所を空けます。持っている行は少し浮きます。"
      stage="plain"
      minHeight={260}
      specs={["つまみ（⋮⋮）を持ったときだけ動く（行のスクロールと混ざらない）", "持っている行は浮き、ほかの行がなめらかによける", "順番はその場で保存できる"]}
    >
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="grid w-full max-w-[300px] gap-1.5 rounded-lg bg-surface-2 p-2">
        {items.map((it) => (
          <ReorderItem key={it} item={it} />
        ))}
      </Reorder.Group>
    </Exhibit>
  );
}

function Sheets() {
  const { intensity } = useDeck();
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<"fit" | "detents">("detents");
  return (
    <Exhibit
      id="sheet"
      title="シート（半分→全画面）"
      lead="下から出るガラスのシート。半分の高さで開き、上へ引くと全画面、下へ引くか速く払うと閉じます。"
      stage="plain"
      minHeight={400}
      knobs={<KnobPick label="高さ" value={kind} onChange={setKind} options={[{ value: "detents", label: "半分→全画面" }, { value: "fit", label: "中身に合わせる" }]} />}
      specs={["止まる高さ（半分・全画面）を選べる。中身に合わせる型もある", "下へ引く・払う・後ろを押す・Esc で閉じる", "PC では右から出る引き出しにもできる（アプリ本体のシート）"]}
    >
      <div ref={setFrame} className="relative h-[360px] w-[min(260px,100%)] overflow-hidden rounded-[28px] border-[6px] border-fg/85 bg-canvas shadow-float">
        <div className="grid h-full place-items-center">
          <button type="button" onClick={() => setOpen(true)} className="min-h-hit rounded-full bg-accent px-4 text-sm font-medium text-on-accent">
            シートを開く
          </button>
        </div>
        {frame && (
          <GlassSheet open={open} onClose={() => setOpen(false)} container={frame} detents={kind === "detents" ? ["medium", "large"] : undefined} intensity={intensity} aria-label="物件の詳細">
            <div className="grid gap-2 px-5 pb-6">
              <p className="text-lg font-semibold">物件の詳細</p>
              <p className="text-sm text-fg-2">上へ引くと全画面、下へ引くと閉じます。</p>
              {ROWS.slice(0, kind === "detents" ? 8 : 3).map((r) => (
                <p key={r} className="border-b border-line py-2 text-sm">
                  {r}
                </p>
              ))}
            </div>
          </GlassSheet>
        )}
      </div>
    </Exhibit>
  );
}

const TABS = [
  { icon: House, label: "ホーム" },
  { icon: CalendarDays, label: "予定" },
  { icon: MessageCircle, label: "連絡" },
  { icon: User, label: "自分" },
];
function TabBarDemo() {
  const [cur, setCur] = useState(0);
  const [count, setCount] = useState(4);
  const tabs = count === 5 ? [...TABS, { icon: Settings, label: "設定" }] : TABS.slice(0, count);
  return (
    <Exhibit
      id="tabbar"
      title="下タブ（アプリと同じ部品）"
      lead="Workspace Kit のアプリの下タブと同じ部品です。押すと泡のレンズが伸びて移り、押さえたまま横になぞると指についてきます。"
      minHeight={400}
      knobs={
        <KnobPick
          label="タブの数"
          value={count}
          onChange={(c) => {
            setCount(c);
            setCur((v) => Math.min(v, c - 1));
          }}
          options={[{ value: 3, label: "3" }, { value: 4, label: "4" }, { value: 5, label: "5" }]}
        />
      }
      specs={["止まっているとき＝塗りアイコン＋主色の文字＋薄い玉", "押す＝控えめに持ち上がって伸び、止まる瞬間に少し潰れる", "押さえる・なぞる＝泡が持ち上がって指についてくる", "タブが6つ以上なら4つ＋「もっと」にまとめる"]}
    >
      <div className="museum-tabbar relative h-[360px] w-[min(300px,100%)] overflow-hidden rounded-[28px] border-[6px] border-fg/85 shadow-float">
        <div className="grid h-full place-items-center pb-16 text-sm text-fg-2">{tabs[cur].label}の画面</div>
        <div className="absolute inset-x-2 bottom-2.5 h-[60px]">
          <LensTrack
            key={count}
            count={tabs.length}
            index={cur}
            onSelect={setCur}
            renderItem={(i, props) => {
              const T = tabs[i];
              return (
                <button {...props} type="button" data-on={i === cur ? "1" : "0"} aria-current={i === cur ? "page" : undefined}>
                  <span className="lg-nav__icons" aria-hidden>
                    <span className="lg-nav__icon lg-nav__icon--idle">
                      <T.icon size={22} strokeWidth={1.8} />
                    </span>
                    <span className="lg-nav__icon lg-nav__icon--active">
                      <T.icon size={22} strokeWidth={2.1} fill="currentColor" fillOpacity={0.9} />
                    </span>
                  </span>
                  <span className={cn("lg-nav__label", i === cur && "font-semibold")}>{T.label}</span>
                </button>
              );
            }}
          />
        </div>
      </div>
    </Exhibit>
  );
}

export function MotionRoom() {
  return (
    <Room id="motion" title="動く" lead="スクロール・引く・ずらす・並べ替える。指の動きにぴったりついてくる動きを確かめる部屋です。">
      <ShrinkHeader />
      <PullRefresh />
      <SwipeDelete />
      <Carousel />
      <ReorderList />
      <Sheets />
      <TabBarDemo />
    </Room>
  );
}
