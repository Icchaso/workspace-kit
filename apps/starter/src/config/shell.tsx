"use client";

/**
 * 骨組み（ナビ・⌘K パレット・追加ボタン）と、このアプリの中身をつなぐ場所。
 * 骨組み（components/shell/）は触らず、アプリごとに変えるのはこのファイルと config/nav.ts だけにする。
 *
 * - APP           … サイドバーの左上に出す名前と頭文字、追加ボタンと ⌘K の入力欄の文言
 * - ShellProviders … 骨組みの外側で包みたい物（データの入れ物など）。無ければ children をそのまま返す
 * - AddSheet      … 「追加」ボタン・N キー・⌘K の「追加」で開くシート。追加が無いアプリは null にする
 * - useExtraCommands … ⌘K パレットに足す候補（打った文字で絞り込む）。無ければ空の配列を返す
 */
import { ListChecks } from "lucide-react";
import { useRouter } from "next/navigation";
import { AddTaskSheet } from "@/components/tasks/add-task-sheet";
import type { PaletteItem } from "@/components/shell/command-palette";
import { TaskProvider, useTasks } from "@/lib/tasks";

export const APP = {
  name: "Kit タスク帳",
  mark: "K",
  addLabel: "タスクを追加",
  searchLabel: "タスクを探す・操作を選ぶ",
};

export function ShellProviders({ children }: { children: React.ReactNode }) {
  return <TaskProvider>{children}</TaskProvider>;
}

export const AddSheet: React.ComponentType<{ open: boolean; onOpenChange: (open: boolean) => void }> | null = AddTaskSheet;

/** needle … 打った文字（小文字・前後の空白なし）。空のときは「よく使う物」を少しだけ返す */
export function useExtraCommands(needle: string): PaletteItem[] {
  const router = useRouter();
  const { tasks } = useTasks();
  const hit = (s: string) => s.toLowerCase().includes(needle);
  return tasks
    .filter((t) => (needle ? hit(t.title) || hit(t.project) : !t.done))
    .slice(0, needle ? 8 : 4)
    .map((t) => ({
      id: `task-${t.id}`,
      group: needle ? "タスク" : "未完了のタスク",
      label: t.title,
      hint: t.project,
      icon: ListChecks,
      run: () => router.push(`/tasks?id=${t.id}${t.done ? "&f=done" : ""}`),
    }));
}
