"use client";

/**
 * スマホの下タブ（767px 以下だけ表示）。動きは iOS 26 の標準的な下タブ（押した所へ光る丸が伸び縮みしながら移る）に合わせている。
 *
 *   指が触れた瞬間 … 押したタブのアイコンが選択表示になり、バー全体が 1.03 倍にふくらむ
 *   指を離した瞬間 … 画面を切り替える（中身はフェードも横すべりもしない＝即移動）
 *   選択の丸い板   … 約 180ms で次のタブへ滑る。速く動いている間だけ横に伸びて少し淡くなる。揺れ（行き過ぎ）は無し
 *   押さえたまま横になぞる … 板が指についてくる。離したところのタブへ移る
 *   動きを減らす設定 … 板は瞬間移動、ふくらみ無し
 *   項目が6つ以上（またはログイン中の人の欄がある）とき … 先頭4つ＋「もっと」。「もっと」は残りの項目とアカウント欄を下からのシートで出す
 *
 * 画面の切り替えは <Link> の先読み（App Shell）が効いているので、押してから待たない。
 * 今の場所（usePathname）は <Suspense> の中で読む。[id] のような動く住所の画面でも事前の描画が止まらないように、
 * 読めるまでは選択表示の無い同じバーを出す。
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { animate, motion, useMotionValue, useReducedMotion, useTransform, useVelocity } from "motion/react";
import { Suspense, useCallback, useLayoutEffect, useRef, useState } from "react";
import { Ellipsis } from "lucide-react";
import { NAV, isActive } from "@/config/nav";
import { useAccount } from "@/config/shell";
import { Sheet } from "@/components/kit/sheet";
import { cn } from "@/lib/cn";

const SLIDE = { type: "spring", visualDuration: 0.18, bounce: 0 } as const;
const PRESS = { type: "spring", visualDuration: 0.12, bounce: 0 } as const;
const RELEASE = { type: "spring", visualDuration: 0.22, bounce: 0 } as const;
const INSET = 4; // 板とバーの縁のすき間
const DRAG_START = 6; // これ以上動いたら「なぞり」とみなす(px)

const MORE = { href: "#more", label: "もっと", short: "もっと", icon: Ellipsis };

export function BottomTabBar() {
  const account = useAccount();
  if (NAV.length === 0 && !account) return null;
  return (
    <Suspense fallback={<TabBar pathname={null} account={account} />}>
      <TabBarAtPath account={account} />
    </Suspense>
  );
}

function TabBarAtPath({ account }: { account: ReturnType<typeof useAccount> }) {
  return <TabBar pathname={usePathname()} account={account} />;
}

function TabBar({ pathname: at, account }: { pathname: string | null; account: ReturnType<typeof useAccount> }) {
  const pathname = at ?? "";
  const needsMore = NAV.length > 5 || !!account;
  const tabs = NAV.slice(0, needsMore ? 4 : 5);
  const rest = NAV.slice(tabs.length);
  const items = needsMore ? [...tabs, MORE] : tabs;
  const [moreOpen, setMoreOpen] = useState(false);
  const router = useRouter();
  const reduce = useReducedMotion();
  const barRef = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(0);
  const slot = width / items.length;

  // 押した瞬間に選択表示にするための「仮の選択」。画面が移り終わったら実際の場所に従う
  // どのナビにも無い画面（と、場所がまだ分からない間）は -1＝どれも選ばない
  const tabIndex = at === null ? -1 : tabs.findIndex((i) => isActive(pathname, i.href));
  const routeIndex = tabIndex >= 0 ? tabIndex : at !== null && needsMore && rest.some((i) => isActive(pathname, i.href)) ? tabs.length : -1;
  const [pressed, setPressed] = useState<{ index: number; from: string } | null>(null);
  // 場所が変わったら（移り終わった・戻る/進む）仮の選択を捨てる
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setPressed(null);
  }
  const active = pressed && pressed.from === pathname ? pressed.index : routeIndex;

  const x = useMotionValue(0);
  const vx = useVelocity(x);
  // 隣のタブへ移るだけでも約1.2倍に伸びるよう、速さ 1200px/秒 で最大になる
  const stretch = useTransform(vx, [-1200, 0, 1200], [1.25, 1, 1.25], { clamp: true });
  const lensOpacity = useTransform(vx, [-1200, 0, 1200], [0.7, 1, 0.7], { clamp: true });
  const lens = useMotionValue(1); // なぞっている間だけ板を少し大きく
  const scaleX = useTransform(() => stretch.get() * lens.get());
  const scaleY = useTransform(() => (1 / Math.sqrt(stretch.get())) * lens.get());
  const barScale = useMotionValue(1);

  const drag = useRef<{ id: number; startX: number; start: number; dragging: boolean } | null>(null);
  const placed = useRef(false);

  useLayoutEffect(() => {
    const el = barRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const moveTo = useCallback(
    (index: number) => {
      if (!slot || index < 0) return;
      const to = index * slot;
      // 最初の配置と「動きを減らす」は瞬間移動
      if (!placed.current || reduce) {
        x.set(to);
        placed.current = true;
        return;
      }
      animate(x, to, SLIDE);
    },
    [slot, reduce, x],
  );

  useLayoutEffect(() => {
    if (!drag.current?.dragging) moveTo(active);
  }, [active, moveTo]);


  const indexAt = (clientX: number) => {
    const rect = barRef.current!.getBoundingClientRect();
    return Math.min(items.length - 1, Math.max(0, Math.floor(((clientX - rect.left) / rect.width) * items.length)));
  };

  const swell = (on: boolean) => {
    if (reduce) return;
    animate(barScale, on ? 1.03 : 1, on ? PRESS : RELEASE);
  };

  const go = (index: number) => {
    const href = items[index].href;
    if (href === MORE.href) {
      setPressed({ index, from: pathname });
      moveTo(index);
      setMoreOpen(true);
      return;
    }
    setPressed({ index, from: pathname });
    moveTo(index);
    if (!isActive(pathname, href)) router.push(href);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 || !barRef.current) return;
    const index = indexAt(e.clientX);
    drag.current = { id: e.pointerId, startX: e.clientX, start: index, dragging: false };
    // 選択表示とふくらみは、指をつかむ処理より先に（つかめない端末でも押した瞬間に反応させる）
    setPressed({ index, from: pathname });
    swell(true);
    try {
      barRef.current.setPointerCapture(e.pointerId);
    } catch {}
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || !barRef.current) return;
    if (!d.dragging && Math.abs(e.clientX - d.startX) < DRAG_START) return;
    if (!d.dragging) {
      d.dragging = true;
      if (!reduce) animate(lens, 1.1, PRESS);
    }
    const rect = barRef.current.getBoundingClientRect();
    const left = Math.min(width - slot, Math.max(0, e.clientX - rect.left - slot / 2));
    x.set(left);
    const index = indexAt(e.clientX);
    if (index !== active) setPressed({ index, from: pathname });
  };

  const finish = (e: React.PointerEvent<HTMLElement>, cancelled: boolean) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    swell(false);
    if (!reduce) animate(lens, 1, RELEASE);
    if (cancelled) {
      setPressed(null);
      moveTo(routeIndex);
      return;
    }
    go(d.dragging ? indexAt(e.clientX) : d.start);
  };

  return (
    <>
    <nav
      ref={barRef}
      aria-label="メインメニュー"
      data-nav="tabbar"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => finish(e, false)}
      onPointerCancel={(e) => finish(e, true)}
      className="fixed inset-x-3 z-40 mx-auto flex max-w-[520px] touch-none select-none rail:hidden"
      style={{
        bottom: "calc(var(--wk-tabbar-gap) + var(--wk-safe-b))",
        height: "var(--wk-tabbar-h)",
      }}
    >
      <motion.div
        aria-hidden
        className="wk-glass-bar absolute inset-0 rounded-full border border-[var(--wk-glass-line)] bg-[var(--wk-glass)] shadow-[inset_0_1px_0_var(--wk-glass-hi),var(--wk-shadow)] backdrop-blur-[18px] backdrop-saturate-[1.8]"
        style={{ scale: barScale }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute rounded-full bg-[color-mix(in_oklab,var(--wk-fg)_9%,transparent)]"
        style={{
          top: INSET,
          bottom: INSET,
          left: INSET,
          width: Math.max(0, slot - INSET * 2),
          x,
          // 動きを減らす設定では伸び縮みを付けない（瞬間移動の一瞬に速さが跳ねて伸びるため）。
          // 設定の有無で style の項目を変えるとサーバーとの水和が食い違うので、項目は常に同じにして値だけ変える
          scaleX: reduce ? 1 : scaleX,
          scaleY: reduce ? 1 : scaleY,
          opacity: active < 0 ? 0 : reduce ? 1 : lensOpacity,
        }}
      />
      {items.map((item, i) => {
        const on = i === active;
        const Icon = item.icon;
        const cls = cn(
          "relative z-10 flex min-w-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-xs",
          "transition-colors duration-[var(--wk-dur-fast)]",
          on ? "text-fg" : "text-fg-3",
        );
        const inner = (
          <>
            <Icon aria-hidden size={22} strokeWidth={on ? 2.4 : 1.8} />
            <span className={cn("leading-none", on && "font-medium")}>{item.short}</span>
          </>
        );
        if (item.href === MORE.href) {
          return (
            <button
              key={item.href}
              type="button"
              aria-haspopup="dialog"
              aria-expanded={moreOpen}
              aria-current={i === routeIndex && tabIndex < 0 ? "page" : undefined}
              // 指やマウスは上の pointer の処理で開く。キーボード（Enter・Space）のときだけここで開く
              onClick={(e) => {
                if (e.detail === 0) go(i);
              }}
              className={cls}
            >
              {inner}
            </button>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            // 指やマウスでの移動は上の pointer の処理で行う。キーボード（Enter）のときだけ通常どおり移動する
            onClick={(e) => {
              if (e.detail !== 0) e.preventDefault();
            }}
            draggable={false}
            className={cls}
          >
            {inner}
          </Link>
        );
      })}
    </nav>
    {needsMore && (
      <Sheet
        open={moreOpen}
        onOpenChange={(open) => {
          setMoreOpen(open);
          // 何も選ばずに閉じたら、板を今いる場所へ戻す
          if (!open) setPressed(null);
        }}
        title="メニュー"
      >
        <MoreList
          rest={rest}
          pathname={pathname}
          account={account}
          onPick={(run, navigates) => {
            setMoreOpen(false);
            // 画面が移らない操作（ログアウト前の確認・明るさの切り替えなど）は、板を今いる場所へ戻す
            if (!navigates) setPressed(null);
            run();
          }}
        />
      </Sheet>
    )}
    </>
  );
}

/** 「もっと」の中身：下タブに入らなかった項目と、ログイン中の人の欄 */
function MoreList({
  rest,
  pathname,
  account,
  onPick,
}: {
  rest: typeof NAV;
  pathname: string;
  account: ReturnType<typeof useAccount>;
  onPick: (run: () => void, navigates: boolean) => void;
}) {
  const router = useRouter();
  const row = "flex min-h-row w-full items-center gap-3 rounded-md px-3 text-left transition-colors active:bg-surface-2";
  return (
    <div className="grid gap-4">
      {rest.length > 0 && (
        <ul className="grid gap-0.5">
          {rest.map((item) => {
            const on = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={on ? "page" : undefined}
                  onClick={(e) => {
                    e.preventDefault();
                    onPick(() => router.push(item.href), true);
                  }}
                  className={cn(row, on ? "bg-accent-soft font-medium text-accent-text" : "text-fg hover:bg-surface-2")}
                >
                  <Icon aria-hidden size={20} className="flex-none text-current" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      {account && (
        <div className="grid gap-0.5 border-t border-line pt-3">
          <p className="truncate px-3 pb-1 text-sm text-fg-3">{account.name}</p>
          {account.actions.map((a) => (
            <button key={a.id} type="button" onClick={() => onPick(a.run, false)} className={cn(row, "text-fg hover:bg-surface-2")}>
              <a.icon aria-hidden size={20} className="flex-none" />
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
