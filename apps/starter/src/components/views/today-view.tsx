"use client";

/**
 * 今日（B 現場型）：立ったまま・片手で使う画面。
 *   - 大きい数字（数え上げて止まる）と進み具合の輪
 *   - 今日の予定（いまの時間の枠に印）
 *   - 押せるカード：押すと詳細、長押しで操作（指の端末）
 *   - スマホは右下の丸い主ボタンで追加（親指が届く位置）。PC・タブレットは見出しの右のボタン
 *   - 「今日を締める」は3つの手順で終える
 */
import { Clock, MoonStar, Plus } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { useShell } from "@/components/shell/app-frame";
import { Button } from "@/components/kit/button";
import { CountUp } from "@/components/kit/count-up";
import { Fab } from "@/components/kit/fab";
import { Page, PageHeader, StatCard } from "@/components/kit/feedback";
import { TaskCard } from "@/components/tasks/task-parts";
import { useTaskCommands } from "@/components/tasks/task-actions";
import { useTaskSheets } from "@/components/tasks/use-task-sheets";
import { WrapUpSheet } from "@/components/tasks/wrap-up-sheet";
import { SCHEDULE, toMin } from "@/lib/schedule";
import { counts, useTasks } from "@/lib/tasks";
import { useLongPress } from "@/lib/use-long-press";
import { cn } from "@/lib/cn";

const WD = ["日", "月", "火", "水", "木", "金", "土"];
// 日付と時刻は見ている人の端末で出す（サーバーで作るとずれるため、画面側でだけ計算する）。30秒ごとに読み直す
const everyHalfMinute = (cb: () => void) => {
  const id = setInterval(cb, 30_000);
  return () => clearInterval(id);
};
function useNow() {
  const label = useSyncExternalStore(
    everyHalfMinute,
    () => {
      const d = new Date();
      return `${d.getMonth() + 1}月${d.getDate()}日（${WD[d.getDay()]}）|${d.getHours() * 60 + d.getMinutes()}`;
    },
    () => "",
  );
  const [date, min] = label.split("|");
  return { date, min: min === undefined ? null : Number(min) };
}

export function TodayView() {
  const { tasks } = useTasks();
  const { openAdd } = useShell();
  const cmd = useTaskCommands();
  const { openDetail, openActions, sheets } = useTaskSheets();
  const press = useLongPress(openActions);
  const [wrapping, setWrapping] = useState(false);
  const now = useNow();

  const today = tasks.filter((t) => t.due === "today" || t.due === "overdue");
  const done = today.filter((t) => t.done).length;
  const c = counts(tasks);
  const list = [...today].sort(
    (a, b) => Number(a.done) - Number(b.done) || Number(b.due === "overdue") - Number(a.due === "overdue") || "高中低".indexOf(a.priority) - "高中低".indexOf(b.priority),
  );
  const pct = today.length ? done / today.length : 0;
  const R = 24;
  const C = 2 * Math.PI * R;

  return (
    <Page className="max-rail:pb-28">
      <PageHeader
        title="今日"
        sub={now.date || " "}
        actions={
          <Button variant="primary" onClick={openAdd} className="max-rail:hidden">
            <Plus aria-hidden size={18} />
            タスクを追加
          </Button>
        }
      />
      <div className="mb-3 grid grid-cols-3 gap-2.5">
        <StatCard label="残り" value={<CountUp value={today.length - done} />} unit="件" />
        <StatCard label="完了" value={<CountUp value={done} />} unit="件" />
        <StatCard label="期限切れ" value={<CountUp value={c.overdue} />} unit="件" tone={c.overdue ? "alert" : "plain"} />
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-md border border-line bg-surface px-4 py-3.5">
        <svg viewBox="0 0 56 56" className="size-14 flex-none -rotate-90" aria-hidden>
          <circle cx="28" cy="28" r={R} fill="none" strokeWidth="6" className="stroke-surface-2" />
          <circle
            cx="28"
            cy="28"
            r={R}
            fill="none"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - pct)}
            className="stroke-accent transition-[stroke-dashoffset] duration-[var(--wk-dur-sheet)] ease-out"
          />
        </svg>
        <div className="min-w-0 flex-1">
          <b className="num font-semibold">
            {done} / {today.length} 件 終わりました
          </b>
          <p className="text-sm text-fg-3">
            {pct >= 1 ? "今日のタスクは全部終わりました" : c.overdue ? "期限切れから片付けると、あとが楽になります" : "このペースなら夕方までに終わります"}
          </p>
        </div>
        <Button onClick={() => setWrapping(true)} className="max-rail:w-full">
          <MoonStar aria-hidden size={16} />
          今日を締める
        </Button>
      </div>

      <div className="grid gap-6 side:grid-cols-[minmax(0,1fr)_280px] side:items-start">
        {/* 予定：スマホでは上、PC では右の列 */}
        <section aria-labelledby="sched-h" className="side:sticky side:top-24 side:col-start-2 side:row-start-1">
          <h2 id="sched-h" className="mb-2 text-base font-semibold">
            今日の予定
          </h2>
          <ol className="overflow-hidden rounded-md border border-line bg-surface">
            {SCHEDULE.map((s) => {
              const state = now.min === null ? "later" : now.min >= toMin(s.end) ? "past" : now.min >= toMin(s.time) ? "now" : "later";
              return (
                <li key={s.time} aria-current={state === "now" ? "time" : undefined} className={cn("flex gap-3 border-b border-line px-4 py-3 last:border-b-0", state === "now" && "bg-accent-soft")}>
                  <span className={cn("num w-11 flex-none pt-px text-sm", state === "past" ? "text-fg-3" : "font-medium")}>{s.time}</span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-sm", state === "past" ? "text-fg-3" : "font-medium", state === "now" && "text-accent-text")}>
                      {s.title}
                      {state === "now" && <span className="ml-2 rounded-full bg-accent px-1.5 py-0.5 text-xs font-medium text-on-accent">いま</span>}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-fg-3">
                      <Clock aria-hidden size={12} />
                      〜{s.end}
                      {s.place && ` ・ ${s.place}`}
                    </span>
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-labelledby="todo-h" className="side:col-start-1 side:row-start-1">
          <div className="mb-2 flex items-baseline justify-between">
            <h2 id="todo-h" className="text-base font-semibold">
              今日やること
            </h2>
            <span className="text-xs text-fg-3">
              <span className="pointer-coarse:hidden">押すと詳細</span>
              <span className="hidden pointer-coarse:inline">押すと詳細・長押しで操作</span>
            </span>
          </div>
          <div className="grid gap-2">
            {list.map((t) => (
              <TaskCard
                key={t.id}
                task={t}
                onToggle={() => cmd.toggle(t)}
                onOpen={() => {
                  if (!press.consumed()) openDetail(t);
                }}
                bind={press.bind(t)}
              />
            ))}
          </div>
        </section>
      </div>

      <Fab label="タスクを追加" onClick={openAdd}>
        <Plus aria-hidden size={26} />
      </Fab>
      <WrapUpSheet open={wrapping} onOpenChange={setWrapping} />
      {sheets}
    </Page>
  );
}
