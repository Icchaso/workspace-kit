"use client";

/**
 * タスクの詳細。PC（1280px 以上）は一覧の右のパネル、それより狭いときはシートに同じ中身を出す。
 * よく使う操作（完了・今日やる）は大きいボタン、削除は控えめな文字のボタンにする。
 */
import { ArrowRight, Check, ListChecks, RotateCcw, Sun, Trash2 } from "lucide-react";
import { Button } from "@/components/kit/button";
import { EmptyState } from "@/components/kit/feedback";
import { Sheet } from "@/components/kit/sheet";
import { CheckButton, DueTag, PriorityTag } from "./task-parts";
import { useTaskCommands } from "./task-actions";
import type { Task } from "@/lib/tasks";
import { cn } from "@/lib/cn";

export function TaskDetail({ task, onRemoved }: { task: Task | null; onRemoved?: () => void }) {
  const cmd = useTaskCommands();
  if (!task) return <EmptyState icon={ListChecks} title="タスクを選ぶと、ここに詳細が出ます" body="一覧の行をクリックするか、↑↓ キーで選べます。" />;

  return (
    <div className="grid gap-5">
      <div className="-ml-2 flex items-start gap-1">
        <CheckButton task={task} onToggle={() => cmd.toggle(task)} />
        <h2 className={cn("pt-1.5 text-lg leading-snug font-semibold", task.done && "text-fg-3 line-through")}>{task.title}</h2>
      </div>
      <dl className="grid grid-cols-[5.5em_1fr] items-center gap-x-3 gap-y-3 text-sm">
        <dt className="text-fg-3">期限</dt>
        <dd>
          <DueTag task={task} />
        </dd>
        <dt className="text-fg-3">案件</dt>
        <dd>{task.project}</dd>
        <dt className="text-fg-3">優先度</dt>
        <dd>
          <PriorityTag task={task} />
        </dd>
        <dt className="text-fg-3">状態</dt>
        <dd>{task.done ? <span className="text-ok">完了</span> : "未完了"}</dd>
      </dl>
      {task.note && <p className="rounded-md bg-surface-2 px-3.5 py-3 text-sm whitespace-pre-wrap text-fg-2">{task.note}</p>}
      <div className="flex flex-wrap gap-2">
        {task.done ? (
          <Button onClick={() => cmd.toggle(task)}>
            <RotateCcw aria-hidden size={16} />
            未完了に戻す
          </Button>
        ) : (
          <Button variant="primary" onClick={() => cmd.toggle(task)}>
            <Check aria-hidden size={16} />
            完了にする
          </Button>
        )}
        {!task.done && task.due !== "today" && (
          <Button onClick={() => cmd.today(task)}>
            <Sun aria-hidden size={16} />
            今日やる
          </Button>
        )}
        {!task.done && (task.due === "today" || task.due === "overdue") && (
          <Button onClick={() => cmd.tomorrow(task)}>
            <ArrowRight aria-hidden size={16} />
            明日に回す
          </Button>
        )}
        <Button
          variant="danger"
          onClick={() => {
            cmd.remove(task);
            onRemoved?.();
          }}
        >
          <Trash2 aria-hidden size={16} />
          削除
        </Button>
      </div>
    </div>
  );
}

/** 狭い画面で詳細を出すシート（閉じる動きの間も中身を出すため、task と open は別に渡す） */
export function TaskDetailSheet({ task, open, onOpenChange }: { task: Task | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Sheet open={open && !!task} onOpenChange={onOpenChange} title="タスクの詳細">
      <div className="pt-1">
        <TaskDetail task={task} onRemoved={() => onOpenChange(false)} />
      </div>
    </Sheet>
  );
}
