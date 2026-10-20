"use client";

/** タスク一覧（A 指令室型の土台）。段階3で右の詳細パネル・⌘K・長押し操作・表とカードの切り替えを足す */
import { CheckCheck, CircleCheck, Plus } from "lucide-react";
import { useState } from "react";
import { useShell } from "@/components/shell/app-frame";
import { Button } from "@/components/ui/button";
import { EmptyState, Page, PageHeader } from "@/components/ui/feedback";
import { Chip } from "@/components/ui/segmented";
import { notify } from "@/components/ui/toast";
import { CheckButton, DueTag, PriorityTag, ProjectTag } from "@/components/tasks/task-parts";
import { counts, useTasks, type Task } from "@/lib/tasks";
import { cn } from "@/lib/cn";

type Filter = "open" | "today" | "overdue" | "done";
const EMPTY: Record<Filter, [string, string]> = {
  open: ["未完了のタスクはありません", "新しいタスクを追加して始めましょう"],
  today: ["今日のタスクはありません", "明日以降のタスクを今日に入れることもできます"],
  overdue: ["期限切れはありません", "この調子です"],
  done: ["完了したタスクはまだありません", "チェックを付けるとここに入ります"],
};

export function TasksView() {
  const { tasks, toggle, undo } = useTasks();
  const { openAdd } = useShell();
  const [filter, setFilter] = useState<Filter>("open");
  const c = counts(tasks);
  const rows = tasks.filter((t: Task) =>
    filter === "open" ? !t.done : filter === "today" ? !t.done && t.due === "today" : filter === "overdue" ? !t.done && t.due === "overdue" : t.done,
  );
  const FILTERS: [Filter, string, number][] = [
    ["open", "未完了", c.open],
    ["today", "今日", c.today],
    ["overdue", "期限切れ", c.overdue],
    ["done", "完了", c.done],
  ];

  return (
    <Page>
      <PageHeader
        title="タスク"
        sub={`${c.open}件が未完了`}
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
      <div role="group" aria-label="絞り込み" className="mt-1 mb-3.5 flex flex-wrap gap-1.5">
        {FILTERS.map(([k, label, n]) => (
          <Chip key={k} pressed={filter === k} onClick={() => setFilter(k)}>
            {label}
            <span className="num text-xs opacity-80">{n}</span>
          </Chip>
        ))}
      </div>
      <div className="overflow-hidden rounded-md border border-line bg-surface">
        {rows.length ? (
          <ul>
            {rows.map((t) => (
              <li
                key={t.id}
                className="grid min-h-row grid-cols-[var(--wk-hit)_minmax(0,1fr)] items-center gap-x-2 border-b border-line px-2 py-2 last:border-b-0 side:grid-cols-[var(--wk-hit)_minmax(0,1fr)_96px_96px_80px] side:py-0"
              >
                <CheckButton
                  task={t}
                  onToggle={() => {
                    const r = toggle(t.id);
                    if (r) notify(r.done ? `「${r.title}」を完了にしました` : "未完了に戻しました", undo);
                  }}
                />
                <span className={cn("text-sm max-side:font-medium side:truncate", t.done && "text-fg-3 line-through")}>{t.title}</span>
                {/* 広い画面は表の列、狭い画面はタイトルの下に並べる */}
                <span className="col-start-2 flex flex-wrap items-center gap-1.5 side:contents">
                  <span className="side:justify-self-start">
                    <DueTag task={t} />
                  </span>
                  <span className="side:justify-self-start">
                    <ProjectTag name={t.project} />
                  </span>
                  <PriorityTag task={t} />
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon={filter === "done" ? CircleCheck : CheckCheck}
            title={EMPTY[filter][0]}
            body={EMPTY[filter][1]}
            action={
              <Button onClick={openAdd}>
                <Plus aria-hidden size={18} />
                タスクを追加
              </Button>
            }
          />
        )}
      </div>
    </Page>
  );
}
