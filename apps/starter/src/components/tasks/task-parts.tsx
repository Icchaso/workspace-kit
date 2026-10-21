"use client";

import { Check } from "lucide-react";
import { DUE_LABEL, type Task } from "@/lib/tasks";
import { cn } from "@/lib/cn";

/** 丸いチェック。押せる範囲は 36px（指なら 44px）、見た目の丸は 20px */
export function CheckButton({ task, onToggle }: { task: Task; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-label={task.done ? `「${task.title}」を未完了に戻す` : `「${task.title}」を完了にする`}
      aria-pressed={task.done}
      data-no-longpress
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="group relative z-10 grid size-hit flex-none place-items-center rounded-full"
    >
      <span
        className={cn(
          "grid size-5 place-items-center rounded-full border-[1.8px] transition-[background-color,border-color,scale] duration-[var(--wk-dur-fast)] ease-out group-active:scale-(--wk-press-round) group-active:duration-[var(--wk-dur-press)]",
          task.done ? "border-accent bg-accent" : "border-fg-3",
        )}
      >
        <Check
          aria-hidden
          size={13}
          strokeWidth={3}
          className={cn("text-on-accent transition-[opacity,scale] duration-[var(--wk-dur-fast)] ease-out motion-reduce:scale-100", task.done ? "scale-100 opacity-100" : "scale-80 opacity-0")}
        />
      </span>
    </button>
  );
}

export function DueTag({ task }: { task: Task }) {
  const tone = task.done ? "" : task.due === "overdue" ? "bg-danger-soft text-danger" : task.due === "today" ? "bg-accent-soft text-accent-text" : "";
  return <span className={cn("inline-flex items-center rounded-full bg-surface-2 px-2 py-1 text-xs leading-none whitespace-nowrap text-fg-2", tone)}>{DUE_LABEL[task.due]}</span>;
}

export function ProjectTag({ name }: { name: string }) {
  return <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-1 text-xs leading-none whitespace-nowrap text-fg-2">{name}</span>;
}

export function PriorityTag({ task }: { task: Task }) {
  const dot = task.priority === "高" ? "bg-danger" : task.priority === "中" ? "bg-warn" : "bg-fg-3";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs whitespace-nowrap text-fg-2">
      <span aria-hidden className={cn("size-2 rounded-full", dot)} />
      優先度 {task.priority}
    </span>
  );
}

/**
 * タスクのカード（今日の画面で使う大きめの形）。
 * カード全体が「詳細を開く」ボタン（題名のボタンを全面に広げている）。チェックだけは別に押せる。
 * 指の端末では長押しで操作シート（bind に useLongPress の bind を渡す）。
 */
export function TaskCard({
  task,
  onToggle,
  onOpen,
  bind,
}: {
  task: Task;
  onToggle: () => void;
  onOpen?: () => void;
  bind?: React.HTMLAttributes<HTMLDivElement>;
}) {
  return (
    <div
      {...bind}
      className="relative flex items-center gap-1.5 rounded-md border border-line bg-surface py-2 pr-3 pl-1.5 transition-[scale,background-color] duration-[var(--wk-dur-fast)] ease-out select-none has-[[data-open]:active]:scale-(--wk-press-card) has-[[data-open]:active]:duration-[var(--wk-dur-press)] data-[held]:scale-(--wk-hold) data-[held]:bg-surface-2 [-webkit-touch-callout:none]"
    >
      <CheckButton task={task} onToggle={onToggle} />
      <div className="grid min-w-0 flex-1 gap-1.5 py-1">
        {onOpen ? (
          <button
            type="button"
            data-open
            onClick={onOpen}
            className={cn("text-left text-base font-medium after:absolute after:inset-0 after:rounded-md focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:outline-accent", task.done && "text-fg-3 line-through")}
          >
            {task.title}
          </button>
        ) : (
          <span className={cn("text-base font-medium", task.done && "text-fg-3 line-through")}>{task.title}</span>
        )}
        <span className="flex flex-wrap items-center gap-1.5">
          <DueTag task={task} />
          <ProjectTag name={task.project} />
          <PriorityTag task={task} />
        </span>
      </div>
    </div>
  );
}
