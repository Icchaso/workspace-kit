"use client";

/**
 * PC・タブレットのナビ。768〜1279px はアイコン列、1280px 以上はサイドバー（畳むとアイコン列）。
 * 項目と順番は下タブと同じ（config/nav.ts）。押した瞬間に選択表示を移し、画面の切り替えは待たせない。
 * 画面の切り替えは1日に何十回もするので、選択の下地は動かさずにその場で入れ替える。
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Plus, Search } from "lucide-react";
import { useState } from "react";
import { NAV, isActive } from "@/config/nav";
import { APP } from "@/config/shell";
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
  "flex h-11 w-full items-center gap-3 rounded-md px-3 text-sm whitespace-nowrap transition-colors duration-[var(--wk-dur-fast)] " +
  "max-side:justify-center max-side:px-0 [:root[data-sidebar=collapsed]_&]:justify-center [:root[data-sidebar=collapsed]_&]:px-0";

export function SideNav({ onSearch, onAdd }: { onSearch?: () => void; onAdd?: () => void }) {
  const pathname = usePathname();
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
      className="fixed inset-y-0 left-0 z-30 hidden flex-col gap-1 overflow-hidden border-r border-line bg-sidebar px-3 py-4 rail:flex"
      style={{ width: "var(--wk-nav-w)", transition: "width var(--wk-dur-base) var(--wk-ease-out)" }}
    >
      <div className="mb-3 flex items-center gap-2.5 px-1.5 max-side:justify-center max-side:px-0 [:root[data-sidebar=collapsed]_&]:justify-center [:root[data-sidebar=collapsed]_&]:px-0">
        <span className="grid size-8 flex-none place-items-center rounded-lg bg-accent text-sm font-semibold text-on-accent">{APP.mark}</span>
        <span className="wk-nav-label truncate text-sm font-semibold">{APP.name}</span>
      </div>

      {onSearch && (
        <button type="button" onClick={onSearch} title="検索・操作（⌘K）" className={cn(itemClass, "mb-2 border border-line bg-surface text-fg-2 hover:text-fg")}>
          <Search aria-hidden size={18} className="flex-none" />
          <span className="wk-nav-label">検索・操作</span>
          <kbd className="wk-nav-label ml-auto rounded border border-line px-1.5 font-sans text-xs text-fg-3">⌘K</kbd>
        </button>
      )}

      {NAV.map((item) => {
        const on = current ? current === item.href : isActive(pathname, item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            aria-current={isActive(pathname, item.href) ? "page" : undefined}
            onPointerDown={() => setPressed({ href: item.href, from: pathname })}
            className={cn(itemClass, on ? "bg-accent-soft font-medium text-accent-text" : "text-fg-2 hover:bg-surface-2 hover:text-fg")}
          >
            <Icon aria-hidden size={20} strokeWidth={on ? 2.2 : 1.8} className="flex-none" />
            <span className="wk-nav-label">{item.label}</span>
          </Link>
        );
      })}

      <div className="flex-1" />

      {onAdd && (
        <button type="button" onClick={onAdd} title={APP.addLabel} className={cn(itemClass, "text-fg-2 hover:bg-surface-2 hover:text-fg")}>
          <Plus aria-hidden size={20} className="flex-none" />
          <span className="wk-nav-label">{APP.addLabel}</span>
        </button>
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
