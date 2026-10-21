import { House, Settings2, type LucideIcon } from "lucide-react";

/**
 * 画面の切り替え（ナビ）の項目。ここを書き換えると、サイドバー・アイコン列・下タブの全部が同じ順番で変わる。
 * - label: サイドバーに出す名前
 * - short: 下タブに出す短い名前（全角4文字まで）
 * - 下タブに出るのは先頭5つまで（6つ目以降はサイドバーだけ）
 */
export type NavItem = { href: string; label: string; short: string; icon: LucideIcon };

export const NAV: NavItem[] = [
  { href: "/", label: "ホーム", short: "ホーム", icon: House },
  { href: "/settings", label: "設定", short: "設定", icon: Settings2 },
];

/** 今の場所がその項目の中か（"/" は完全一致、それ以外は配下も含む） */
export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}
