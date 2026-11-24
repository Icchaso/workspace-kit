"use client";

/**
 * スマホの下タブ（767px 以下だけ表示）。見た目と動きは iOS 26 の下タブ（Liquid Glass）に合わせている。
 * ガラスの仕組みは components/kit/liquid-glass（元は @zakisheriff/liquid-glass・MIT）。
 *
 *   止まっているとき … 選んだタブはアイコンが塗りつぶし＋文字が主色。下にバーより少し灰色の薄い玉
 *   指が触れた瞬間   … 押したタブが選択表示になり、玉が持ち上がって澄んだ泡のレンズになる（下のアイコンを拡大して塗る）
 *   押さえたまま横になぞる … レンズが指についてくる。速く動かすと伸び、止まるとぷるんと揺れる
 *   指を離した瞬間   … 画面を切り替える（中身はフェードも横すべりもしない＝即移動）。レンズは揺れながら収まる
 *   動きを減らす設定 … バネを使わず、すぐ収まる
 *   項目が6つ以上（またはログイン中の人の欄がある）とき … 先頭4つ＋「もっと」。「もっと」は残りの項目とアカウント欄を下からのシートで出す
 *
 * 画面の切り替えは <Link> の先読み（App Shell）が効いているので、押してから待たない。
 * 今の場所（usePathname）は <Suspense> の中で読む。[id] のような動く住所の画面でも事前の描画が止まらないように、
 * 読めるまでは選択表示の無い同じバーを出す。
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useState } from "react";
import { Ellipsis } from "lucide-react";
import { NAV, isActive } from "@/config/nav";
import { useAccount } from "@/config/shell";
import { Sheet } from "@/components/kit/sheet";
import { LensTrack } from "@/components/kit/liquid-glass/lens-track";
import { cn } from "@/lib/cn";

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

  // 離した瞬間（キーボードの Enter もここに来る）
  const go = (index: number) => {
    const href = items[index].href;
    setPressed({ index, from: pathname });
    if (href === MORE.href) {
      setMoreOpen(true);
      return;
    }
    if (!isActive(pathname, href)) router.push(href);
  };

  return (
    <>
      <nav
        aria-label="メインメニュー"
        data-nav="tabbar"
        className="fixed inset-x-5 z-40 mx-auto max-w-[520px] select-none rail:hidden"
        style={{
          bottom: "calc(var(--wk-tabbar-gap) + var(--wk-safe-b))",
          height: "var(--wk-tabbar-h)",
        }}
      >
        <LensTrack
          count={items.length}
          index={active}
          onPress={(index) => setPressed({ index, from: pathname })}
          onSelect={go}
          renderItem={(i, props) => {
            const item = items[i];
            const on = i === active;
            const Icon = item.icon;
            const inner = (
              <>
                <span className="lg-nav__icons" aria-hidden>
                  <span className="lg-nav__icon lg-nav__icon--idle">
                    <Icon size={24} strokeWidth={1.8} />
                  </span>
                  <span className="lg-nav__icon lg-nav__icon--active">
                    {/* 選んだ形：中を塗りつぶす（iOS の下タブと同じ） */}
                    <Icon size={24} strokeWidth={2.1} fill="currentColor" fillOpacity={0.9} />
                  </span>
                </span>
                <span className={cn("lg-nav__label", on && "font-semibold")}>{item.short}</span>
              </>
            );
            if (item.href === MORE.href) {
              return (
                <button
                  {...props}
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={moreOpen}
                  aria-current={i === routeIndex && tabIndex < 0 ? "page" : undefined}
                  data-on={on ? "1" : "0"}
                >
                  {inner}
                </button>
              );
            }
            return (
              <Link
                {...props}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                // 移動は上の onSelect（離した瞬間・Enter）で行う。リンクとしての移動は止める（二重に動かないように）
                onClick={(e) => e.preventDefault()}
                draggable={false}
                data-on={on ? "1" : "0"}
              >
                {inner}
              </Link>
            );
          }}
        />
      </nav>
      {needsMore && (
        <Sheet
          open={moreOpen}
          onOpenChange={(open) => {
            setMoreOpen(open);
            // 何も選ばずに閉じたら、玉を今いる場所へ戻す
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
              // 画面が移らない操作（ログアウト前の確認・明るさの切り替えなど）は、玉を今いる場所へ戻す
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
