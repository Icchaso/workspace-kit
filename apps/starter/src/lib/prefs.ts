"use client";

/**
 * 見た目の設定（明るさ・行の高さ）。<html> の data 属性に書き、このブラウザに覚えさせる。
 * 設定画面と ⌘K パレットの両方から変えるので、ここに1つだけ置く。
 */
import { useSyncExternalStore } from "react";

export type Theme = "system" | "light" | "dark";
export type Density = "comfy" | "compact";

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function write(name: "theme" | "density" | "palette", value: string, key: string) {
  const d = document.documentElement;
  if (value) d.dataset[name] = value;
  else delete d.dataset[name];
  try {
    if (value) localStorage.setItem(key, value);
    else localStorage.removeItem(key);
  } catch {}
  listeners.forEach((l) => l());
}

export const setTheme = (t: Theme) => write("theme", t === "system" ? "" : t, "wk.theme");
export const setDensity = (d: Density) => write("density", d === "comfy" ? "" : d, "wk.density");

export function useTheme(): Theme {
  return (useSyncExternalStore(subscribe, () => document.documentElement.dataset.theme ?? "", () => "") || "system") as Theme;
}
export function useDensity(): Density {
  return (useSyncExternalStore(subscribe, () => document.documentElement.dataset.density ?? "", () => "") || "comfy") as Density;
}

/** 指で触る端末か（ボタンの大きさや、長押し・… ボタンの出し分けに使う） */
const coarseQuery = "(pointer: coarse)";
function subscribeCoarse(cb: () => void) {
  const m = window.matchMedia(coarseQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
export function useCoarsePointer() {
  return useSyncExternalStore(subscribeCoarse, () => window.matchMedia(coarseQuery).matches, () => false);
}

/** 1280px 以上（サイドバーと右の詳細パネルを並べられる幅）か */
const wideQuery = "(min-width: 80rem)";
function subscribeWide(cb: () => void) {
  const m = window.matchMedia(wideQuery);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
export function useWide() {
  return useSyncExternalStore(subscribeWide, () => window.matchMedia(wideQuery).matches, () => false);
}

/**
 * テーマ（色・文字・角丸のひとそろい）。<html data-palette="…">。グラファイトは指定なし（基準のトークンそのもの）。
 * 一覧は packages/themes が生成する（仕上げた12種）。
 */
export function setPalette(id: string) {
  write("palette", id === "graphite" ? "" : id, "wk.palette");
  // グラファイトも名前で覚える（アプリの既定テーマが別のときに、グラファイトを選んだことを残すため）
  try {
    localStorage.setItem("wk.palette", id);
  } catch {}
}
export function usePalette(): string {
  return useSyncExternalStore(subscribe, () => document.documentElement.dataset.palette ?? "", () => "") || "graphite";
}
