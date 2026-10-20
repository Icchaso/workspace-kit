"use client";

/** 今日（B 現場型）：大きい数字と、片手で押せるカード。段階3で長押し操作・右下の主ボタンを足す */
import { Plus } from "lucide-react";
import { useSyncExternalStore } from "react";
import { useShell } from "@/components/shell/app-frame";
import { Button } from "@/components/ui/button";
import { Page, PageHeader, StatCard } from "@/components/ui/feedback";
import { notify } from "@/components/ui/toast";
import { TaskCard } from "@/components/tasks/task-parts";
import { counts, useTasks } from "@/lib/tasks";

const WD = ["日", "月", "火", "水", "木", "金", "土"];
// 日付は見ている人の端末の今日で出す（サーバーで作ると日付がずれるため、画面側でだけ計算する）
const noop = () => () => {};
function useTodayLabel() {
  return useSyncExternalStore(
    noop,
    () => {
      const d = new Date();
      return `${d.getMonth() + 1}月${d.getDate()}日（${WD[d.getDay()]}）`;
    },
    () => "",
  );
}

export function TodayView() {
  const { tasks, toggle, undo } = useTasks();
  const { openAdd } = useShell();
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
    <Page>
      <PageHeader
        title="今日"
        sub={useTodayLabel() || " "}
        actions={
          <Button variant="primary" onClick={openAdd}>
            <Plus aria-hidden size={18} />
            <span className="max-rail:sr-only">タスクを追加</span>
            <span className="rail:hidden" aria-hidden>
              追加
            </span>
          </Button>
        }
      />
      <div className="mb-3 grid grid-cols-3 gap-2.5">
        <StatCard label="残り" value={today.length - done} unit="件" />
        <StatCard label="完了" value={done} unit="件" />
        <StatCard label="期限切れ" value={c.overdue} unit="件" tone={c.overdue ? "alert" : "plain"} />
      </div>
      <div className="mb-6 flex items-center gap-4 rounded-md border border-line bg-surface px-4 py-3.5">
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
        <div>
          <b className="num font-semibold">
            {done} / {today.length} 件 終わりました
          </b>
          <p className="text-sm text-fg-3">
            {pct >= 1 ? "今日のタスクは全部終わりました" : c.overdue ? "期限切れから片付けると、あとが楽になります" : "このペースなら夕方までに終わります"}
          </p>
        </div>
      </div>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-base font-semibold">今日やること</h2>
        <span className="text-xs text-fg-3">期限切れも含む</span>
      </div>
      <div className="grid gap-2">
        {list.map((t) => (
          <TaskCard
            key={t.id}
            task={t}
            onToggle={() => {
              const r = toggle(t.id);
              if (r) notify(r.done ? `「${r.title}」を完了にしました` : "未完了に戻しました", undo);
            }}
          />
        ))}
      </div>
    </Page>
  );
}
