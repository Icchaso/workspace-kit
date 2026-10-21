"use client";

/**
 * 骨組み（ナビ・⌘K パレット・追加ボタン）と、このアプリの中身をつなぐ場所。
 * 骨組み（components/shell/）は触らず、アプリごとに変えるのはこのファイルと config/nav.ts だけにする。
 *
 * - APP           … サイドバーの左上に出す名前と頭文字、追加ボタンと ⌘K の入力欄の文言
 * - ShellProviders … 骨組みの外側で包みたい物（データの入れ物など）。無ければ children をそのまま返す
 * - AddSheet      … 「追加」ボタン・N キー・⌘K の「追加」で開くシート。追加が無いアプリは null のまま
 * - useExtraCommands … ⌘K パレットに足す候補（打った文字で絞り込む）。無ければ空の配列を返す
 * - useAccount   … ナビの一番下に出す「ログイン中の人」と操作（ログアウトなど）。無ければ null。スマホでは下タブの「もっと」の中に出る
 */
import type { AccountInfo, PaletteItem } from "@/components/shell/command-palette";

export const APP = {
  name: "My App",
  mark: "M",
  addLabel: "追加",
  searchLabel: "探す・操作を選ぶ",
};

export function ShellProviders({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export const AddSheet: React.ComponentType<{ open: boolean; onOpenChange: (open: boolean) => void }> | null = null;

/** needle … 打った文字（小文字・前後の空白なし）。空のときは「よく使う物」を少しだけ返す */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function useExtraCommands(needle: string): PaletteItem[] {
  return [];
}

/** ログインのあるアプリは、ここでログイン中の人の名前（メールなど）と操作を返す */
export function useAccount(): AccountInfo | null {
  return null;
}
