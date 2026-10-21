"use client";

/**
 * 選んだテーマのフォントを Google Fonts から読み込む（グラファイトは next/font で読み込み済みなので何もしない）。
 * 届くまでは端末の日本語フォントで表示され、届いたら差し替わる。
 */
import { PALETTES } from "@workspace-kit/themes/catalog";
import { usePalette } from "@/lib/prefs";

export function ThemeFonts() {
  const id = usePalette();
  const p = id === "graphite" ? null : PALETTES.find((x) => x.id === id);
  return p ? <link rel="stylesheet" href={p.href} /> : null;
}
