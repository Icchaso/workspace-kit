"use client";

/**
 * PC・タブレットのナビ。768〜1279px はアイコン列、1280px 以上はサイドバー（畳むとアイコン列）。
 * 項目と順番は下タブと同じ（config/nav.ts）。押した瞬間に選択表示を移し、画面の切り替えは待たせない。
 * 画面の切り替えは1日に何十回もするので、選択の下地は動かさずにその場で入れ替える。
 * 今の場所（usePathname）は <Suspense> の中で読む（動く住所の画面でも事前の描画を止めない）。読めるまでは選択表示の無い同じナビを出す。
 * 項目が多いときは、項目の部分だけが縦にスクロールする（項目を押しつぶさない）。
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Plus, Search } from "lucide-react";
import { Suspense, useState } from "react";
import { NAV, isActive } from "@/config/nav";
import { APP, useAccount } from "@/config/shell";
import { cn } from "@/lib/cn";

function setCollapsed(collapsed: boolean) {
  const d = document.documentElement;
  if (collapsed) d.dataset.sidebar = "collapsed";
  else delete d.dataset.sidebar;
  try {
    localStorage.setItem("wk.sidebar", collapsed ? "collapsed" : "open");
  } catch {}
}

const itemClass =
  "flex h-11 w-full flex-none items-center gap-3 rounded-md px-3 text-sm whitespace-nowrap transition-colors duration-[var(--wk-dur-fast)] " +
  "max-side:justify-center max-side:px-0 [:root[data-sidebar=collapsed]_&]:justify-center [:root[data-sidebar=collapsed]_&]:px-0";

type Props = { onSearch?: () => void; onAdd?: () => void };

export function SideNav(props: Props) {
  return (
    <Suspense fallback={<Side {...props} pathname={null} />}>
      <SideAtPath {...props} />
    </Suspense>
  );
}

function SideAtPath(props: Props) {
  return <Side {...props} pathname={usePathname()} />;
}

function Side({ onSearch, onAdd, pathname: at }: Props & { pathname: string | null }) {
  const pathname = at ?? "";
  const account = useAccount();
  const [pressed, setPressed] = useState<{ href: string; from: string } | null>(null);
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setPressed(null);
  }
  const current = pressed && pressed.from === pathname ? pressed.href : null;

  return (
    <nav
      aria-label="メインメニュー"
      data-nav="side"
      className="fixed inset-y-0 left-0 z-30 hidden flex-col gap-1 overflow-hidden border-r border-line bg-sidebar py-4 pr-3 rail:flex"
      style={{
        width: "var(--wk-nav-w)",
        // 横向きの iPhone では切り欠きの分だけ内側に寄せる
        paddingLeft: "max(0.75rem, env(safe-area-inset-left, 0px))",
        // 幅は動かさない（width を動かすと本文の配置計算が毎コマ走り、窓幅を変えたときも本文が遅れてついてくる）
      }}
    >
      <div className="mb-3 flex items-center gap-2.5 px-1.5 max-side:justify-center max-side:px-0 [:root[data-sidebar=collapsed]_&]:justify-center [:root[data-sidebar=collapsed]_&]:px-0">
        <span className="grid size-8 flex-none place-items-center rounded-lg bg-accent text-sm font-semibold text-on-accent">{APP.mark}</span>
        <span className="wk-nav-label truncate text-sm font-semibold">{APP.name}</span>
      </div>

      {onSearch && (
        <button type="button" onClick={onSearch} title="検索・操作（⌘K）" className={cn(itemClass, "mb-2 border border-line bg-surface text-fg-2 hover:text-fg active:bg-surface-2")}>
          <Search aria-hidden size={18} className="flex-none" />
          <span className="wk-nav-label">検索・操作</span>
          <kbd className="wk-nav-label ml-auto rounded border border-line px-1.5 font-sans text-xs text-fg-3">⌘K</kbd>
        </button>
      )}

      <div className="-mx-1 grid min-h-0 flex-1 content-start gap-1 overflow-y-auto px-1">
      {NAV.map((item) => {
        const on = current ? current === item.href : at !== null && isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-current={at !== null && isActive(pathname, item.href) ? "page" : undefined}
            onPointerDown={(e) => {
              // 右クリック・新しいタブで開く（⌘・Ctrl・Shift）は、この画面の選択を変えない
              if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              setPressed({ href: item.href, from: pathname });
            }}
            // 押したまま外へずらして離したら、仮の選択を捨てる
            onPointerCancel={() => setPressed(null)}
            onPointerLeave={(e) => {
              if (e.buttons) setPressed(null);
            }}
            className={cn(itemClass, on ? "bg-accent-soft font-medium text-accent-text" : "text-fg-2 hover:bg-surface-2 hover:text-fg")}
          >
            <Icon aria-hidden size={20} strokeWidth={on ? 2.2 : 1.8} className="flex-none" />
            <span className="wk-nav-label">{item.label}</span>
          </Link>
        );
      })}
      </div>

      {onAdd && (
        <button type="button" onClick={onAdd} title={APP.addLabel} className={cn(itemClass, "text-fg-2 hover:bg-surface-2 hover:text-fg active:bg-surface-2")}>
          <Plus aria-hidden size={20} className="flex-none" />
          <span className="wk-nav-label">{APP.addLabel}</span>
        </button>
      )}
      {account && (
        <div className="mt-1 grid gap-1 border-t border-line pt-2">
          <p className="wk-nav-wide px-3 text-xs text-fg-3" title={account.name}>
            <span className="min-w-0 truncate">{account.name}</span>
          </p>
          {account.actions.map((a) => (
            <button key={a.id} type="button" onClick={a.run} title={a.label} className={cn(itemClass, "text-fg-2 hover:bg-surface-2 hover:text-fg active:bg-surface-2")}>
              <a.icon aria-hidden size={20} className="flex-none" />
              <span className="wk-nav-label">{a.label}</span>
            </button>
          ))}
        </div>
      )}
      {/* 畳む・広げる（1280px 以上のときだけ） */}
      <button
        type="button"
        onClick={() => setCollapsed(document.documentElement.dataset.sidebar !== "collapsed")}
        className={cn(itemClass, "hidden text-fg-3 hover:bg-surface-2 hover:text-fg side:flex")}
        title="サイドバーを畳む・広げる"
      >
        <PanelLeftClose aria-hidden size={20} className="flex-none [:root[data-sidebar=collapsed]_&]:hidden" />
        <PanelLeftOpen aria-hidden size={20} className="hidden flex-none [:root[data-sidebar=collapsed]_&]:block" />
        <span className="wk-nav-label">畳む</span>
      </button>
    </nav>
  );
}
