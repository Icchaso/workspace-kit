"use client";

/**
 * タスクの見本データと、画面から使う操作（完了・今日にする・追加・削除・取り消し）。
 * 雛形なので、データはこのブラウザの中だけに持つ（再読み込みで元に戻る）。
 * 本番では、ここをデータベース（Supabase など）の読み書きに差し替える。
 */
import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Due = "overdue" | "today" | "tomorrow" | "week" | "later";
export type Priority = "高" | "中" | "低";
export type Task = { id: number; title: string; project: string; due: Due; priority: Priority; done: boolean; note: string };

export const PROJECTS = ["HP制作", "講座", "LINE Bot", "経理", "物件紹介"];
export const DUE_LABEL: Record<Due, string> = { overdue: "期限切れ", today: "今日", tomorrow: "明日", week: "今週", later: "日付なし" };

const SAMPLE: Task[] = [
  { id: 1, title: "トップページのヒーロー画像を差し替える", project: "HP制作", due: "today", priority: "高", done: false, note: "差し替え用の写真は共有フォルダの「11月」に入っています。" },
  { id: 2, title: "11月分の請求書を発行する", project: "経理", due: "today", priority: "高", done: false, note: "3社分。金額は先月と同じ。" },
  { id: 3, title: "第3回講座のスライドを仕上げる", project: "講座", due: "today", priority: "中", done: false, note: "事例を2つ足す。" },
  { id: 4, title: "自動返信の文面を見直す", project: "LINE Bot", due: "overdue", priority: "高", done: false, note: "営業時間外の返事が古いまま。" },
  { id: 5, title: "領収書を写真で取り込む", project: "経理", due: "overdue", priority: "中", done: false, note: "" },
  { id: 6, title: "受講生の質問に返信する", project: "講座", due: "today", priority: "低", done: false, note: "質問は4件。" },
  { id: 7, title: "新着物件の紹介文を2件書く", project: "物件紹介", due: "tomorrow", priority: "中", done: false, note: "" },
  { id: 8, title: "お問い合わせフォームの動作確認", project: "HP制作", due: "week", priority: "中", done: false, note: "スマホとPCの両方で送ってみる。" },
  { id: 9, title: "リッチメニューの画像を作る", project: "LINE Bot", due: "week", priority: "低", done: false, note: "" },
  { id: 10, title: "先月の売上をまとめる", project: "経理", due: "today", priority: "中", done: true, note: "" },
  { id: 11, title: "内見の予定をカレンダーに入れる", project: "物件紹介", due: "today", priority: "低", done: true, note: "" },
  { id: 12, title: "申込ページの文言を直す", project: "講座", due: "later", priority: "低", done: false, note: "" },
];

type Store = {
  tasks: Task[];
  toggle: (id: number) => Task | undefined;
  makeToday: (ids: number[]) => void;
  add: (t: Omit<Task, "id" | "done">) => Task;
  remove: (id: number) => Task | undefined;
  reset: () => void;
  /** 直前の変更を1つ戻す（トーストの「取り消す」用） */
  undo: () => void;
};

const Ctx = createContext<Store | null>(null);

export function TaskProvider({ children }: { children: React.ReactNode }) {
  // prev は「取り消す」で戻す1つ前の状態
  const [state, setState] = useState<{ tasks: Task[]; prev: Task[] | null; seq: number }>({ tasks: SAMPLE, prev: null, seq: 100 });
  const change = useCallback((f: (tasks: Task[]) => Task[]) => setState((s) => ({ ...s, tasks: f(s.tasks), prev: s.tasks })), []);
  const { tasks } = state;

  const store = useMemo<Store>(
    () => ({
      tasks,
      toggle: (id) => {
        const t = tasks.find((x) => x.id === id);
        change((ts) => ts.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
        return t && { ...t, done: !t.done };
      },
      makeToday: (ids) => change((ts) => ts.map((x) => (ids.includes(x.id) && !x.done ? { ...x, due: "today" } : x))),
      add: (t) => {
        const task: Task = { ...t, id: state.seq + 1, done: false };
        setState((s) => ({ tasks: [task, ...s.tasks], prev: s.tasks, seq: s.seq + 1 }));
        return task;
      },
      remove: (id) => {
        const t = tasks.find((x) => x.id === id);
        change((ts) => ts.filter((x) => x.id !== id));
        return t;
      },
      reset: () => setState((s) => ({ ...s, tasks: SAMPLE, prev: null })),
      undo: () => setState((s) => (s.prev ? { ...s, tasks: s.prev, prev: null } : s)),
    }),
    [tasks, state.seq, change],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useTasks() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useTasks は TaskProvider の中で使う");
  return s;
}

export function counts(tasks: Task[]) {
  const open = tasks.filter((t) => !t.done);
  return {
    open: open.length,
    today: open.filter((t) => t.due === "today").length,
    overdue: open.filter((t) => t.due === "overdue").length,
    done: tasks.filter((t) => t.done).length,
  };
}
